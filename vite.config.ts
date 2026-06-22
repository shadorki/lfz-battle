import { defineConfig } from 'vite'

// PixiJS v8 is ESM-first; Vite serves/bundles it without extra config.
// Dev server on 3000 to match the previous webpack-dev-server port.
export default defineConfig({
  server: { port: 3000 },
  build: { outDir: 'dist', target: 'es2020' }
})
