'use strict';

import {describe, expect, beforeAll, afterAll, test} from '@jest/globals';
import { Browser, Page, launch } from 'puppeteer';
import { getSimulation } from "accessibility-checker";

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
        await page.goto('https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/');
    });

    afterAll(async () => {
        return page.close();
    });

    test('should be titled "Altoro Accessibility Testing Site"', async () => {
        await expect(page.title()).resolves.toMatch('Altoro Accessibility Testing Site');
    });

    test ('should be accessible', async() => {
        await (expect(page) as any).toBeAccessible();
    })

    test ('SR simulation has not regressed', async() => {
        const simulation = await getSimulation(page, 'test_name');
        expect(simulation).toEqual([
            { "region": "", "heading": "", "item": "[Start of document: Altoro Accessibility Testing Site]", "tab_focus": "", "image": "", "selector": "body" },
            { "region": "[\"ibm accessibility\", banner region] ", "heading": "", "item": "[\"ibm accessibility\", banner region] ", "tab_focus": "", "image": "", "selector": "#root > header.bx--header[aria-label=\"IBM\\ Accessibility\"]" },
            { "region": "", "heading": "", "item": "[same page link] IBM Accessibility", "tab_focus": "[same page link] IBM Accessibility", "image": "", "selector": "#root > header > a.bx--header__name" },
            { "region": "", "heading": "", "item": "DEMO. This is not a real bank.", "tab_focus": "", "image": "", "selector": "#root > header > div" },
            { "region": "", "heading": "", "item": "[out of banner region] ", "tab_focus": "", "image": "", "selector": "#root > div.page-wrapper.bx--grid" },
            { "region": "", "heading": "", "item": "[Unlabeled graphic]", "tab_focus": "", "image": "", "selector": "#root > div > div > div.none" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[Unlabeled graphic]", "selector": "#root > div > div > div > svg" },
            { "region": "[\"altoro\", banner region] ", "heading": "", "item": "[\"altoro\", banner region] ", "tab_focus": "", "image": "", "selector": "#altoro-page > header.bx--header.altoro-header-bar-fixed[aria-label=\"Altoro\"]" },
            { "region": "", "heading": "", "item": "[link] Altoro", "tab_focus": "[link] Altoro", "image": "", "selector": "#altoro-page > header > a.bx--header__name.altoro-header-title" },
            { "region": "", "heading": "", "item": "[\"Log in\", button]", "tab_focus": "[\"Log in\", button]", "image": "", "selector": "#altoro-page > header > button.altoro-button-secondary.bx--btn.bx--btn--primary:nth-of-type(1)" },
            { "region": "", "heading": "", "item": "[\"Sign up\", button]", "tab_focus": "[\"Sign up\", button]", "image": "", "selector": "#altoro-page > header > button.altoro-button-primary.bx--btn.bx--btn--primary:nth-of-type(2)" },
            { "region": "[search region] ", "heading": "", "item": "[search region] [\"Search..\", edit, placeholder: Search..]", "tab_focus": "", "image": "", "selector": "#altoro-page > header > div > form.form-control[role=\"search\"]" },
            { "region": "", "heading": "", "item": "", "tab_focus": "[\"Search..\", edit, placeholder: Search..]", "image": "", "selector": "#altoro-page > header > div > form > input[type=\"text\"]" },
            { "region": "", "heading": "", "item": "[out of search region] [out of banner region] ", "tab_focus": "", "image": "", "selector": "#altoro-page > div.altoro-main-section.bx--grid" },
            { "region": "[main region] ", "heading": "", "item": "[main region] ", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main" },
            { "region": "", "heading": "", "item": "[link] Bad Button", "tab_focus": "[link] Bad Button", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(1) > a.altoro-button.bx--btn.bx--btn--primary" },
            { "region": "", "heading": "[\"Banking Made Simple.\", heading level 1]", "item": "[heading level 1] Banking Made Simple.", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(2) > div:nth-of-type(1) > div > h1.altoro-main-title" },
            { "region": "", "heading": "", "item": "We are determined to help you stay ahead of your expectations. That is our commitment to you.", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(2) > div:nth-of-type(1) > div > p.altoro-main-paragraph" },
            { "region": "", "heading": "", "item": "[\"Click here\", button] [Unlabeled graphic]", "tab_focus": "[\"Click here\", button]", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(2) > div:nth-of-type(1) > div > button.altoro-button.Bad_RPT_Style_HinderFocus1.bx--btn" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[Unlabeled graphic]", "selector": "#altoro-page > div > main > div:nth-of-type(2) > div:nth-of-type(2) > img.altoro-image" },
            { "region": "", "heading": "", "item": "[graphic, \"Explore our services\"] [heading level 2]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div.bx--row:nth-of-type(1)" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[graphic, \"Explore our services\"]", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(1) > img.altoro-secondary-title-img" },
            { "region": "", "heading": "", "item": "[graphic, \"banking icon\"]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div.altoro-sub-row.bx--row:nth-of-type(2)" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[graphic, \"banking icon\"]", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > img.altoro-icon-image" },
            { "region": "", "heading": "[\"Personal Banking\", heading level 3]", "item": "[heading level 3] Personal Banking", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > h3.altoro-sub-title" },
            { "region": "", "heading": "", "item": "Our solutions are designed to make banking as efficient and cost effective as possible for all your personal banking needs. [graphic, \"credit card icon\"]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > div.altoro-paragraph" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[graphic, \"credit card icon\"]", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(2) > img.altoro-icon-image" },
            { "region": "", "heading": "[\"Business Credit Cards\", heading level 3]", "item": "[heading level 3] Business Credit Cards", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(2) > h3.altoro-sub-title" },
            { "region": "", "heading": "", "item": "You're always looking for ways to improve your company's bottom line. You can do it all with a business credit card account from Altoro Mutual. [graphic, \"loans icon\"]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(2) > div.altoro-paragraph" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[graphic, \"loans icon\"]", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(3) > img.altoro-icon-image" },
            { "region": "", "heading": "[\"Loans\", heading level 3]", "item": "[heading level 3] Loans", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(3) > h3.altoro-sub-title" },
            { "region": "", "heading": "", "item": "Find the right solution for your borrowing needs - whether you're purchasing a home, remodeling, or simply financing your dreams.", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(3) > div.altoro-paragraph" },
            { "region": "", "heading": "", "item": "[same page link] Learn more", "tab_focus": "[same page link] Learn more", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(1) > a" },
            { "region": "", "heading": "", "item": "[same page link] Learn more", "tab_focus": "[same page link] Learn more", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(2) > a" },
            { "region": "", "heading": "", "item": "[same page link] Learn more", "tab_focus": "[same page link] Learn more", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > a" },
            { "region": "", "heading": "", "item": "[Unlabeled graphic]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(4) > div.bx--row" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[Unlabeled graphic]", "selector": "#altoro-page > div > main > div:nth-of-type(4) > div > div:nth-of-type(1) > img.altoro-money-image" },
            { "region": "", "heading": "[\"Play the investment game\", heading level 3]", "item": "[heading level 3] Play the investment game", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(4) > div > div:nth-of-type(2) > h3.altoro-section-title" },
            { "region": "", "heading": "", "item": "Explore your path to retirement and understand investment strategies with this simple portfolio game.", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(4) > div > div:nth-of-type(2) > p" },
            { "region": "", "heading": "", "item": "[link] Try it now", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(4) > div > div:nth-of-type(2) > a.altoro-button.bx--btn.bx--btn--primary:nth-of-type(1)" },
            { "region": "", "heading": "", "item": "Or try it now for a friend", "tab_focus": "Or try it now for a friend", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(4) > div > div:nth-of-type(2) > a:nth-of-type(2) > div" },
            { "region": "", "heading": "", "item": "[Unlabeled graphic]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(5) > div.altoro-sub-row.bx--row" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[Unlabeled graphic]", "selector": "#altoro-page > div > main > div:nth-of-type(5) > div > div:nth-of-type(1) > img.altoro-retirement-image" },
            { "region": "", "heading": "[\"Retirement Solutions\", heading level 3]", "item": "[heading level 3] Retirement Solutions", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(5) > div > div:nth-of-type(1) > h3.altoro-section-title" },
            { "region": "", "heading": "", "item": "Retaining good employees is a tough task. See how Altoro can assist you in accomplishing this feat through effective Retirement Solutions. [Unlabeled graphic]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(5) > div > div:nth-of-type(1) > div.altoro-paragraph" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[Unlabeled graphic]", "selector": "#altoro-page > div > main > div:nth-of-type(5) > div > div:nth-of-type(2) > img.altoro-retirement-image" },
            { "region": "", "heading": "[\"Real Estate Financing\", heading level 3]", "item": "[heading level 3] Real Estate Financing", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(5) > div > div:nth-of-type(2) > h3.altoro-section-title" },
            { "region": "", "heading": "", "item": "Fast. Simple. Professional. Whether you are preparing to buy, build, purchase land, or construct new space, let Altoro Mutuals premier real estate lenders help with financing.", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(5) > div > div:nth-of-type(2) > div.altoro-paragraph" },
            { "region": "", "heading": "[\"Be the first to know.\", heading level 2]", "item": "[heading level 2] Be the first to know.", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > h2.altoro-form-title" },
            { "region": "", "heading": "", "item": "Subscribe to the Altoro newsletter at the bottom of the page to receive important updates and exclusive offers.", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > div.altoro-paragraph" },
            { "region": "", "heading": "", "item": "[grouping, \"Required fields in blue\"] ", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > fieldset.bx--fieldset" },
            { "region": "", "heading": "", "item": "Required fields in blue", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > fieldset > legend.bx--label" },
            { "region": "", "heading": "", "item": "[\"First name\", edit, placeholder: First name ]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > fieldset > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div > div.bx--text-input__field-wrapper" },
            { "region": "", "heading": "", "item": "", "tab_focus": "[\"First name\", edit, placeholder: First name ]", "image": "", "selector": "#subscribe-first-name" },
            { "region": "", "heading": "", "item": "[\"Occupation\", edit, placeholder: Occupation]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > fieldset > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > div.bx--text-input__field-wrapper" },
            { "region": "", "heading": "", "item": "", "tab_focus": "[\"Occupation\", edit, placeholder: Occupation]", "image": "", "selector": "#subscribe-occupation" },
            { "region": "", "heading": "", "item": "[\"Last name\", edit, placeholder: Last name]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > fieldset > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div > div.bx--text-input__field-wrapper" },
            { "region": "", "heading": "", "item": "", "tab_focus": "[\"Last name\", edit, placeholder: Last name]", "image": "", "selector": "#subscribe-last-name" },
            { "region": "", "heading": "", "item": "[\"Phone\", edit, placeholder: Phone ]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > fieldset > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div > div.bx--text-input__field-wrapper" },
            { "region": "", "heading": "", "item": "", "tab_focus": "[\"Phone\", edit, placeholder: Phone ]", "image": "", "selector": "#subscribe-phone" },
            { "region": "", "heading": "", "item": "[\"Email\", edit, placeholder: Email ]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > fieldset > div:nth-of-type(2) > div > div > div > div.bx--text-input__field-wrapper" },
            { "region": "", "heading": "", "item": "", "tab_focus": "[\"Email\", edit, placeholder: Email ]", "image": "", "selector": "#subscribe-email" },
            { "region": "", "heading": "", "item": "[\"Subscribe\", button]", "tab_focus": "[\"Subscribe\", button]", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(1) > div > fieldset > div:nth-of-type(3) > div > button.altoro-button.center.bx--btn" },
            { "region": "", "heading": "", "item": "[out of grouping] Some of Altoro's Best Features:", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div.bx--row:nth-of-type(2)" },
            { "region": "", "heading": "", "item": "- Quick check deposits - Quick check deposits", "tab_focus": "- Quick check deposits", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(3) > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
            { "region": "", "heading": "", "item": "- Free wire transfers", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(3) > ul > li:nth-of-type(2)" },
            { "region": "", "heading": "", "item": "- Human monitored phone service", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(3) > ul > li:nth-of-type(3)" },
            { "region": "", "heading": "", "item": "[toolbar] Want to keep up with us? Make sure to click the button below to tell us what you think", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div:nth-of-type(4) > div.altoro-paragraph[role=\"toolbar\"]" },
            { "region": "", "heading": "", "item": "[out of toolbar] ", "tab_focus": "", "image": "", "selector": "#altoro-page > div > main > div:nth-of-type(6) > div.bx--row:nth-of-type(5)" },
            { "region": "", "heading": "", "item": "[link] Got some feedback for us?", "tab_focus": "[link] Got some feedback for us?", "image": "", "selector": "#feedbackButton" },
            { "region": "", "heading": "", "item": "[out of main region] ", "tab_focus": "", "image": "", "selector": "#altoro-page > div > div.altoro-section.altoro-privacy[role=\"contentinfo\"]" },
            { "region": "", "heading": "", "item": "[heading level 2] Privacy and Security [graphic, \"Altoro Security Logo\"]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > div > div > div > div:nth-of-type(1)" },
            { "region": "", "heading": "[\"Privacy and Security\", heading level 2]", "item": "", "tab_focus": "", "image": "", "selector": "#altoro-page > div > div > div > div > div:nth-of-type(1) > h2.altoro-privacy-title" },
            { "region": "", "heading": "", "item": "", "tab_focus": "", "image": "[graphic, \"Altoro Security Logo\"]", "selector": "#altoro-page > div > div > div > div > div:nth-of-type(1) > img.altoro-privacy-img" },
            { "region": "", "heading": "", "item": "The 2000 employees of Altoro Mutual are dedicated to protecting your privacy and security. We pledge to provide you with the information and resources that you need to help secure your information and keep it confidential. This is our promise. [End of document: Altoro Accessibility Testing Site]", "tab_focus": "", "image": "", "selector": "#altoro-page > div > div > div > div > div.altoro-privacy-text:nth-of-type(2)" }]);
    })

    describe('"Personal" page', () => {
        beforeAll(async () => {
            await page.click(".altoro-section a");
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

