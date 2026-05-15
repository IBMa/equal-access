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
 * Comprehensive unit tests for Combobox component screen reader rendering
 * Tests both implicit (<select>) and explicit (role="combobox") comboboxes
 * Includes tests for option exposure and announcement
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

describe('Combobox Component Screen Reader Tests', function() {

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

    describe("Implicit Combobox Role - Select Element", function() {
        
        it("Should render basic select with options", function() {
            let fixture = `<div id='fixture'>
                <label for='country'>Country:</label>
                <select id='country'>
                    <option>USA</option>
                    <option>Canada</option>
                    <option>Mexico</option>
                </select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Country:", combo box, collapsed, "USA"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Country:", combo box, collapsed, "USA"]`, "image": "", "selector": "#country" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should expose all options when expanded", function() {
            let fixture = `<div id='fixture'>
                <label for='color'>Color:</label>
                <select id='color' size='3'>
                    <option>Red</option>
                    <option>Green</option>
                    <option>Blue</option>
                </select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Color:", list box, "Red"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Color:", list box, "Red"]`, "image": "", "selector": "#color" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce selected option", function() {
            let fixture = `<div id='fixture'>
                <label for='size'>Size:</label>
                <select id='size'>
                    <option>Small</option>
                    <option selected>Medium</option>
                    <option>Large</option>
                </select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Size:", combo box, collapsed, "Medium"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Size:", combo box, collapsed, "Medium"]`, "image": "", "selector": "#size" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should expose options with optgroup", function() {
            let fixture = `<div id='fixture'>
                <label for='car'>Car:</label>
                <select id='car'>
                    <optgroup label='German'>
                        <option>BMW</option>
                        <option>Mercedes</option>
                    </optgroup>
                    <optgroup label='Japanese'>
                        <option>Toyota</option>
                        <option>Honda</option>
                    </optgroup>
                </select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Car:", combo box, collapsed, "BMW"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Car:", combo box, collapsed, "BMW"]`, "image": "", "selector": "#car" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle empty select", function() {
            let fixture = `<div id='fixture'>
                <label for='empty'>Empty:</label>
                <select id='empty'></select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Empty:", combo box, collapsed]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Empty:", combo box, collapsed]`, "image": "", "selector": "#empty" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle disabled select", function() {
            let fixture = `<div id='fixture'>
                <label for='disabled'>Disabled:</label>
                <select id='disabled' disabled>
                    <option>Option 1</option>
                </select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Disabled:", combo box, collapsed, disabled, "Option 1"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Combobox Role - ARIA Combobox", function() {
        
        it("Should render ARIA combobox with listbox", function() {
            let fixture = `<div id='fixture'>
                <label id='combo-label'>Choose fruit:</label>
                <div role='combobox' aria-labelledby='combo-label' aria-expanded='false' aria-controls='listbox1' tabindex='0'>
                    <span>Apple</span>
                </div>
                <ul id='listbox1' role='listbox' style='display:none;'>
                    <li role='option'>Apple</li>
                    <li role='option'>Banana</li>
                    <li role='option'>Orange</li>
                </ul>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `Choose fruit: ["Choose fruit:", combo box, collapsed] Apple`, "tab_focus": `["Choose fruit:", combo box, collapsed]`, "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should expose options when combobox is expanded", function() {
            let fixture = `<div id='fixture'>
                <label id='combo-label2'>Select item:</label>
                <div role='combobox' aria-labelledby='combo-label2' aria-expanded='true' aria-controls='listbox2' tabindex='0'>
                    <span>Item 1</span>
                </div>
                <ul id='listbox2' role='listbox'>
                    <li role='option' aria-selected='true'>Item 1</li>
                    <li role='option'>Item 2</li>
                    <li role='option'>Item 3</li>
                </ul>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `Select item: ["Select item:", combo box, expanded] Item 1`, "tab_focus": `["Select item:", combo box, expanded]`, "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": `[list box]`, "tab_focus": "", "image": "", "selector": "#listbox2" },
                { "region": "", "heading": "", "item": `[option, selected] Item 1`, "tab_focus": "", "image": "", "selector": "#listbox2 > li[role=\"option\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": `[option] Item 2`, "tab_focus": "", "image": "", "selector": "#listbox2 > li[role=\"option\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": `[option] Item 3`, "tab_focus": "", "image": "", "selector": "#listbox2 > li[role=\"option\"]:nth-of-type(3)" },
                { "region": "", "heading": "", "item": `[out of list box]`, "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render combobox with aria-autocomplete", function() {
            let fixture = `<div id='fixture'>
                <label for='search-combo'>Search:</label>
                <input type='text' id='search-combo' role='combobox' aria-autocomplete='list' aria-expanded='false' aria-controls='suggestions'>
                <ul id='suggestions' role='listbox' style='display:none;'></ul>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Search:", combo box, collapsed, edit]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Search:", combo box, collapsed, edit]`, "image": "", "selector": "#search-combo" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle combobox without options exposed", function() {
            let fixture = `<div id='fixture'>
                <label id='combo-label3'>Pick one:</label>
                <div role='combobox' aria-labelledby='combo-label3' aria-expanded='false' tabindex='0'>
                    <span>None selected</span>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `Pick one: ["Pick one:", combo box, collapsed] None selected`, "tab_focus": `["Pick one:", combo box, collapsed]`, "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Combobox with Multiple Selection", function() {
        
        it("Should render multi-select", function() {
            let fixture = `<div id='fixture'>
                <label for='multi'>Select multiple:</label>
                <select id='multi' multiple>
                    <option>Option 1</option>
                    <option selected>Option 2</option>
                    <option selected>Option 3</option>
                </select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Select multiple:", list box, "Option 2"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Select multiple:", list box, "Option 2"]`, "image": "", "selector": "#multi" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Combobox Edge Cases", function() {
        
        it("Should handle combobox without label", function() {
            let fixture = `<div id='fixture'>
                <select>
                    <option>Unlabeled</option>
                </select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[combo box, collapsed, "Unlabeled"]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[combo box, collapsed, "Unlabeled"]`, "image": "", "selector": "#fixture > select" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle required combobox", function() {
            let fixture = `<div id='fixture'>
                <label for='required'>Required field:</label>
                <select id='required' required>
                    <option value=''>Select...</option>
                    <option>Option 1</option>
                </select>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Required field:", combo box, collapsed, required, "Select..."]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Required field:", combo box, collapsed, required, "Select..."]`, "image": "", "selector": "#required" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob