import {Link,useNavigate} from "react-router-dom";
import {useEffect,useState} from "react";
import useAuth from "../hooks/useAuth";
import {api} from "../services/api";
import {tools,type Stats,type Content} from "../types/studio";
import WorkspaceHeader from "../components/WorkspaceHeader";

const contentTypes=tools;

export default function Dashboard() {
  const navigate = useNavigate();

  const {user}=useAuth();
  const userName=user?.name||"Creator";
  const [stats,setStats]=useState<Stats|null>(null);
  const [recent,setRecent]=useState<Content[]>([]);
  const [error,setError]=useState("");
  useEffect(()=>{Promise.all([api<Stats>("/api/dashboard/stats"),api<{items:Content[]}>("/api/dashboard/recent-content")]).then(([s,r])=>{setStats(s);setRecent(r.items)}).catch(e=>setError(e.message));},[]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <WorkspaceHeader/>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Welcome */}

        <section className="mb-12">

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Creator Dashboard
          </p>

          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {userName}
            </span>{" "}
            👋
          </h2>

          <p className="mt-4 max-w-2xl text-slate-400">
            Choose what you want to create and let AI handle the hard work.
            Generate professional content in seconds.
          </p>

        </section>

        {error&&<p role="alert" className="mb-6 text-red-300">{error}</p>}
        <section aria-label="Your content statistics" className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">{[["Saved items",stats?.saved_items],["Successful generations",stats?.successful_generations],["Image creations",stats?.by_category.image],["Failed requests",stats?.failed_generations]].map(([label,value])=><div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><p className="text-xs text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold text-cyan-300">{value??"—"}</p></div>)}</section>
        {/* ================= CONTENT TYPES ================= */}

        <section>

          <div className="mb-6 flex items-end justify-between">

            <div>
              <h3 className="text-2xl font-bold">
                Create Content
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select a content type to get started.
              </p>
            </div>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

{contentTypes.map((type) => (
  <button
    key={type.title}
    type="button"
    onClick={() => navigate(type.path)}
    className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900 hover:shadow-xl hover:shadow-cyan-500/10"
  >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-3xl ring-1 ring-cyan-400/10 transition group-hover:scale-110">
                  {type.icon}
                </div>

                <h4 className="text-xl font-bold">
                  {type.title}
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {type.description}
                </p>

                <div className="mt-5 font-semibold text-cyan-400">
                  Create now →
                </div>

              </button>

            ))}

          </div>

        </section>

        {/* ================= RECENT CONTENT ================= */}

        <section className="mt-16">

          <div className="mb-6">

            <h3 className="text-2xl font-bold">
              Recent Content
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your recently generated content will appear here.
            </p>

          </div>

          {recent.length>0?<div className="grid gap-4 md:grid-cols-2">{recent.map(item=><Link to={"/history/"+item.id} key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-cyan-400/40"><span className="text-xs uppercase tracking-wider text-cyan-400">{item.kind}</span><h4 className="mt-2 font-semibold">{item.title}</h4><p className="mt-2 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p></Link>)}</div>:(
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              📄
            </div>

            <h4 className="text-lg font-semibold">
              No content yet
            </h4>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Start creating your first piece of AI-generated content and
              it will appear here.
            </p>

          </div>
          )}

        </section>

      </main>

    </div>
  );
}