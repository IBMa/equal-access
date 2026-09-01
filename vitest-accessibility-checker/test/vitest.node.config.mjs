import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vitest config for Node-side tests (reporter output, XLSX generation, etc.)
 * Runs in a forked Node process so fs, adm-zip, etc. are available.
 */
export default defineConfig({
    root: __dirname,
    test: {
        include: ['src/achecker-xlsx.test.js'],
        pool: 'forks',
    },
});
