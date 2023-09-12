'use strict';

import {describe, expect, beforeAll, afterAll, test} from '@jest/globals';
import { Browser, Page, launch } from 'puppeteer';

let browser: Browser;
beforeAll(async () => {
    try {
        browser = await launch({ headless: "new"});
    } catch (e) {
        console.log(e);
    }
    return Promise.resolve();
});

afterAll(async() => {
    await browser.close();
    return Promise.resolve();
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe('Extension header', () => {
    let page: Page;
    beforeAll(async () => {
        page = await browser.newPage();
        await page.goto('http://localhost:6006/iframe.html?id=extension-headersection--default&viewMode=story');
    });

    afterAll(async () => {
        return page.close();
    });

    test ('should be accessible', async() => {
        await (expect(page) as any).toBeAccessible();
    })
});

