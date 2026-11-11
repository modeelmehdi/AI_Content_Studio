import {Link} from "react-router-dom";
const paths=["/blog-generator", "/generate/linkedin", "/generate/instagram", "/generate/twitter", "/generate/seo", "/generate/image"];
const contentTypes = [
  {
    icon: "📝",
    title: "Blog Posts",
    description:
      "Create detailed, engaging and SEO-friendly blog articles with AI.",
    tag: "Writing",
  },
  {
    icon: "💼",
    title: "LinkedIn Posts",
    description:
      "Generate professional LinkedIn content designed to increase engagement.",
    tag: "Social",
  },
  {
    icon: "📱",
    title: "Social Media",
    description:
      "Create captions and engaging content for Instagram and other platforms.",
    tag: "Social",
  },
  {
    icon: "📢",
    title: "X / Twitter Posts",
    description:
      "Draft concise social posts with visible character counts.",
    tag: "Marketing",
  },
  {
    icon: "✉️",
    title: "SEO Content",
    description:
      "Create search titles, meta descriptions and keyword suggestions.",
    tag: "Business",
  },
  {
    icon: "🎨",
    title: "AI Images",
    description:
      "Turn your ideas into creative visual concepts using AI-powered image generation.",
    tag: "Creative",
  },
];

export default function ContentTypes() {
  return (
    <section
      id="content-types"
      className="relative w-full overflow-hidden bg-slate-950 px-4 py-28 sm:px-6 lg:px-8"
    >
      {/* Background glow */}

      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Main centered container */}

      <div className="relative site-container">

        {/* ================= HEADING ================= */}

        <div className="mx-auto w-full max-w-4xl text-center">

          <span className="inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
            Content Types
          </span>

          <h2 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            One studio.

            <span className="mt-2 block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Every type of content.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Choose what you want to create and let AI handle the hard work.
            From professional articles to social media content, everything
            is available in one powerful studio.
          </p>

        </div>

        {/* ================= CONTENT CARDS ================= */}

        <div className="mx-auto mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {contentTypes.map((type,index) => (
            <div
              key={type.title}
              className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-7 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:bg-slate-900 hover:shadow-2xl hover:shadow-cyan-500/10"
            >

              {/* Top gradient */}

              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 transition group-hover:opacity-100" />

              {/* Icon */}

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-2xl ring-1 ring-cyan-400/10 transition duration-300 group-hover:scale-110">
                {type.icon}
              </div>

              {/* Tag */}

              <div className="mt-6">
                <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                  {type.tag}
                </span>
              </div>

              {/* Title */}

              <h3 className="mt-4 text-xl font-bold text-white">
                {type.title}
              </h3>

              {/* Description */}

              <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-400">
                {type.description}
              </p>

              {/* Action */}

              <Link
                to={paths[index]}
                className="mt-5 font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Create now

                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}