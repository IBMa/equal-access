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
 * Comprehensive unit tests for Radio button component screen reader rendering
 * Tests both implicit (<input type="radio">) and explicit (role="radio") radio buttons
 */

let ace = require('../../../src/index');

// Helper function to trim item fields in results
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim()
    }));
}

describe('Radio Button Component Screen Reader Tests', function() {

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

    describe("Implicit Radio Role", function() {
        
        it("Should render radio button group with one selected", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='option1' name='choice' checked>
                <label for='option1'>Option 1</label>
                <input type='radio' id='option2' name='choice'>
                <label for='option2'>Option 2</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, checked, \"Option 1\"] [radio button, not checked, \"Option 2\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, checked, \"Option 1\"]", "image": "", "selector": "#option1" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio button group with none selected", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='opt1' name='options'>
                <label for='opt1'>First</label>
                <input type='radio' id='opt2' name='options'>
                <label for='opt2'>Second</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"First\"] [radio button, not checked, \"Second\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, not checked, \"First\"]", "image": "", "selector": "#opt1" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render disabled radio button", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='enabled' name='status'>
                <label for='enabled'>Enabled</label>
                <input type='radio' id='disabled' name='status' disabled>
                <label for='disabled'>Disabled</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Enabled\"] [radio button, not checked, disabled, \"Disabled\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, not checked, \"Enabled\"]", "image": "", "selector": "#enabled" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio buttons with label before input", function() {
            let fixture = `<div id='fixture'>
                <label for='yes'>Yes</label>
                <input type='radio' id='yes' name='answer'>
                <label for='no'>No</label>
                <input type='radio' id='no' name='answer'>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Yes\"] [radio button, not checked, \"No\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, not checked, \"Yes\"]", "image": "", "selector": "#yes" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio buttons wrapped in labels", function() {
            let fixture = `<div id='fixture'>
                <label><input type='radio' name='size' value='small'> Small</label>
                <label><input type='radio' name='size' value='medium' checked> Medium</label>
                <label><input type='radio' name='size' value='large'> Large</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Small\"] [radio button, checked, \"Medium\"] [radio button, not checked, \"Large\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, checked, \"Medium\"]", "image": "", "selector": "#fixture > label:nth-of-type(2) > input[type=\"radio\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Radio Role", function() {
        
        it("Should render div with role='radio' unchecked", function() {
            let fixture = `<div id='fixture'>
                <div role='radio' aria-checked='false' aria-label='Option A' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Option A\"]", "tab_focus": "[radio button, not checked, \"Option A\"]", "image": "", "selector": "#fixture > div[role=\"radio\"][aria-label=\"Option\\ A\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='radio' checked", function() {
            let fixture = `<div id='fixture'>
                <div role='radio' aria-checked='true' aria-label='Selected option' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, checked, \"Selected option\"]", "tab_focus": "[radio button, checked, \"Selected option\"]", "image": "", "selector": "#fixture > div[role=\"radio\"][aria-label=\"Selected\\ option\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radiogroup with custom radio buttons", function() {
            let fixture = `<div id='fixture'>
                <div role='radiogroup' aria-label='Color choice'>
                    <div role='radio' aria-checked='true' aria-label='Red' tabindex='0'></div>
                    <div role='radio' aria-checked='false' aria-label='Blue' tabindex='-1'></div>
                    <div role='radio' aria-checked='false' aria-label='Green' tabindex='-1'></div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[grouping, \"Color choice\"]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"radiogroup\"][aria-label=\"Color\\ choice\"]" },
                { "region": "", "heading": "", "item": "[radio button, checked, \"Red\"]", "tab_focus": "[grouping, \"Color choice\"] [radio button, checked, \"Red\"]", "image": "", "selector": "#fixture > div > div[role=\"radio\"][aria-label=\"Red\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Blue\"]", "tab_focus": "", "image": "", "selector": "#fixture > div > div[role=\"radio\"][aria-label=\"Blue\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Green\"]", "tab_focus": "", "image": "", "selector": "#fixture > div > div[role=\"radio\"][aria-label=\"Green\"]:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[out of grouping]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio with aria-disabled", function() {
            let fixture = `<div id='fixture'>
                <div role='radio' aria-checked='false' aria-disabled='true' aria-label='Disabled option' tabindex='-1'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, disabled, \"Disabled option\"]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"radio\"][aria-label=\"Disabled\\ option\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio with aria-labelledby", function() {
            let fixture = `<div id='fixture'>
                <span id='radio-label'>Payment method</span>
                <div role='radio' aria-checked='false' aria-labelledby='radio-label' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "Payment method", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Payment method\"]", "tab_focus": "[radio button, not checked, \"Payment method\"]", "image": "", "selector": "#fixture > div[role=\"radio\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Radio Buttons in Fieldset", function() {
        
        it("Should render radio group in fieldset", function() {
            let fixture = `<div id='fixture'>
                <fieldset>
                    <legend>Choose a plan</legend>
                    <input type='radio' id='basic' name='plan'>
                    <label for='basic'>Basic</label>
                    <input type='radio' id='pro' name='plan' checked>
                    <label for='pro'>Pro</label>
                    <input type='radio' id='enterprise' name='plan'>
                    <label for='enterprise'>Enterprise</label>
                </fieldset>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[grouping, \"Choose a plan\"]", "tab_focus": "", "image": "", "selector": "#fixture > fieldset" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Basic\"] [radio button, checked, \"Pro\"] [radio button, not checked, \"Enterprise\"]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, checked, \"Pro\"]", "image": "", "selector": "#pro" },
                { "region": "", "heading": "", "item": "[out of grouping]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render multiple radio groups in separate fieldsets", function() {
            let fixture = `<div id='fixture'>
                <fieldset>
                    <legend>Size</legend>
                    <input type='radio' id='s' name='size' checked>
                    <label for='s'>Small</label>
                    <input type='radio' id='l' name='size'>
                    <label for='l'>Large</label>
                </fieldset>
                <fieldset>
                    <legend>Color</legend>
                    <input type='radio' id='r' name='color'>
                    <label for='r'>Red</label>
                    <input type='radio' id='b' name='color' checked>
                    <label for='b'>Blue</label>
                </fieldset>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[grouping, \"Size\"]", "tab_focus": "", "image": "", "selector": "#fixture > fieldset:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[radio button, checked, \"Small\"] [radio button, not checked, \"Large\"]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, checked, \"Small\"]", "image": "", "selector": "#s" },
                { "region": "", "heading": "", "item": "[out of grouping]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[grouping, \"Color\"]", "tab_focus": "", "image": "", "selector": "#fixture > fieldset:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Red\"] [radio button, checked, \"Blue\"]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, checked, \"Blue\"]", "image": "", "selector": "#b" },
                { "region": "", "heading": "", "item": "[out of grouping]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Radio Buttons in List", function() {
        
        it("Should render radio buttons in list", function() {
            let fixture = `<div id='fixture'>
                <ul>
                    <li><input type='radio' id='opt-a' name='opts'> <label for='opt-a'>Option A</label></li>
                    <li><input type='radio' id='opt-b' name='opts' checked> <label for='opt-b'>Option B</label></li>
                    <li><input type='radio' id='opt-c' name='opts'> <label for='opt-c'>Option C</label></li>
                </ul>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 3 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul" },
                { "region": "", "heading": "", "item": "[bullet] [radio button, not checked, \"Option A\"]", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] [radio button, checked, \"Option B\"]", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, checked, \"Option B\"]", "image": "", "selector": "#opt-b" },
                { "region": "", "heading": "", "item": "[bullet] [radio button, not checked, \"Option C\"]", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[out of list]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Radio Button with Required Attribute", function() {
        
        it("Should render required radio button", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='req1' name='required-group' required>
                <label for='req1'>Required option 1</label>
                <input type='radio' id='req2' name='required-group' required>
                <label for='req2'>Required option 2</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, required, \"Required option 1\"] [radio button, not checked, required, \"Required option 2\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, not checked, required, \"Required option 1\"]", "image": "", "selector": "#req1" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio with aria-required", function() {
            let fixture = `<div id='fixture'>
                <div role='radio' aria-checked='false' aria-required='true' aria-label='Required choice' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, required, \"Required choice\"]", "tab_focus": "[radio button, not checked, required, \"Required choice\"]", "image": "", "selector": "#fixture > div[role=\"radio\"][aria-label=\"Required\\ choice\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Radio Button Edge Cases", function() {
        
        it("Should render radio button without label", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='unlabeled' name='test'>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, not checked]", "image": "", "selector": "#unlabeled" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio button with aria-label", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='labeled' name='test' aria-label='Custom radio label'>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Custom radio label\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, not checked, \"Custom radio label\"]", "image": "", "selector": "#labeled" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio with tabindex=-1 (not in tab order)", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='notab' name='test' tabindex='-1'>
                <label for='notab'>Not tabbable</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Not tabbable\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render checked and disabled radio", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='both' name='test' checked disabled>
                <label for='both'>Checked and disabled</label>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, checked, disabled, \"Checked and disabled\"]", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render radio with description", function() {
            let fixture = `<div id='fixture'>
                <input type='radio' id='described' name='test' aria-describedby='desc'>
                <label for='described'>Option with description</label>
                <span id='desc'>Additional information</span>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[radio button, not checked, \"Option with description\"] Additional information", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[radio button, not checked, \"Option with description\", \"Additional information\"]", "image": "", "selector": "#described" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob