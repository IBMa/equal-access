/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const aChecker = require("../src/index");
const request = require("request");
 
async function getAceMapping() {
    let rules = await aChecker.getRules();
    let retVal = {};
    for (const rule of rules) {
        if (rule.act) {
            let reasonIds = [];
            for (const reasonId in rule.messages["en-US"]) {
                if ((reasonId+"") !== "0" && reasonId !== "group") {
                    reasonIds.push(reasonId);
                }
            }
            if (typeof rule.act === "string") {
                retVal[rule.act] = retVal[rule.act] || [];
                retVal[rule.act].push({
                    ruleId: rule.id,
                    reasonIds: reasonIds
                });
            } else {
                for (const actMap of rule.act) {
                    if (typeof actMap === "string") {
                        retVal[actMap] = retVal[actMap] || [];
                        retVal[actMap].push({
                            ruleId: rule.id,
                            reasonIds: reasonIds
                        });
                    } else {
                        for (const actRuleId in actMap) {
                            let remapReasonIds = []
                            for (const reasonId in actMap[actRuleId]) {
                                if (actMap[actRuleId][reasonId] !== "inapplicable") {
                                    remapReasonIds.push(reasonId);
                                }
                            }
                            retVal[actRuleId] = retVal[actRuleId] || [];
                            retVal[actRuleId].push({
                                ruleId: rule.id,
                                reasonIds: remapReasonIds,
                                remap: actMap[actRuleId]
                            });
                        }
                    }
                }
            }
        }
    }
    return retVal;
}

async function getTestcases() {
    let aceMapping = await getAceMapping();
    let ruleTestInfo = {}
    return await new Promise((resolve, reject) => {
        request("https://act-rules.github.io/testcases.json", (err, req, body) => {
            let testcaseInfo = JSON.parse(body);
            for (const testcase of testcaseInfo.testcases) {
                if (testcase.ruleId in aceMapping) {
                    ruleTestInfo[testcase.ruleId] = ruleTestInfo[testcase.ruleId] || {
                        aceRules: aceMapping[testcase.ruleId],
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

async function getResult(page, testcaseId, aceRules, bSkip) {
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
    let results = [];
    if (!bSkip) {
        results = await aChecker.getCompliance(page, testcaseId);
    }
    let issuesFail = [];
    let issuesReview = [];
    let issuesPass = [];
    if (results && results.report && results.report.results) {
        for (const result of results.report.results) {
            for (const aceRule of aceRules) {
                if (result.ruleId === aceRule.ruleId) {
                    if (aceRule.remap && result.reasonId in aceRule.remap) {
                        let earlResult = aceRule.remap[result.reasonId];
                        switch (earlResult) {
                            case "pass":
                                issuesPass.push(result);
                                break;
                            case "fail":
                                issuesFail.push(result);
                                break;
                            case "cantTell":
                                issuesReview.push(result);
                                break;
                            case "inapplicable":
                                break;
                        }
                    } else if (!aceRule.remap) {
                        if (result.value[1] === "FAIL") {
                            issuesFail.push(result);
                        } else if (["POTENTIAL", "MANUAL"].includes(result.value[1])) {
                            issuesReview.push(result);
                        } else if (result.value[1] === "PASS") {
                            issuesPass.push(result);
                        }
                    }
                }
            }
        }
    }

    let issues2 = results && results.report && results.report.results ? results.report.results : [];
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