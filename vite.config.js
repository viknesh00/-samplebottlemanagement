import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // fail fast if 3000 is already taken
    host: true,       // expose on 0.0.0.0 so LAN / VPS access works
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true,
  },
})
