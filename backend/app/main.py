import hashlib
import logging
import re
import secrets
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from uuid import UUID, uuid4
import jwt
from fastapi import FastAPI, Request, Response, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from .config import get_settings
from .database import SQLiteStore, MongoStore, DuplicateRecord
from .schemas import Register, Login, PublicUser, ProfileUpdate, UserSettings, GenerateInput, ContentCreate, ContentUpdate, Kind
from .security import authenticate, digest, check_password, password_hasher, public_user, set_cookies
from .services.ai_service import AIService
from .services.media import MediaService
from .services.pdf_export import export_pdf

logger = logging.getLogger('studio')


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def present(document):
    result = {k: v for k, v in document.items() if k not in ('media', 'user_id')}
    if document.get('media'):
        result['image_url'] = f"/api/content/{document['id']}/image"
    return result


async def rate(request, name, limit, window, user_id=None):
    identity = user_id or (request.client.host if request.client else 'unknown')
    key = name + ':' + hashlib.sha256(identity.encode()).hexdigest()
    if not await request.app.state.store.rate(key, limit, window):
        raise HTTPException(429, 'Too many requests. Please wait and try again.', headers={'Retry-After': str(window)})


async def owned(request, content_id, user):
    document = await request.app.state.store.one('generated_content', {'id': str(content_id), 'user_id': user['id']})
    if not document:
        raise HTTPException(404, 'Content not found.')
    return document


