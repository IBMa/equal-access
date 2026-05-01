import { defineConfig } from 'vitest/config';
import { accessibilityCheckerPlugin } from '../src/index.js';

export default defineConfig({
    plugins: [accessibilityCheckerPlugin()],
    test: {
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true,
        },
        setupFiles: ['./setupMatchers.js'],
    },
});


