/**
 * Generates public/logo-mark.png — a transparent-background version of the Ø
 * mark — from the source public/logo.png (a white Ø baked onto a black square).
 *
 *   npx tsx scripts/make-logo-mark.ts
 *
 * Every pixel is forced to white and its alpha is set to the source luminance,
 * so black background → fully transparent, white Ø → fully opaque, and the
 * anti-aliased edges keep a smooth partial-alpha halo (no jagged cutout).
 */

import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const src = path.join(process.cwd(), "public", "logo.png");
const out = path.join(process.cwd(), "public", "logo-mark.png");

const png = PNG.sync.read(fs.readFileSync(src));

for (let i = 0; i < png.data.length; i += 4) {
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];
  const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

  png.data[i] = 255;
  png.data[i + 1] = 255;
  png.data[i + 2] = 255;
  png.data[i + 3] = luminance;
}

fs.writeFileSync(out, PNG.sync.write(png));
console.log(`Wrote ${out} (${png.width}x${png.height}, transparent white mark)`);
