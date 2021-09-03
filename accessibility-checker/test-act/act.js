/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

 'use strict';

 const aChecker = require("../src/index");
 const request = require("request");
 const { ace_mapping } = require("./ace_mapping");

 
 async function getTestcases() {
    let ruleTestInfo = {}
    return await new Promise((resolve, reject) => {
        request("https://act-rules.github.io/testcases.json", (err, req, body) => {
            let testcaseInfo = JSON.parse(body);
            for (const testcase of testcaseInfo.testcases) {
                if (testcase.ruleId in ace_mapping) {
                    ruleTestInfo[testcase.ruleId] = ruleTestInfo[testcase.ruleId] || {
                        aceRules: ace_mapping[testcase.ruleId],
                        label: testcase.ruleName,
                        testcases: []
                    }
                    ruleTestInfo[testcase.ruleId].testcases.push(testcase);
                }
            }
            resolve(ruleTestInfo);
        });
    });
}

async function getResult(page, testcaseId, aceRules) {
    if (aceRules.length === 0) {
        return {
            title: "",
            result: "earl:untested",
            issuesPass: [],
            issuesFail: [],
            issuesReview: [],
            issuesAll: []    
        }
    }
    let results = await aChecker.getCompliance(page, testcaseId);
    let issuesFail = [];
    let issuesReview = [];
    let issuesPass = [];
    for (const result of results.report.results) {
        for (const aceRule of aceRules) {
            if (result.ruleId === aceRule.ruleId) {
                if (aceRule.treatAsPass && aceRule.treatAsPass.includes(result.reasonId)) {
                    issuesPass.push(result);
                } else if (aceRule.treatAsFail && aceRule.treatAsFail.includes(result.reasonId)) {
                    issuesFail.push(result);
                } else if (result.value[1] === "FAIL") {
                    issuesFail.push(result);
                } else if (["POTENTIAL", "MANUAL"].includes(result.value[1])) {
                    issuesReview.push(result);
                } else {
                    issuesPass.push(result);
                }
            }
        }
    }

    let issues2 = results.report.results;
    let ruleStrs = [];
    for (let aceRule of aceRules) {
        ruleStrs.push(`${aceRule.ruleId}:${aceRule.reasonIds.join(",")}`)
    }
    let ruleTitle = ruleStrs.join("|");
    let result = "";
    if (issuesFail.length === 0 && issuesReview.length === 0 && issuesPass.length === 0) {
        result = "earl:inapplicable";
    } else if (issuesFail.length > 0) {
        result = "earl:failed";
    } else if (issuesReview.length > 0) {
        result = "earl:cantTell";
    } else if (issuesPass.length > 0) {
        result = "earl:passed";
    }
    return {
        title: ruleTitle,
        result: result,
        issuesPass: issuesPass,
        issuesFail: issuesFail,
        issuesReview: issuesReview,
        issuesAll: issues2
    }
}

module.exports = { getTestcases, getResult }