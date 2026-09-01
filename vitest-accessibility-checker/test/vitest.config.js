import { defineConfig } from 'vitest/config';
import { accessibilityCheckerPlugin } from '../src/index.js';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    root: __dirname,
    plugins: [accessibilityCheckerPlugin()],
    test: {
        // Explicitly exclude the Node-only XLSX test (runs via vitest.node.config.mjs instead)
        exclude: ['src/achecker-xlsx.test.js'],
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
        setupFiles: [resolve(__dirname, 'setupMatchers.js')],
    },
});


