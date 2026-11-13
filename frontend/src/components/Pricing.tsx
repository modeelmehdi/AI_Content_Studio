import {Link} from "react-router-dom";
const plans = [
 {name:"Your writing space",price:"Create",description:"Start with a brief or write your own draft.",features:["Blogs and social posts","SEO titles and descriptions","Editable content","Writing preferences"],button:"Start writing",popular:false},
 {name:"Connected AI",price:"Generate",description:"Use a server-configured AI provider.",features:["Seven text tools and AI images","Configurable model access","Honest service-status messages","Images when the provider is enabled"],button:"Open workspace",popular:true},
 {name:"Private library",price:"Keep",description:"Return to your work whenever you need it.",features:["Persistent saved content","Search and category filters","TXT and PDF exports","Private image downloads"],button:"Create an account",popular:false},
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-slate-900 px-4 py-28 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Heading */}

        <div className="site-container">

          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Your Workspace
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
            One workspace.
            <span className="mt-2 block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Your creative workflow.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Write, generate, and organize your content. No billing or subscriptions
            are enabled; AI access depends on the owner’s provider configuration.
          </p>

        </div>

        {/* Pricing Cards */}

        <div className="mt-16 grid gap-8 lg:grid-cols-3">

          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-8 transition duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "border-cyan-400/60 bg-slate-950 shadow-2xl shadow-cyan-500/10"
                  : "border-slate-800 bg-slate-950/70"
              }`}
            >

              {/* Popular badge */}

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  Writing and media
                </div>
              )}

              {/* Plan name */}

              <h3 className="text-2xl font-bold text-white">
                {plan.name}
              </h3>

              <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
                {plan.description}
              </p>

              {/* Price */}

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-extrabold text-white">
                  {plan.price}
                </span>
              </div>

              {/* Button */}

              <Link
                to="/register"
                className={`mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl text-center px-6 py-3.5 font-semibold transition ${
                  plan.popular
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
                    : "border border-slate-700 bg-slate-900 text-white hover:border-cyan-400 hover:bg-slate-800"
                }`}
              >
                {plan.button}
              </Link>

              {/* Features */}

              <div className="mt-8 border-t border-slate-800 pt-8">

                <p className="mb-5 text-sm font-semibold text-white">
                  What's included:
                </p>

                <ul className="space-y-4">

                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-slate-400"
                    >
                      <span className="mt-0.5 text-cyan-400">
                        ✓
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}

                </ul>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}