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
 * NAME: commands.js
 * DESCRIPTION: Browser-side commands for accessibility checking
 *              These run in the browser context and communicate with Node.js
 *******************************************************************************/

/**
 * Get accessibility compliance results for a DOM element or document
 * @param {Element|Document} content - The element or document to scan
 * @param {string} label - Label for this scan
 * @returns {Promise<Object>} Compliance report
 */
async function getCompliance(content, label) {
    if (!window.ACBrowserHelper) {
        throw new Error('ACBrowserHelper not loaded. Make sure setup.js is included.');
    }
    
    // Get config to retrieve policies
    const config = await getConfig();
    
    // Run scan in browser with policies from config
    const report = await window.ACBrowserHelper.runScan(content, config.policies);
    
    // Gather metadata for reporter
    const startScan = Date.now();
    const url = window.location.href;
    const title = document.title;
    const profile = navigator.userAgent;
    
    // Send to Node.js for processing via server endpoint
    const response = await fetch('/__accessibility-checker-task__', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            task: 'sendResultsToReporter',
            data: {
                profile,
                startScan,
                url,
                title,
                label,
                report
            }
        })
    });
    if (!response.ok) {
        throw new Error(`Failed to send results to reporter: ${response.statusText}`);
    }
    
    // Return the updated report from the reporter (includes baseline comparison, etc.)
    const updatedReport = await response.json();
    return updatedReport;
}

/**
 * Get baseline for comparison
 * @param {string} label - Label for the baseline
 * @returns {Promise<Object>} Baseline data
 */
async function getBaseline(label) {
    const response = await fetch('/__accessibility-checker-task__', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            task: 'getBaseline',
            data: { label }
        })
    });
    
    return await response.json();
}

/**
 * Get diff between current results and baseline
 * @param {string} label - Label for comparison
 * @param {Object} actual - Current scan results
 * @returns {Promise<Object>} Diff results
 */
async function getDiffResults(label, actual) {
    const response = await fetch('/__accessibility-checker-task__', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            task: 'getDiffResults',
            data: { label, actual }
        })
    });
    
    return await response.json();
}

/**
 * Get available rulesets
 * @returns {Promise<Array>} List of available rulesets
 */
async function getRulesets() {
    if (!window.ACBrowserHelper) {
        throw new Error('ACBrowserHelper not loaded. Make sure setup.js is included.');
    }
    return window.ACBrowserHelper.getRulesets();
}

/**
 * Get rules for a specific ruleset
 * @param {string} rulesetId - ID of the ruleset
 * @returns {Promise<Array>} List of rules
 */
async function getRules(rulesetId) {
    if (!window.ACBrowserHelper) {
        throw new Error('ACBrowserHelper not loaded. Make sure setup.js is included.');
    }
    return window.ACBrowserHelper.getRules(rulesetId);
}

/**
 * Get current configuration
 * @returns {Promise<Object>} Current configuration
 */
async function getConfig() {
    const response = await fetch('/__accessibility-checker-task__', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            task: 'getConfig',
            data: {}
        })
    });
    
    return await response.json();
}

/**
 * Assert compliance against baseline or fail levels
 * @param {Object} report - Scan report
 * @returns {Promise<number>} Number of violations that exceed failLevels
 */
async function assertCompliance(report) {
    const response = await fetch('/__accessibility-checker-task__', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            task: 'assertCompliance',
            data: { report }
        })
    });
    
    const result = await response.json();
    return result || 0;
}

/**
 * Stringify results for display
 * @param {Object} report - Scan report
 * @returns {string} Formatted results string
 */
function stringifyResults(report) {
    if (!report || !report.results) {
        return 'No results available';
    }
    
    const violations = report.results.filter(r => r.level === 'violation');
    const potentialViolations = report.results.filter(r => r.level === 'potentialviolation');
    const recommendations = report.results.filter(r => r.level === 'recommendation');
    
    let message = '\nAccessibility Issues Found:\n';
    message += `  Violations: ${violations.length}\n`;
    message += `  Potential Violations: ${potentialViolations.length}\n`;
    message += `  Recommendations: ${recommendations.length}\n\n`;
    
    if (violations.length > 0) {
        message += 'Violations:\n';
        violations.forEach((issue, idx) => {
            message += `  ${idx + 1}. ${issue.message.substring(0, 100)}...\n`;
            message += `     Rule: ${issue.ruleId}\n`;
            message += `     Path: ${issue.path.dom}\n\n`;
        });
    }
    
    return message;
}

// Export all commands
export {
    getCompliance,
    assertCompliance,
    getBaseline,
    getDiffResults,
    getRulesets,
    getRules,
    getConfig,
    stringifyResults
};


