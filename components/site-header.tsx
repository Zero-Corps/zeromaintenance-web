import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group">
          <BrandLogo />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/#services"
            className="hidden text-sm text-muted transition-colors hover:text-fg sm:block"
          >
            Services
          </Link>
          <Link
            href="/#process"
            className="hidden text-sm text-muted transition-colors hover:text-fg sm:block"
          >
            Process
          </Link>
          <Link
            href="/quote"
            className="rounded-none bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-glow"
          >
            Get a quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
