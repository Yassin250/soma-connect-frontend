import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
      // Only the backend's auth namespace — a bare '/admin' prefix would also
      // swallow the SPA's /admin/* routes on hard refresh and return raw JSON.
      '/admin/auth': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
})
