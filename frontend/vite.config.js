import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/static/dist/' : '/',
  build: {
    outDir: '../backend/static/dist',
    emptyOutDir: true,
    manifest: "manifest.json",
    rollupOptions: {
      input: "./src/js/index.js",
    },
  },
}))