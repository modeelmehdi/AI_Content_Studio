import hashlib
import secrets
import time
from datetime import datetime, timedelta, timezone
import jwt
from pwdlib import PasswordHash
from fastapi import HTTPException, Request
from starlette.concurrency import run_in_threadpool

password_hasher = PasswordHash.recommended()
DUMMY_HASH = password_hasher.hash('a-dummy-password-not-used-for-sign-in-384')


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def public_user(user):
    return {key: user[key] for key in ('id', 'name', 'email', 'created_at')}


async def authenticate(request: Request):
    settings = request.app.state.settings
    token = request.cookies.get('acs_access')
    if not token:
        raise HTTPException(401, 'Sign in to continue.')
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=['HS256'], audience='ai-content-studio', issuer='ai-content-studio', options={'require': ['exp', 'iat', 'sub', 'sid', 'kind']})
        if payload['kind'] != 'access':
            raise jwt.InvalidTokenError()
    except jwt.InvalidTokenError as exc:
        raise HTTPException(401, 'Your session has expired. Please sign in again.') from exc
    session = await request.app.state.store.one('sessions', {'id': payload['sid'], 'user_id': payload['sub']})
    if not session or session['expires'] <= time.time():
        raise HTTPException(401, 'Your session has ended. Please sign in again.')
    if request.method not in ('GET', 'HEAD', 'OPTIONS'):
        supplied = request.headers.get('x-csrf-token', '')
        if not supplied or not secrets.compare_digest(digest(supplied), session['csrf_hash']):
            raise HTTPException(403, 'Session verification failed. Refresh the page and try again.')
    user = await request.app.state.store.one('users', {'id': payload['sub']})
    if not user or user.get('status') != 'active':
        raise HTTPException(401, 'Account is unavailable.')
    request.state.session = session
    return user


def encode_token(settings, user_id, sid, kind, jti):
    now = datetime.now(timezone.utc)
    lifetime = timedelta(minutes=settings.access_minutes) if kind == 'access' else timedelta(days=settings.refresh_days)
    return jwt.encode({'sub': user_id, 'sid': sid, 'kind': kind, 'jti': jti, 'iat': now, 'exp': now + lifetime, 'aud': 'ai-content-studio', 'iss': 'ai-content-studio'}, settings.jwt_secret, algorithm='HS256')


def set_cookies(response, settings, user_id, sid, refresh_jti, csrf_token):
    common = {'secure': settings.secure_cookies, 'samesite': 'lax'}
    response.set_cookie('acs_access', encode_token(settings, user_id, sid, 'access', secrets.token_urlsafe(20)), max_age=settings.access_minutes * 60, httponly=True, path='/', **common)
    response.set_cookie('acs_refresh', encode_token(settings, user_id, sid, 'refresh', refresh_jti), max_age=settings.refresh_days * 86400, httponly=True, path='/api/auth', **common)
    response.set_cookie('acs_csrf', csrf_token, max_age=settings.refresh_days * 86400, httponly=False, path='/', **common)


async def check_password(password, stored):
    try:
        return await run_in_threadpool(password_hasher.verify, password, stored or DUMMY_HASH)
    except Exception:
        return False
