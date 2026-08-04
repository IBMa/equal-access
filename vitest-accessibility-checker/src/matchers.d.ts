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

/**
 * Custom Vitest matcher to check if an element is accessible.
 *
 * @param node  - The element or document to scan.
 * @param label - Optional label for the scan. Defaults to the current test name.
 * @returns A Vitest matcher result (`{ pass, message }`).
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest';
 * import * as matchers from 'vitest-accessibility-checker/matchers';
 * expect.extend(matchers);
 *
 * test('page is accessible', async () => {
 *   await expect(document).toBeAccessible('home-page');
 * });
 * ```
 */
export declare function toBeAccessible(
    node: Element | Document,
    label?: string,
): Promise<{ pass: boolean; message: () => string }>;
