import {Given, When, Then, After, AfterAll, ITestCaseHookParameter, Before} from '@cucumber/cucumber';
import {CustomWorld} from '../CustomWorld';
import { BrowserWrapper } from '../BrowserWrapper';
import { strict as assert } from "assert";
import { PupUtil } from "../util/pup";

Given("{string} page {string} and panel {string}", async function(widthKey, pageKey, panelKey) {
    const browser : BrowserWrapper = this.browser;
    const index = browser.pageKeyToTabId(pageKey)!;
    const panelUrl = browser.panelKeyToURL(panelKey);
    await browser.openTab(widthKey, `${panelUrl}?index=${encodeURIComponent(index)}`);
    // assert.strictEqual(false, true, "Test");
});

Then("Banner is loaded", function() {

})

Then('manual step {string}', function (_str: string) {
    return 'pending';
});

Then('manual step', function (_docString) {
    return 'pending';
});

Then(`page is accessible`, async function() {
    const w = this as CustomWorld;
    return PupUtil.accessibilityScan(w.browser.page(), this.scenario.gherkinDocument.feature.name+" "+this.scenario.pickle.name);
});

Then(`page is accessible with label {string}`, async function(label: string) {
    const w = this as CustomWorld;
    return PupUtil.accessibilityScan(w.browser.page(), this.scenario.gherkinDocument.feature.name+" "+this.scenario.pickle.name + " " + label);
});

When(`user clicks xpath {string}`, async function (xpath) { await PupUtil.xpathClick(this.browser.page(), xpath); });

When(`user clicks elem {string}`, async function (elemId) { await PupUtil.elemClick(this.browser.page(), elemId); });

When(`user clicks elem {string} and waits for elem {string}`, async function (elemId, waitId) { await PupUtil.elemClick(this.browser.page(), elemId, waitId); });

When(`user types into elem {string} {string}`, async function (elemId, text) { await PupUtil.elemType(this.browser.page(), elemId, text); });

When(`user types into elem {string} {string} and waits for elem {string}`, async function (elemId, text, waitId) { await PupUtil.elemType(this.browser.page(), elemId, text, waitId); });

When(`wait {int}`, async function(ms) {
    await PupUtil.wait(ms);
})

When (`user closes tab`, async function() {
    const b = BrowserWrapper.get();
    b.closeTab();
})

Then(`elem {string} is visible`, async function (elemId) { await PupUtil.elemVisible(this.browser.page(), elemId); });

Then(`elem {string} is not visible`, async function (elemId) { await PupUtil.elemNotVisible(this.browser.page(), elemId); });

Then(`elem {string} text is {string}`, async function (elemId, text) {
    await PupUtil.assertElemTextEquals(this.browser.page(), elemId, text);
});

Then(`elem {string} text starts with {string}`, async function (elemId, text) { await PupUtil.assertElemTextStartsWith(this.browser.page(), elemId, text); });

Then(`elem {string} text ends with {string}`, async function (elemId, text) { await PupUtil.assertElemTextEndsWith(this.browser.page(), elemId, text); });

Then(`fail`, function () {
    assert.strictEqual(false, true);
})


Before(async function (scenario: ITestCaseHookParameter) {
    const w = this as CustomWorld;
    w.scenario = scenario;
});

After(async function (scenario) {
    const w = this as CustomWorld;
    /* enum Status {
        UNKNOWN = 0,
        PASSED = 1,
        SKIPPED = 2,
        PENDING = 3,
        UNDEFINED = 4,
        AMBIGUOUS = 5,
        FAILED = 6
    } */
    if (scenario.result?.status === "FAILED") {
        if (this.browser.page()) {
            let bodyHTML = await this.browser.page().evaluate(() => document.body.innerHTML);
            console.error(bodyHTML);
        }
    }
    if (scenario.result?.status === "PASSED" || process.env.TRAVIS === "true") {
        await w.browser.closeTab();
    }
});

AfterAll(async () => {
    const b = BrowserWrapper.get();
    if (b.tabs.length === 0) {
        b.closeBrowser();
    }
})