def create_app(settings=None, store=None, ai=None):
    @asynccontextmanager
    async def lifespan(app):
        cfg = settings or get_settings()
        app.state.settings = cfg
        app.state.store = store or (MongoStore(cfg.mongodb_uri, cfg.mongodb_database) if cfg.database_backend == 'mongodb' else SQLiteStore(cfg.sqlite_path))
        await app.state.store.open()
        app.state.ai = ai or AIService(cfg)
        app.state.media = MediaService(cfg, app.state.store)
        try:
            yield
        finally:
            await app.state.ai.close()
            await app.state.store.close()

    app = FastAPI(title='AI Content Studio API', version='1.0.0', lifespan=lifespan)

    @app.middleware('http')
    async def boundary(request, call_next):
        cfg = request.app.state.settings
        origin = request.headers.get('origin', '').rstrip('/')
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            # Native scripts can provide Origin explicitly; browser mutations must be same-origin or allowlisted.
            if origin not in cfg.origins:
                return JSONResponse({'detail': 'This origin is not permitted.'}, status_code=403)
            try:
                if int(request.headers.get('content-length', '0')) > 100000:
                    return JSONResponse({'detail': 'Request body is too large.'}, status_code=413)
            except ValueError:
                return JSONResponse({'detail': 'Invalid request length.'}, status_code=400)
        if request.method == 'OPTIONS':
            response = Response(status_code=204)
        else:
            response = await call_next(request)
        if origin in cfg.origins:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type,X-CSRF-Token'
            response.headers['Vary'] = 'Origin'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'same-origin'
        response.headers['Cache-Control'] = 'no-store'
        return response

    @app.exception_handler(Exception)
    async def unexpected(request, exc):
        logger.error('Unhandled request failure: %s', type(exc).__name__)
        return JSONResponse({'detail': 'The request could not be completed. Please try again.'}, status_code=500)

    @app.get('/health')
    async def health(request: Request):
        cfg = request.app.state.settings
        return {'status': 'ok', 'database': cfg.database_backend, 'text_generation_configured': bool(cfg.gemini_api_key and cfg.gemini_text_model), 'image_generation_configured': cfg.image_ready, 'media_storage': 'mongodb' if cfg.media_storage == 'mongodb' else 'cloudinary' if cfg.cloudinary_ready else 'local-development', 'environment': cfg.environment}

    async def start_session(request, response, user):
        cfg = request.app.state.settings
        sid, jti, csrf = str(uuid4()), secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        await request.app.state.store.insert('sessions', {'id': sid, 'user_id': user['id'], 'refresh_hash': digest(jti), 'csrf_hash': digest(csrf), 'expires': int(time.time()) + cfg.refresh_days * 86400, 'created_at': timestamp()})
        set_cookies(response, cfg, user['id'], sid, jti, csrf)
        return {'user': public_user(user), 'csrf_token': csrf}

    @app.post('/api/auth/register', status_code=201)
    async def register(data: Register, request: Request, response: Response):
        await rate(request, 'register', 5, 3600)
        email = str(data.email).lower()
        if await request.app.state.store.one('users', {'email': email}):
            raise HTTPException(409, 'An account with this email already exists.')
        user = {'id': str(uuid4()), 'email': email, 'name': data.name, 'password_hash': await run_in_threadpool(password_hasher.hash, data.password), 'status': 'active', 'created_at': timestamp(), 'updated_at': timestamp()}
        try:
            await request.app.state.store.insert('users', user)
        except DuplicateRecord as exc:
            raise HTTPException(409, 'An account with this email already exists.') from exc
        return await start_session(request, response, user)

    @app.post('/api/auth/login')
    async def login(data: Login, request: Request, response: Response):
        await rate(request, 'login', 12, 900)
        user = await request.app.state.store.one('users', {'email': str(data.email).lower()})
        valid = await check_password(data.password, user.get('password_hash') if user else None)
        if not user or not valid or user.get('status') != 'active':
            raise HTTPException(401, 'Email or password is incorrect.')
        return await start_session(request, response, user)

    @app.get('/api/auth/me')
    async def me(request: Request, user=Depends(authenticate)):
        return {'user': public_user(user)}

    @app.post('/api/auth/refresh')
    async def refresh(request: Request, response: Response):
        cfg = request.app.state.settings
        await rate(request, 'refresh', 60, 900)
        try:
            token = jwt.decode(request.cookies.get('acs_refresh', ''), cfg.jwt_secret, algorithms=['HS256'], audience='ai-content-studio', issuer='ai-content-studio', options={'require': ['exp', 'iat', 'sub', 'sid', 'jti', 'kind']})
            if token['kind'] != 'refresh':
                raise jwt.InvalidTokenError()
        except jwt.InvalidTokenError as exc:
            raise HTTPException(401, 'Sign in again to continue.') from exc
        session = await request.app.state.store.one('sessions', {'id': token['sid'], 'user_id': token['sub'], 'refresh_hash': digest(token['jti'])})
        csrf = request.headers.get('x-csrf-token', '')
        if not session or session['expires'] <= time.time():
            raise HTTPException(401, 'Your session has ended.')
        if not csrf or not secrets.compare_digest(digest(csrf), session['csrf_hash']):
            raise HTTPException(403, 'Session verification failed.')
        user = await request.app.state.store.one('users', {'id': token['sub'], 'status': 'active'})
        if not user:
            raise HTTPException(401, 'Account is unavailable.')
        jti, new_csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        updated = await request.app.state.store.update('sessions', {'id': session['id'], 'refresh_hash': session['refresh_hash']}, {'refresh_hash': digest(jti), 'csrf_hash': digest(new_csrf)})
        if not updated:
            raise HTTPException(401, 'This refresh token was already used.')
        set_cookies(response, cfg, user['id'], session['id'], jti, new_csrf)
        return {'user': public_user(user), 'csrf_token': new_csrf}

    @app.post('/api/auth/logout')
    async def logout(request: Request, response: Response, user=Depends(authenticate)):
        await request.app.state.store.delete('sessions', {'id': request.state.session['id'], 'user_id': user['id']})
        response.delete_cookie('acs_access', path='/')
        response.delete_cookie('acs_refresh', path='/api/auth')
        response.delete_cookie('acs_csrf', path='/')
        return {'ok': True}

    @app.get('/api/users/me', response_model=PublicUser)
    async def profile(user=Depends(authenticate)):
        return public_user(user)

    @app.put('/api/users/me', response_model=PublicUser)
    async def update_profile(data: ProfileUpdate, request: Request, user=Depends(authenticate)):
        return public_user(await request.app.state.store.update('users', {'id': user['id']}, {'name': data.name, 'updated_at': timestamp()}))

    @app.get('/api/users/me/settings')
    async def settings_read(request: Request, user=Depends(authenticate)):
        document = await request.app.state.store.one('user_settings', {'user_id': user['id']})
        return {key: document[key] for key in UserSettings.model_fields} if document else UserSettings().model_dump()

    @app.put('/api/users/me/settings')
    async def settings_write(data: UserSettings, request: Request, user=Depends(authenticate)):
        current = await request.app.state.store.one('user_settings', {'user_id': user['id']})
        if current:
            await request.app.state.store.update('user_settings', {'id': current['id'], 'user_id': user['id']}, data.model_dump())
        else:
            await request.app.state.store.insert('user_settings', {'id': str(uuid4()), 'user_id': user['id'], **data.model_dump()})
        return data

    @app.post('/api/generate/{kind}', status_code=201)
    async def generate(kind: Kind, data: GenerateInput, request: Request, user=Depends(authenticate)):
        await rate(request, 'generate', 10, 600, user['id'])
        store, service = request.app.state.store, request.app.state.ai
        ident, now = str(uuid4()), timestamp()
        usage = {'id': str(uuid4()), 'user_id': user['id'], 'kind': kind, 'created_at': now, 'status': 'started'}
        await store.insert('usage_records', usage)
        try:
            if kind == 'image':
                await rate(request, 'daily-image', 3, 86400, user['id'])
                await rate(request, 'global-daily-image', 20, 86400, 'free-image-workspace')
                raw, _mime, model = await service.generate_image(data.model_dump())
                media = await request.app.state.media.save(raw, user['id'], ident, aspect_ratio=data.aspect_ratio)
                output = {'title': data.topic[:100], 'text': '', 'seo_title': '', 'meta_description': '', 'suggestions': [], 'media': media}
            else:
                methods = {'blog': service.generate_blog, 'linkedin': service.generate_linkedin_post, 'instagram': service.generate_instagram_caption, 'twitter': service.generate_twitter_post, 'seo': service.generate_seo_content}
                output, model = await methods[kind](data.model_dump())
            document = {'id': ident, 'user_id': user['id'], 'kind': kind, 'parameters': data.model_dump(), 'model': model, 'source': 'ai-generated', 'created_at': now, 'updated_at': now, **output}
            await store.insert('generated_content', document)
            await store.insert('generation_history', {'id': str(uuid4()), 'user_id': user['id'], 'content_id': ident, 'kind': kind, 'model': model, 'created_at': now})
            await store.update('usage_records', {'id': usage['id']}, {'status': 'success', 'model': model})
            return present(document)
        except Exception:
            await store.update('usage_records', {'id': usage['id']}, {'status': 'failed'})
            raise

    @app.post('/api/content', status_code=201)
    async def create_content(data: ContentCreate, request: Request, user=Depends(authenticate)):
        if data.kind == 'image':
            raise HTTPException(422, 'Use the image generator to create image content.')
        await rate(request, 'manual-save', 60, 600, user['id'])
        now = timestamp()
        document = {'id': str(uuid4()), 'user_id': user['id'], **data.model_dump(), 'source': 'manual-draft', 'model': '', 'parameters': {}, 'created_at': now, 'updated_at': now}
        await request.app.state.store.insert('generated_content', document)
        return present(document)

    @app.get('/api/content')
    async def list_content(request: Request, kind: Kind | None = None, q: str = Query(default='', max_length=150), page: int = Query(default=1, ge=1, le=10000), page_size: int = Query(default=12, ge=1, le=50), order: str = Query(default='newest', pattern='^(newest|oldest)$'), user=Depends(authenticate)):
        query = {'user_id': user['id']}
        if kind:
            query['kind'] = kind
        store = request.app.state.store
        offset = (page - 1) * page_size
        rows = await store.find('generated_content', query, limit=page_size, skip=offset, descending=order == 'newest', search=q)
        return {'items': [present(d) for d in rows], 'total': await store.count('generated_content', query, search=q), 'page': page, 'page_size': page_size}

    @app.get('/api/content/{content_id}')
    async def read_content(content_id: UUID, request: Request, user=Depends(authenticate)):
        return present(await owned(request, content_id, user))

    @app.put('/api/content/{content_id}')
    async def update_content(content_id: UUID, data: ContentUpdate, request: Request, user=Depends(authenticate)):
        await owned(request, content_id, user)
        document = await request.app.state.store.update('generated_content', {'id': str(content_id), 'user_id': user['id']}, {**data.model_dump(), 'updated_at': timestamp()})
        return present(document)

    @app.delete('/api/content/{content_id}')
    async def delete_content(content_id: UUID, request: Request, user=Depends(authenticate)):
        document = await owned(request, content_id, user)
        if document.get('media'):
            await request.app.state.media.delete(document['media'])
        await request.app.state.store.delete('generated_content', {'id': str(content_id), 'user_id': user['id']})
        return {'ok': True}

    @app.get('/api/content/{content_id}/image')
    async def image(content_id: UUID, request: Request, download: bool = False, user=Depends(authenticate)):
        document = await owned(request, content_id, user)
        if not document.get('media'):
            raise HTTPException(404, 'This item has no image.')
        raw = await request.app.state.media.read(document['media'])
        extension = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp'}[document['media']['mime']]
        return Response(raw, media_type=document['media']['mime'], headers={'Content-Disposition': f'{"attachment" if download else "inline"}; filename="studio-{content_id}.{extension}"'})

    @app.get('/api/content/{content_id}/export')
    async def export(content_id: UUID, request: Request, format: str = Query(default='txt', pattern='^(txt|pdf)$'), user=Depends(authenticate)):
        document = await owned(request, content_id, user)
        if document['kind'] == 'image':
            raise HTTPException(422, 'Download this item as an image.')
        if format == 'pdf':
            data = await run_in_threadpool(export_pdf, document)
            mime = 'application/pdf'
        else:
            data = (document['title'] + '\n\n' + document.get('text', '') + ('\n\nSEO title: ' + document['seo_title'] if document.get('seo_title') else '') + ('\nMeta description: ' + document['meta_description'] if document.get('meta_description') else '')).encode('utf-8')
            mime = 'text/plain; charset=utf-8'
        return Response(data, media_type=mime, headers={'Content-Disposition': f'attachment; filename="studio-{content_id}.{format}"'})

    @app.get('/api/dashboard/stats')
    async def stats(request: Request, user=Depends(authenticate)):
        store = request.app.state.store
        query = {'user_id': user['id']}
        counts = {kind: await store.count('generated_content', {**query, 'kind': kind}) for kind in ('blog', 'linkedin', 'instagram', 'twitter', 'seo', 'image')}
        return {'saved_items': sum(counts.values()), 'by_category': counts, 'successful_generations': await store.count('usage_records', {**query, 'status': 'success'}), 'failed_generations': await store.count('usage_records', {**query, 'status': 'failed'})}

    @app.get('/api/dashboard/recent-content')
    async def recent(request: Request, user=Depends(authenticate)):
        return {'items': [present(d) for d in await request.app.state.store.find('generated_content', {'user_id': user['id']}, limit=5)]}

    return app


app = create_app()
