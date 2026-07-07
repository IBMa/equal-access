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
 * Comprehensive unit tests for Link component screen reader rendering
 * Tests link announcements, tabindex behavior, and nested block elements
 */

let ace = require('../../../src/index');

// Helper function to trim item fields in results
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim()
    }));
}

describe('Link Component Screen Reader Tests', function() {

    afterEach(function() {
        // Disconnect the SRController to stop mutation observers
        if (ace.SRController.getController) {
            let controller = ace.SRController.getController();
            if (controller && controller.disconnect) {
                controller.disconnect();
            }
        }
        
        // Clean up any fixtures
        let fixture = document.getElementById('fixture');
        if (fixture) {
            document.body.removeChild(fixture);
        }
    });

    describe("Basic Links", function() {
        
        it("Should render simple link with default tabindex", function() {
            let fixture = "<div id='fixture'>"
                + "<a href='/home'>Home</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] Home", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home [link]", "image": "", "selector": "#fixture > a" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render multiple links", function() {
            let fixture = "<div id='fixture'>"
                + "<a href='/home'>Home</a>"
                + "<a href='/about'>About</a>"
                + "<a href='/contact'>Contact</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] Home", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home [link]", "image": "", "selector": "#fixture > a:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[link] About", "tab_focus": "About [link]", "image": "", "selector": "#fixture > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[link] Contact", "tab_focus": "Contact [link]", "image": "", "selector": "#fixture > a:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Links with Tabindex", function() {
        
        it("Should render link with tabindex='0'", function() {
            let fixture = "<div id='fixture'>"
                + "<a tabindex='0' href='/home'>Home</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] Home", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home [link]", "image": "", "selector": "#fixture > a" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render link with tabindex='-1' (not in tab order)", function() {
            let fixture = "<div id='fixture'>"
                + "<a tabindex='-1' href='/InvestmentGameBad'>Try it now</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] Try it now", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render link with positive tabindex", function() {
            let fixture = `<div id='fixture'>
                <a tabindex='1' href='/home'>Home</a>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] Home", "tab_focus": "Home [link]", "image": "", "selector": "#fixture > a" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Links with Block Elements Inside", function() {
        
        it("Should render link with div inside (both with tabindex='0')", function() {
            let fixture = `<div id='fixture'>
                <a tabindex='0' href='/InvestmentGameBad'><div tabindex='0'>Or try it now for a friend</div></a>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Or try it now for a friend [link]", "image": "", "selector": "#fixture > a" },
                { "region": "", "heading": "", "item": "[link] Or try it now for a friend", "tab_focus": "Or try it now for a friend [link]", "image": "", "selector": "#fixture > a > div" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render link with div inside (link has tabindex='-1', div has tabindex='0')", function() {
            let fixture = "<div id='fixture'>"
                + "<a tabindex='-1' href='/InvestmentGameBad'><div tabindex='0'>Or try it now for a friend</div></a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] Or try it now for a friend", "tab_focus": "Or try it now for a friend [link]", "image": "", "selector": "#fixture > a > div" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render link with paragraph inside", function() {
            let fixture = "<div id='fixture'>"
                + "<a href='/article'><p>Read more about this topic</p></a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Read more about this topic [link]", "image": "", "selector": "#fixture > a" },
                { "region": "", "heading": "", "item": "[link] Read more about this topic", "tab_focus": "", "image": "", "selector": "#fixture > a > p" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render link with multiple block elements inside", function() {
            let fixture = `<div id='fixture'>
                <a href='/card'>
                <div>Card Title</div>
                <p>Card description text</p>
                </a>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Card Title Card description text [link]", "image": "", "selector": "#fixture > a" },
                { "region": "", "heading": "", "item": "[link] Card Title", "tab_focus": "", "image": "", "selector": "#fixture > a > div" },
                { "region": "", "heading": "", "item": "[link] Card description text", "tab_focus": "", "image": "", "selector": "#fixture > a > p" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render link with heading inside", function() {
            let fixture = `<div id='fixture' class='tomtest'>
                <a href='/article'><h2>Article Title</h2></a>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "", "tab_focus": `Article Title [heading level 2] [link]`, "image": "", "selector": "#fixture > a" },
                { "region": "", "heading": `[link] ["Article Title", heading level 2]`, "item": `[link] [heading level 2] Article Title`, "tab_focus": ``, "image": "", "selector": "#fixture > a > h2" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Combined Scenarios", function() {
        
        it("Should render both scenarios from the task", function() {
            let fixture = "<div id='fixture'>"
                + "<a tabindex='-1' href='/InvestmentGameBad'>Try it now</a>"
                + "<a tabindex='0' href='/InvestmentGameBad'><div tabindex='0'>Or try it now for a friend</div></a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] Try it now", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Or try it now for a friend [link]", "image": "", "selector": "#fixture > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[link] Or try it now for a friend", "tab_focus": "Or try it now for a friend [link]", "image": "", "selector": "#fixture > a:nth-of-type(2) > div" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render links with mixed tabindex values", function() {
            let fixture = "<div id='fixture'>"
                + "<a href='/first'>First link (default)</a>"
                + "<a tabindex='-1' href='/second'>Second link (tabindex -1)</a>"
                + "<a tabindex='0' href='/third'>Third link (tabindex 0)</a>"
                + "<a tabindex='1' href='/fourth'>Fourth link (tabindex 1)</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] First link (default)", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[link] Second link (tabindex -1)", "tab_focus": "", "image": "", "selector": "#fixture > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[link] Third link (tabindex 0)", "tab_focus": "", "image": "", "selector": "#fixture > a:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[link] Fourth link (tabindex 1)", "tab_focus": "Fourth link (tabindex 1) [link]", "image": "", "selector": "#fixture > a:nth-of-type(4)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "First link (default) [link]", "image": "", "selector": "#fixture > a:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Third link (tabindex 0) [link]", "image": "", "selector": "#fixture > a:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Link Edge Cases", function() {
        
        it("Should handle link with no href", function() {
            let fixture = "<div id='fixture'>"
                + "<a>Link without href</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "Link without href", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle link with empty href", function() {
            let fixture = "<div id='fixture'>"
                + "<a href=''>Empty href link</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link] Empty href link", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Empty href link [link]", "image": "", "selector": "#fixture > a" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle link with aria-label", function() {
            let fixture = "<div id='fixture'>"
                + "<a href='/home' aria-label='Go to homepage'>Home</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[link, \"Go to homepage\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Go to homepage\", link]", "image": "", "selector": "#fixture > a[aria-label=\"Go\\ to\\ homepage\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle link with role='button'", function() {
            let fixture = "<div id='fixture'>"
                + "<a href='/action' role='button'>Click me</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Click me", button]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Click me", button]`, "image": "", "selector": "#fixture > a[role=\"button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Link Within Label", function() {

        it("Should render checkbox with aria-label and a linked label containing a link and aria-hidden spans", function() {
            let fixture = `<div id='fixture'>
                <h2>Regular order</h2>
                <div>
                    <input type="checkbox" id="terms" name="terms" required aria-label="I have read and accept the terms and conditions."/>
                    <label id="chkLabel" for="terms">
                        <span aria-hidden="true">I have read and accept the </span>
                        <a href="#" target="_blank">terms and conditions</a>
                        <span aria-hidden="true">.</span>
                    </label>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Regular order", heading level 2]`, "item": `[heading level 2] Regular order`, "tab_focus": "", "image": "", "selector": "#fixture > h2" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, required, "I have read and accept the terms and conditions."]`, "tab_focus": "", "image": "", "selector": "#fixture > div" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, required, "I have read and accept the terms and conditions."]`, "image": "", "selector": "#terms" },
                { "region": "", "heading": "", "item": "[same page link] terms and conditions", "tab_focus": "terms and conditions [same page link]", "image": "", "selector": `#chkLabel > a` },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});
