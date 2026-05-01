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
 * NAME: ACBrowserHelper.js
 * DESCRIPTION: Browser-side helper for running accessibility scans
 *              This runs in the browser context and uses the ace engine
 *******************************************************************************/

/**
 * Convert value array to level string
 * @param {Array} reportValue - Value array from result
 * @returns {string} Level string
 */
function valueToLevel(reportValue) {
    let reportLevel;
    if (reportValue[1] === "PASS") {
        reportLevel = "pass";
    }
    else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
        reportLevel = "manual";
    }
    else if (reportValue[0] === "VIOLATION") {
        if (reportValue[1] === "FAIL") {
            reportLevel = "violation";
        }
        else if (reportValue[1] === "POTENTIAL") {
            reportLevel = "potentialviolation";
        }
    }
    else if (reportValue[0] === "RECOMMENDATION") {
        if (reportValue[1] === "FAIL") {
            reportLevel = "recommendation";
        }
        else if (reportValue[1] === "POTENTIAL") {
            reportLevel = "potentialrecommendation";
        }
    }
    return reportLevel;
}

/**
 * Get counts from engine report
 * @param {Object} engineReport - Engine report with results
 * @returns {Object} Counts object
 */
function getCounts(engineReport) {
    let counts = {
        violation: 0,
        potentialviolation: 0,
        recommendation: 0,
        potentialrecommendation: 0,
        manual: 0
    };
    for (const issue of engineReport.results) {
        ++counts[issue.level];
    }
    return counts;
}

/**
 * Browser helper for accessibility checking
 * Provides methods to run scans using the ace engine
 */
window.ACBrowserHelper = {
    /**
     * Run an accessibility scan on content
     * @param {Element|Document} content - The element or document to scan
     * @param {Array} policies - Policies to use for scanning
     * @returns {Promise<Object>} Scan report
     */
    async runScan(content, policies) {
        if (!window.ace) {
            throw new Error('ace engine not loaded');
        }

        try {
            const checker = new window.ace.Checker();
            const report = await checker.check(content, policies || []);
            
            // Add level to each result (like Cypress does)
            for (const result of report.results) {
                delete result.node;
                result.level = valueToLevel(result.value);
            }
            
            // Add summary with counts (like Cypress does)
            report.summary = report.summary || {};
            report.summary.counts = report.summary.counts || getCounts(report);
            
            return report;
        } catch (err) {
            console.error('Error running accessibility scan:', err);
            throw err;
        }
    },

    /**
     * Get available rulesets
     * @returns {Promise<Array>} List of available rulesets
     */
    async getRulesets() {
        if (!window.ace) {
            throw new Error('ace engine not loaded');
        }

        try {
            return window.ace.getRulesets();
        } catch (err) {
            console.error('Error getting rulesets:', err);
            throw err;
        }
    },

    /**
     * Get rules for a specific ruleset
     * @param {string} rulesetId - ID of the ruleset
     * @returns {Promise<Array>} List of rules
     */
    async getRules(rulesetId) {
        if (!window.ace) {
            throw new Error('ace engine not loaded');
        }

        try {
            return window.ace.getRules(rulesetId);
        } catch (err) {
            console.error('Error getting rules:', err);
            throw err;
        }
    }
};


