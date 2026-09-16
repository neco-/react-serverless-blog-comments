import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hugo 側は固定ファイル名 (main.min.js / main.min.css) を読み込むため、この 2 つは名前を固定する。
// 外から参照されるのはこの 2 つだけなので、チャンクと画像にはハッシュを付ける。
// URL が内容で決まればブラウザに無期限でキャッシュさせられる（customHttp.yml の immutable）。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/main.min.js',
        chunkFileNames: 'static/js/[name]-[hash].min.js',
        assetFileNames: ({ names }) =>
          names?.[0]?.endsWith('.css')
            ? 'static/css/main.min.css'
            : 'static/media/[name]-[hash][extname]',
      },
    },
  },
})
