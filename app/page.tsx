import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorkGallery } from "@/components/work-gallery";
import { SERVICES, formatCurrency } from "@/lib/quote";

const SERVICE_BLURBS: Record<string, string> = {
  interior:
    "Full vacuum, deep clean, and hand-wiped detail on every interior surface.",
  exterior:
    "Pressure wash, hand wash with wax soap, wheels, tires, and hand dry.",
  full: "Complete interior + exterior service.",
};

const PROCESS: {
  title: string;
  steps: { n: string; title: string; body: string }[];
}[] = [
  {
    title: "Interior",
    steps: [
      {
        n: "01",
        title: "Vacuum",
        body: "Full vacuum — seats, carpets, mats, and trunk.",
      },
      {
        n: "02",
        title: "Deep clean",
        body: "Every surface sprayed down with interior-safe cleaner.",
      },
      {
        n: "03",
        title: "Detail wipe",
        body: "Every crack and crevice — dash, vents, cupholders, center console, and seats — wiped by hand.",
      },
    ],
  },
  {
    title: "Exterior",
    steps: [
      {
        n: "01",
        title: "Foam & hand wash",
        body: "Pressure wash, then hand wash with wax-infused soap.",
      },
      {
        n: "02",
        title: "Wheels & tires",
        body: "Rims deep-cleaned and tires shined while the soap dwells.",
      },
      {
        n: "03",
        title: "Hand dry",
        body: "Towel-dried by hand for a spot-free finish.",
      },
    ],
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
            <p className="spec-label animate-rise">Mobile Auto Detailing</p>
            <h1 className="animate-rise-delay-1 mt-5 max-w-4xl font-display text-5xl sm:text-7xl lg:text-8xl">
              Your car, detailed.
              <br />
              <span className="text-accent">At your driveway.</span>
            </h1>
            <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg text-muted">
              Professional auto detailing that comes to you. Launch pricing
              from $50 — full detail $80.
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
            <p className="animate-rise-delay-3 mt-9 max-w-xl font-mono text-xs leading-relaxed text-muted">
              Based in Wise County, TX — serving Decatur, Bridgeport, Boyd,
              Rhome, Denton, and northwest Fort Worth. Just outside the area?
              Ask — we&apos;re mobile.
            </p>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <div>
              <p className="spec-label">What we do</p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                Services
              </h2>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
              {SERVICES.map((service) => {
                const compareAt =
                  "compareAt" in service ? service.compareAt : undefined;
                return (
                  <div
                    key={service.id}
                    className="group flex flex-col bg-panel p-8 transition-colors hover:bg-panel-2"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-2xl">{service.label}</h3>
                      <span className="flex items-baseline gap-2 font-mono text-sm text-accent-glow">
                        {compareAt ? (
                          <span className="text-muted line-through">
                            {formatCurrency(compareAt)}
                          </span>
                        ) : (
                          <span className="text-muted">from</span>
                        )}
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    {compareAt && (
                      <span className="mt-2 font-mono text-xs uppercase tracking-widest text-accent">
                        Launch pricing
                      </span>
                    )}
                    <p className="mt-4 text-muted">
                      {SERVICE_BLURBS[service.id]}
                    </p>
                    <div className="mt-6 h-px w-12 bg-line transition-all duration-300 group-hover:w-20 group-hover:bg-accent" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Before / after gallery */}
        <section id="work" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <p className="spec-label">The proof</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">
              Recent work
            </h2>
            <WorkGallery />
          </div>
        </section>

        {/* Process */}
        <section id="process" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <p className="spec-label">How it works</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">
              Our process
            </h2>

            <div className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2">
              {PROCESS.map((column) => (
                <div key={column.title}>
                  <h3 className="font-display text-2xl text-accent">
                    {column.title}
                  </h3>
                  <div className="mt-6 flex flex-col gap-6">
                    {column.steps.map((step) => (
                      <div key={step.n} className="border-t border-line pt-5">
                        <span className="font-mono text-sm text-accent">
                          {step.n}
                        </span>
                        <h4 className="mt-3 font-display text-xl">
                          {step.title}
                        </h4>
                        <p className="mt-3 text-sm text-muted">{step.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
