import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-panel/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <BrandLogo imgClassName="h-7" wordmarkClassName="font-display text-lg" />
          <p className="mt-3 text-sm text-muted">
            Detailing done so well that upkeep drops to near zero.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">
            Mobile service · Serving Wise County and surrounding DFW communities
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <span className="spec-label">Site</span>
          <Link href="/" className="text-muted transition-colors hover:text-fg">
            Home
          </Link>
          <Link
            href="/#services"
            className="text-muted transition-colors hover:text-fg"
          >
            Services
          </Link>
          <Link
            href="/quote"
            className="text-muted transition-colors hover:text-fg"
          >
            Get a quote
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <span className="spec-label">Company</span>
          <a
            href="https://zerocorps.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-fg"
          >
            zerocorps.org
          </a>
          <span className="text-muted">A ZeroCorps LLC venture</span>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="font-mono text-xs text-muted">
            © {new Date().getFullYear()} ZeroCorps LLC — Zero Maintenance
            Detailing. All rights reserved.
          </p>
          <a
            href="https://zerocorps.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-fg"
          >
            Powered by{" "}
            <span className="font-semibold text-accent-glow transition-colors group-hover:text-accent">
              ZeroCorps
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
