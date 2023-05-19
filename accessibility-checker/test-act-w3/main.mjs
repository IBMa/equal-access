'use strict';

import * as puppeteer from "puppeteer";
import { getTestcases, getResult } from "./act.mjs";
import * as fs from "fs";
(async () => {
    // Fetch the testcases from ACT
    let ruleTestInfo = await getTestcases();
    let earlResult = {
        "@context": "https://act-rules.github.io/earl-context.json",
        "@graph": []
    }
    
    // Setup the Puppeteer test environment
    let browser = await puppeteer.launch({ headless: 'new', ignoreHTTPSErrors: true });
    let pupPage = await browser.newPage();
    await pupPage.setRequestInterception(true);
    pupPage.on('request', request => {
        if (request.isNavigationRequest() && request.redirectChain().length)
            request.abort();
        else
            request.continue();
    });
    pupPage.on('console', message =>
        !message.text().includes("interest-cohort") && console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    await pupPage.setCacheEnabled(true);
    await pupPage.setViewport({ width: 1280, height: 1024 });

    const processTestCase = async (ruleId, showApproved) => {
        let first = true;
        let approved = false;
        for (const testcase of ruleTestInfo[ruleId].testcases) {
            // If any testcase is approved, consider the rule approved
            approved = approved || testcase.approved;
            if (!!approved !== showApproved) continue;
            if (first) {
                console.group(`* ${ruleTestInfo[ruleId].label} (https://www.w3.org/WAI/standards-guidelines/act/rules/${ruleId})`);
                first = false;
            }
            let ext = testcase.url.substring(testcase.url.lastIndexOf("."));
            // if (testcase.testcaseId === "cbf6409b0df0b3b6437ab3409af341587b144969") {
                // Skip
            // } else 
            if (!ruleTestInfo[ruleId].aceRules || ruleTestInfo[ruleId].aceRules.length === 0) {
                console.log(`? No checker rules`);
                console.groupEnd();
                return;
            }

            try {
                // This rule has testcases, run the test
                console.group(`+ ${testcase.testcaseTitle}: ${testcase.url}`);
                // Special handling for meta refresh
                if (ext === ".html" || ext === ".xhtml") {
                    if (testcase.ruleId === "bisz58" || testcase.ruleId === "bc659a") 
                    {
                    //     testcase.testcaseId === "cbf6409b0df0b3b6437ab3409af341587b144969"
                    //     || testcase.testcaseId === "beeaf6f49d37ef2d771effd40bcb3bfc9655fbf4"
                    //     || testcase.testcaseId === "d1bbcc895f6e11010b033578d073138e7c4fc57e"
                    //     || testcase.testcaseId === "d789ff3d0c087c77117a02527e71a646a343d4a3")
                    // {
                        let succeeded = false;
                        while (!succeeded) {
                            try {
                                await pupPage.goto(testcase.url, { waitUntil: 'domcontentloaded' });
                                await pupPage._client.send("Page.stopLoading");
                                let win = await pupPage.evaluate("document");
                                if (win) {
                                    succeeded = true;
                                }
                            } catch (err) {
                            }
                        }
                    } else {
                        await pupPage.goto(testcase.url, { waitUntil: 'networkidle2' });
                    }
                }

                let { assertions, result, issuesFail, issuesPass, issuesReview, issuesAll } = await getResult(pupPage, testcase.ruleId, testcase.testcaseId, ruleTestInfo[ruleId].aceRules, !(ext === ".html" || ext === ".htm"));
                earlResult["@graph"].push({
                    "@type": "TestSubject",
                    "source": `${testcase.url}`,
                    "assertions": assertions
                });
                let consistent = `earl:${testcase.expected}` === result 
                    || testcase.expected === "inapplicable" && result === "earl:passed" 
                    || testcase.expected === "passed" && result === "earl:inapplicable";
                if (result === "earl:cantTell" && (testcase.expected === "passed" || testcase.expected === "failed")) {
                    console.log("--Can't tell");
                } else if (!consistent) {
                    if (result !== "earl:untested") {
                        console.log(`\x1b[31m--Expected ${testcase.expected}, but returned ${result}
Failures: ${JSON.stringify(issuesFail, null, 2)}
Review: ${JSON.stringify(issuesReview, null, 2)}
Pass: ${JSON.stringify(issuesPass, null, 2)}
All: ${JSON.stringify(issuesAll
                            .filter(result => result.value[1] !== "PASS")
                            .map(result => result.ruleId + ":" + result.reasonId + ":" + result.value[1]), null, 2)}\x1b[0m`);
                    }
                }
                console.groupEnd();
            } catch (err) {
                console.error(err);
            }
        }
        console.groupEnd();
    }

    console.log("Approved Rules");
    console.log("==========================================================");
    for (const ruleId in ruleTestInfo) {
        await processTestCase(ruleId, true);
    }
    console.log("\n\n\nProposed Rules");
    console.log("==========================================================");
    for (const ruleId in ruleTestInfo) {
        await processTestCase(ruleId, false);
    }
    fs.writeFileSync("./act-report-v2.json", JSON.stringify(earlResult, null, 2));
    await browser.close();
})();

