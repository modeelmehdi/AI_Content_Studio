# Free deployment

Use Render Free for FastAPI, Atlas Free for persistence, and Vercel Hobby or the existing authorized Netlify account for the frontend. Never use an ephemeral filesystem as the production database. Free hosting may sleep, impose quotas, or become unavailable; a first request can take longer after inactivity.

1. Push the source to the owner's existing GitHub repository without force-pushing.
2. Create a readWrite Atlas user limited to `ai_content_studio` on the selected free cluster. Allow only the required development/hosting outbound addresses. Do not grant admin access or enable paid upgrades.
3. Create a Render web service from `render.yaml`, or use Python, root `backend`, build `pip install -r requirements.lock.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, and explicitly select Free.
4. Set production environment variables privately: `ENVIRONMENT=production`, `DATABASE_BACKEND=mongodb`, `MONGODB_URI`, `MONGODB_DATABASE=ai_content_studio`, a random `JWT_SECRET` of at least 32 characters, `SECURE_COOKIES=true`, exact HTTPS `ALLOWED_ORIGINS`, `GEMINI_API_KEY`, `GEMINI_TEXT_MODEL=gemini-3.1-flash-lite`. Leave image and Cloudinary values blank for the free text release.
5. Configure the frontend proxy with the verified backend URL using `node scripts/configure-deployment.mjs https://YOUR-SERVICE.onrender.com`. The template placeholder must never be deployed. Vercel project root is `frontend`, Vite output `dist`. Keep `VITE_API_URL` blank for same-origin cookie/proxy operation.
6. Check health, registration, generation, persistence, logout, exports and responsive UI on the actual public URL. Do not mark deployment complete before these checks pass.

Never place Gemini, MongoDB or JWT secrets in frontend variables, Git, screenshots or logs. `.env`, `.local`, runtime data and deployment account state are ignored.

Social share links work without API subscriptions. They are not connected-account auto-publishing. Image generation remains unavailable unless a genuinely free supported provider is separately implemented and verified, or the owner changes the free-only requirement.

## Current free image and hosting configuration

The current release uses Vercel Hobby for the Python backend, because Render requested a card. Run the official Vercel CLI from backend, link the new project, set production variables privately and deploy with --prod. backend/vercel.json declares the FastAPI entrypoint, execution limit and Mumbai region. .vercelignore excludes private environment files, local data and tests from the upload. The .python-version file selects Python 3.12.

Set IMAGE_PROVIDER=cloudflare, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN and MEDIA_STORAGE=mongodb. Use a token limited to Workers AI Read/Edit for this account. Remain on Workers AI Free; never enable a paid fallback. The image model is fixed to @cf/black-forest-labs/flux-1-schnell. Free image requests have bounded timeouts and useful quota errors. Each user is limited to three images daily, the workspace to twenty, and the saved library to 100 compacted images. MongoDB stores image data separately from listable content records; the ownership-checked image endpoint serves it privately.

Run scripts/configure-deployment.mjs with the verified HTTPS backend origin to generate the Netlify same-origin proxy and update the optional Vercel frontend configuration. Netlify uploads frontend/dist only. Backend secrets never enter the frontend build.
