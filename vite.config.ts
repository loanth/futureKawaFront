import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    cors: true,
    proxy: {
      // Proxy pour l'API locale (évite les problèmes CORS)
      '/api': {
        target: 'http://web:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        
      }
    }
  },
  preview: {
  host: true,
  port: 4173,
  proxy: {
    '/api': {
      target: 'http://web:5000',
      changeOrigin: true,
      secure: false,
      ws: true,
    }
  }
},
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
