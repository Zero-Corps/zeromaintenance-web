"use client";

import { useState } from "react";

type BrandLogoProps = {
  /** Tailwind height class for the logo image, e.g. "h-8". */
  imgClassName?: string;
  /** Tailwind classes for the wordmark text. */
  wordmarkClassName?: string;
};

// Renders /logo.png with dark-theme blend styling. If the file hasn't been
// dropped into /public yet (or fails to load), it falls back to the built-in
// diamond mark so the brand never shows a broken image.
export function BrandLogo({
  imgClassName = "h-8",
  wordmarkClassName = "font-display text-xl tracking-wide",
}: BrandLogoProps) {
  const [imageOk, setImageOk] = useState(true);

  return (
    <span className="flex items-center gap-2.5">
      {imageOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt="Zero Maintenance"
          onError={() => setImageOk(false)}
          className={`logo-blend w-auto ${imgClassName}`}
        />
      ) : (
        <span className="inline-block h-5 w-5 rotate-45 border-2 border-accent transition-colors group-hover:bg-accent" />
      )}
      <span className={wordmarkClassName}>Zero Maintenance</span>
    </span>
  );
}
