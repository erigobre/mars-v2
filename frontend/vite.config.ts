import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),  // ← esto sincroniza con el tsconfig
      "@core/*": resolve(__dirname, './src/core'),
      "@features/*": resolve(__dirname, './src/features'),
      "@roles/*": resolve(__dirname, './src/roles')
    },
  },

  server: {
    host: true,       // equivale a 0.0.0.0
    port: 5173,
    proxy: {
      // Todas las llamadas a /api/* se redirigen al backend
      '/api': {
        target: 'http://api:80',  // nombre del servicio en Docker
        changeOrigin: true,
      }
    },
    watch: {
      usePolling: true, // Esto fuerza a Vite a revisar cambios manualmente
    },
  }
})
