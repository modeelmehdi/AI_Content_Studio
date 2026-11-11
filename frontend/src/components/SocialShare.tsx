import {useState} from 'react';

export default function SocialShare({text,title}:{text:string;title:string}) {
  const [notice,setNotice]=useState('');
  const encoded=encodeURIComponent(text);
  async function copyFor(name:string) {
    try {await navigator.clipboard.writeText(text);setNotice(`Copied. Paste into ${name}, review, then publish there.`);}
    catch {setNotice(`Select and copy your content above, then paste into ${name}.`);}
  }
  return <section aria-label="Share your reviewed content" className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 space-y-3">
    <h3 className="font-semibold text-white">Review & share</h3>
    <p className="text-xs leading-5 text-slate-400">You choose what to publish. These links open social apps; your accounts are not connected to Studio. Instagram requires an image or video added in Instagram.</p>
    <div className="flex flex-wrap gap-2">
      <a className="rounded-lg border border-slate-600 px-3 py-2 text-sm" href={`https://x.com/intent/tweet?text=${encoded}`} target="_blank" rel="noopener noreferrer" onClick={e=>{if(Array.from(text).length>280){e.preventDefault();setNotice('Shorten the content to 280 characters before opening X, or copy it to create a thread there.')}}}>Compose on X / Twitter</a>
      <a className="rounded-lg border border-slate-600 px-3 py-2 text-sm" href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
      {[
        ['Instagram','https://www.instagram.com/'],
        ['Facebook','https://www.facebook.com/'],
        ['LinkedIn','https://www.linkedin.com/feed/'],
        ['Threads','https://www.threads.com/'],
      ].map(([name,url])=><a key={name} className="rounded-lg border border-slate-600 px-3 py-2 text-sm" href={url} target="_blank" rel="noopener noreferrer" onClick={()=>{void copyFor(name)}}>Copy & open {name}</a>)}
      {typeof navigator.share==='function'&&<button className="rounded-lg border border-cyan-700 px-3 py-2 text-sm text-cyan-300" onClick={async()=>{try{await navigator.share({title,text});setNotice('Share sheet opened. Complete sharing in your selected app.')}catch(e){if((e as Error).name!=='AbortError')setNotice('Sharing is unavailable here. Use a platform link or Copy.')}}}>More sharing options</button>}
    </div>
    <p className="text-xs text-cyan-300" role="status">{notice}</p>
  </section>;
}
