import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // This section allows Render to access the Vite dev server
    allowedHosts: [
      'content-evolution.onrender.com',
      '.onrender.com' // This allows any sub-domain on render
    ]
  }
})
