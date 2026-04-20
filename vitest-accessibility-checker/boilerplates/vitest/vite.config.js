import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// This config is used for the development server (npm run dev)
// For testing, see vitest.browser.config.js
export default defineConfig({
  plugins: [react()],
})
