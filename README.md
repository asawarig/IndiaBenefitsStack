# India Benefits Stack

"The India Benefits Stack — A Guide for MNC Decision-Makers", built as an
[Astro](https://astro.build) site for deployment to **Webflow Cloud**.

## Structure

```
src/pages/index.astro   the guide markup (prerendered) + TOC highlight script
public/guide.css        the stylesheet, incl. @font-face rules
public/fonts/           self-hosted webfonts
astro.config.mjs        MOUNT_PATH is declared here — see below
wrangler.json           Workers config for local preview only (see Mount path)
webflow.json            declares the framework as astro
```

The stylesheet is a separate file in `public/` rather than inline in the
`.astro` component on purpose: Astro `<style>` blocks cannot be interpolated,
and CSS `url()` resolves relative to the stylesheet, so the `@font-face` rules
keep working under any mount path without threading `BASE_URL` through them.

There is deliberately **no `prerender` export** on the page — `output` decides
per target: `'server'` (Webflow Cloud) renders on demand, `'static'` (Pages)
prerenders. It has to be on demand on Webflow Cloud: prerendering wrote
`dist/<base>/index.html`, and Cloudflare's static-asset router applies
`html_handling: "auto-trailing-slash"`, so `/<base>` got a 307 to `/<base>/`
while Webflow's edge strips the slash back off — an infinite redirect loop on
the mount path. Setting `prerender = false` explicitly is not equivalent: under
`output: 'static'` it marks the route on demand and the Pages build fails with
`no-adapter-installed`.

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
horizontal scroller pinned under the nav below that.

It nests three levels deep: sections, then additional `h2`s within a section,
then `h3`s beneath those. Sub-entries need an `id` on the heading to link to —
`benchmark-headcount`, `beyond-personas`, `beyond-gaps`, `beyond-outside`,
`beyond-non-insurance`. Below 1024px only the top-level entries show, since 20
items in a horizontal scroller is unusable.

A small inline script in `src/pages/index.astro` marks the entry being read with
`aria-current="true"` and its parents with `data-ancestor`, so a reader deep in a
sub-section can still see which section they are in.

Two constraints on that script, both learned the hard way:

- **The probe is a fixed 96px from the top, not a share of the viewport.** At
  25% of a 900px viewport the probe sat at 225px, which skipped past any two
  headings closer than that — `beyond-outside` and `beyond-non-insurance` are
  222px apart.
- **`by-setup`'s three Phase headings are deliberately not in the rail.** They
  are laid out as side-by-side columns at one identical scroll offset (same `y`,
  x = 491/755/1018), so all three would jump to the same place and no
  scroll-tracker could distinguish them. The `phase-1/2/3` ids remain on the
  headings for direct linking.

Body copy is capped near 68 characters for readability; tables, card grids and
callouts keep the full column width.

## Fonts

Self-hosted — the page makes **no external requests at all**.

| Role | Font | Status |
|---|---|---|
| `--font-display` | **GT Alpina** (Grilli Type) | on brand — licensed webfonts |
| `--font-sans` | **Passenger Sans** | on brand — licensed webfonts |
| U+20B9 only | **Figtree** (SIL OFL 1.1) | pinned rupee glyph, see below |

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

### Passenger Sans — wired up, with the rupee sign pinned

| CSS weight | File | Rules |
|---|---|---|
| 400 | `PassengerSans-Regular.woff` | all body prose (the default) |
| 500 | *no webfont build supplied* | 8 — resolve to 400, see below |
| 600 | `PassengerSans-Bold.woff` (usWeight 600) | 19 |
| 700 | `PassengerSans-Black.woff` (usWeight 700) | 1 |

**No Passenger Sans file — web or desktop, any weight — contains U+20B9**, and
the page uses the rupee sign 103 times. Rather than let all of them fall back to
whatever system font the visitor has, a `Plum Rupee` `@font-face` pins that one
codepoint to Figtree and is listed **first** in `--font-sans`. A face is only
eligible for codepoints inside its `unicode-range`, so every other character
falls straight through to Passenger Sans. Figtree is variable, so the rupee
tracks the surrounding weight. Figtree also stays as the fallback behind
Passenger Sans.

**Medium (500) is missing.** Per CSS weight matching, a target of exactly 500
checks 500, then descends, then ascends — so those eight label rules render at
Regular and lose the step above body prose they were drawn with. The kit's
"Bold" is usWeight 600, a step heavier than the Semibold the 19 emphasis rules
were drawn against. Asking the foundry for Medium and Semibold closes both gaps.

`latin-ext` is required for Figtree because of the rupee sign. GT Alpina ships a
full ~1281-glyph charset, unsubsetted.

## Notes

- `@astrojs/cloudflare` logs a warning that it is enabling KV-backed sessions
  with a `SESSION` binding. The page never uses sessions and no such binding is
  declared — the Webflow Cloud deploy ends up with only `ASSETS`. The warning is
  inert; a `kv_namespaces` entry was tried and rejected by Webflow's schema for
  lacking an `id`.
- The nav "get a quote" CTA uses `target="_top"` so it escapes the frame if the
  page is ever embedded rather than served directly.
- The Plum logo is an inline SVG traced from the original 1920×1080 PNG, which
  was 36% of the page's bytes. It keeps the source viewBox so existing height
  rules render it at identical size.
