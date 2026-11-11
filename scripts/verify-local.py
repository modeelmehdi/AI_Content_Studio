"""Opt-in live integration check against the running local app. Uses free configured text model."""
import json
import secrets
import time
from pathlib import Path
import httpx

root = Path(__file__).resolve().parents[1]
results = []
with httpx.Client(base_url='http://127.0.0.1:8000', headers={'Origin': 'http://127.0.0.1:5175'}, timeout=120) as client:
    health = client.get('/health')
    results.append({'check': 'API health and MongoDB', 'passed': health.status_code == 200 and health.json()['database'] == 'mongodb'})
    email = f'integration-{int(time.time())}@example.com'
    response = client.post('/api/auth/register', json={'name': 'Integration QA', 'email': email, 'password': secrets.token_urlsafe(24) + '7'})
    response.raise_for_status()
    client.headers['X-CSRF-Token'] = response.json()['csrf_token']
    for kind in ['blog', 'linkedin', 'instagram', 'twitter', 'seo']:
        response = client.post('/api/generate/' + kind, json={'topic': 'Why clear documentation and accessible interfaces help people use software', 'word_count': 100, 'instructions': 'Do not invent achievements, statistics, quotations, or sources. Use plain text without emoji.'})
        ok = response.status_code == 201
        record = {'check': 'Real free-tier Gemini ' + kind, 'passed': ok, 'status': response.status_code}
        if ok:
            item = response.json()
            record['model'] = item['model']
            record['persisted'] = client.get('/api/content/' + item['id']).status_code == 200
            if kind == 'blog':
                pdf = client.get('/api/content/' + item['id'] + '/export?format=pdf')
                record['pdf_valid'] = pdf.status_code == 200 and pdf.content.startswith(b'%PDF-')
                if record['pdf_valid']:
                    (root / 'backend/data/verified-export.pdf').write_bytes(pdf.content)
        else:
            record['message'] = response.json().get('detail', 'Request failed')
        results.append(record)
        print(json.dumps(record), flush=True)
    results.append({'check': 'Paid image service remains disabled', 'passed': not client.get('/health').json()['image_generation_configured']})
    results.append({'check': 'Logout', 'passed': client.post('/api/auth/logout').status_code == 200})
report = {'tested_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'scope': 'Local API + real MongoDB + real free-tier Gemini text requests', 'results': results}
(root / 'docs').mkdir(exist_ok=True)
(root / 'docs/LOCAL_VERIFICATION.json').write_text(json.dumps(report, indent=2), encoding='utf8')
print('Saved sanitized verification report; no credentials printed.')
