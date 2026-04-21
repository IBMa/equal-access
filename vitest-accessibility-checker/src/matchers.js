/******************************************************************************
     Copyright:: 2026- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  *****************************************************************************/

/*******************************************************************************
 * NAME: matchers.js
 * DESCRIPTION: Custom Vitest matchers for accessibility testing
 *******************************************************************************/

import { getCompliance, assertCompliance, stringifyResults } from './commands.js';

/**
 * Custom Vitest matcher to check if an element is accessible
 * @param {Element|Document} node - The element or document to check
 * @param {string} label - Optional label for the scan
 * @returns {Object} Matcher result with pass/fail and message
 */
export async function toBeAccessible(node, label) {
    const { isNot } = this;
    
    // Use test name if label not provided
    const testLabel = label || (this.task ? this.task.name.replace(/[ \\/]/g, "_") : 'accessibility-check');
    
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
