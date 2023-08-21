import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/marketo-file-uploader/',
  // base: '/dist/',
  // base: process.env.NODE_ENV === 'production' ? '/marketo-file-uploader/' : '/dist/',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // outDir: './path/to/', // ビルド成果物の生成先
    manifest: true,
    // rollupOptions: {
    //   output: { // entry chunk assets それぞれの書き出し名の指定
    //     entryFileNames: `assets/[name]-marketo-file-uploader.js`,
    //     chunkFileNames: `assets/[name]-marketo-file-uploader.js`,
    //     assetFileNames: `assets/[name]-marketo-file-uploader.[ext]`,
    //   },
    // },
  },
})
