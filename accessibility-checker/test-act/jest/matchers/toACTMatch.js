/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const aChecker = require("../../../src/index");

async function toACTMatch(node, testcaseId, aceRules, result) {
    let results = await aChecker.getCompliance(node, testcaseId);
    let issuesFail = results.report.results.filter(result => {
        let match = false;
        for (let aceRule of aceRules) {
            match = match || (result.ruleId === aceRule.ruleId && aceRule.reasonIds.includes(result.reasonId));
        }
        return match;
    });
    let issuesPass = results.report.results.filter(result => {
        let match = false;
        let matchRuleId = false;
        for (let aceRule of aceRules) {
            match = match || (result.ruleId === aceRule.ruleId && aceRule.reasonIds.includes(result.reasonId));
            matchRuleId = matchRuleId || result.ruleId === aceRule.ruleId;
        }
        // Fails, so don't include here
        if (match) return false;
        // Doesn't match any relevant rules
        if (!matchRuleId) return false;
        return result.value[1] === "PASS";
    });
    let issues2 = results.report.results.filter(result => {
        let match = false;
        for (let aceRule of aceRules) {
            match = match || result.ruleId === aceRule.ruleId;
        }
        return match;
    });
    if (result === "passed") {
        if (issuesFail.length === 0 && issuesPass.length > 0) {
            return {
                pass: true
            }
        } else {
            return {
                pass: false,
                message: () => `Expected passed, but results don't match:
Failures: ${JSON.stringify(issuesFail, null, 2)}
Pass: ${JSON.stringify(issuesPass, null, 2)}`
            }
        }
    } else if (result === "inapplicable") {
        if (issuesFail.length === 0 && issuesPass.length === 0) {
            return {
                pass: true
            }
        } else {
            return {
                pass: false,
                message: () => `Expected inapplicable, but results don't match:
Failures: ${JSON.stringify(issuesFail, null, 2)}
Pass: ${JSON.stringify(issuesPass, null, 2)}`
            }
        }
    } else if (result === "failed") {
        if (issuesFail.length > 0) {
            return {
                pass: true
            }
        } else {
            return {
                pass: false,
                message: () => `Expect fail, but no failing issues:
${JSON.stringify(issues2, null, 2)}`
            }
        }
    } else {
        return {
            pass: false,
            message: () => `Unexpected result: ${result}`
        }
    }
}

module.exports = toACTMatch;