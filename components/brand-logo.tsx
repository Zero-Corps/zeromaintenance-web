"use client";

import { useState } from "react";

type BrandLogoProps = {
  /** Tailwind height class for the logo image, e.g. "h-8". */
  imgClassName?: string;
  /** Tailwind classes for the wordmark text. */
  wordmarkClassName?: string;
  /** When false, render only the logo mark (no "Zero Maintenance" wordmark). */
  showWordmark?: boolean;
};

// Renders the transparent Ø mark (/logo-mark.png) directly on the page
// background with a soft white halo — no container/tile. If the file is
// missing or fails to load, it falls back to the built-in diamond mark so the
// brand never shows a broken image.
export function BrandLogo({
  imgClassName = "h-8",
  wordmarkClassName = "font-display text-xl tracking-wide",
  showWordmark = true,
}: BrandLogoProps) {
  const [imageOk, setImageOk] = useState(true);

  return (
    <span className="flex items-center gap-2.5">
      {imageOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo-mark.png"
          alt="Zero Maintenance"
          onError={() => setImageOk(false)}
          className={`logo-mark w-auto ${imgClassName}`}
        />
      ) : (
        <span className="inline-block h-5 w-5 rotate-45 border-2 border-accent transition-colors group-hover:bg-accent" />
      )}
      {showWordmark && (
        <span className={wordmarkClassName}>
          Zero <span className="text-accent">Maintenance</span>
        </span>
      )}
    </span>
  );
}
