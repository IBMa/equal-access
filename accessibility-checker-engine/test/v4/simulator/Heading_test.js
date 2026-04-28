/******************************************************************************
    Copyright:: 2026- IBM, Inc

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
 * Comprehensive unit tests for Heading component screen reader rendering
 * Tests heading announcements, levels, and both implicit and explicit roles
 */

let ace = require('../../../src/index');

describe('Heading Component Screen Reader Tests', function() {

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

    describe("Implicit Heading Role", function() {
        
        it("Should render h1 heading", function() {
            let fixture = "<div id='fixture'>"
                + "<h1>Main Title</h1>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Main Title", heading level 1]`, "item": "[heading level 1] Main Title", "tab_focus": "", "image": "", "selector": "#fixture > h1" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render h2 heading", function() {
            let fixture = "<div id='fixture'>"
                + "<h2>Section Title</h2>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Section Title", heading level 2]`, "item": "[heading level 2] Section Title", "tab_focus": "", "image": "", "selector": "#fixture > h2" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render h3 heading", function() {
            let fixture = "<div id='fixture'>"
                + "<h3>Subsection Title</h3>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Subsection Title", heading level 3]`, "item": "[heading level 3] Subsection Title", "tab_focus": "", "image": "", "selector": "#fixture > h3" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render h4 heading", function() {
            let fixture = "<div id='fixture'>"
                + "<h4>Level 4 Heading</h4>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Level 4 Heading", heading level 4]`, "item": "[heading level 4] Level 4 Heading", "tab_focus": "", "image": "", "selector": "#fixture > h4" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render h5 heading", function() {
            let fixture = "<div id='fixture'>"
                + "<h5>Level 5 Heading</h5>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Level 5 Heading", heading level 5]`, "item": "[heading level 5] Level 5 Heading", "tab_focus": "", "image": "", "selector": "#fixture > h5" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render h6 heading", function() {
            let fixture = "<div id='fixture'>"
                + "<h6>Level 6 Heading</h6>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Level 6 Heading", heading level 6]`, "item": "[heading level 6] Level 6 Heading", "tab_focus": "", "image": "", "selector": "#fixture > h6" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Heading Role", function() {
        
        it("Should render div with role='heading' and aria-level='1'", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='heading' aria-level='1'>Custom H1</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Custom H1", heading level 1]`, "item": "[heading level 1] Custom H1", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"heading\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='heading' and aria-level='2'", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='heading' aria-level='2'>Custom H2</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Custom H2", heading level 2]`, "item": "[heading level 2] Custom H2", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"heading\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='heading' without aria-level (defaults to level 2)", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='heading'>Default Level</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Default Level", heading level 2]`, "item": "[heading level 2] Default Level", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"heading\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Heading Hierarchy", function() {
        
        it("Should render proper heading hierarchy", function() {
            let fixture = "<div id='fixture'>"
                + "<h1>Main Title</h1>"
                + "<h2>Section 1</h2>"
                + "<h3>Subsection 1.1</h3>"
                + "<h3>Subsection 1.2</h3>"
                + "<h2>Section 2</h2>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Main Title", heading level 1]`, "item": "[heading level 1] Main Title", "tab_focus": "", "image": "", "selector": "#fixture > h1" },
                { "region": "", "heading": `["Section 1", heading level 2]`, "item": "[heading level 2] Section 1", "tab_focus": "", "image": "", "selector": "#fixture > h2:nth-of-type(1)" },
                { "region": "", "heading": `["Subsection 1.1", heading level 3]`, "item": "[heading level 3] Subsection 1.1", "tab_focus": "", "image": "", "selector": "#fixture > h3:nth-of-type(1)" },
                { "region": "", "heading": `["Subsection 1.2", heading level 3]`, "item": "[heading level 3] Subsection 1.2", "tab_focus": "", "image": "", "selector": "#fixture > h3:nth-of-type(2)" },
                { "region": "", "heading": `["Section 2", heading level 2]`, "item": "[heading level 2] Section 2", "tab_focus": "", "image": "", "selector": "#fixture > h2:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render mixed native and custom headings", function() {
            let fixture = "<div id='fixture'>"
                + "<h1>Native H1</h1>"
                + "<div role='heading' aria-level='2'>Custom H2</div>"
                + "<h3>Native H3</h3>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Native H1", heading level 1]`, "item": "[heading level 1] Native H1", "tab_focus": "", "image": "", "selector": "#fixture > h1" },
                { "region": "", "heading": `["Custom H2", heading level 2]`, "item": "[heading level 2] Custom H2", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"heading\"]" },
                { "region": "", "heading": `["Native H3", heading level 3]`, "item": "[heading level 3] Native H3", "tab_focus": "", "image": "", "selector": "#fixture > h3" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Heading with Content", function() {
        
        it("Should render heading with nested elements", function() {
            let fixture = "<div id='fixture'>"
                + "<h2><span>Chapter</span> <strong>One</strong></h2>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Chapter One", heading level 2]`, "item": "[heading level 2] Chapter One", "tab_focus": "", "image": "", "selector": "#fixture > h2" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render heading with aria-label", function() {
            let fixture = "<div id='fixture'>"
                + "<h2 aria-label='Introduction Section'>Intro</h2>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Introduction Section", heading level 2]`, "item": "[heading level 2, \"Introduction Section\"]", "tab_focus": "", "image": "", "selector": "#fixture > h2[aria-label=\"Introduction\\ Section\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render empty heading", function() {
            let fixture = "<div id='fixture'>"
                + "<h2></h2>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Heading Edge Cases", function() {
        
        it("Should render heading with link inside", function() {
            let fixture = `<div id='fixture'>
                <h2><a href='/section'>Section Title</a></h2>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Section Title", heading level 2]`, "item": "[heading level 2] [link] Section Title", "tab_focus": "", "image": "", "selector": "#fixture > h2" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Section Title [link]", "image": "", "selector": "#fixture > h2 > a" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render heading with button inside", function() {
            let fixture = "<div id='fixture'>"
                + "<h2><button>Toggle Section</button></h2>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Toggle Section", heading level 2]`, "item": `[heading level 2] ["Toggle Section", button]`, "tab_focus": "", "image": "", "selector": "#fixture > h2" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Toggle Section", button]`, "image": "", "selector": "#fixture > h2 > button" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render heading with tabindex (focusable)", function() {
            let fixture = "<div id='fixture'>"
                + "<h2 tabindex='0'>Focusable Heading</h2>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Focusable Heading", heading level 2]`, "item": "[heading level 2] Focusable Heading", "tab_focus": "Focusable Heading [heading level 2]", "image": "", "selector": "#fixture > h2" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob