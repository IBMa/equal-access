import { defineConfig } from 'vitest/config';
import { accessibilityChecker } from '../src/index.js';

export default defineConfig({
    plugins: [accessibilityChecker()],
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


