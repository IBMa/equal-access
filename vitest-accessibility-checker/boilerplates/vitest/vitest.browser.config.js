import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'
import { accessibilityCheckerPlugin } from 'vitest-accessibility-checker'

export default defineConfig({
  plugins: [
    react(),
    accessibilityCheckerPlugin()
  ],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
      instances: [
        { browser: 'chromium' },
      ],
    },
    setupFiles: ['./setupMatchers.js'],
    // Disable cache during development to ensure latest code is loaded
    cache: false,
  },
})


