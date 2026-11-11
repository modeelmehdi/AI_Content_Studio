import io
import time
import os
from uuid import uuid4
import jwt
import pytest
from PIL import Image
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app.config import Settings
from app.main import create_app

ORIGIN = 'http://testserver'
PASSWORD = 'Test-only-password-34982'


def test_persistent_mongodb_images_are_private_and_survive_restart(cfg):
    if cfg.database_backend != 'mongodb':
        pytest.skip('Persistent image library is MongoDB-only.')
    cfg.media_storage = 'mongodb'
    with TestClient(create_app(settings=cfg, ai=FakeAI()), headers={'Origin': ORIGIN}) as first:
        session = register(first)
        result = first.post('/api/generate/image', json={'topic':'A scenic landscape', 'aspect_ratio':'16:9'})
        assert result.status_code == 201
        item = result.json()
        assert 'media' not in item and 'data' not in item
        cookies = dict(first.cookies)
    with TestClient(create_app(settings=cfg, ai=FakeAI()), headers={'Origin': ORIGIN}) as second:
        second.cookies.update(cookies)
        second.headers['X-CSRF-Token'] = session['csrf_token']
        response = second.get(item['image_url'])
        assert response.status_code == 200
        assert response.headers['content-type'] == 'image/jpeg'
        image = Image.open(io.BytesIO(response.content))
        assert image.size == (1024, 576)
        assert 'data' not in second.get('/api/content').text
        owner_cookies = dict(second.cookies)
        second.cookies.clear()
        register(second, 'other-image-user@example.com')
        assert second.get(item['image_url']).status_code == 404
        second.cookies.clear()
        second.cookies.update(owner_cookies)
        second.headers['X-CSRF-Token'] = session['csrf_token']
        assert second.delete('/api/content/'+item['id']).status_code == 200
        assert second.get(item['image_url']).status_code == 404
    from pymongo import MongoClient
    with MongoClient(cfg.mongodb_uri) as client:
        assert client[cfg.mongodb_database].image_files.count_documents({}) == 0


class FakeAI:
    """Test-only provider. Never wired into the running application."""
    async def close(self): pass

    async def text(self, parameters):
        return {'title': 'A useful result', 'text': 'A verified test result with enough content to export.\n\nA second paragraph.', 'seo_title': 'Useful title', 'meta_description': 'Useful description', 'suggestions': ['Keyword']}, 'test-provider'

    generate_blog = text
    generate_linkedin_post = text
    generate_instagram_caption = text
    generate_twitter_post = text
    generate_facebook_post = text
    generate_threads_post = text
    generate_seo_content = text

    async def generate_image(self, parameters):
        stream = io.BytesIO()
        Image.new('RGB', (64, 64), '#274463').save(stream, 'PNG')
        return stream.getvalue(), 'image/png', 'test-image-provider'


@pytest.fixture(params=['sqlite', 'mongodb'])
def cfg(tmp_path, request):
    mode = request.param
    if mode == 'mongodb' and not os.getenv('TEST_MONGODB_URI'):
        pytest.skip('Set TEST_MONGODB_URI to an isolated local MongoDB test server.')
    database_name = 'test_studio_' + uuid4().hex
    settings = Settings(jwt_secret='test-only-secret-which-is-long-enough-54856', database_backend=mode, mongodb_uri=os.getenv('TEST_MONGODB_URI',''), mongodb_database=database_name, sqlite_path=str(tmp_path / 'db.sqlite3'), media_directory=str(tmp_path / 'media'), allowed_origins=ORIGIN, gemini_api_key='', gemini_text_model='', gemini_image_model='', _env_file=None)
    yield settings
    if mode == 'mongodb':
        # Only remove this fixture's randomly named test database, never a configured application database.
        from pymongo import MongoClient
        with MongoClient(settings.mongodb_uri) as client:
            client.drop_database(database_name)


@pytest.fixture
def client(cfg):
    with TestClient(create_app(settings=cfg, ai=FakeAI()), headers={'Origin': ORIGIN}) as client:
        yield client


def register(client, email='writer@example.com'):
    response = client.post('/api/auth/register', json={'name': 'Test Writer', 'email': email, 'password': PASSWORD})
    assert response.status_code == 201, response.text
    client.headers['X-CSRF-Token'] = response.json()['csrf_token']
    return response.json()


def test_register_login_logout_and_cookie_security(client):
    result = register(client)
    assert 'password_hash' not in result['user']
    assert client.get('/api/auth/me').status_code == 200
    assert 'HttpOnly' in client.cookies.jar._cookies['testserver.local']['/']['acs_access']._rest
    stolen = client.cookies.get('acs_access')
    assert client.post('/api/auth/logout').status_code == 200
    assert client.get('/api/auth/me').status_code == 401
    client.cookies.set('acs_access', stolen)
    assert client.get('/api/auth/me').status_code == 401
    assert client.post('/api/auth/login', json={'email': 'writer@example.com', 'password': 'incorrect'}).status_code == 401
    assert client.post('/api/auth/login', json={'email': 'writer@example.com', 'password': PASSWORD}).status_code == 200


