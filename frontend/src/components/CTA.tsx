import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-slate-950 px-4 py-28 sm:px-6 lg:px-8"
    >
      {/* Background effects */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="pointer-events-none absolute left-10 top-10 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-10 right-10 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">

        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-16 text-center shadow-2xl sm:px-12">

          {/* Icon */}

       <div className="site-container"></div>

          {/* Heading */}

          <h2 className="mt-8 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Ready to create
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              amazing content?
            </span>
          </h2>

          {/* Description */}

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Start creating professional content with AI today.
            Save time, increase productivity and bring your ideas to life.
          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

            <Link
              to="/register"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-500/40 sm:w-auto"
            >
              Open Your Workspace →
            </Link>

            <Link
              to="/login"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-8 py-4 font-semibold text-white transition duration-300 hover:border-cyan-400 hover:bg-slate-800 sm:w-auto"
            >
              I Already Have an Account
            </Link>

          </div>

          {/* Trust text */}

          <p className="mt-8 text-sm text-slate-500">
            Write, save, and refine your work in one place.
          </p>

        </div>

      </div>
    </section>
  );
}