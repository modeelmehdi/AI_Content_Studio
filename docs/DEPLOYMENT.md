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
