import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Features from "../components/Features";

import HowItWorks from "../components/HowItWorks";
import ContentTypes from "../components/ContentTypes";
import Pricing from "../components/Pricing";
import CTA from "../components/CTA";

export default function Home() {
  return (
    <MainLayout>

      {/* ================= HERO ================= */}

      <section
        id="home"
        className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-slate-950 px-6 py-24 text-center"
      >

        {/* Background effects */}

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="pointer-events-none absolute left-10 top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="pointer-events-none absolute bottom-10 right-10 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />

        {/* Hero content */}

        <div className="relative z-10 mx-auto max-w-5xl">

          {/* Badge */}

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-medium text-cyan-300">
            ✨ AI-powered content creation
          </div>

          {/* Heading */}

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Create Amazing Content

            <span className="mt-2 block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              From your next idea.
            </span>
          </h1>

          {/* Description */}

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Generate blogs, LinkedIn posts, SEO content,
            social media captions and AI-powered creative content
            in one private workspace.
          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

          <Link
  to="/register"
  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-semibold text-white shadow-xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-500/30 sm:w-auto"
>
  Open Your Workspace
</Link>

            <a
              href="#features"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-8 py-4 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-slate-800 sm:w-auto"
            >
              Explore Features
            </a>

          </div>

          {/* Trust points */}

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-400">

            <span>✓ AI Content Generation</span>

            <span>✓ Fast & Easy</span>

            <span>✓ Multiple Content Types</span>

            <span>✓ Built for Creators</span>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <Features />


      {/* ================= HOW IT WORKS ================= */}

      <HowItWorks />


      <ContentTypes />
      {/* ================= PRICING ================= */}

      <Pricing />
     {/* ================= CTA ================= */}

     <CTA />

    </MainLayout>
  );
}