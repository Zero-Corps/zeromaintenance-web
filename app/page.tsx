import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SERVICES, formatCurrency } from "@/lib/quote";

const SERVICE_BLURBS: Record<string, string> = {
  exterior:
    "Multi-stage hand wash, decontamination, and a deep gloss finish that resets your paint.",
  interior:
    "Full extraction, steam, and conditioning — every seam, vent, and surface handled.",
  ceramic:
    "A hard ceramic layer that locks in gloss and makes dirt and water slide right off.",
  correction:
    "Machine polishing that removes swirls, scratches, and haze for true depth.",
};

const PROCESS = [
  {
    n: "01",
    title: "Inspect",
    body: "We assess paint, panels, and interior condition and map the exact work needed.",
  },
  {
    n: "02",
    title: "Correct",
    body: "Decontaminate and machine-polish to remove defects before any coating goes down.",
  },
  {
    n: "03",
    title: "Protect",
    body: "Lay down ceramic protection that seals the finish against the elements.",
  },
  {
    n: "04",
    title: "Maintain-free",
    body: "Upkeep drops to near zero — a rinse keeps it looking freshly detailed.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="hero-glow pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
            <p className="spec-label animate-rise">
              Detailing &amp; Ceramic Coating
            </p>
            <h1 className="animate-rise-delay-1 mt-5 max-w-4xl font-display text-5xl sm:text-7xl lg:text-8xl">
              Detailed once.
              <br />
              <span className="text-accent">Near-zero</span> upkeep.
            </h1>
            <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg text-muted">
              We detail and ceramic-coat your vehicle so thoroughly that keeping
              it clean becomes almost effortless. Get an instant estimate in
              under a minute.
            </p>
            <div className="animate-rise-delay-3 mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/quote"
                className="bg-accent px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-glow"
              >
                Get a quote
              </Link>
              <Link
                href="/#services"
                className="border border-line px-7 py-3.5 text-base font-semibold text-fg transition-colors hover:border-accent"
              >
                View services
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="spec-label">What we do</p>
                <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                  Services
                </h2>
              </div>
              <p className="hidden max-w-xs text-sm text-muted sm:block">
                Starting prices for a sedan in good condition. Your exact
                estimate is built on the quote page.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              {SERVICES.map((service) => (
                <div
                  key={service.id}
                  className="group bg-panel p-8 transition-colors hover:bg-panel-2"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl">{service.label}</h3>
                    <span className="font-mono text-sm text-accent-glow">
                      from {formatCurrency(service.price)}
                    </span>
                  </div>
                  <p className="mt-4 text-muted">
                    {SERVICE_BLURBS[service.id]}
                  </p>
                  <div className="mt-6 h-px w-12 bg-line transition-all duration-300 group-hover:w-20 group-hover:bg-accent" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <p className="spec-label">How it works</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">
              Our process
            </h2>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((step) => (
                <div key={step.n} className="border-t border-line pt-5">
                  <span className="font-mono text-sm text-accent">
                    {step.n}
                  </span>
                  <h3 className="mt-3 font-display text-2xl">{step.title}</h3>
                  <p className="mt-3 text-sm text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
            <h2 className="mx-auto max-w-2xl font-display text-4xl sm:text-6xl">
              Ready for a finish that lasts?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-muted">
              Build your estimate and send us a quote request. We&apos;ll follow
              up to confirm details and lock in a time.
            </p>
            <Link
              href="/quote"
              className="mt-9 inline-block bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-glow"
            >
              Get a quote
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
