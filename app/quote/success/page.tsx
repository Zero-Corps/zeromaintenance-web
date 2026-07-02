import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Request received — Zero Maintenance",
  description: "Your quote request has been received.",
};

export default function QuoteSuccessPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-28 text-center sm:px-8">
            <span className="animate-rise flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent text-3xl text-accent">
              ✓
            </span>
            <p className="spec-label animate-rise-delay-1 mt-8">
              Request received
            </p>
            <h1 className="animate-rise-delay-1 mt-4 font-display text-5xl sm:text-6xl">
              You&apos;re on the list.
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-lg text-muted">
              Thanks — your quote request has been saved and we&apos;ll reach
              out shortly to confirm the details, finalize pricing after an
              inspection, and get you scheduled.
            </p>
            <div className="animate-rise-delay-3 mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="border border-line px-7 py-3.5 font-semibold text-fg transition-colors hover:border-accent"
              >
                Back home
              </Link>
              <Link
                href="/quote"
                className="bg-accent px-7 py-3.5 font-semibold text-white transition-colors hover:bg-accent-glow"
              >
                Start another quote
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
