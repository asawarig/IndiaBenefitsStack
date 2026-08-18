# India Benefits Stack

"The India Benefits Stack — A Guide for MNC Decision-Makers", built as an
[Astro](https://astro.build) site for deployment to **Webflow Cloud**.

## Structure

```
src/pages/index.astro   the guide markup (prerendered) + TOC highlight script
public/guide.css        the stylesheet, incl. @font-face rules
public/fonts/           self-hosted webfonts
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

**Webflow Cloud sets this itself — `MOUNT_PATH` here does not control it.**

The Webflow Cloud builder renames `astro.config.mjs` to
`clouduser.astro.config.mjs` and generates its own from a template, taking the
base path from its `COSMIC_MOUNT_PATH` environment variable (the mount path set
in the Webflow Cloud UI). It also discards `wrangler.json` in favour of its own
template. So on Webflow Cloud the mount path cannot drift out of sync with this
file — their value always wins.

`MOUNT_PATH` in `astro.config.mjs` therefore only affects:

- `npm run dev` / `npm run preview` locally
- GitHub Pages, where the workflow overrides it with `BASE_PATH=/<repo>`

```js
const MOUNT_PATH = '/india-benefits-stack';
```

Keeping it equal to the Webflow Cloud mount path is still worth doing, so local
preview reproduces production URLs — but it is a convenience, not a
requirement.

## Local development

```bash
npm install
npm run dev      # Astro dev server
npm run build    # production build to dist/
npm run preview  # serve the build through the Workers runtime (wrangler)
```

`npm run preview` serves at `http://localhost:8787/<MOUNT_PATH>/`, matching how
Webflow Cloud serves it.

## Layout

The table of contents is a **sticky left rail** above 1024px, collapsing to a
horizontal scroller pinned under the nav below that. The section being read is
marked `aria-current="true"` by a small inline script in `src/pages/index.astro`,
which drives the highlight in the rail.

Body copy is capped near 68 characters for readability; tables, card grids and
callouts keep the full column width.

## Fonts

Self-hosted — the page makes **no external requests at all**.

| Role | Font | Status |
|---|---|---|
| `--font-display` | **GT Alpina** (Grilli Type) | on brand — webfont licence held |
| `--font-sans` | **Figtree** (SIL OFL 1.1) | **substitute** for Passenger Sans |

### GT Alpina — complete

| Weight | File | Used by |
|---|---|---|
| 400 normal | `GT-Alpina-Standard-Regular.woff` | `h1`, `h2`, `.policy-name`, `.stat-num`, `.persona-name`, `.bd-title`, `.outside-lane h3`, `.footer-brand` |
| 300 normal | `GT-Alpina-Standard-Light.woff2` + `.woff` | nothing currently — kept for headroom |
| 300 italic | `GT-Alpina-Standard-Light-Italic.woff2` + `.woff` | `.masthead h1 em`, `.pull-quote` |

Regular was supplied as `woff` only. That works everywhere, but `woff2` would
cut roughly 19KB off it if Grilli Type can provide one.

Only these three faces are served. GT Alpina Bold (700) and the Regular/Bold
desktop `.ttf`/`.otf` builds are deliberately absent: a desktop licence does not
cover webfont delivery, and no rule needs weight 700 in the serif.

### Passenger Sans — blocked, Figtree standing in

Passenger Sans is commercial and only part of its webfont set is available, so
the body sans is currently a substitute. Figtree is variable (400–700), `latin`
+ `latin-ext`.

| CSS needs | Webfont supplied | Rules affected |
|---|---|---|
| **400 Regular** | ❌ desktop `.otf` only | all body prose (the default weight) |
| **500 Medium** | ❌ desktop `.otf` only | 8 |
| 600 Semibold | ✅ `PassengerSansBold.woff` (usWeight 600) | 19 |
| 700 Black | ✅ `PassengerSansBlack.woff` (usWeight 700) | 1 |

The two missing weights are the two that matter most — 400 carries every
paragraph on the page. Serving Passenger Sans for 600/700 while prose fell back
to Figtree would put two different sans families side by side, so none of it is
wired up until **400 and 500 arrive as `woff`/`woff2`**. The 600/700 webfont
files are held outside the repo rather than committed, so nothing unused ships.

Once they arrive: add four `@font-face` blocks to `public/guide.css`, repoint
`--font-sans` to `'Passenger Sans'`, and update the Figtree `<link rel="preload">`
in `src/pages/index.astro`. Passenger Sans italics (600/700) were also supplied;
no rule currently uses an italic sans.

`latin-ext` is required for Figtree because the page uses the rupee sign
(U+20B9) throughout. GT Alpina ships a full ~1281-glyph charset, unsubsetted.

## Notes

- `kv_namespaces: [{ binding: "SESSION" }]` in `wrangler.json` exists only to
  satisfy `@astrojs/cloudflare`, which auto-enables KV-backed sessions unless a
  session driver is configured. The page never uses sessions.
- The nav "get a quote" CTA uses `target="_top"` so it escapes the frame if the
  page is ever embedded rather than served directly.
- The Plum logo is an inline SVG traced from the original 1920×1080 PNG, which
  was 36% of the page's bytes. It keeps the source viewBox so existing height
  rules render it at identical size.
