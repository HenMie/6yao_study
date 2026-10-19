import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { localVideos } from './local-videos.js'

export default defineConfig({
  plugins: [vue(), localVideos(fileURLToPath(new URL('../视频/', import.meta.url)))],
  base: './',
  server: { port: 5173, host: '127.0.0.1' },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1200 }
})
