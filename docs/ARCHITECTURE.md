# Architecture

The owner's supplied React/Vite frontend retains its cyan/navy design. React Router protects workspace routes. A centralized fetch client sends HttpOnly cookies, CSRF headers, and refreshes expired access sessions once. No passwords or access tokens are stored in localStorage.

FastAPI validates typed input and checks ownership on every content operation. PyMongo Async stores users, revocable sessions, generated content, preferences and usage. Production requires MongoDB and secure cookies; SQLite is an explicit development/test option with no automatic fallback.

Passwords use Argon2. Signed JWT access and rotating refresh cookies reference revocable server sessions. Mutations require a trusted Origin and authenticated operations require CSRF. Database-backed limits cover authentication and generation. Keys remain server-side.

Gemini returns validated structured text. Generation is persisted before the frontend receives success. Five text tools are configured with the verified free-tier model. Image generation has a real adapter but remains disabled because the selected Google image models have no free tier. Cloudinary authenticated media storage is required before enabling production images. No fake generation runs in the app; injected providers exist only in automated tests.

Exports use ownership-checked TXT/PDF endpoints. ReportLab embeds the included Noto Sans font and paginates output. Private image responses proxy authenticated storage rather than exposing credentials.

Social sharing opens user-controlled composers or copies content and opens a platform. It does not authenticate social accounts or report posts as published. Direct account publishing requires separately configured provider OAuth applications, reviewed scopes and an explicit publish step.
