# India Benefits Stack

"The India Benefits Stack — A Guide for MNC Decision-Makers", built as an
[Astro](https://astro.build) site for deployment to **Webflow Cloud**.

## Layout

```
src/pages/index.astro   the guide (markup only; prerendered)
public/guide.css        the stylesheet, incl. @font-face rules
public/fonts/           GT Alpina + Passenger Sans, woff2 with ttf/otf fallback
astro.config.mjs        MOUNT_PATH is declared here — see below
wrangler.json           Workers runtime config (Webflow Cloud reads this)
webflow.json            declares the framework as astro
```

The stylesheet is a separate file in `public/` rather than inline in the
`.astro` component on purpose: Astro `<style>` blocks cannot be interpolated,
and CSS `url()` resolves relative to the stylesheet, so the `@font-face` rules
keep working under any mount path without threading `BASE_URL` through them.

The page sets `export const prerender = true` — it is fully static, so it is
built to HTML and served as a static asset with no Worker invocation per
request.

## Mount path

`MOUNT_PATH` in `astro.config.mjs` **must match the mount path of the Webflow
Cloud environment this repo is wired to.** It is currently:

```js
const MOUNT_PATH = '/india-benefits-stack';
```

Astro needs this at build time to emit correct asset URLs, so it cannot be
inferred at runtime. If a deploy serves HTML but 404s on `guide.css` and the
fonts, this value and the Webflow Cloud mount path have diverged.

## Local development

```bash
npm install
npm run dev      # Astro dev server
npm run build    # production build to dist/
npm run preview  # serve the build through the Workers runtime (wrangler)
```

`npm run preview` serves at `http://localhost:8787/<MOUNT_PATH>/`, matching
how Webflow Cloud serves it.

## Fonts

All six declared faces are present, so no weight falls back:

| Family | Weight | File |
|---|---|---|
| GT Alpina | 400 | `GT-Alpina-Standard-Regular` |
| GT Alpina | 300 italic | `GT-Alpina-Standard-Light-Italic` |
| Passenger Sans | 400 | `PassengerSans-Regular` |
| Passenger Sans | 500 | `PassengerSans-Medium` |
| Passenger Sans | 600 | `PassengerSans-Semibold` |
| Passenger Sans | 700 | `PassengerSans-Black` |

Each is served as woff2 with the original ttf/otf as a fallback source.

> **Licensing:** GT Alpina (Grilli Type) and Passenger Sans are commercial
> fonts, and the files here are desktop builds. Self-hosting them as webfonts
> on a public domain needs a webfont licence — confirm this is held before
> publishing, and prefer vendor-supplied woff2 files if available.

## Notes

- `kv_namespaces: [{ binding: "SESSION" }]` in `wrangler.json` exists only to
  satisfy `@astrojs/cloudflare`, which auto-enables KV-backed sessions unless
  a session driver is configured. The page never uses sessions.
- The nav "get a quote" CTA uses `target="_top"` so it escapes the frame if
  the page is ever embedded rather than served directly.
