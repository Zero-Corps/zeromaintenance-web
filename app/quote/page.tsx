import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { QuoteForm } from "./quote-form";

export const metadata: Metadata = {
  title: "Get a quote — Zero Maintenance",
  description:
    "Build an instant estimate for detailing and ceramic coating, then send us your quote request.",
};

export default function QuotePage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-line">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8">
            <p className="spec-label animate-rise">Quote builder</p>
            <h1 className="animate-rise-delay-1 mt-4 font-display text-5xl sm:text-6xl">
              Build your estimate
            </h1>
            <p className="animate-rise-delay-2 mt-4 max-w-xl text-muted">
              Pick your services and vehicle details for a live price range.
              Submit and we&apos;ll follow up to confirm and schedule.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <QuoteForm />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
