const steps = [
  {
    number: "01",
    icon: "🎯",
    title: "Choose Your Content",
    description:
      "Select the type of content you want to create, such as a blog, LinkedIn post, social media caption or marketing copy.",
  },
  {
    number: "02",
    icon: "💡",
    title: "Describe Your Idea",
    description:
      "Tell AI what you want to create. Add your topic, audience, tone and any important details.",
  },
  {
    number: "03",
    icon: "🚀",
    title: "Generate & Refine",
    description:
      "Let AI create your content in seconds. Review, edit and use your finished content wherever you need it.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative w-full overflow-hidden bg-slate-900 px-4 py-28 sm:px-6 lg:px-8"
    >
      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-600/5 blur-3xl" />

      {/* ================= MAIN CONTAINER ================= */}

      <div className="relative site-container">

        {/* ================= HEADING ================= */}

        <div className="mx-auto w-full max-w-4xl text-center">

          <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-sm">
            How It Works
          </span>

          <h2 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Create content in

            <span className="mt-2 block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              three simple steps
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Creating professional content doesn't have to be complicated.
            AI Content Studio makes the entire process simple and fast.
          </p>

        </div>

        {/* ================= STEPS ================= */}

        <div className="relative mx-auto mt-20 grid w-full grid-cols-1 gap-8 md:grid-cols-3">

          {/* Connecting line */}

          <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent md:block" />

          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative z-10 w-full"
            >

              {/* Card */}

              <div className="relative h-full min-h-[300px] rounded-2xl border border-slate-800 bg-slate-950/90 p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10">

                {/* Number */}

                <div className="absolute right-5 top-5 text-sm font-bold text-slate-700">
                  {step.number}
                </div>

                {/* Icon */}

                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-4xl ring-1 ring-cyan-400/10 transition duration-300 group-hover:scale-110">
                  {step.icon}
                </div>

                {/* Title */}

                <h3 className="mt-7 text-xl font-bold text-white">
                  {step.title}
                </h3>

                {/* Description */}

                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-400">
                  {step.description}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}