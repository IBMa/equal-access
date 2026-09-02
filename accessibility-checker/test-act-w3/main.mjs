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

    // Pre-fetch all HTML testcase content from GitHub raw in parallel (bounded concurrency).
    // This collapses ~1169 serial network fetches into one parallel batch before the browser
    // loop starts, avoiding repeated round-trips during scanning.
    const GH_RAW_BASE = "https://raw.githubusercontent.com/w3c/wcag-act-rules/publication/content-assets/wcag-act-rules/";
    const FETCH_CONCURRENCY = 20;
    const htmlCache = new Map(); // relativePath -> html string

    const allFetchable = [];
    for (const ruleId in ruleTestInfo) {
        for (const testcase of ruleTestInfo[ruleId].testcases) {
            const ext = testcase.url.substring(testcase.url.lastIndexOf("."));
            if ((ext === ".html" || ext === ".xhtml") && testcase.relativePath
                    && testcase.ruleId !== "bisz58" && testcase.ruleId !== "bc659a") {
                allFetchable.push(testcase.relativePath);
            }
        }
    }
    // Deduplicate (same file can appear in multiple rule entries)
    const uniquePaths = [...new Set(allFetchable)];
    console.error(`Pre-fetching ${uniquePaths.length} testcase files from GitHub...`);
    const fetchStart = Date.now();
    for (let i = 0; i < uniquePaths.length; i += FETCH_CONCURRENCY) {
        const batch = uniquePaths.slice(i, i + FETCH_CONCURRENCY);
        await Promise.all(batch.map(async (relPath) => {
            try {
                const resp = await fetch(GH_RAW_BASE + relPath);
                htmlCache.set(relPath, await resp.text());
            } catch (err) {
                console.error(`Failed to pre-fetch ${relPath}: ${err.message}`);
            }
        }));
    }
    console.error(`Pre-fetch complete in ${((Date.now() - fetchStart) / 1000).toFixed(1)}s`);

    // Setup the Puppeteer test environment
    let browser = await puppeteer.launch({ headless: 'shell', ignoreHTTPSErrors: true, args: ['--disable-blink-features=AutomationControlled'] });
    let pupPage = await browser.newPage();
    await pupPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await pupPage.setRequestInterception(true);
    pupPage.on('request', request => {
        if (request.isNavigationRequest() && request.redirectChain().length)
            request.abort();
        else
            request.continue();
    });
    // pupPage.on('console', message =>
    //     !message.text().includes("interest-cohort") && console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
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
                console.group(`+ ${testcase.testcaseTitle}${testcase.approved ? "" : " [not approved]" }: ${testcase.url}`);
                // Special handling for meta refresh
                if (ext === ".html" || ext === ".xhtml") {
                    if (testcase.ruleId === "bisz58" || testcase.ruleId === "bc659a")
                    {
                        let succeeded = false;
                        while (!succeeded) {
                            try {
                                await pupPage.goto(testcase.url, { waitUntil: 'domcontentloaded' });
                                const client = await pupPage.target().createCDPSession();
                                await client.send("Page.stopLoading");
                                let win = await pupPage.evaluate("document");
                                if (win) {
                                    succeeded = true;
                                }
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    } else if (testcase.relativePath) {
                        // W3C testcase files: served from the pre-fetched in-memory cache.
                        // If the HTML references external sub-resources (iframe src, img src, etc.)
                        // pass the canonical URL as the base and wait for networkidle2 so those
                        // loads settle. Otherwise domcontentloaded is enough and much faster.
                        const html = htmlCache.get(testcase.relativePath) || "";
                        const hasExternalRefs = /\s(?:src|href|data)\s*=\s*["'][^"'#]/i.test(html);
                        await pupPage.setContent(html, {
                            waitUntil: hasExternalRefs ? 'networkidle2' : 'domcontentloaded',
                            ...(hasExternalRefs ? { url: testcase.url } : {})
                        });
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

