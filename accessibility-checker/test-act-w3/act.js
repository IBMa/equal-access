/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const aChecker = require("../src/index");
const request = require("request");
const rulesetP = aChecker.getRuleset('IBM_Accessibility');

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
        request("https://www.w3.org/WAI/content-assets/wcag-act-rules/testcases.json", (err, req, body) => {
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

async function getResult(page, ruleId, testcaseId, aceRules) {
    const ruleset = await rulesetP;
    let assertions = [];
    if (aceRules.length === 0) {
        return {
            assertions: [{
                "@type": "Assertion",
                "test": { "title": "", "isPartOf": []},
                "result": { "outcome": "earl:untested" }
            }],
            title: "",
            result: "earl:untested",
            issuesPass: [],
            issuesFail: [],
            issuesReview: [],
            issuesAll: []    
        }
    }
    let results = await aChecker.getCompliance(page, `${ruleId}_${testcaseId}`);
    let ruleIds = {};
    let issuesFailMap = {};
    let issuesReviewMap = {};
    let issuesPassMap = {};
    for (const result of results.report.results) {
        for (const aceRule of aceRules) {
            if (result.ruleId === aceRule.ruleId) {
                if (aceRule.remap && result.reasonId in aceRule.remap) {
                    let earlResult = aceRule.remap[result.reasonId];
                    switch (earlResult) {
                        case "pass":
                            ruleIds[result.ruleId] = true;
                            issuesPassMap[result.ruleId] = issuesPassMap[result.ruleId] || [];
                            issuesPassMap[result.ruleId].push(result);
                            break;
                        case "fail":
                            ruleIds[result.ruleId] = true;
                            issuesFailMap[result.ruleId] = issuesFailMap[result.ruleId] || [];
                            issuesFailMap[result.ruleId].push(result);
                            break;
                        case "cantTell":
                            ruleIds[result.ruleId] = true;
                            issuesReviewMap[result.ruleId] = issuesReviewMap[result.ruleId] || [];
                            issuesReviewMap[result.ruleId].push(result);
                            break;
                        case "inapplicable":
                            break;
                    }
                } else if (!aceRule.remap) {
                    if (result.value[1] === "FAIL") {
                        ruleIds[result.ruleId] = true;
                        issuesFailMap[result.ruleId] = issuesFailMap[result.ruleId] || [];
                        issuesFailMap[result.ruleId].push(result);
                    } else if (["POTENTIAL", "MANUAL"].includes(result.value[1])) {
                        ruleIds[result.ruleId] = true;
                        issuesReviewMap[result.ruleId] = issuesReviewMap[result.ruleId] || [];
                        issuesReviewMap[result.ruleId].push(result);
                    } else if (result.value[1] === "PASS") {
                        ruleIds[result.ruleId] = true;
                        issuesPassMap[result.ruleId] = issuesPassMap[result.ruleId] || [];
                        issuesPassMap[result.ruleId].push(result);
                    }
                }
            }
        }
    }

    // Summarize the results
    let issuesPass = [];
    let issuesFail = [];
    let issuesReview = [];
    for (const ruleId in ruleIds) {
        let ruleTitle = "";
        aChecker.getRuleset("")
        for (let aceRule of aceRules) {
            if (aceRule.ruleId === ruleId) {
                ruleTitle = `${aceRule.ruleId}:${aceRule.reasonIds.join(",")}`;
            }
        }
        let result = "";
        const hasFail = ruleId in issuesFailMap && issuesFailMap[ruleId].length > 0;
        const hasReview = ruleId in issuesReviewMap && issuesReviewMap[ruleId].length > 0;
        const hasPass = ruleId in issuesPassMap && issuesPassMap[ruleId].length > 0;
        if (!hasFail && !hasReview && !hasPass) {
            result = "earl:inapplicable";
        } else if (hasFail) {
            result = "earl:failed";
        } else if (hasReview) {
            result = "earl:cantTell";
        } else {
            result = "earl:passed";
        }
        assertions.push({
            "@type": "Assertion",
            "test": { 
                "title": ruleTitle,
                "isPartOf": ruleset.checkpoints
                    // Get checkpoints that have this rule
                    .filter(cp => cp.rules && cp.rules.filter(rule => rule.id === ruleId).length > 0)
                    // Replace with the scId
                    .map(cp => cp.scId)
            },
            "result": { "outcome": result }
        })
        if (hasFail) { 
            issuesFail = issuesFail.concat(issuesFailMap[ruleId]); 
        }
        if (hasReview) { 
            issuesReview = issuesReview.concat(issuesReviewMap[ruleId]);
        }
        if (hasPass) { 
            issuesPass = issuesPass.concat(issuesPassMap[ruleId]);
        }
    }

    let overallResult = "";
    if (issuesFail.length === 0 && issuesReview.length === 0 && issuesPass.length === 0) {
        overallResult = "earl:inapplicable";
    } else if (issuesFail.length > 0) {
        overallResult = "earl:failed";
    } else if (issuesReview.length > 0) {
        overallResult = "earl:cantTell";
    } else if (issuesPass.length > 0) {
        overallResult = "earl:passed";
    }    

    return {
        assertions: assertions,
        result: overallResult,
        issuesPass: issuesPass,
        issuesFail: issuesFail,
        issuesReview: issuesReview,
        issuesAll: results.report.results
    }
}

module.exports = { getTestcases, getResult }