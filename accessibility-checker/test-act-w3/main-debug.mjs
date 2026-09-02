'use strict';
/**
 * Single-testcase debug runner.
 * Usage: node main-debug.mjs <ruleId> <testcaseId>
 * Example: node main-debug.mjs m6b1q3 f3a40579bcb3cab4f12a31639bc9dd0ca5c14d87
 */

import * as puppeteer from "puppeteer";
import * as aChecker from "../src/mjs/index.js";
import { getTestcases } from "./act.mjs";

const [,, ACT_RULE_ID, TARGET_TESTCASE_ID] = process.argv;

if (!ACT_RULE_ID || !TARGET_TESTCASE_ID) {
    console.error("Usage: node main-debug.mjs <ruleId> <testcaseId>");
    process.exit(1);
}

const GH_RAW_BASE = "https://raw.githubusercontent.com/w3c/wcag-act-rules/publication/content-assets/wcag-act-rules/";

(async () => {
    const ruleTestInfo = await getTestcases();
    const ruleInfo = ruleTestInfo[ACT_RULE_ID];

    if (!ruleInfo) {
        console.error(`No testcase info found for ACT rule '${ACT_RULE_ID}'`);
        process.exit(1);
    }

    const testcase = ruleInfo.testcases.find(tc => tc.testcaseId === TARGET_TESTCASE_ID);
    if (!testcase) {
        console.error(`Testcase '${TARGET_TESTCASE_ID}' not found for rule '${ACT_RULE_ID}'`);
        console.log("Available testcases:");
        ruleInfo.testcases.forEach(tc => console.log(`  ${tc.testcaseId}  ${tc.testcaseTitle}  (${tc.expected})`));
        process.exit(1);
    }

    console.log(`\n=== ACT rule: ${ACT_RULE_ID} — ${ruleInfo.label} ===`);
    console.log(`Testcase:  ${testcase.testcaseTitle} (expected: ${testcase.expected})`);
    console.log(`URL:       ${testcase.url}`);
    console.log(`ACE rules: ${ruleInfo.aceRules?.map(r => r.ruleId).join(", ") || "NONE"}\n`);

    // Show full aceRules mapping
    console.log("aceRules detail:");
    console.log(JSON.stringify(ruleInfo.aceRules, null, 2));

    // Show config
    const config = await aChecker.getConfig();
    console.log(`\nConfig loaded:`);
    console.log(`  rulePack:     ${config.rulePack}`);
    console.log(`  ruleArchive:  ${config.ruleArchive}`);
    console.log(`  policies:     ${JSON.stringify(config.policies)}`);
    console.log(`  reportLevels: ${JSON.stringify(config.reportLevels)}`);
    console.log(`  failLevels:   ${JSON.stringify(config.failLevels)}`);

    const ext = testcase.url.substring(testcase.url.lastIndexOf("."));
    const bSkip = !(ext === ".html" || ext === ".htm" || ext === ".xhtml");

    const browser = await puppeteer.launch({
        headless: 'shell',
        ignoreHTTPSErrors: true,
        args: ['--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 1024 });

    if (!bSkip) {
        if (testcase.relativePath) {
            const ghUrl = GH_RAW_BASE + testcase.relativePath;
            console.log(`\nFetching from GitHub publication branch: ${ghUrl}`);
            const resp = await fetch(ghUrl);
            const html = await resp.text();
            await page.setContent(html, { waitUntil: 'networkidle2' });
        } else {
            await page.goto(testcase.url, { waitUntil: 'networkidle2' });
        }
    }

    console.log(`\nPage url:   ${page.url()}`);
    console.log(`Page title: "${await page.title()}"`);
    console.log(`Page body:  ${await page.evaluate(() => document.body.innerHTML.trim())}\n`);

    // --- Raw getCompliance result ---
    console.log("=== Raw getCompliance results ===");
    const raw = await aChecker.getCompliance(page, `debug_${ACT_RULE_ID}_${TARGET_TESTCASE_ID}`);
    const allResults = raw?.report?.results || [];
    console.log(`Total results: ${allResults.length}`);
    console.log(`Summary counts: ${JSON.stringify(raw?.report?.summary?.counts)}\n`);

    console.log("All results:");
    allResults.forEach(r =>
        console.log(`  ${r.ruleId}:${r.reasonId}  value=${JSON.stringify(r.value)}  level=${r.level}`)
    );

    // --- Results matching ACE rules for this ACT rule ---
    const aceRuleIds = new Set(ruleInfo.aceRules?.map(r => r.ruleId) || []);
    const matching = allResults.filter(r => aceRuleIds.has(r.ruleId));
    console.log(`\nMatching results (${matching.length}):`);
    matching.forEach(r =>
        console.log(`  ${r.ruleId}:${r.reasonId}  value=${JSON.stringify(r.value)}  level=${r.level}  snippet=${r.snippet}`)
    );

    await browser.close();
    process.exit(0);
})();
