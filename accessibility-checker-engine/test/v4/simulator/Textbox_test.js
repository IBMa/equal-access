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
 * Comprehensive unit tests for Textbox component screen reader rendering
 * Tests both implicit (<input>, <textarea>) and explicit (role="textbox") textboxes
 */

let ace = require('../../../src/index');

// Helper function to trim region fields in results
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim(),
        region: item.region.trim()
    }));
}

describe('Textbox Component Screen Reader Tests', function() {

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

    describe("Implicit Textbox Role - Input Text", function() {
        
        it("Should render basic text input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='name'>Name:</label>"
                + "<input type='text' id='name'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Name:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Name:", edit]`, "image": "", "selector": "#name" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render text input with value", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='username'>Username:</label>"
                + "<input type='text' id='username' value='john_doe'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Username:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Username:", edit]`, "image": "", "selector": "#username" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render text input with placeholder", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='email'>Email:</label>"
                + "<input type='text' id='email' placeholder='Enter your email'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Email:", edit, placeholder: Enter your email]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Email:", edit, placeholder: Enter your email]`, "image": "", "selector": "#email" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render disabled text input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='disabled'>Disabled field:</label>"
                + "<input type='text' id='disabled' disabled>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Disabled field:", edit, disabled]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render readonly text input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='readonly'>Read-only field:</label>"
                + "<input type='text' id='readonly' value='Cannot edit' readonly>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Read-only field:", edit, read only]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Read-only field:", edit, read only]`, "image": "", "selector": "#readonly" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render required text input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='required'>Required field:</label>"
                + "<input type='text' id='required' required>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Required field:", edit, required]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Required field:", edit, required]`, "image": "", "selector": "#required" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render text input with aria-label", function() {
            let fixture = "<div id='fixture'>"
                + "<input type='text' aria-label='Search query'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Search query", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Search query", edit]`, "image": "", "selector": "#fixture > input[aria-label=\"Search\\ query\"][type=\"text\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render text input with aria-labelledby", function() {
            let fixture = `<div id='fixture'>
                <span id='label-text'>First name</span>
                <input type='text' aria-labelledby='label-text'>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `First name ["First name", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["First name", edit]`, "image": "", "selector": "#fixture > input[type=\"text\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render text input with aria-describedby", function() {
            let fixture = `<div id='fixture'>
                <label for='password'>Password:</label>
                <input type='text' id='password' aria-describedby='hint'>
                <span id='hint'>Must be at least 8 characters</span>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Password:", edit] Must be at least 8 characters`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Password:", edit, "Must be at least 8 characters"]`, "image": "", "selector": "#password" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Implicit Textbox Role - Textarea", function() {
        
        it("Should render basic textarea", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='comments'>Comments:</label>"
                + "<textarea id='comments'></textarea>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Comments:", edit, multiline] [out of edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Comments:", edit, multiline]`, "image": "", "selector": "#comments" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render textarea with content", function() {
            let fixture = `<div id='fixture'>
                <label for='bio'>Biography:</label>
                <textarea id='bio'>This is my story...</textarea>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Biography:", edit, multiline] This is my story... [out of edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Biography:", edit, multiline] This is my story...`, "image": "", "selector": "#bio" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render disabled textarea", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='disabled-area'>Disabled:</label>"
                + "<textarea id='disabled-area' disabled></textarea>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Disabled:", edit, multiline, disabled] [out of edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render readonly textarea", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='readonly-area'>Read-only:</label>"
                + "<textarea id='readonly-area' readonly>Cannot edit this</textarea>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Read-only:", edit, multiline, read only] Cannot edit this [out of edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Read-only:", edit, multiline, read only] Cannot edit this`, "image": "", "selector": "#readonly-area" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render required textarea", function() {
            let fixture = `<div id='fixture'>
                <label for='required-area'>Required:</label>
                <textarea id='required-area' required></textarea>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Required:", edit, multiline, required] [out of edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Required:", edit, multiline, required]`, "image": "", "selector": "#required-area" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Textbox Role", function() {
        
        it("Should render div with role='textbox' single-line", function() {
            let fixture = `<div id='fixture'>
                <div role='textbox' aria-label='Custom textbox' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Custom textbox", edit]`, "tab_focus": `["Custom textbox", edit]`, "image": "", "selector": "#fixture > div[role=\"textbox\"][aria-label=\"Custom\\ textbox\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='textbox' multiline", function() {
            let fixture = `<div id='fixture'>
                <div role='textbox' aria-multiline='true' aria-label='Multiline editor' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Multiline editor", edit, multiline]`, "tab_focus": `["Multiline editor", edit, multiline]`, "image": "", "selector": "#fixture > div[role=\"textbox\"][aria-label=\"Multiline\\ editor\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render textbox with aria-readonly", function() {
            let fixture = `<div id='fixture'>
                <div role='textbox' aria-readonly='true' aria-label='Read-only box' tabindex='0'>Content here</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Read-only box", edit, read only] Content here`, "tab_focus": `["Read-only box", edit, read only]`, "image": "", "selector": "#fixture > div[role=\"textbox\"][aria-label=\"Read-only\\ box\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render textbox with aria-disabled", function() {
            let fixture = `<div id='fixture'>
                <div role='textbox' aria-disabled='true' aria-label='Disabled box' tabindex='-1'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Disabled box", edit, disabled]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"textbox\"][aria-label=\"Disabled\\ box\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render textbox with aria-required", function() {
            let fixture = `<div id='fixture'>
                <div role='textbox' aria-required='true' aria-label='Required box' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Required box", edit, required]`, "tab_focus": `["Required box", edit, required]`, "image": "", "selector": "#fixture > div[role=\"textbox\"][aria-label=\"Required\\ box\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        // it("Should render contenteditable as textbox", function() {
        //     let fixture = `<div id='fixture'>
        //         <div contenteditable='true' aria-label='Editable content'>Type here</div>
        //     </div>`;
        //     document.body.insertAdjacentHTML('afterbegin', fixture);
            
        //     let result = trimItems(ace.SRController.renderStructure(document));
            
        //     expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
        //         { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
        //         { "region": "", "heading": "", "item": `["Editable content", editable section] Type here [out of section]`, "tab_focus": `["Editable content", editable section] Type here [out of section]`, "image": "", "selector": "#fixture > div[contenteditable=\"true\"][aria-label=\"Editable\\ content\"]" },
        //         { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
        //     ]);
        // });
    });

    describe("Other Input Types", function() {
        
        it("Should render email input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='email'>Email:</label>"
                + "<input type='email' id='email'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Email:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Email:", edit]`, "image": "", "selector": "#email" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render password input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='pwd'>Password:</label>"
                + "<input type='password' id='pwd'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Password:", edit, protected]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Password:", edit, protected]`, "image": "", "selector": "#pwd" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render tel input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='phone'>Phone:</label>"
                + "<input type='tel' id='phone'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Phone:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Phone:", edit]`, "image": "", "selector": "#phone" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render url input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='website'>Website:</label>"
                + "<input type='url' id='website'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Website:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Website:", edit]`, "image": "", "selector": "#website" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render search input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='search'>Search:</label>"
                + "<input type='search' id='search'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Search:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Search:", edit]`, "image": "", "selector": "#search" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render number input", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='age'>Age:</label>"
                + "<input type='number' id='age'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Age:", spinbutton, editable]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Age:", spinbutton, editable]`, "image": "", "selector": "#age" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Textbox Edge Cases", function() {
        
        it("Should render textbox without label", function() {
            let fixture = "<div id='fixture'>"
                + "<input type='text'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[edit]`, "image": "", "selector": "#fixture > input[type=\"text\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render textbox with tabindex=-1 (not in tab order)", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='notab'>Not tabbable:</label>"
                + "<input type='text' id='notab' tabindex='-1'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Not tabbable:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render textbox with maxlength", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='limited'>Limited input:</label>"
                + "<input type='text' id='limited' maxlength='10'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Limited input:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Limited input:", edit]`, "image": "", "selector": "#limited" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render textbox with autocomplete", function() {
            let fixture = "<div id='fixture'>"
                + "<label for='auto'>Auto-complete:</label>"
                + "<input type='text' id='auto' autocomplete='name'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Auto-complete:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Auto-complete:", edit]`, "image": "", "selector": "#auto" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render textbox with aria-invalid", function() {
            let fixture = `<div id='fixture'>
                <label for='invalid'>Invalid field:</label>
                <input type='text' id='invalid' aria-invalid='true'>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Invalid field:", edit, invalid]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Invalid field:", edit, invalid]`, "image": "", "selector": "#invalid" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render multiple textboxes in a form", function() {
            let fixture = "<div id='fixture'>"
                + "<form>"
                + "<label for='first'>First name:</label>"
                + "<input type='text' id='first'>"
                + "<label for='last'>Last name:</label>"
                + "<input type='text' id='last'>"
                + "<label for='note'>Note:</label>"
                + "<textarea id='note'></textarea>"
                + "</form>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[section]", "heading": "", "item": `[section] ["First name:", edit] ["Last name:", edit] ["Note:", edit, multiline] [out of edit]`, "tab_focus": "", "image": "", "selector": "#fixture > form" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["First name:", edit]`, "image": "", "selector": "#first" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Last name:", edit]`, "image": "", "selector": "#last" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Note:", edit, multiline]`, "image": "", "selector": "#note" },
                { "region": "", "heading": "", "item": "[out of section] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob