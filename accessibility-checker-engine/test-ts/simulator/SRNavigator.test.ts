/**
 * @jest-environment jsdom
 */

/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 *****************************************************************************/

/*
 * Unit tests for lib/calculator.js
 */

import * as ace from "../../src/index";

describe('SRController', function() {
    it("Should exist", function() {
        expect(ace).toBeDefined();
        expect(ace.SRController).toBeDefined();
    });

    describe("Testing content", function() {

        beforeEach(function() {
            // Get computed style for pseudoelements does not work, so have to ignore those
            if (!(window as any).IBMaPatched) {
                (window as any).IBMaPatched = true;
                let temp = window.getComputedStyle;
                window.getComputedStyle = (el, p) => p ? {} as any : temp(el);
            }
            let fixture = `
<div id='fixture'>
    <main>
        <h1>This is a sample heading</h1>
        <p>This is a sample paragraph</p>
        <h2>This is a sub heading</h2>
        <p>And yet another paragraph with a <a href="#">Link 1</a> in it and a <a href="#">Link 2</a></p>
    </main>
</div>`;
            document.body.innerHTML = fixture;
        });

        it("Mode 'link'", function() {
            // let startWalker = new ace.SRWalker(document.documentElement);
            // let results = ace.SRController.renderNext(startWalker, "link");
            let results = ace.SRController.renderAll("link");
            // expect(results).toEqual([[{ nameInfo: "Link 1", role: "link", tag: "start"}], [{nameInfo: "Link 2", role: "link", tag: "start"}]]);
            expect(results).toEqual([
                "[main landmark] [same page link] Link 1",
                "[same page link] Link 2"
            ]); 
        });

        it("Mode 'heading'", function() {
            // let startWalker = new ace.SRWalker(document.documentElement);
            // let results = ace.SRController.renderNext(startWalker, "link");
            let results = ace.SRController.renderAll("heading");
            // expect(results).toEqual([[{ nameInfo: "Link 1", role: "link", tag: "start"}], [{nameInfo: "Link 2", role: "link", tag: "start"}]]);
            expect(results).toEqual([
                "[main landmark] [heading level 1] This is a sample heading",
                "[heading level 2] This is a sub heading",
            ]); 
        });

        // it("Mode 'item'", function() {
        //     // let startWalker = new ace.SRWalker(document.documentElement);
        //     // let results = ace.SRController.renderNext(startWalker, "heading");
        //     // expect(results).toEqual([{ value: "This is a sample heading", role: "heading"}]);
        //     let results = ace.SRController.renderAll("item");
        //     console.log(JSON.stringify(results, null, 2));
        //     expect(results).toEqual([]);
        // });
    });
    describe("XXX", () => {
        beforeEach(() => {
            // Get computed style for pseudoelements does not work, so have to ignore those
            if (!(window as any).IBMaPatched) {
                (window as any).IBMaPatched = true;
                let temp = window.getComputedStyle;
                window.getComputedStyle = (el, p) => p ? {} as any : temp(el);
            }
            let fixture = `
            <div id="fixture"><div id="root"><header aria-label="IBM Accessibility" class="bx--header" data-landmark-index="0"><a class="bx--header__name" href="#"><span class="bx--header__name--prefix">IBM</span>&nbsp;Accessibility</a><div style="color: white;">DEMO. This is not a real bank.</div></header><div class="page-wrapper bx--grid"><div><div class="none" style="font-size: 14px; background-color: rgba(196, 196, 196, 0);"><svg viewBox="0 0 600 400" width="0" height="0" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><filter id="protanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.567, 0.433, 0,     0, 0 0.558, 0.442, 0,     0, 0 0,     0.242, 0.758, 0, 0 0,     0,     0,     1, 0"></feColorMatrix></filter><filter id="deuteranopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.625, 0.375, 0,   0, 0 0.7,   0.3,   0,   0, 0 0,     0.3,   0.7, 0, 0 0,     0,     0,   1, 0"></feColorMatrix></filter><filter id="tritanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.95, 0.05,  0,     0, 0 0,    0.433, 0.567, 0, 0 0,    0.475, 0.525, 0, 0 0,    0,     0,     1, 0"></feColorMatrix></filter></defs></svg><div id="altoro-page" class="contrast-filter"><span class="security--transition"></span><header aria-label="Altoro" class="bx--header altoro-header-bar-fixed" data-landmark-index="1"><a class="bx--header__name altoro-header-title" href="/"><div style="font-size: 32px;">Altoro</div></a><nav class="bx--header__nav" style="background-color: rgba(196, 196, 196, 0);"><ul class="bx--header__menu-bar"><li class="bx--header__submenu grayTest" style="background-color: rgba(196, 196, 196, 0);"><a aria-haspopup="menu" aria-expanded="false" class="bx--header__menu-item bx--header__menu-title" href="#" tabindex="0" aria-label="Investment Game" style="font-size: 14px;">Investment Game<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="bx--header__menu-arrow"><path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path></svg></a><ul aria-label="Investment Game" class="bx--header__menu"><li class="altoro-header-item"><a href="InvestmentGame" id="trap-target-1" class="bx--header__menu-item" tabindex="0" style="background-color: rgba(196, 196, 196, 0); font-size: 14px;"><span class="bx--text-truncate--end"><div style="background-color: rgba(196, 196, 196, 0);">Good</div></span></a></li><li class="altoro-header-item"><a href="InvestmentGameBad" id="trap-target-2" class="bx--header__menu-item" tabindex="0" style="font-size: 14px;"><span class="bx--text-truncate--end">Bad</span></a></li></ul></li><li class="bx--header__submenu grayTest" style="background-color: rgba(196, 196, 196, 0);"><a aria-haspopup="menu" aria-expanded="false" class="bx--header__menu-item bx--header__menu-title" href="#" tabindex="0" aria-label="Small business" style="font-size: 14px;">Small Business<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="bx--header__menu-arrow"><path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path></svg></a><ul aria-label="Small business" class="bx--header__menu"><li class="altoro-header-item"><a href="#" class="bx--header__menu-item" tabindex="0" style="font-size: 14px;"><span class="bx--text-truncate--end">Example 1</span></a></li><li class="altoro-header-item"><a href="#" class="bx--header__menu-item" tabindex="0" style="font-size: 14px;"><span class="bx--text-truncate--end">Example 2</span></a></li></ul></li><li class="bx--header__submenu grayTest" style="font-size: 14px; background-color: rgba(196, 196, 196, 0);"><a aria-haspopup="menu" aria-expanded="false" class="bx--header__menu-item bx--header__menu-title" href="#" tabindex="0" aria-label="About" style="font-size: 14px;">About<svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="bx--header__menu-arrow"><path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path></svg></a><ul aria-label="About" class="bx--header__menu"><li class="altoro-header-item"><a href="#" class="bx--header__menu-item" tabindex="0" style="font-size: 14px;"><span class="bx--text-truncate--end">Example 1</span></a></li><li class="altoro-header-item"><a href="#" class="bx--header__menu-item" tabindex="0" style="font-size: 14px;"><span class="bx--text-truncate--end">Example 2</span></a></li></ul></li><li class="altoro-header-item"><a href="#" class="bx--header__menu-item" tabindex="0" style="background-color: rgba(196, 196, 196, 0); font-size: 14px;"><span class="bx--text-truncate--end">Contact Us</span></a></li></ul></nav><button tabindex="0" class="altoro-button-secondary bx--btn bx--btn--primary" type="button" style="font-size: 14px;">Log in</button><button tabindex="0" class="altoro-button-primary bx--btn bx--btn--primary" type="button" style="font-size: 14px;">Sign up</button><div class="search-container" style="margin-left: 16px;"><form class="form-control" action="/action_page.php" role="search" data-landmark-index="2"><input type="text" placeholder="Search.." name="search" style="border: 0px;"></form></div></header><div class="altoro-main-section bx--grid"><main data-landmark-index="3"><div class="bx--row"><a tabindex="0" class="altoro-button bx--btn bx--btn--primary" href="/InvestmentGameBad" style="font-size: 14px; left: -300px;">Bad Button</a></div><div class="bx--row"><div class="bx--col"><div style="padding: 70px 0px;"><h1 class="altoro-main-title " style="font-size: 48px;">Banking Made Simple.</h1><p class="altoro-main-paragraph ">We are determined to help you stay ahead of your expectations. That is our commitment to you.</p><button tabindex="0" class="altoro-button Bad_RPT_Style_HinderFocus1 bx--btn bx--btn--primary" type="button" style="font-size: 14px; border: thick solid black;">Click here</button></div></div><div class="bx--col"><img class="altoro-image" src="/static/media/altorocard.3c2d600a.png"></div></div><div class="altoro-section"><div class="bx--row"><img src="/static/media/altorotxt.c8fbb292.png" class="altoro-secondary-title-img " alt="Explore our services"><h2 class="altoro-secondary-title " style="font-size: 32px;">Explore our services</h2></div><div class="altoro-sub-row bx--row"><div class="altoro-sub-col bx--col"><img class="altoro-icon-image" src="data:image/png;base64,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" alt="banking icon"><h3 class="altoro-sub-title" style="font-size: 18px;">Personal Banking</h3><div class="altoro-paragraph">Our solutions are designed to make banking as efficient and cost effective as possible for all your personal banking needs.</div></div><div class="altoro-sub-col bx--col"><img class="altoro-icon-image" src="data:image/png;base64,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" alt="credit card icon"><h3 class="altoro-sub-title" style="font-size: 18px;">Business Credit Cards</h3><div class="altoro-paragraph">You're always looking for ways to improve your company's bottom line. You can do it all with a business credit card account from Altoro Mutual.</div></div><div class="altoro-sub-col bx--col"><img class="altoro-icon-image" src="data:image/png;base64,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" alt="loans icon"><h3 class="altoro-sub-title" style="font-size: 18px;">Loans</h3><div class="altoro-paragraph">Find the right solution for your borrowing needs - whether you're purchasing a home, remodeling, or simply financing your dreams.</div></div></div><div class="altoro-sub-row bx--row"><div class="altoro-sub-col bx--col"><a href="#">Learn more</a></div><div class="altoro-sub-col bx--col"><a href="#">Learn more</a></div><div class="altoro-sub-col bx--col"><a href="#">Learn more</a></div></div></div><div class="altoro-section"><div class="bx--row"><div class="bx--col"><img class="altoro-money-image" src="/static/media/altoromoney.52861ea2.png"></div><div class="bx--col"><h3 class="altoro-section-title " style="font-size: 32px;">Play the investment game</h3><p>Explore your path to retirement and understand investment strategies with this simple portfolio game.</p><a tabindex="-1" class="altoro-button bx--btn bx--btn--primary" href="/InvestmentGameBad" style="font-size: 14px;">Try it now</a><a tabindex="0" class="altoro-button bx--btn bx--btn--primary" href="/InvestmentGameBad" style="font-size: 14px; margin-left: 16px;"><div tabindex="0">Or try it now for a friend</div></a></div></div></div><div class="altoro-section"><div class="altoro-sub-row bx--row"><div class="altoro-sub-col bx--col"><img class="altoro-retirement-image" src="/static/media/altoroimg1.19a288b3.png"><h3 class="altoro-section-title " style="font-size: 18px;"> Retirement Solutions</h3><div class="altoro-paragraph">Retaining good employees is a tough task. See how Altoro can assist you in accomplishing this feat through effective Retirement Solutions.</div></div><div class="altoro-sub-col bx--col"><img class="altoro-retirement-image" src="/static/media/altoroimg2.1162d050.png"><h3 class="altoro-section-title " style="font-size: 18px;">Real Estate Financing</h3><div class="altoro-paragraph">Fast. Simple. Professional. Whether you are preparing to buy, build, purchase land, or construct new space, let Altoro Mutuals premier real estate lenders help with financing.</div></div></div></div><div class="altoro-section"><div class="bx--row"><div class="bx--col-sm-4 bx--col-md-6 bx--col-lg-6" style="margin: auto;"><h2 class="altoro-form-title " text-align="center" style="font-size: 32px;">Be the first to know.</h2><div class="altoro-paragraph" text-align="center">Subscribe to the Altoro newsletter at the bottom of the page to receive important updates and exclusive offers.</div><fieldset class="bx--fieldset"><legend class="bx--label">Required fields in blue</legend><div class="bx--row"><div class="bx--col"><div class="bx--form-item bx--text-input-wrapper"><label for="subscribe-first-name" class="bx--label bx--visually-hidden">First name </label><div class="bx--text-input__field-outer-wrapper"><div class="bx--text-input__field-wrapper"><input id="subscribe-first-name" placeholder="First name " type="text" class="bx--text-input altoro-input altoro-input-required" title="First name " aria-describedby="" style="font-size: 14px;"></div></div></div><div class="bx--form-item bx--text-input-wrapper"><label for="subscribe-occupation" class="bx--label bx--visually-hidden">Occupation</label><div class="bx--text-input__field-outer-wrapper"><div class="bx--text-input__field-wrapper"><input id="subscribe-occupation" placeholder="Occupation" type="text" class="bx--text-input altoro-input" title="Occupation" aria-describedby="" style="font-size: 14px;"></div></div></div></div><div class="bx--col"><div class="bx--form-item bx--text-input-wrapper"><label for="subscribe-last-name" class="bx--label bx--visually-hidden">Last name</label><div class="bx--text-input__field-outer-wrapper"><div class="bx--text-input__field-wrapper"><input id="subscribe-last-name" placeholder="Last name" type="text" class="bx--text-input altoro-input" title="Last name" aria-describedby="" style="font-size: 14px;"></div></div></div><div class="bx--form-item bx--text-input-wrapper"><label for="subscribe-phone" class="bx--label bx--visually-hidden">Phone </label><div class="bx--text-input__field-outer-wrapper"><div class="bx--text-input__field-wrapper"><input id="subscribe-phone" placeholder="Phone " type="tel" class="bx--text-input altoro-input altoro-input-required" title="Phone " aria-describedby="" style="font-size: 14px;"></div></div></div></div></div><div class="bx--row"><div class="bx--col"><div class="bx--form-item bx--text-input-wrapper"><label for="subscribe-email" class="bx--label bx--visually-hidden">Email </label><div class="bx--text-input__field-outer-wrapper"><div class="bx--text-input__field-wrapper"><input id="subscribe-email" placeholder="Email " type="email" class="bx--text-input altoro-input altoro-input-required" title="Email " aria-describedby="" style="font-size: 14px;"></div></div></div></div></div><div class="bx--row"><div class="bx--col"><button tabindex="0" class="altoro-button center bx--btn bx--btn--primary" type="button" style="font-size: 14px;">Subscribe</button></div></div></fieldset></div></div><div class="bx--row"><div style="margin-right: 16px; font-size: 20px;">Some of Altoro's Best Features:</div></div><div class="bx--row" style="margin-top: 16px;"><ul class="altoro-paragraph" role="tree" tabindex="0" style="line-height: 1.5;"><li tabindex="0" role="treeitem">- Quick check deposits</li><li>- Free wire transfers</li><li>- Human monitored phone service</li></ul></div><div class="bx--row" style="margin-top: 48px;"><div class="altoro-paragraph" text-align="center" role="toolbar" tabindex="a" aria-activedescendant="button1" style="width: 100%; display: flex; justify-content: center; font-size: 20px;">Want to keep up with us? Make sure to click the button below to tell us what you think</div></div><div class="bx--row" style="margin-top: 16px;"><div tabindex="0" style="width: 100%; display: flex; justify-content: center;"><a id="feedbackButton" tabindex="0" class="altoro-button center bx--btn bx--btn--primary" href="/InvestmentGameBad" style="font-size: 14px;">Got some feedback for us?</a></div></div></div></main><div class="altoro-section altoro-privacy" role="contentinfo" data-landmark-index="4"><div class="bx--row"><div class="bx--col" style="padding-left: 0px;"><div style="display: flex; margin-top: 16px;"><h2 class="altoro-privacy-title" style="font-size: 18px;">Privacy and Security </h2><img class="altoro-privacy-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAA7CAMAAAAdOWm/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABpUExURQAAAEBQ3zhQ5zhY3zhY5zVV5DhU4zxU4zlT4j1T4jtW5zhV5DdV5jlU5DpW5TpU4zlT4zpW5zpS5DpV5ThT4jhV5TlV4zlV5TdV5jhU5jlU5jlU5DhV4zhT5DlT5DpU5DlU5DlU5DpV5JnZzjwAAAAidFJOUwAQICAgMEBAUFBfYG9wf4CQnp+foK6vr76/v87e39/u7/4pwR1fAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABf0lEQVRIS+2WXXuCMAxGy4ZsUwZucx+gMuT//8i1JtgkLaW52J3nhmJz5DF5n6K54yjq87DFtYqiGSfLSS2j6NDJRHTky0J05MkR0XHaFliwBBfHMy4cQ/OARTHKA5Yhg9l1uHQsy4UQnWpMReXpDUolj7jtcaqVyVderp8EhOr4BDv+h2Sr9rk4lVlWqH6kIKtULitVKqtVIsNFklKdnAhTqA67zCRGVGOes5IYVUUSs9sEQaRJzO9w/wJbtyRqhsPDpIwEk7WRILJWJfI7XCUJ1ctxQpUda6kkhqo91vKSGFNFmIYGSiVxlcvZHZ6PNZ9ExXB6HqbpF24DYFfAk3iEmwDaTQKVv2AZsMfaAC8vBaPCygjpMNn3VfTNiqzILZbN8GMteSbKx9pIMPkH62K8Yg0ijrXL5lq0AA3sHMSb3MLtAgWfbY9J3Lg8fMJ6kVLkwifxuPYXJnBXR0qRI9LIJW+WJd0gRnUgEx7bRBRiVPVH13Xf+zo5zDv/hzF/EUqgrFyZHHkAAAAASUVORK5CYII=" alt="Altoro Security Logo"></div><div class="altoro-privacy-text" style="font-size: 14px; line-height: 14px;">The 2000 employees of Altoro Mutual are dedicated to protecting your privacy and security. We pledge to provide you with the information and resources that you need to help secure your information and keep it confidential. This is our promise.</div></div></div></div></div></div></div></div></div></div></div>
`;
           document.body.innerHTML = fixture;
        })

        it("Sim Test", function() {
            // let startWalker = new ace.SRWalker(document.documentElement);
            // let results = ace.SRController.renderNext(startWalker, "heading");
            // expect(results).toEqual([{ value: "This is a sample heading", role: "heading"}]);
            // let results = ace.SRController.renderAll("item");
            // results = results.map(result => (result.map(({nameInfo, role, tag}) => ({nameInfo: nameInfo.name, role, tag}))));
            let results = ace.SRController.renderAll("item");
            expect(results.filter(s=>s.trim().length > 0).map(s=>s.trim())).toEqual([
                "ibm accessibility [banner landmark] [same page link] IBM Accessibility",
                "DEMO. This is not a real bank.",
                "[Unlabeled graphic]",
                "altoro [banner landmark] [link] Altoro",
                "[navigation landmark] [list with 4 items] [bullet] [collapsed] [subMenu] [same page link] investment game",
                "investment game [list with 2 items]", 
                "[bullet] [link] Good",
                "[bullet] [link] Bad",
                "[out of list] [bullet] [collapsed] [subMenu] [same page link] small business",
                "small business [list with 2 items] [bullet] [same page link] Example 1",
                "[bullet] [same page link] Example 2",
                "[out of list] [bullet] [collapsed] [subMenu] [same page link] about",
                "about [list with 2 items] [bullet] [same page link] Example 1",
                "[bullet] [same page link] Example 2",
                "[out of list] [bullet] [same page link] Contact Us",
                "[out of list] [button] Log in [button] Sign up",
                "[search landmark] [edit] Search..",
                "[main landmark] [link] Bad Button",
                "[heading level 1] Banking Made Simple.",
                "We are determined to help you stay ahead of your expectations. That is our commitment to you.",
                "[button] Click here",
                "[Unlabeled graphic]",
                "[graphic] Explore our services",
                "[heading level 2] Explore our services",
                "[graphic] banking icon",
                "[heading level 3] Personal Banking",
                "Our solutions are designed to make banking as efficient and cost effective as possible for all your personal banking needs.",
                "[graphic] credit card icon",
                "[heading level 3] Business Credit Cards",
                "You're always looking for ways to improve your company's bottom line. You can do it all with a business credit card account from Altoro Mutual.",
                "[graphic] loans icon",
                "[heading level 3] Loans",
                "Find the right solution for your borrowing needs - whether you're purchasing a home, remodeling, or simply financing your dreams.",
                "[same page link] Learn more",
                "[same page link] Learn more",
                "[same page link] Learn more",
                "[heading level 3] Play the investment game",
                "Explore your path to retirement and understand investment strategies with this simple portfolio game.",
                "[link] Try it now",
                "[link] Or try it now for a friend",
                "[heading level 3] Retirement Solutions",
                "Retaining good employees is a tough task. See how Altoro can assist you in accomplishing this feat through effective Retirement Solutions.",
                "[heading level 3] Real Estate Financing",
                "Fast. Simple. Professional. Whether you are preparing to buy, build, purchase land, or construct new space, let Altoro Mutuals premier real estate lenders help with financing.",
                "[heading level 2] Be the first to know.",
                "Subscribe to the Altoro newsletter at the bottom of the page to receive important updates and exclusive offers.",
                "[grouping] Required fields in blue",
                "First name",
                "[edit] First name",
                "Occupation",
                "[edit] Occupation",
                "Last name",
                "[edit] Last name",
                "Phone",
                "[edit] Phone",
                "Email",
                "[edit] Email",
                "[button] Subscribe",
                // "blank",
                "[out of grouping] Some of Altoro's Best Features:",
                "[tree view] [level 1]  [bullet] - Quick check deposits",
                "[tool bar] Want to keep up with us? Make sure to click the button below to tell us what you think",
                "[out of tool bar] [link] Got some feedback for us?",
                "[content info landmark] [heading level 2] Privacy and Security",
                "[graphic] Altoro Security Logo",
                "The 2000 employees of Altoro Mutual are dedicated to protecting your privacy and security. We pledge to provide you with the information and resources that you need to help secure your information and keep it confidential. This is our promise."
            ])
            console.log(JSON.stringify(results, null, 2));
            // expect(results).toEqual([]);
        });
    })
});