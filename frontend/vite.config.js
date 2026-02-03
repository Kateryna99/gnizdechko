import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/static/dist/' : '/',
  build: {
    outDir: '../backend/static/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: "./src/js/index.js",
    },
  },
}))