'use strict';

const puppeteer = require('puppeteer');
const { getTestcases, getResult } = require("./act");
const fs = require("fs");
(async () => {
    let earlResult = {
        "@context": "https://act-rules.github.io/earl-context.json",
        "@graph": []
    }
    let ruleTestInfo = await getTestcases();
    let browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
    let pupPage = await browser.newPage();
    await pupPage.setRequestInterception(true);
    pupPage.on('request', request => {
        if (request.isNavigationRequest() && request.redirectChain().length)
            request.abort();
        else
            request.continue();
    });
    pupPage.on('console', message =>
        console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    await pupPage.setCacheEnabled(true);
    await pupPage.setViewport({ width: 1280, height: 1024 });

    for (const ruleId in ruleTestInfo) {
        console.group(`* ${ruleTestInfo[ruleId].label}`);
        for (const testcase of ruleTestInfo[ruleId].testcases) {
            let ext = testcase.url.substring(testcase.url.lastIndexOf("."));
            if (testcase.testcaseId === "cbf6409b0df0b3b6437ab3409af341587b144969") {
                // Skip
            } else if (ext === ".html" || ext === ".xhtml") {
                try {
                    if (ruleTestInfo[ruleId].aceRules.length > 0) {
                        console.group(`+ ${testcase.testcaseTitle}: ${testcase.url}`);
                        // If no tests, don't bother loading the testcase
                        await pupPage.goto(testcase.url, { waitUntil: 'networkidle2' });
                    } else {
                        console.group(`? ${testcase.testcaseTitle}: ${testcase.url}`);
                    }
                    let { title, result, issuesFail, issuesPass, issuesReview, issuesAll } = await getResult(pupPage, testcase.testcaseId, ruleTestInfo[ruleId].aceRules);
                    earlResult["@graph"].push({
                        "@type": "TestSubject",
                        "source": `https://act-rules.github.io/testcases/${ruleId}/${testcase.testcaseId}.html`,
                        "assertions": [
                            {
                                "@type": "Assertion",
                                "test": { "title": title },
                                "result": { "outcome": result }
                            }
                        ]
                    });
                    if (result === "earl:cantTell" && (testcase.expected === "passed" || testcase.expected === "failed")) {
                        console.log("--Can't tell");
                    } else if (`earl:${testcase.expected}` !== result) {
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
        }
        console.groupEnd();
    }
    fs.writeFileSync("./earlResult.json", JSON.stringify(earlResult, null, 2));
    await browser.close();
})();

