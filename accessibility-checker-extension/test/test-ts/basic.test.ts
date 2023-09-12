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
describe('Accessibility of default stories', () => {
    let page: Page;
    beforeAll(async () => {
        page = await browser.newPage();
    });

    afterAll(async () => {
        return page.close();
    });

    test ('Report header', async() => {
        await page.goto('http://localhost:6006/iframe.html?id=extension-headersection--default&viewMode=story');
        await (expect(page) as any).toBeAccessible();
    })

    test ('Report with no scan', async() => {
        await page.goto('http://localhost:6006/iframe.html?args=&id=extension-reporttreegrid--no-scan&viewMode=story');
        await (expect(page) as any).toBeAccessible();
    })

    test ('Report with an empty scan', async() => {
        await page.goto('http://localhost:6006/iframe.html?args=&id=extension-reporttreegrid--empty-scan&viewMode=story');
        await (expect(page) as any).toBeAccessible();
    })

    test ('Report tree grid with content', async() => {
        await page.goto('http://localhost:6006/iframe.html?args=&id=extension-reporttreegrid--example-scan&viewMode=story');
        await (expect(page) as any).toBeAccessible();
    })
});
