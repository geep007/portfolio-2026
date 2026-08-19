// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The apex 308s to www, so canonical and share-card URLs have to be www
  // too — a canonical that redirects is a canonical crawlers argue with.
  site: 'https://www.atomicdesignz.com',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
