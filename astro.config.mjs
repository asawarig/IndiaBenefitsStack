// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// ─────────────────────────────────────────────────────────────────────────
// MOUNT PATH — must match the mount path of the Webflow Cloud environment
// this repo is wired to. Webflow Cloud serves the app from a subpath of the
// site (e.g. plumhq.com/india-benefits-stack), and Astro needs to know that
// prefix at BUILD time to emit correct asset URLs.
//
// If the deploy 404s on CSS/fonts, this value and the Webflow Cloud mount
// path have diverged. It is the only place the path is declared.
// ─────────────────────────────────────────────────────────────────────────
const MOUNT_PATH = '/india-benefits-stack';

export default defineConfig({
  base: MOUNT_PATH,
  trailingSlash: 'always',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  build: {
    // Webflow Cloud serves built assets from the mount path too.
    assetsPrefix: MOUNT_PATH,
  },
});
