# AI Content Studio frontend

The supplied React/TypeScript/Vite interface is preserved and connected to the FastAPI API. See the root README for setup and verified capabilities.

- `npm ci`, then `npm run dev -- --host 127.0.0.1 --port 5175`
- `npm run lint` and `npm run build`
- Development proxies `/api` and `/health` to port 8000.
- Production must proxy these paths to the deployed backend; keep VITE_API_URL blank for same-origin cookies.
- No Gemini, database, JWT or Cloudinary secrets belong in frontend environment variables.
- Social links open user-controlled sharing flows. Direct publishing is not configured.
