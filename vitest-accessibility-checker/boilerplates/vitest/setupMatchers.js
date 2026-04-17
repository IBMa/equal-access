/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import { expect } from 'vitest';
import { getCompliance, assertCompliance, stringifyResults } from 'vitest-accessibility-checker/commands';

// Extend Vitest's expect with custom accessibility matcher
expect.extend({
  async toBeAccessible(node, label) {
    const { isNot } = this;
    
    // Use test name if label not provided
    const testLabel = label || this.task.name.replace(/[ \\/]/g, "_");
    
    // Get compliance results
    const report = await getCompliance(node, testLabel);
    // Check if there are violations
    const numFailing = await assertCompliance(report);
    const pass = numFailing === 0;
    
    return {
      pass,
      message: () => {
        if (pass) {
          return `Expected element ${isNot ? 'not ' : ''}to be accessible, but it passed all checks`;
        } else {
          return stringifyResults(report);
        }
      }
    };
  }
});

