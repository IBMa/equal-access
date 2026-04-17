import { defineConfig } from 'vitest/config';
import { accessibilityChecker } from 'vitest-accessibility-checker';

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


