import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'framer-motion': fileURLToPath(
        new URL('./node_modules/framer-motion/dist/cjs/index.js', import.meta.url),
      ),
    },
  },
})