def test_registration_validation_and_duplicate_email(client):
    assert client.post('/api/auth/register', json={'name': 'A', 'email': 'invalid', 'password': 'short'}).status_code == 422
    register(client)
    assert client.post('/api/auth/register', json={'name': 'Another', 'email': 'WRITER@example.com', 'password': PASSWORD}).status_code == 409


def test_csrf_origin_and_unauthenticated_access(client):
    assert client.get('/api/content').status_code == 401
    register(client)
    data = {'kind': 'blog', 'title': 'Private draft', 'text': 'Private writing'}
    assert client.post('/api/content', json=data, headers={'X-CSRF-Token': ''}).status_code == 403
    assert client.post('/api/content', json=data, headers={'Origin': 'https://attacker.example'}).status_code == 403
    assert client.post('/api/content?csrf=false', json=data, headers={'X-CSRF-Token': ''}).status_code == 403


def test_refresh_rotation_and_session_expiry(client, cfg):
    register(client)
    old = client.cookies.get('acs_refresh')
    response = client.post('/api/auth/refresh')
    assert response.status_code == 200
    client.headers['X-CSRF-Token'] = response.json()['csrf_token']
    assert client.cookies.get('acs_refresh') != old
    fresh_access = client.cookies.get('acs_access')
    client.cookies.clear()
    client.cookies.set('acs_refresh', old, path='/api/auth')
    assert client.post('/api/auth/refresh').status_code == 401
    payload = jwt.decode(fresh_access, cfg.jwt_secret, algorithms=['HS256'], audience='ai-content-studio', issuer='ai-content-studio')
    payload['exp'] = int(time.time()) - 60
    client.cookies.set('acs_access', jwt.encode(payload, cfg.jwt_secret, algorithm='HS256'))
    assert client.get('/api/auth/me').status_code == 401


def test_content_crud_search_pagination_and_user_isolation(client):
    register(client)
    created = client.post('/api/content', json={'kind': 'blog', 'title': 'Private engineering draft', 'text': '<script>never execute</script>'})
    assert created.status_code == 201
    ident = created.json()['id']
    assert created.json()['source'] == 'manual-draft'
    assert client.get('/api/content?q=engineering').json()['total'] == 1
    assert client.get('/api/content?kind=image').json()['total'] == 0
    assert client.get('/api/content?page_size=1&page=2').json()['items'] == []
    assert client.get('/api/content/not-a-uuid').status_code == 422
    assert client.put('/api/content/' + ident, json={'title': 'Updated draft', 'text': 'Updated writing'}).status_code == 200
    assert client.get('/api/content/' + ident).json()['text'] == 'Updated writing'
    first_cookies = dict(client.cookies)
    first_csrf = client.headers['X-CSRF-Token']
    client.cookies.clear()
    register(client, 'second@example.com')
    assert client.get('/api/content').json()['total'] == 0
    for method, path, body in [('get', '', None), ('put', '', {'title': 'Hijacked'}), ('delete', '', None), ('get', '/export', None), ('get', '/image', None)]:
        response = getattr(client, method)('/api/content/' + ident + path, **({'json': body} if body else {}))
        assert response.status_code == 404
    client.cookies.clear()
    client.cookies.update(first_cookies)
    client.headers['X-CSRF-Token'] = first_csrf
    assert client.delete('/api/content/' + ident).status_code == 200
    assert client.get('/api/content/' + ident).status_code == 404


@pytest.mark.parametrize('kind', ['blog', 'linkedin', 'instagram', 'twitter', 'facebook', 'threads', 'seo', 'image'])
def test_every_generator_persists_real_contract(client, kind):
    register(client)
    response = client.post('/api/generate/' + kind, json={'topic': 'Accessible software for everyone'})
    assert response.status_code == 201, response.text
    result = response.json()
    assert result['source'] == 'ai-generated'
    assert client.get('/api/content/' + result['id']).status_code == 200
    stats = client.get('/api/dashboard/stats').json()
    assert stats['successful_generations'] == 1
    assert stats['by_category'][kind] == 1
    if kind == 'image':
        image = client.get(result['image_url'])
        assert image.status_code == 200
        assert image.headers['content-type'] == 'image/png'
        assert client.delete('/api/content/' + result['id']).status_code == 200
        assert client.get(result['image_url']).status_code == 404


def test_valid_pdf_txt_and_long_document_export(client):
    register(client)
    result = client.post('/api/content', json={'kind': 'blog', 'title': 'Readable <document>', 'text': ('A useful paragraph with safe symbols < > & and café.\n\n' * 120)}).json()
    response = client.get('/api/content/' + result['id'] + '/export?format=pdf')
    assert response.status_code == 200, response.text[:200] if response.status_code != 200 else ''
    assert response.content.startswith(b'%PDF-')
    assert response.content.count(b'/Type /Page') > 2
    text = client.get('/api/content/' + result['id'] + '/export?format=txt')
    assert 'café' in text.text


