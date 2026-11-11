export const API_BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
let refreshPromise:Promise<boolean>|null=null;
export function csrf(){return decodeURIComponent(document.cookie.split('; ').find(c=>c.startsWith('acs_csrf='))?.split('=').slice(1).join('=')||'')}
async function refresh(){
 if(!refreshPromise)refreshPromise=fetch(API_BASE+'/api/auth/refresh',{method:'POST',credentials:'include',headers:{'X-CSRF-Token':csrf()},signal:AbortSignal.timeout(20000)}).then(r=>r.ok).catch(()=>false).finally(()=>{refreshPromise=null});
 return refreshPromise;
}
export async function api<T>(path:string,options:RequestInit={},retry=true):Promise<T>{
 let response:Response;
 try{response=await fetch(API_BASE+path,{...options,credentials:'include',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf(),...options.headers},signal:options.signal||AbortSignal.timeout(120000)})}catch{throw Error('The server is unavailable or the request timed out. Please try again. Your saved content is safe.')}
 if(response.status===401&&retry&&!path.includes('/auth/login')&&!path.includes('/auth/register')&&await refresh())return api<T>(path,options,false);
 const data=await response.json().catch(()=>({detail:'The server returned an unreadable response.'}));
 if(!response.ok){if(response.status===401)window.dispatchEvent(new Event('studio-session-ended'));const detail=data.detail;throw Error(typeof detail==='string'?detail:Array.isArray(detail)?detail.map((e:{msg?:string})=>e.msg||'Invalid field').join(' '):'The request could not be completed.')}
 return data as T;
}
export function resource(path:string){return API_BASE+path}
export async function downloadFile(path:string,filename:string,retry=true){
 let response:Response;try{response=await fetch(resource(path),{credentials:'include',signal:AbortSignal.timeout(60000)})}catch{throw Error('Download failed. Please check your connection and try again.')}
 if(response.status===401&&retry&&await refresh())return downloadFile(path,filename,false);
 if(!response.ok){const data=await response.json().catch(()=>({detail:'Download could not be completed.'}));throw Error(typeof data.detail==='string'?data.detail:'Download could not be completed.')}
 const url=URL.createObjectURL(await response.blob());const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
