# API

Interactive schemas: `/docs`. Health: `GET /health` (configuration booleans only).

All mutation requests require an allowlisted `Origin`. Authenticated mutations additionally require the `X-CSRF-Token` header matching the CSRF cookie. Clients must include cookies. UUIDs and payloads are validated; resources belonging to other users return 404.

| Method | Path | Purpose |
|---|---|---|
| POST | /api/auth/register | name, email, password; create account and session |
| POST | /api/auth/login | email, password; create session |
| GET | /api/auth/me | Current user |
| POST | /api/auth/refresh | Rotate refresh token |
| POST | /api/auth/logout | Revoke session |
| GET, PUT | /api/users/me | Read/update profile |
| GET, PUT | /api/users/me/settings | Writing defaults |
| POST | /api/generate/{kind} | Generate and save: blog, linkedin, instagram, twitter, seo, image |
| GET, POST | /api/content | List/filter/paginate or save manual draft |
| GET, PUT, DELETE | /api/content/{id} | Read, edit, remove owned item |
| GET | /api/content/{id}/export?format=txt\|pdf | Download export |
| GET | /api/content/{id}/image | Authenticated image |
| GET | /api/dashboard/stats | Actual saved-content and usage counts |
| GET | /api/dashboard/recent-content | Recent owned items |

Generation input includes topic, tone, length, audience, language, keywords, instructions, industry, image_style and aspect_ratio. See live OpenAPI for exact limits and optional fields. Errors use `detail` and appropriate 400/401/403/404/422/429/502/503/504 status codes. Missing provider configuration returns a useful error, not generated-looking placeholder text.

## Post media and allowances

GET /api/usage returns the authenticated user's remaining image allowance, shared workspace availability, saved-library capacity and UTC reset time. Only successful image generations count toward daily image allowances.

PUT /api/content/{id} also accepts image_id (a valid UUID or null) and sound_effect (none, chime, pop, whoosh). Image references must point to an owned image; another account's image returns 404. Facebook and Threads are supported generator kinds in addition to the original six routes. Original effects and motion rendering are client-side; there is no paid audio or video API endpoint.
