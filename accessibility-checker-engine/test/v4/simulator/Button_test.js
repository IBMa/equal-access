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
 * Comprehensive unit tests for Button component screen reader rendering
 * Tests button announcements, states, and both implicit and explicit roles
 */

let ace = require('../../../src/index');

describe('Button Component Screen Reader Tests', function() {

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

    describe("Implicit Button Role", function() {
        
        it("Should render native button element", function() {
            let fixture = "<div id='fixture'>"
                + "<button>Click me</button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Click me\", button]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Click me\", button]", "image": "", "selector": "#fixture > button" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render button with type='button'", function() {
            let fixture = "<div id='fixture'>"
                + "<button type='button'>Action</button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Action\", button]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Action\", button]", "image": "", "selector": "#fixture > button" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render button with type='submit'", function() {
            let fixture = "<div id='fixture'>"
                + "<button type='submit'>Submit</button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Submit\", button]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Submit\", button]", "image": "", "selector": "#fixture > button" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render disabled button", function() {
            let fixture = "<div id='fixture'>"
                + "<button disabled>Disabled</button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Disabled\", button, disabled]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Button Role", function() {
        
        it("Should render div with role='button'", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='button' tabindex='0'>Custom button</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Custom button\", button]", "tab_focus": "[\"Custom button\", button]", "image": "", "selector": "#fixture > div[role=\"button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render span with role='button'", function() {
            let fixture = "<div id='fixture'>"
                + "<span role='button' tabindex='0'>Span button</span>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Span button\", button]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Span button\", button]", "image": "", "selector": "#fixture > span[role=\"button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render button with aria-pressed='false'", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='button' tabindex='0' aria-pressed='false'>Toggle off</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[toggle button, not pressed, "Toggle off"]`, "tab_focus": `[toggle button, not pressed, "Toggle off"]`, "image": "", "selector": "#fixture > div[role=\"button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render button with aria-pressed='true'", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='button' tabindex='0' aria-pressed='true'>Toggle on</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[toggle button, pressed, "Toggle on"]`, "tab_focus": `[toggle button, pressed, "Toggle on"]`, "image": "", "selector": "#fixture > div[role=\"button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render button with aria-disabled='true'", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='button' aria-disabled='true'>Disabled custom</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Disabled custom\", button, disabled]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Button with Labels", function() {
        
        it("Should render button with aria-label", function() {
            let fixture = "<div id='fixture'>"
                + "<button aria-label='Close dialog'>X</button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Close dialog\", button]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Close dialog\", button]", "image": "", "selector": "#fixture > button[aria-label=\"Close\\ dialog\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render button with aria-labelledby", function() {
            let fixture = "<div id='fixture'>"
                + "<span id='label'>Save changes</span>"
                + "<button aria-labelledby='label'>💾</button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `Save changes ["Save changes", button]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Save changes\", button]", "image": "", "selector": "#fixture > button" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Multiple Buttons", function() {
        
        it("Should render multiple buttons in sequence", function() {
            let fixture = "<div id='fixture'>"
                + "<button>First</button>"
                + "<button>Second</button>"
                + "<button>Third</button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["First", button] ["Second", button] ["Third", button]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"First\", button]", "image": "", "selector": "#fixture > button:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Second\", button]", "image": "", "selector": "#fixture > button:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Third\", button]", "image": "", "selector": "#fixture > button:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render mix of native and custom buttons", function() {
            let fixture = "<div id='fixture'>"
                + "<button>Native</button>"
                + "<div role='button' tabindex='0'>Custom</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Native\", button]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Native\", button]", "image": "", "selector": "#fixture > button" },
                { "region": "", "heading": "", "item": "[\"Custom\", button]", "tab_focus": "[\"Custom\", button]", "image": "", "selector": "#fixture > div[role=\"button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Button Edge Cases", function() {
        
        it("Should render button with no text content", function() {
            let fixture = "<div id='fixture'>"
                + "<button></button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[button]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[button]", "image": "", "selector": "#fixture > button" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render button with nested elements", function() {
            let fixture = "<div id='fixture'>"
                + "<button><span>Click</span> <strong>here</strong></button>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Click here\", button]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Click here\", button]", "image": "", "selector": "#fixture > button" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render button without tabindex (custom role)", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='button'>Not focusable</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Not focusable\", button]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob
