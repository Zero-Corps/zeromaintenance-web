# Static assets

Drag-and-drop your logo here.

## Logo

Drop your logo file in this folder named exactly:

```
public/logo.png
```

That's it — the header and footer pick it up automatically. Until the file
exists, the site falls back to the built-in diamond mark, so nothing looks
broken while you're setting up.

### How it blends in

The logo is rendered with the `.logo-blend` utility (defined in
`app/globals.css`) so it sits naturally on the dark blue-black background:

- `mix-blend-mode: screen` makes any **black/dark background box** in the PNG
  disappear (ideal for a light or blue logo on the dark theme).
- a subtle blue drop-shadow glow ties it into the accent color.

Tips depending on your PNG:

- **Transparent background, light/white or blue logo** → works great as-is.
- **Logo on a solid _white_ box** → open `app/globals.css` and change
  `mix-blend-mode: screen` to `multiply` in `.logo-blend` so the white drops out
  instead.
- **Dark logo on transparent** → it'll be hard to see on the dark theme; use a
  light/white version, or remove the `.logo-blend` class from
  `components/brand-logo.tsx`.

A transparent PNG at roughly 2–3× the display height (the header shows it at
~32px tall) keeps it crisp on high-DPI screens.
