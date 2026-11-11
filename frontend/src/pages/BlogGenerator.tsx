import { useState } from "react";
import {Link} from "react-router-dom";
import {api} from "../services/api";
import {tools,type Kind,type Content,type Health} from "../types/studio";
import ContentEditor from "../components/ContentEditor";
import WorkspaceHeader from "../components/WorkspaceHeader";
import {useEffect} from "react";

export default function BlogGenerator({kind="blog"}:{kind?:Kind}) {
  const tool=tools.find(t=>t.kind===kind)!;
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [content,setContent]=useState<Content|null>(null);
  const [audience,setAudience]=useState("General audience");
  const [language,setLanguage]=useState("English");
  const [keywords,setKeywords]=useState("");
  const [instructions,setInstructions]=useState("");
  const [industry,setIndustry]=useState("");
  const [brandContext,setBrandContext]=useState("");
  const [style,setStyle]=useState("Editorial illustration");
  const [aspectRatio,setAspectRatio]=useState("16:9");
  const [error,setError]=useState("");
  const [health,setHealth]=useState<Health|null>(null);
  useEffect(()=>{api<Health>("/health").then(setHealth).catch(()=>{});api<{default_tone:string;default_language:string;brand_context:string}>("/api/users/me/settings").then(p=>{setTone(p.default_tone);setLanguage(p.default_language);setBrandContext(p.brand_context)}).catch(()=>{});},[]);
  const [loading, setLoading] = useState(false);

  const generateBlog = async () => {
    if(topic.trim().length<3){setError("Please enter a topic of at least 3 characters.");return;}
    setError("");setLoading(true);
    try{const result=await api<Content>("/api/generate/"+kind,{method:"POST",body:JSON.stringify({topic,tone,word_count:({Short:250,Medium:700,Long:1500} as Record<string,number>)[length],audience,language,keywords,instructions,industry,brand_context:brandContext,style,aspect_ratio:aspectRatio})});setContent(result);}
    catch(error){setError((error as Error).message);}
    finally{setLoading(false);}
  };
  const clearContent = () => {if(content&&!confirm("Start a new brief? Your saved item stays in the library."))return;setTopic("");setContent(null);setError("");};
  const createDraft = async () => {setLoading(true);setError("");try{setContent(await api<Content>("/api/content",{method:"POST",body:JSON.stringify({kind,title:topic.trim()||"Untitled "+tool.title+" draft",text:""})}));}catch(error){setError((error as Error).message);}finally{setLoading(false);}};

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <WorkspaceHeader subtitle={tool.title}/>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Heading */}

        <div className="mb-10">

          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
            {tool.title}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
            Create your next{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {kind==="image"?"original visual":"piece of content"}
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Describe your brief, generate a result, and refine it in your private workspace.
          </p>

        </div>

        {/* ================= WORKSPACE ================= */}

        <div className="grid gap-8 lg:grid-cols-2">

          {/* ================= INPUT ================= */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-xl">

            <h2 className="text-xl font-bold">
              {tool.title} Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose your brief and preferences. Generated results are saved automatically.
            </p>

            {/* Topic */}

            <div className="mt-7">

              <label htmlFor="topic" className="mb-2 block text-sm font-semibold text-slate-300">
                {kind==="image"?"Image Prompt":"Topic / Brief"}
              </label>

              <textarea
                id="topic" maxLength={3000} value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: The future of Artificial Intelligence in education"
                rows={7}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white placeholder-slate-600 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

            </div>

            {/* Options */}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>

                <label htmlFor="tone" className="mb-2 block text-sm font-semibold text-slate-300">
                  Tone
                </label>

                <select
                  id="tone" value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Creative</option>
                  <option>Persuasive</option>
                  <option>Educational</option>
                </select>

              </div>

              <div>

                <label htmlFor="length" className="mb-2 block text-sm font-semibold text-slate-300">
                  Length
                </label>

                <select
                  id="length" value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option>Short</option>
                  <option>Medium</option>
                  <option>Long</option>
                </select>

              </div>

            </div>

            <div className="mt-6 space-y-5">
              {kind!=="image"&&<><label className="block text-sm font-semibold text-slate-300">Target audience<input value={audience} onChange={e=>setAudience(e.target.value)} maxLength={200} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label><label className="block text-sm font-semibold text-slate-300">Language<input value={language} onChange={e=>setLanguage(e.target.value)} maxLength={60} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label><label className="block text-sm font-semibold text-slate-300">Keywords<input value={keywords} onChange={e=>setKeywords(e.target.value)} maxLength={500} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>{kind==="linkedin"&&<label className="block text-sm font-semibold text-slate-300">Industry<input value={industry} onChange={e=>setIndustry(e.target.value)} maxLength={200} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>}</>}
              {kind==="image"&&<><label className="block text-sm font-semibold text-slate-300">Image style<select value={style} onChange={e=>setStyle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"><option>Editorial illustration</option><option>Photorealistic</option><option>3D render</option><option>Minimal graphic</option><option>Watercolor</option></select></label><label className="block text-sm font-semibold text-slate-300">Aspect ratio<select value={aspectRatio} onChange={e=>setAspectRatio(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3">{["1:1","16:9","9:16","4:3","3:4"].map(r=><option key={r}>{r}</option>)}</select></label></>}
              <label className="block text-sm font-semibold text-slate-300">Additional instructions<textarea value={instructions} onChange={e=>setInstructions(e.target.value)} maxLength={3000} rows={3} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
            </div>
            {health&&!(kind==="image"?health.image_generation_configured:health.text_generation_configured)&&<p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">AI generation is not configured yet. {kind==="image"?"The owner needs to enable the image service.":"You can still write, save, and export your own drafts."} <Link to="/settings" className="underline">View service status</Link></p>}
            {error&&<p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
            {/* Generate */}

            <button
              type="button"
              onClick={generateBlog}
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Working…" : "✨ Generate "+tool.title}
            </button>

            {kind!=="image"&&<button type="button" disabled={loading} onClick={createDraft} className="mt-3 w-full rounded-xl border border-slate-700 py-3 text-sm font-semibold text-slate-300">Write a manual draft</button>}
            {/* Clear */}

            {content && (
              <button
                type="button"
                onClick={clearContent}
                className="mt-3 w-full rounded-xl border border-slate-700 py-3 text-sm font-semibold text-slate-400 transition hover:border-red-400 hover:text-red-400"
              >
                Clear
              </button>
            )}

          </div>

          {/* ================= RESULT ================= */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-xl">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Generated Content
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Edit your result, save changes, or export it.
                </p>
              </div>


            </div>

            {/* Empty */}

            {!content && !loading && (
              <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 text-4xl">
                    ✍️
                  </div>

                  <h3 className="font-semibold text-slate-300">
                    Nothing generated yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                    Enter a brief and choose a generator to create your
                    first result.
                  </p>

                </div>

              </div>
            )}

            {/* Loading */}

            {loading && (
              <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

                  <h3 className="font-semibold text-slate-300">
                    Creating your content…
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Please wait a moment.
                  </p>

                </div>

              </div>
            )}

            {/* Result */}

            {content && !loading && <ContentEditor key={content.id} content={content} onSave={setContent}/>}

          </div>

        </div>

      </main>

    </div>
  );
}
