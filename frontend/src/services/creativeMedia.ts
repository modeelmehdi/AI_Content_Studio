export type SoundEffect='none'|'chime'|'pop'|'whoosh';

export function effectSamples(effect:SoundEffect,rate=44100){
  const data=new Float32Array(Math.round(rate*1.6));let phase=0,last=0;
  for(let i=0;i<data.length;i++){
    const t=i/rate;let value=0;
    if(effect==='chime')for(const [start,hz] of [[0,523.25],[0.14,659.25],[0.28,783.99]]){const x=t-start;if(x>=0)value+=Math.sin(2*Math.PI*hz*x)*Math.exp(-x*5)*Math.min(1,x*100)*0.22;}
    if(effect==='pop'){phase+=2*Math.PI*(80+900*Math.exp(-t*18))/rate;value=Math.sin(phase)*Math.exp(-t*22)*Math.min(1,t*500)*0.65;}
    if(effect==='whoosh'){const noise=Math.sin(i*12.9898+78.233)*43758.5453;last=last*0.85+((noise-Math.floor(noise))*2-1)*0.15;const x=Math.min(1,t/0.85);value=last*Math.sin(Math.PI*x)*1.7;}
    data[i]=Math.max(-0.85,Math.min(0.85,value));
  }
  return data;
}

export function effectWav(effect:SoundEffect){
  const samples=effectSamples(effect);const buffer=new ArrayBuffer(44+samples.length*2);const view=new DataView(buffer);
  function text(at:number,value:string){for(let i=0;i<value.length;i++)view.setUint8(at+i,value.charCodeAt(i));}
  text(0,'RIFF');view.setUint32(4,36+samples.length*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,44100,true);view.setUint32(28,88200,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,samples.length*2,true);
  samples.forEach((v,i)=>view.setInt16(44+i*2,Math.round(v*32767),true));
  return new Blob([buffer],{type:'audio/wav'});
}

export async function previewEffect(effect:SoundEffect){
  const context=new AudioContext();try{await context.resume();const samples=effectSamples(effect,context.sampleRate);const buffer=context.createBuffer(1,samples.length,context.sampleRate);buffer.getChannelData(0).set(samples);const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);await new Promise<void>(resolve=>{source.onended=()=>resolve();source.start()});}finally{await context.close();}
}

export function saveBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}

export function recordingMime(){
  if(typeof MediaRecorder==='undefined')return '';
  return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(type=>MediaRecorder.isTypeSupported(type))||'';
}

export async function renderMotionPost({title,text,imageUrl,sound,portrait,onProgress}:{title:string;text:string;imageUrl:string;sound:SoundEffect;portrait:boolean;onProgress:(p:number)=>void}){
  const mime=recordingMime();if(!mime)throw Error('Video rendering is unavailable in this browser. You can still use the image and WAV sound separately.');
  const response=await fetch(imageUrl,{credentials:'include'});if(!response.ok)throw Error('Your saved image could not be loaded. Choose another visual.');
  const imageBlob=await response.blob();const imageObjectUrl=URL.createObjectURL(imageBlob);const image=new Image();
  try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('Image preview could not be loaded.'));image.src=imageObjectUrl;});}finally{URL.revokeObjectURL(imageObjectUrl);}
  const canvas=document.createElement('canvas');canvas.width=720;canvas.height=portrait?1280:720;const ctx=canvas.getContext('2d');if(!ctx||!canvas.captureStream)throw Error('Your browser does not support video rendering.');
  const audio=new AudioContext();let stream:MediaStream|undefined;
  try{
    await audio.resume();const destination=audio.createMediaStreamDestination();const samples=effectSamples(sound,audio.sampleRate);const audioBuffer=audio.createBuffer(1,samples.length,audio.sampleRate);audioBuffer.getChannelData(0).set(samples);const source=audio.createBufferSource();source.buffer=audioBuffer;source.connect(destination);
    stream=canvas.captureStream(30);destination.stream.getAudioTracks().forEach(track=>stream!.addTrack(track));const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3_000_000});const chunks:BlobPart[]=[];const completed=new Promise<Blob>((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>resolve(new Blob(chunks,{type:mime}));recorder.onerror=()=>reject(Error('Video rendering failed. Your post and image are still saved.'));});
    const width=canvas.width,height=canvas.height;
    function wrapped(value:string,y:number,font:string,lineHeight:number,maxLines:number){ctx!.font=font;ctx!.fillStyle='#fff';const words=value.split(/\s+/);let line='',lines=0;for(const word of words){if(ctx!.measureText(line+word).width>width-112&&line){ctx!.fillText(line.trim(),56,y);line='';y+=lineHeight;if(++lines>=maxLines)return;}line+=word+' ';}if(line&&lines<maxLines)ctx!.fillText(line.trim(),56,y);}
    const start=performance.now();
    function frame(now:number){const progress=Math.min(1,(now-start)/6000);const scale=Math.max(width/image.width,height/image.height)*(1+progress*0.035);ctx!.drawImage(image,(width-image.width*scale)/2,(height-image.height*scale)/2,image.width*scale,image.height*scale);const gradient=ctx!.createLinearGradient(0,0,0,height);gradient.addColorStop(0,'rgba(2,6,23,.12)');gradient.addColorStop(0.42,'rgba(2,6,23,.5)');gradient.addColorStop(1,'rgba(2,6,23,.96)');ctx!.fillStyle=gradient;ctx!.fillRect(0,0,width,height);ctx!.fillStyle='#22d3ee';ctx!.fillRect(56,height*0.5-55,64,6);wrapped(title,height*0.5,'bold 42px sans-serif',50,3);wrapped(text.slice(0,220),height*0.5+170,'26px sans-serif',37,portrait?8:3);onProgress(Math.round(progress*100));if(progress<1)requestAnimationFrame(frame);else recorder.stop();}
    recorder.start();source.start();requestAnimationFrame(frame);return {blob:await completed,extension:mime.startsWith('video/mp4')?'mp4':'webm'};
  }finally{stream?.getTracks().forEach(track=>track.stop());await audio.close();}
}
