import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>

      {/* Hero */}

      <section className="relative overflow-hidden">

        {/* Background */}

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24 lg:px-8">

          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Smart Lost & Found Platform

            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl">

              Find what you lost.
              <br />

              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Return what you found.
              </span>

            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">

              A smarter way to report, discover and recover lost belongings.
              Connect with your campus community and increase the chance of
              getting your items back.

            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/create-item"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                + Report an Item
              </Link>

              <Link
                to="/explore"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                Explore Reports →
              </Link>

            </div>

          </div>

          {/* Search */}

          <div className="mx-auto mt-14 max-w-3xl">

            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50">

              <div className="flex items-center gap-3 px-4 py-3">

                <span className="text-xl">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search for an item..."
                  className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                <Link
                  to="/explore"
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Search
                </Link>

              </div>

            </div>

          </div>

          {/* Stats */}

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur">

            <div className="text-center">

              <p className="text-2xl font-bold text-slate-900">
                100+
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Reports
              </p>

            </div>

            <div className="text-center">

              <p className="text-2xl font-bold text-slate-900">
                50+
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Items Found
              </p>

            </div>

            <div className="text-center">

              <p className="text-2xl font-bold text-slate-900">
                24/7
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Accessible
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* How It Works */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Getting your item back is simple
            </h2>

            <p className="mt-4 text-slate-500">
              Report an item, discover potential matches and connect with
              the right person.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {[
              {
                number: "01",
                icon: "📝",
                title: "Report",
                text: "Create a detailed lost or found report with an image, description, location and date.",
              },
              {
                number: "02",
                icon: "🔎",
                title: "Discover",
                text: "Browse reports and search for items using relevant details and filters.",
              },
              {
                number: "03",
                icon: "🤝",
                title: "Reconnect",
                text: "Identify potential matches and connect with the person who found or lost the item.",
              },
            ].map((step) => (

              <div
                key={step.number}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                    {step.icon}
                  </div>

                  <span className="text-sm font-bold text-slate-300">
                    {step.number}
                  </span>

                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* AI Feature Section */}

      <section className="bg-slate-950 py-20 text-white">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid items-center gap-12 md:grid-cols-2">

            <div>

              <div className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
                Built for smarter matching
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Technology that helps connect the missing pieces.
              </h2>

              <p className="mt-5 leading-7 text-slate-400">
                Our platform is designed to evolve beyond traditional
                keyword-based searching with intelligent semantic matching,
                image analysis and OCR technologies.
              </p>

              <div className="mt-7 space-y-4">

                {[
                  "Semantic item matching",
                  "Image-based identification",
                  "OCR for useful item information",
                  "Smart notifications",
                ].map((feature) => (

                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >

                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                      ✓
                    </span>

                    <span className="text-sm text-slate-300">
                      {feature}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">

              <div className="rounded-2xl bg-white p-5 text-slate-900">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-medium text-slate-400">
                      Potential Match
                    </p>

                    <p className="mt-1 font-bold">
                      Black Backpack
                    </p>

                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                    92% Match
                  </span>

                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />

                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">

                  <div className="rounded-xl bg-slate-50 p-3">

                    <p className="text-lg font-bold">
                      ✓
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Category
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">

                    <p className="text-lg font-bold">
                      ✓
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Location
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">

                    <p className="text-lg font-bold">
                      ✓
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Description
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Lost something important?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Don't wait. Create a report and let the community help you find it.
          </p>

          <Link
            to="/create-item"
            className="mt-8 inline-flex rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            Report a Lost Item →
          </Link>

        </div>

      </section>

      {/* Footer */}

      <footer className="border-t border-slate-200 bg-slate-50">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          <div>

            <p className="font-bold text-slate-900">
              FindBack
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Smart Lost & Found Portal
            </p>

          </div>

          <p className="text-xs text-slate-400">
            © 2026 FindBack. Built to reconnect people with their belongings.
          </p>

        </div>

      </footer>

    </div>
  );
};

export default Home;