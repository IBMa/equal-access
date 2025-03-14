'use strict';

import {describe, expect, beforeAll, afterAll, test} from '@jest/globals';
import { Browser, Page, launch } from 'puppeteer';

let browser: Browser;
beforeAll(async () => {
    try {
        browser = await launch({ headless: "shell"});
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
describe('Altoro Mutual', () => {
    let page: Page;
    beforeAll(async () => {
        page = await browser.newPage();
        await page.goto('http://altoromutual.com/');
    });

    afterAll(async () => {
        return page.close();
    });

    test('should be titled "Altoro Mutual"', async () => {
        await expect(page.title()).resolves.toMatch('Altoro Mutual');
    });

    test ('should be accessible', async() => {
        await (expect(page) as any).toBeAccessible();
    })

    describe('"Personal" page', () => {
        beforeAll(async () => {
            await page.click("#LinkHeader2");
        });
        
        test ('should be accessible', async() => {
            await (expect(page) as any).toBeAccessible();
        })
    });

    // describe('"Small Business" page', () => {
    //     beforeAll(async () => {
    //         await page.click("#LinkHeader3");
    //     });
        
    //     it ('should be accessible', async() => {
    //         await expect(page).toBeAccessible();
    //     })
    // });
});

