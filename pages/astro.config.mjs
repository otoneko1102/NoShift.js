// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [icon()],
  base: '/',
  trailingSlash: 'always',
  outDir: '../docs',
  build: {
    assets: '_assets',
  },
  site: 'https://noshift.js.org',
});
