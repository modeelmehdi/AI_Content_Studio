# Current architecture

The supplied React/Vite frontend retains the owner's cyan/navy design. React Router protects workspace routes. A centralized API client sends HttpOnly cookies and CSRF headers and shares refresh requests. Authentication credentials never enter localStorage.

FastAPI validates inputs and enforces resource ownership. PyMongo Async stores users, revocable sessions, writing preferences, content, usage and history. Production requires MongoDB and secure cookies. SQLite is an explicit development/test option and never silently replaces Atlas.

Gemini generates validated structured text. Transient errors are retried within bounded timeouts; the verified Cloudflare Workers AI IBM Granite model provides a free backup. Generated records retain the actual provider model. The runtime never substitutes a test fixture or an unlabeled template for AI output.

Cloudflare FLUX.1 schnell creates real images on Workers AI Free. PIL validates and compacts them; separate MongoDB image records keep binary data out of list responses. Only the owner may read an image. A text post's image reference is validated against that same owner before saving. The optional Cloudinary adapter is retained but is not needed for this release.

Daily image allowances count successful generations, not failed requests. The app caps user and shared usage and bounds saved image storage. Provider Free-plan quotas can still limit requests. No paid fallback or automatic upgrade exists.

A post stores the selected image UUID and sound-effect name. Original sound is synthesized as PCM in the browser. Canvas and MediaRecorder create motion previews with an image, title, excerpt and effect. Video/audio files remain in browser memory until the user requests a download; the server does not claim to store rendered clips. MP4 is preferred when supported; WebM availability is disclosed.

Vercel Hobby runs the Python application. Netlify serves the static frontend and proxies API routes so cookies stay on one browser origin. Secrets are stored only in private hosting environment variables and ignored local files.

Social links use user-controlled composers or clipboard-and-open flows. They do not connect accounts or report a post as published. Direct publishing needs separately authorized platform applications and scopes.
