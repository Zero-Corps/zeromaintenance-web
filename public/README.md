# Static assets

## Logo

Two files are used:

```
public/logo.png        # source master — white Ø on a black square
public/logo-mark.png   # generated — transparent-background white Ø (what the site shows)
```

The header and footer render `logo-mark.png` directly on the dark background
(no tile/container) with a soft white halo, via the `.logo-mark` utility in
`app/globals.css`. Until `logo-mark.png` exists, the site falls back to the
built-in diamond mark so nothing looks broken.

### Regenerating the transparent mark

If you replace `logo.png` with a new master, regenerate the transparent mark:

```
npx tsx scripts/make-logo-mark.ts
```

That script forces every pixel white and sets alpha from the source luminance,
so the black background becomes fully transparent and the anti-aliased edges
keep a smooth halo (no jagged cutout).

- If your master already has a **transparent background**, you can point
  `components/brand-logo.tsx` straight at it and skip the script.
- Use a master at roughly 2–3× the display height (the header shows it at
  ~32px tall) to stay crisp on high-DPI screens.
