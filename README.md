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

Self-hosted; the page makes **no external requests at all**.

| Role | Font | Licence | Faces served |
|---|---|---|---|
| `--font-display` | **GT Alpina** (Grilli Type) | webfont licence held | Light 300, Light Italic 300 |
| `--font-sans` | **Figtree** | SIL OFL 1.1 | variable 400–700, latin + latin-ext |

### GT Alpina is served at weight 300, not 400

Only **Light (300)** and **Light Italic (300)** were supplied as `woff2`/`woff`.
Regular (400) and Bold (700) arrived as desktop `.ttf`/`.otf` only, and a
desktop licence does not cover webfont delivery — so those files are not in
this repo and are not served.

The page was originally designed with Regular (400) for its nine display rules
(`h1`, `h2`, `.policy-name`, `.stat-num`, `.persona-name`, `.bd-title`,
`.outside-lane h3`, `.footer-brand`). Those are now `font-weight: 300`, so
headings are a little lighter than first drawn.

To restore weight 400: obtain the **GT Alpina Regular webfont** (woff2) from
Grilli Type, drop it in `public/fonts/`, add a `font-weight: 400` `@font-face`
block in `public/guide.css`, and change those display rules back to
`font-weight: 400`.

### Figtree stands in for Passenger Sans

Passenger Sans is commercial and no webfont licence has been confirmed for it,
so the body sans is currently a substitute. This affects the majority of the
page's text. The original Passenger Sans `@font-face` blocks and files are in
git history at commit `ae46c6c`; swapping back is the same four-step change
described in the section above.

`latin-ext` is required for Figtree because the page uses the rupee sign
(U+20B9) throughout. GT Alpina ships a full 1281-glyph charset, unsubsetted.

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

Plum's brand fonts are **GT Alpina** (display serif) and **Passenger Sans**
(humanist sans). Both are commercial, and self-hosting them as webfonts needs
a webfont licence. Until one is confirmed for each, the page uses the closest
open-licensed (SIL OFL 1.1) substitutes, self-hosted from `public/fonts/`:

| Role | Brand font | Current substitute |
|---|---|---|
| `--font-display` | GT Alpina | **Newsreader** (variable, 300–600, true italics) |
| `--font-sans` | Passenger Sans | **Figtree** (variable, 400–700) |

Both are variable fonts, so one file per style covers the whole weight range —
six files, 229KB total, `latin` + `latin-ext`. The `latin-ext` subset is
required: the page uses the rupee sign (U+20B9) throughout.

Self-hosted rather than linked from Google Fonts, so the page makes **no
external requests at all** — no third-party dependency, and no visitor data
sent to Google.

### Restoring the brand fonts

Designed to be a swap, not a rewrite:

1. Put the licensed woff2 files in `public/fonts/`.
2. In `public/guide.css`, replace the `@font-face` blocks with the brand ones.
3. Repoint `--font-display` / `--font-sans` in the same file.
4. Update the two `<link rel="preload">` hints in `src/pages/index.astro`.

The original GT Alpina / Passenger Sans `@font-face` blocks and font files are
in git history at commit `ae46c6c` if useful as a starting point. Note that
`h2` letter-spacing was relaxed from `-.04em` to `-.02em` for Newsreader and
should go back to `-.04em` with GT Alpina.

## Layout

The table of contents is a **sticky left rail** on screens wider than 1024px,
and collapses to a horizontal scroller pinned under the nav below that. The
current section is marked with `aria-current="true"` by a small inline script
in `src/pages/index.astro`, which drives the highlight in the rail.

Body copy is capped near 68 characters for readability; tables, card grids and
callouts keep the full column width.

## Notes

- `kv_namespaces: [{ binding: "SESSION" }]` in `wrangler.json` exists only to
  satisfy `@astrojs/cloudflare`, which auto-enables KV-backed sessions unless
  a session driver is configured. The page never uses sessions.
- The nav "get a quote" CTA uses `target="_top"` so it escapes the frame if
  the page is ever embedded rather than served directly.
