import {MongoMemoryServer} from 'mongodb-memory-server';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const dbPath=fileURLToPath(new URL('../.local/mongodb/',import.meta.url));
await mkdir(dbPath,{recursive:true});
const server=await MongoMemoryServer.create({instance:{ip:'127.0.0.1',port:27019,dbPath,storageEngine:'wiredTiger'}});
console.log('Local MongoDB ready at '+server.getUri()+'; data persists in .local/mongodb. For development only.');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await server.stop({doCleanup:false});process.exit(0)});
setInterval(()=>{},60000);
