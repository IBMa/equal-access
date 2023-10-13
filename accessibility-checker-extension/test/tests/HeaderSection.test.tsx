/**
 * @jest-environment jsdom
 */
'use strict';
import * as React from 'react';
import { HeaderSection } from '../../src/ts/devtools/components/headerSection';
import { setupTest } from '../support/testUtil';
    
// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("HeaderSection", () => {
    test("Is accessible", async () => {
        setupTest(<HeaderSection />)
        await (expect(document) as any).toBeAccessible();
    });

    describe("First button", () => {
        test("Label is 'Help'", async () => {
            let button = document.body.querySelector("button");
            let labelId = button?.getAttribute("aria-labelledby") || "";
            let label = document.getElementById(labelId);
            expect(label?.textContent).toEqual("Help");
        });

        test("Click opens quickGuideAC.html", async () => {
            let button = document.body.querySelector("button");
            // Expect click of the help button to open quickGuideAC.html
            window.chrome = { runtime: {
                    getURL: (url: string) => url
            } } as any

            (window as any).open = (url: string, target: string) => {
                expect(url).toEqual("quickGuideAC.html");
                expect(target).toEqual("_blank");
            };
            
            button!.click();
        });
    });

    test("Second button is settings", async () => {
        let button = document.body.querySelectorAll("button")[1];
        let labelId = button?.getAttribute("aria-labelledby") || "";
        let label = document.getElementById(labelId);
        expect(label?.textContent).toEqual("Settings");
    });
});
