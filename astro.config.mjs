// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// ─────────────────────────────────────────────────────────────────────────
// Two deploy targets, two base paths.
//
//   Webflow Cloud   plumhq.com/<mount path>       Workers runtime
//   GitHub Pages    <user>.github.io/<repo>/      static hosting
//
// Astro bakes asset URLs at BUILD time, so the base path cannot be worked
// out at runtime — it has to be right when the build runs. Both targets are
// driven off the same env var so there is still only one place it lives.
//
// Webflow Cloud (default): MOUNT_PATH below must match the mount path of the
// environment this repo is wired to. If a deploy serves HTML but 404s on
// guide.css and the fonts, these two have diverged.
//
// GitHub Pages: the workflow sets BASE_PATH=/<repo> and PAGES=true. Pages is
// static hosting with no Workers runtime, so PAGES=true drops the Cloudflare
// adapter and builds a plain static site. The page is prerendered either way,
// so nothing about the output changes but the wrapper.
// ─────────────────────────────────────────────────────────────────────────
const MOUNT_PATH = '/india-benefits-stack';

const PAGES = process.env.PAGES === 'true';
const BASE = process.env.BASE_PATH || MOUNT_PATH;

export default defineConfig({
  base: BASE,
  trailingSlash: 'always',
  ...(PAGES
    ? { output: 'static' }
    : {
        output: 'server',
        adapter: cloudflare({ platformProxy: { enabled: true } }),
      }),
  build: {
    // Webflow Cloud serves built assets from the mount path too.
    assetsPrefix: BASE,
  },
});
