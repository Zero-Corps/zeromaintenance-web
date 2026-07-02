import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-panel/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
        <div className="flex flex-col items-center gap-1.5 sm:items-start">
          <a
            href="https://zerocorps.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3"
          >
            <BrandLogo showWordmark={false} imgClassName="h-6" />
            <span className="font-brand text-sm font-semibold uppercase tracking-[0.18em] text-muted transition-colors group-hover:text-fg">
              Powered by ZeroCorps
            </span>
          </a>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Serving Wise County and surrounding communities
          </p>
        </div>

        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} ZeroCorps. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
