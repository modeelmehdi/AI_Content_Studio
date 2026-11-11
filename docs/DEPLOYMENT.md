# Free deployment and maintenance

The deployed release uses Vercel Hobby for FastAPI, Netlify for the frontend, Atlas Free, Gemini free text access and Cloudflare Workers AI Free. No paid plan or payment method was added. Render requested a card and was not used.

## Backend

Use Python 3.12 and the backend directory as the Vercel project root. backend/vercel.json declares FastAPI, a 120-second maximum execution time and the Mumbai region. .vercelignore excludes private environment files, local data and tests. .python-version selects Python 3.12.

Set these production values privately:

- ENVIRONMENT=production
- DATABASE_BACKEND=mongodb and MONGODB_DATABASE=ai_content_studio
- A restricted MONGODB_URI with readWrite only on the application database
- A random JWT_SECRET of at least 32 characters
- SECURE_COOKIES=true
- ALLOWED_ORIGINS=https://modeel-ai-content-studio.netlify.app
- GEMINI_API_KEY and GEMINI_TEXT_MODEL=gemini-3.1-flash-lite
- IMAGE_PROVIDER=cloudflare
- CLOUDFLARE_ACCOUNT_ID and a token limited to Workers AI Read/Edit
- MEDIA_STORAGE=mongodb

Keep Workers AI on Free and Google billing disabled. The fixed free-compatible image model is @cf/black-forest-labs/flux-1-schnell; the verified writing backup is @cf/ibm-granite/granite-4.0-h-micro. Neither path enables a paid fallback. Gemini image models are not used.

Link the authorized Vercel account to the correct GitHub identity before deploying owner-attributed commits. This repository uses Modeel's verified GitHub identity locally; global Git settings remain untouched. Do not disable author verification to work around a mismatch.

Use the official CLI to link the backend project and deploy with --prod. Supply secrets through stdin to env add with --sensitive, never command arguments or Git. A source upload must exclude .env, .env.local, .local, runtime data and account state.

## Frontend

Run scripts/configure-deployment.mjs with the verified HTTPS backend origin. It updates frontend/vercel.json and netlify.toml with same-origin API proxies. Never deploy a template placeholder.

Build from the repository root with npm run build. Upload frontend/dist to the separate modeel-ai-content-studio project. For an already verified local build, use Netlify deploy --no-build; reinstalling dependencies while a Windows preview holds native modules can cause a file lock. Leave VITE_API_URL blank for the same-origin proxy.

## Checks and limits

Verify public health, signup/sign-in, real generation, private history, saved media attachments, exports, logout and ownership. Do not confuse configuration flags with provider uptime. Provider outages and quotas must remain honest, recoverable states.

The application allows 20 successful images per user and 50 per workspace per UTC day, subject to provider limits. It stores up to 100 compacted images. Failed requests do not consume the application image allowance. Original WAV sound effects, guided templates, editing and in-browser motion rendering need no AI API credit.

Video format depends on browser support. MP4/H.264/AAC was verified in the test browser; other browsers may produce WebM, which some social apps require converting. The app labels the actual format and does not promise direct account publishing.

Never expose keys in frontend variables, logs, screenshots, archives or repository history. Test accounts and credentials are kept outside tracked source. Recheck free-tier policies before changing providers or limits.
