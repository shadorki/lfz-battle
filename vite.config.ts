import { defineConfig } from 'vite'

// PixiJS v8 is ESM-first; Vite serves/bundles it without extra config.
// Dev server on 3000 to match the previous webpack-dev-server port.
// On build, base is the GitHub Pages project subpath (https://shadorki.github.io/lfz-battle/);
// dev stays at '/' for a clean localhost.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lfz-battle/' : '/',
  server: { port: 3000 },
  build: { outDir: 'dist', target: 'es2020' }
}))
