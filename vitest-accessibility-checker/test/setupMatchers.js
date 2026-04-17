import { expect } from 'vitest';
import { getCompliance, assertCompliance, stringifyResults } from '../src/commands.js';

expect.extend({
    async toBeAccessible(label) {
        const report = await getCompliance(label);
        const numFailing = await assertCompliance(report);
        
        return {
            pass: numFailing === 0,
            message: () => stringifyResults(report)
        };
    }
});


