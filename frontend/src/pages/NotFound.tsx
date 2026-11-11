import {Link} from 'react-router-dom';
export default function NotFound(){return <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-6 text-center text-white"><p className="text-cyan-400">404</p><h1 className="text-4xl font-bold">This page isn’t here.</h1><Link className="rounded-xl border border-slate-700 px-6 py-3" to="/">Return home</Link></main>}
