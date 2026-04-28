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
 * Comprehensive unit tests for Checkbox component screen reader rendering
 * Tests both implicit (<input type="checkbox">) and explicit (role="checkbox") checkboxes
 */

let ace = require('../../../src/index');

// Helper function to trim item fields in results
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim()
    }));
}

describe('Checkbox Component Screen Reader Tests', function() {

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

    describe("Implicit Checkbox Role", function() {
        
        it("Should render unchecked checkbox with label", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='agree'>
                <label for='agree'>I agree to terms</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, "I agree to terms"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "I agree to terms"]`, "image": "", "selector": "#agree" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checked checkbox with label", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='subscribe' checked>
                <label for='subscribe'>Subscribe to newsletter</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, checked, "Subscribe to newsletter"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, checked, "Subscribe to newsletter"]`, "image": "", "selector": "#subscribe" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render disabled checkbox", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='disabled-cb' disabled>
                <label for='disabled-cb'>Disabled option</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, disabled, "Disabled option"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checkbox with label before input", function() {
            let fixture = `<div id='fixture'>
                <label for='option1'>Option 1</label>
                <input type='checkbox' id='option1'>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, "Option 1"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Option 1"]`, "image": "", "selector": "#option1" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checkbox wrapped in label", function() {
            let fixture = `<div id='fixture'>
                <label><input type='checkbox'> Accept terms</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, "Accept terms"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Accept terms"]`, "image": "", "selector": `#fixture > label > input[type="checkbox"]` },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Checkbox Role", function() {
        
        it("Should render div with role='checkbox' unchecked", function() {
            let fixture = `<div id='fixture'>
                <div role='checkbox' aria-checked='false' aria-label='Custom checkbox' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[checkbox, not checked, \"Custom checkbox\"]", "tab_focus": "[checkbox, not checked, \"Custom checkbox\"]", "image": "", "selector": `#fixture > div[role="checkbox"][aria-label="Custom\\ checkbox"]` },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='checkbox' checked", function() {
            let fixture = `<div id='fixture'>
                <div role='checkbox' aria-checked='true' aria-label='Enabled feature' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[checkbox, checked, \"Enabled feature\"]", "tab_focus": "[checkbox, checked, \"Enabled feature\"]", "image": "", "selector": `#fixture > div[role="checkbox"][aria-label="Enabled\\ feature"]` },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='checkbox' mixed state", function() {
            let fixture = `<div id='fixture'>
                <div role='checkbox' aria-checked='mixed' aria-label='Partially selected' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[checkbox, half checked, \"Partially selected\"]", "tab_focus": "[checkbox, half checked, \"Partially selected\"]", "image": "", "selector": `#fixture > div[role="checkbox"][aria-label="Partially\\ selected"]` },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='checkbox' and aria-disabled", function() {
            let fixture = `<div id='fixture'>
                <div role='checkbox' aria-checked='false' aria-disabled='true' aria-label='Disabled custom' tabindex='-1'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[checkbox, not checked, disabled, \"Disabled custom\"]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"checkbox\"][aria-label=\"Disabled\\ custom\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checkbox with aria-labelledby", function() {
            let fixture = `<div id='fixture'>
                <span id='cb-label'>Enable notifications</span>
                <div role='checkbox' aria-checked='false' aria-labelledby='cb-label' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "Enable notifications", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[checkbox, not checked, \"Enable notifications\"]", "tab_focus": "[checkbox, not checked, \"Enable notifications\"]", "image": "", "selector": "#fixture > div[role=\"checkbox\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Multiple Checkboxes", function() {
        
        it("Should render multiple checkboxes in sequence", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='cb1'>
                <label for='cb1'>Option 1</label>
                <input type='checkbox' id='cb2' checked>
                <label for='cb2'>Option 2</label>
                <input type='checkbox' id='cb3'>
                <label for='cb3'>Option 3</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, "Option 1"] [checkbox, checked, "Option 2"] [checkbox, not checked, "Option 3"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Option 1"]`, "image": "", "selector": "#cb1" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, checked, "Option 2"]`, "image": "", "selector": "#cb2" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Option 3"]`, "image": "", "selector": "#cb3" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checkboxes in a list", function() {
            let fixture = `<div id='fixture'>
                <ul>
                    <li><input type='checkbox' id='item1'> <label for='item1'>Item 1</label></li>
                    <li><input type='checkbox' id='item2'> <label for='item2'>Item 2</label></li>
                </ul>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul" },
                { "region": "", "heading": "", "item": `[bullet] [checkbox, not checked, "Item 1"]`, "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Item 1"]`, "image": "", "selector": "#item1" },
                { "region": "", "heading": "", "item": `[bullet] [checkbox, not checked, "Item 2"]`, "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Item 2"]`, "image": "", "selector": "#item2" },
                { "region": "", "heading": "", "item": "[out of list]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Checkbox in Fieldset", function() {
        
        it("Should render checkboxes grouped in fieldset", function() {
            let fixture = `<div id='fixture'>
                <fieldset>
                    <legend>Select features</legend>
                    <input type='checkbox' id='feature1'>
                    <label for='feature1'>Feature 1</label>
                    <input type='checkbox' id='feature2'>
                    <label for='feature2'>Feature 2</label>
                </fieldset>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[grouping, \"Select features\"]", "tab_focus": "", "image": "", "selector": "#fixture > fieldset" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, "Feature 1"] [checkbox, not checked, "Feature 2"]`, "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Feature 1"]`, "image": "", "selector": "#feature1" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Feature 2"]`, "image": "", "selector": "#feature2" },
                { "region": "", "heading": "", "item": "[out of grouping]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Checkbox with Required Attribute", function() {
        
        it("Should render required checkbox", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='terms' required>
                <label for='terms'>I agree to terms (required)</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, required, "I agree to terms (required)"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, required, "I agree to terms (required)"]`, "image": "", "selector": "#terms" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render required checkbox with aria-required", function() {
            let fixture = `<div id='fixture'>
                <div role='checkbox' aria-checked='false' aria-required='true' aria-label='Required option' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[checkbox, not checked, required, \"Required option\"]", "tab_focus": "[checkbox, not checked, required, \"Required option\"]", "image": "", "selector": "#fixture > div[role=\"checkbox\"][aria-label=\"Required\\ option\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Checkbox Edge Cases", function() {
        
        it("Should render checkbox without label", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='unlabeled'>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[checkbox, not checked]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[checkbox, not checked]", "image": "", "selector": "#unlabeled" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checkbox with aria-label", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='labeled' aria-label='Custom label'>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[checkbox, not checked, \"Custom label\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[checkbox, not checked, \"Custom label\"]", "image": "", "selector": "#labeled" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checkbox with tabindex=-1 (not in tab order)", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='notab' tabindex='-1'>
                <label for='notab'>Not tabbable</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, "Not tabbable"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render indeterminate checkbox (checked and disabled)", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='both' checked disabled>
                <label for='both'>Checked and disabled</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, checked, disabled, "Checked and disabled"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checkbox with description", function() {
            let fixture = `<div id='fixture'>
                <input type='checkbox' id='described' aria-describedby='desc'>
                <label for='described'>Option with description</label>
                <span id='desc'>This is a helpful description</span>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[checkbox, not checked, "Option with description"] This is a helpful description`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Option with description", "This is a helpful description"]`, "image": "", "selector": `#described` },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob