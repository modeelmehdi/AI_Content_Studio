import {Link} from "react-router-dom";
const paths=["/blog-generator", "/generate/linkedin", "/generate/instagram", "/generate/image", "/generate/seo", "/history"];
const features = [
  {
    icon: "✍️",
    title: "AI Blog Writer",
    description:
      "Draft structured blog posts using a configured AI service.",
  },
  {
    icon: "💼",
    title: "LinkedIn Content",
    description:
      "Create professional LinkedIn posts designed to increase engagement and reach.",
  },
  {
    icon: "📱",
    title: "Social Media",
    description:
      "Generate engaging captions and social media content for your audience.",
  },
  {
    icon: "🎨",
    title: "AI Images",
    description:
      "Generate original visuals when image-model access is configured.",
  },
  {
    icon: "📢",
    title: "SEO Content",
    description:
      "Draft SEO titles, meta descriptions, and useful keyword suggestions.",
  },
  {
    icon: "⚡",
    title: "Private Library",
    description:
      "Save, search, edit, and export your content from a private library.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-slate-950 px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

     <div className="relative site-container">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">

          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Powerful Features
          </span>

          <h2 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Everything you need to

            <span className="mt-2 block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              create amazing content
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            AI Content Studio gives you powerful tools to create,
            manage and organize and export your content in one place.
          </p>

        </div>

        {/* Cards */}
        <div className="mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((feature,index) => (
            <div
              key={feature.title}
              className="group relative min-h-[270px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-7 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-500/10"
            >

              {/* Glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl transition group-hover:bg-cyan-500/20" />

              {/* Icon */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-2xl ring-1 ring-cyan-400/10 transition duration-300 group-hover:scale-110">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="relative mt-6 text-xl font-bold text-white">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="relative mt-4 min-h-[70px] text-sm leading-7 text-slate-400 sm:text-base">
                {feature.description}
              </p>

              {/* Link */}
              <Link
                to={paths[index]}
                className="relative mt-5 font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Explore feature
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>

            </div>
          ))}

        </div>

        {/* Bottom statement */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            Built for creators, marketers and businesses.
          </p>
        </div>

      </div>
    </section>
  );
}