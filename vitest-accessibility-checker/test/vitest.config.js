import { defineConfig } from 'vitest/config';
import { accessibilityCheckerPlugin } from '../src/index.js';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
    plugins: [accessibilityCheckerPlugin()],
    test: {
        browser: {
            enabled: true,
            instances: [
                {
                    browser: 'chromium',
                    provider: playwright(),
                }
            ],
            headless: true,
        },
        setupFiles: ['./test/setupMatchers.js'],
    },
});


