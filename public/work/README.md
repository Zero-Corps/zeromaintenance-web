# Before / after photos

The "Recent work" carousel on the homepage reads its images from this folder.
To publish real photos, **drop in files with these exact names** (no code
changes needed):

```
before-1.jpg   after-1.jpg
before-2.jpg   after-2.jpg
before-3.jpg   after-3.jpg
before-4.jpg   after-4.jpg
```

- Any web image format works if you keep the `.jpg` extension in the filename,
  but real `.jpg`/`.jpeg` files are best. Aim for landscape shots — they're
  displayed in a 4:3 frame and cropped to fill.
- Until a file exists, that panel shows a tasteful "Photo coming soon"
  placeholder instead of a broken image, so the section is always safe to ship.

## Captions

Edit the caption for each vehicle at the top of
`components/work-gallery.tsx` — the `SLIDES` array. Example:

```ts
{ before: "/work/before-1.jpg", after: "/work/after-1.jpg", caption: "2014 F-150 — Full Detail" },
```

## Add more (or fewer) than 4

Add or remove entries in that `SLIDES` array and matching files here — the
arrows, dots, and swipe all adapt to the number of slides automatically.
