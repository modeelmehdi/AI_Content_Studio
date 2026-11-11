import {readFileSync,writeFileSync} from 'node:fs';
const origin=process.argv[2];
if(!origin||!/^https:\/\/[a-z0-9-]+\.onrender\.com$/.test(origin))throw Error('Provide the verified HTTPS Render service origin.');
const path=new URL('../frontend/vercel.json',import.meta.url);
const config=JSON.parse(readFileSync(path,'utf8'));
config.rewrites[0].destination=origin+'/api/:path*';config.rewrites[1].destination=origin+'/health';
writeFileSync(path,JSON.stringify(config,null,2)+'\n');console.log('Configured same-origin API proxy. No credentials were written.');
