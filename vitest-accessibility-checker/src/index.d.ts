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

import type { Plugin } from 'vite';
import type { IBaselineReport } from './lib/common/engine/IReport.js';
import type { IConfig, eAssertResult } from './lib/common/config/IConfig.js';

/**
 * Configuration options for the accessibility checker plugin
 */
export interface AccessibilityCheckerOptions extends Partial<IConfig> {
    /**
     * Port for the HTTP server used for browser-Node communication
     * @default 3000
     */
    port?: number;
}

/**
 * Vitest plugin for accessibility testing in browser mode
 * 
 * @example
 * ```typescript
 * import { defineConfig } from 'vitest/config';
 * import { accessibilityCheckerPlugin } from 'vitest-accessibility-checker';
 * 
 * export default defineConfig({
 *   plugins: [accessibilityCheckerPlugin()],
 *   test: {
 *     browser: {
 *       enabled: true,
 *       name: 'chromium',
 *       provider: 'playwright'
 *     }
 *   }
 * });
 * ```
 */
export declare function accessibilityCheckerPlugin(options?: AccessibilityCheckerOptions): Plugin;

export default accessibilityCheckerPlugin;

// Re-export common types for convenience
export type { IBaselineReport, IBaselineResult, IEngineReport, SummaryCounts } from './lib/common/engine/IReport.js';
export type { IConfig, eAssertResult, eRuleLevel } from './lib/common/config/IConfig.js';

/**
 * Browser-side accessibility checker functions
 * These are available in the browser context via window.aChecker
 */
declare global {
    interface Window {
        aChecker: {
            /**
             * Get accessibility compliance results for a DOM element or document
             * 
             * @param content - The element or document to scan
             * @param label - Label for this scan
             * @returns Promise with compliance report
             */
            getCompliance(content: Element | Document, label: string): Promise<IBaselineReport>;
            
            /**
             * Assert compliance against baseline or fail levels
             * 
             * @param report - Scan report
             * @returns Promise with assertion result code
             */
            assertCompliance(report: IBaselineReport): Promise<eAssertResult>;
            
            /**
             * Get baseline for comparison
             * 
             * @param label - Label for the baseline
             * @returns Promise with baseline data
             */
            getBaseline(label: string): Promise<IBaselineReport>;
            
            /**
             * Get diff between current results and baseline
             * 
             * @param label - Label for comparison
             * @param actual - Current scan results
             * @returns Promise with diff results
             */
            getDiffResults(label: string, actual: IBaselineReport): Promise<unknown>;
            
            /**
             * Get available rulesets
             * 
             * @returns Promise with list of available rulesets
             */
            getRulesets(): Promise<unknown[]>;
            
            /**
             * Get rules for a specific ruleset
             * 
             * @param rulesetId - ID of the ruleset
             * @returns Promise with list of rules
             */
            getRules(rulesetId: string): Promise<unknown[]>;
            
            /**
             * Get current configuration
             * 
             * @returns Promise with current configuration
             */
            getConfig(): Promise<IConfig>;
            
            /**
             * Stringify results for display
             * 
             * @param report - Scan report
             * @returns Formatted results string
             */
            stringifyResults(report: IBaselineReport): string;
        };
    }
}
