"use client";

import { useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────
// Drop real photos into /public/work/ using these exact filenames, then edit
// the caption strings below. No other code changes needed.
//   before-1.jpg / after-1.jpg, before-2.jpg / after-2.jpg, ...
// ─────────────────────────────────────────────────────────────────────────
type Slide = {
  before: string;
  after: string;
  caption: string;
};

const SLIDES: Slide[] = [
  {
    before: "/work/before-1.jpg",
    after: "/work/after-1.jpg",
    caption: "2014 F-150 — Full Detail",
  },
  {
    before: "/work/before-2.jpg",
    after: "/work/after-2.jpg",
    caption: "Honda Civic — Interior Service",
  },
  {
    before: "/work/before-3.jpg",
    after: "/work/after-3.jpg",
    caption: "Jeep Wrangler — Exterior Service",
  },
  {
    before: "/work/before-4.jpg",
    after: "/work/after-4.jpg",
    caption: "Chevy Tahoe — Full Detail",
  },
];

function WorkImage({ src, label }: { src: string; label: "Before" | "After" }) {
  const [ok, setOk] = useState(true);

  return (
    <div className="relative aspect-[4/3] overflow-hidden border border-line bg-panel">
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${label} detailing`}
          onError={() => setOk(false)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-panel-2">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Photo coming soon
          </span>
        </div>
      )}
      <span className="absolute left-0 top-0 bg-ink/80 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent-glow">
        {label}
      </span>
    </div>
  );
}

export function WorkGallery() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = SLIDES.length;

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  const slide = SLIDES[index];

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Before and after detailing work"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="mt-12 outline-none"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <WorkImage src={slide.before} label="Before" />
        <WorkImage src={slide.after} label="After" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className="flex h-10 w-10 items-center justify-center border border-line bg-panel text-fg transition-colors hover:border-accent"
        >
          &#8592;
        </button>

        <p className="font-mono text-sm text-muted">{slide.caption}</p>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className="flex h-10 w-10 items-center justify-center border border-line bg-panel text-fg transition-colors hover:border-accent"
        >
          &#8594;
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-2.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.caption}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-accent" : "bg-line hover:bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