def test_missing_provider_is_honest_and_records_failure(cfg):
    with TestClient(create_app(settings=cfg), headers={'Origin': ORIGIN}) as client:
        register(client)
        assert not client.get('/health').json()['text_generation_configured']
        assert client.post('/api/generate/blog', json={'topic': 'A real topic'}).status_code == 503
        assert client.get('/api/content').json()['total'] == 0
        assert client.get('/api/dashboard/stats').json()['failed_generations'] == 1


def test_provider_timeout_and_invalid_response_errors(client):
    register(client)
    async def unavailable(_):
        raise HTTPException(504, 'Provider timeout')
    client.app.state.ai.generate_blog = unavailable
    assert client.post('/api/generate/blog', json={'topic': 'Valid topic'}).status_code == 504
    assert client.get('/api/content').json()['total'] == 0


def test_generation_validation_rate_limits_and_real_stats(client):
    register(client)
    assert client.post('/api/generate/blog', json={'topic': 'x', 'word_count': 99999}).status_code == 422
    assert client.get('/api/dashboard/stats').json()['saved_items'] == 0
    for _ in range(10):
        assert client.post('/api/generate/twitter', json={'topic': 'Useful topic'}).status_code == 201
    assert client.post('/api/generate/twitter', json={'topic': 'Useful topic'}).status_code == 429
    assert len(client.get('/api/dashboard/recent-content').json()['items']) == 5


def test_profile_and_settings_persist(client):
    register(client)
    assert client.put('/api/users/me', json={'name': 'New display name'}).json()['name'] == 'New display name'
    assert client.put('/api/users/me/settings', json={'default_tone': 'Friendly', 'default_language': 'English', 'brand_context': 'A careful software studio'}).status_code == 200
    assert client.get('/api/users/me/settings').json()['default_tone'] == 'Friendly'


def test_post_visual_sound_and_ownership(client, cfg):
    register(client)
    visual=client.post('/api/generate/image',json={'topic':'An editorial studio visual'}).json()
    post=client.post('/api/content',json={'kind':'facebook','title':'A useful social post','text':'A useful idea for our community.'}).json()
    payload={'title':post['title'],'text':post['text'],'image_id':visual['id'],'sound_effect':'chime'}
    response=client.put('/api/content/'+post['id'],json=payload)
    assert response.status_code==200
    assert response.json()['image_id']==visual['id']
    assert response.json()['sound_effect']=='chime'
    assert client.get('/api/content/'+post['id']).json()['sound_effect']=='chime'
    with TestClient(create_app(settings=cfg,ai=FakeAI()),headers={'Origin':ORIGIN}) as peer:
        register(peer,'cover-peer@example.com')
        own=peer.post('/api/content',json={'kind':'threads','title':'My private post','text':'A separate account.'}).json()
        assert peer.put('/api/content/'+own['id'],json=payload).status_code==404
        assert peer.get(visual['image_url']).status_code==404
    assert client.put('/api/content/'+post['id'],json={**payload,'image_id':'not-a-uuid'}).status_code==422
    assert client.put('/api/content/'+post['id'],json={**payload,'sound_effect':'untrusted'}).status_code==422


def test_failed_images_do_not_consume_allowance(cfg):
    class RecoveringImageAI(FakeAI):
        attempts=0
        async def generate_image(self,parameters):
            self.attempts+=1
            if self.attempts==1:raise HTTPException(503,'Temporary provider outage')
            return await super().generate_image(parameters)
    with TestClient(create_app(settings=cfg,ai=RecoveringImageAI()),headers={'Origin':ORIGIN}) as client:
        register(client)
        assert client.get('/api/usage').json()['images_remaining']==20
        assert client.post('/api/generate/image',json={'topic':'A garden illustration'}).status_code==503
        assert client.get('/api/usage').json()['images_remaining']==20
        assert client.post('/api/generate/image',json={'topic':'A garden illustration'}).status_code==201
        assert client.get('/api/usage').json()['images_remaining']==19


def test_primary_outage_uses_backup_writer(cfg,monkeypatch):
    from app.services.ai_service import AIService
    cfg.cloudflare_account_id='test-account'
    cfg.cloudflare_api_token='test-only-token'
    service=AIService(cfg)
    calls=[]
    async def unavailable(kind,parameters):raise HTTPException(503,'Primary provider busy')
    async def backup(kind,parameters):
        calls.append(kind)
        output,_=await FakeAI().text(parameters)
        return output,'test-only-backup'
    monkeypatch.setattr(service,'gemini_text',unavailable)
    monkeypatch.setattr(service,'cloudflare_text',backup)
    with TestClient(create_app(settings=cfg,ai=service),headers={'Origin':ORIGIN}) as client:
        register(client)
        response=client.post('/api/generate/instagram',json={'topic':'A practical gardening tip'})
        assert response.status_code==201
        assert response.json()['model']=='test-only-backup'
        assert calls==['instagram']

