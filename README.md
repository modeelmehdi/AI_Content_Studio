# AI Content Studio

An authenticated writing workspace by **Modeel Mehdi**. Generate blog articles, LinkedIn posts, Instagram captions, X/Twitter posts and SEO copy; edit results, search your saved library, and export TXT or PDF. The supplied cyan/navy frontend is preserved and connected to a real FastAPI backend.

[Owner's portfolio](https://modeelmehdi.netlify.app) · [Portfolio administration](https://modeelmehdi.netlify.app/admin)

## Implemented

- React 19, TypeScript and Vite frontend with responsive workspace routes.
- FastAPI, PyMongo Async, MongoDB persistence and typed validation.
- Argon2 passwords, HttpOnly access/refresh cookies, rotating revocable sessions, CSRF and ownership checks.
- Five real Gemini text generators, bounded retries, useful errors and request limits.
- Manual drafts, editing, search, filters, pagination, statistics and preferences.
- PDF/TXT exports and user-controlled social sharing links.
- Real image/Cloudinary adapters, disabled in the free text release.

Social links open a composer or copy content and open the chosen app. Users review and publish there. Studio does not connect social accounts or publish automatically on login.

## Run locally

Requires Python 3.12+ and Node.js 22+.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.lock.txt
npm ci
npm --prefix frontend ci
.\.venv\Scripts\python.exe scripts/setup-local.py
```

In separate terminals:

```powershell
npm run db:local
```

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

```powershell
npm run frontend
```

Open http://127.0.0.1:5175. Configure an authorized free-tier Gemini key and supported text model in ignored backend/.env. Without provider configuration, manual drafts work and generation reports configuration errors. The local database script runs actual MongoDB with persistent development data in ignored .local/mongodb. Production uses Atlas.

## Validation

```powershell
npm run lint
npm run build
cd backend
$env:TEST_MONGODB_URI='mongodb://127.0.0.1:27019'
..\.venv\Scripts\python.exe -m pytest -q
```

The suite covers SQLite and real MongoDB when TEST_MONGODB_URI is set. Fake AI fixtures exist only inside tests. All five real free-tier text generators, persistence and PDF export passed local verification; see [recorded results](docs/LOCAL_VERIFICATION.json). Local checks do not establish production availability.

## Deployment and limits

[Free deployment](docs/DEPLOYMENT.md) · [Architecture](docs/ARCHITECTURE.md) · [API](docs/API_DOCUMENTATION.md) · [Audit](PROJECT_AUDIT.md)

Render configuration selects Free; Atlas uses the existing Free cluster. No paid subscription or billing integration is enabled. Free tiers have quotas and sleeping instances. Gemini image generation is disabled because the selected image models are not free. Connected-account publishing needs separate provider OAuth applications and permissions. API keys, database passwords and session secrets stay out of Git and browser code.
