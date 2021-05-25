'use strict';

const puppeteer = require('puppeteer');
const toACTMatch = require('../matchers/toACTMatch');
expect.extend({ toACTMatch });

jest.setTimeout(600000);
let ruleTestInfo = {}

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("ACT Match Testcases", () => {
    let pupPage;
    let browser;
    ruleTestInfo = global.ruleTestInfo;
    beforeAll(async () => {
        browser = await puppeteer.launch({headless: true, ignoreHTTPSErrors: true});
        //browser = await puppeteer.launch({headless:true}); //Debugging by watching test
        pupPage = await browser.newPage();
        await pupPage.setCacheEnabled(true);
        await pupPage.setViewport({width:1280,height:1024});
    })

    afterAll(async () => {
        await browser.close();
    })

    try {
        for (const ruleId in ruleTestInfo) {
            describe(ruleTestInfo[ruleId].label, () => {
                for (const testcase of ruleTestInfo[ruleId].testcases) {
                    let ext = testcase.url.substring(testcase.url.lastIndexOf("."));
                    if (ext === ".html" || ext === ".xhtml") {
                        test(`${testcase.testcaseTitle}: ${testcase.url}`, async () => {
                            await pupPage.goto(testcase.url, { waitUntil: 'networkidle2' });
                            try {
                                await expect(pupPage).toACTMatch(testcase.testcaseId, ruleTestInfo[ruleId].aceRules, testcase.expected);
                            } catch (err) {
                                throw err;
                            }
                        });
                    }
                }
            })
        }
    } catch (err) {
        console.error(err);
    }
});
