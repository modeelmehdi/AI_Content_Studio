import {readFileSync,writeFileSync} from 'node:fs';
const origin=process.argv[2];
if(!origin||!/^https:\/\/[a-z0-9-]+\.(?:onrender\.com|vercel\.app)$/.test(origin))throw Error('Provide the verified HTTPS backend service origin.');
const path=new URL('../frontend/vercel.json',import.meta.url);
const config=JSON.parse(readFileSync(path,'utf8'));
config.rewrites[0].destination=origin+'/api/:path*';config.rewrites[1].destination=origin+'/health';
writeFileSync(path,JSON.stringify(config,null,2)+'\n');console.log('Configured same-origin API proxy. No credentials were written.');
writeFileSync(new URL('../netlify.toml',import.meta.url),`[build]
command = "npm --prefix frontend ci && npm --prefix frontend run build"
publish = "frontend/dist"
[[redirects]]
from = "/api/*"
to = "${origin}/api/:splat"
status = 200
force = true
[[redirects]]
from = "/health"
to = "${origin}/health"
status = 200
force = true
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
[[headers]]
for = "/*"
[headers.values]
X-Content-Type-Options = "nosniff"
X-Frame-Options = "DENY"
Referrer-Policy = "strict-origin-when-cross-origin"
Permissions-Policy = "camera=(), microphone=(), geolocation=()"
`);
