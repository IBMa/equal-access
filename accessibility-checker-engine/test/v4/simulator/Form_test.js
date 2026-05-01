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
 * Comprehensive unit tests for Form landmark screen reader rendering
 * Tests both implicit (<form>) and explicit (role="form") form landmarks
 */

let ace = require('../../../src/index');

// Helper function to trim region fields in results
function trimRegions(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim(),
        region: item.region.trim()
    }));
}

describe('Form Landmark Screen Reader Tests', function() {

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

    describe("Implicit Form Role", function() {
        
        it("Should render form with aria-label as landmark", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Contact form'>
                    <label for='name'>Name:</label>
                    <input type='text' id='name'>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Contact form", form region]`, "heading": "", "item": `["Contact form", form region] ["Name:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Contact\\ form\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Name:", edit]`, "image": "", "selector": "#name" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render form with aria-labelledby as landmark", function() {
            let fixture = `<div id='fixture'>
                <h2 id='form-title'>Registration Form</h2>
                <form aria-labelledby='form-title'>
                    <label for='email'>Email:</label>
                    <input type='email' id='email'>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Registration Form", heading level 2]`, "item": "[heading level 2] Registration Form", "tab_focus": "", "image": "", "selector": "#form-title" },
                { "region": `["Registration Form", form region]`, "heading": "", "item": `["Registration Form", form region] ["Email:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture > form" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Email:", edit]`, "image": "", "selector": "#email" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should NOT render form without accessible name as landmark", function() {
            let fixture = `<div id='fixture'>
                <form>
                    <label for='username'>Username:</label>
                    <input type='text' id='username'>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[section]", "heading": "", "item": `[section] ["Username:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture > form" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Username:", edit]`, "image": "", "selector": "#username" },
                { "region": "", "heading": "", "item": "[out of section]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Form Role", function() {
        
        it("Should render div with role='form' and aria-label", function() {
            let fixture = `<div id='fixture'>
                <div role='form' aria-label='Search form'>
                    <label for='search'>Search:</label>
                    <input type='text' id='search'>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Search form", form region]`, "heading": "", "item": `["Search form", form region] ["Search:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"form\"][aria-label=\"Search\\ form\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Search:", edit]`, "image": "", "selector": "#search" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should NOT render div with role='form' without accessible name", function() {
            let fixture = `<div id='fixture'>
                <div role='form'>
                    <label for='query'>Query:</label>
                    <input type='text' id='query'>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[section]", "heading": "", "item": `[section] ["Query:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"form\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Query:", edit]`, "image": "", "selector": "#query" },
                { "region": "", "heading": "", "item": "[out of section]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Form with Various Input Types", function() {
        
        it("Should render form with text inputs", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='User info'>
                    <label for='fname'>First name:</label>
                    <input type='text' id='fname'>
                    <label for='lname'>Last name:</label>
                    <input type='text' id='lname'>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["User info", form region]`, "heading": "", "item": `["User info", form region] ["First name:", edit] ["Last name:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"User\\ info\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["First name:", edit]`, "image": "", "selector": "#fname" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Last name:", edit]`, "image": "", "selector": "#lname" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render form with checkboxes", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Preferences'>
                    <input type='checkbox' id='newsletter'>
                    <label for='newsletter'>Subscribe to newsletter</label>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Preferences", form region]`, "heading": "", "item": `["Preferences", form region] [checkbox, not checked, "Subscribe to newsletter"]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Preferences\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Subscribe to newsletter"]`, "image": "", "selector": "#newsletter" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render form with radio buttons", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Payment method'>
                    <input type='radio' id='credit' name='payment'>
                    <label for='credit'>Credit card</label>
                    <input type='radio' id='debit' name='payment'>
                    <label for='debit'>Debit card</label>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Payment method", form region]`, "heading": "", "item": `["Payment method", form region] [radio button, not checked, "Credit card"] [radio button, not checked, "Debit card"]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Payment\\ method\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[radio button, not checked, "Credit card"]`, "image": "", "selector": "#credit" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render form with select dropdown", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Country selection'>
                    <label for='country'>Country:</label>
                    <select id='country'>
                        <option>USA</option>
                        <option>Canada</option>
                    </select>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Country selection", form region]`, "heading": "", "item": `["Country selection", form region] ["Country:", combo box, collapsed, "USA"]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Country\\ selection\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Country:", combo box, collapsed, "USA"]`, "image": "", "selector": "#country" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render form with textarea", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Feedback form'>
                    <label for='comments'>Comments:</label>
                    <textarea id='comments'></textarea>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Feedback form", form region]`, "heading": "", "item": `["Feedback form", form region] ["Comments:", edit, multiline] [out of edit]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Feedback\\ form\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Comments:", edit, multiline]`, "image": "", "selector": "#comments" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Form with Buttons", function() {
        
        it("Should render form with submit button", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Login'>
                    <label for='user'>Username:</label>
                    <input type='text' id='user'>
                    <button type='submit'>Login</button>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Login", form region]`, "heading": "", "item": `["Login", form region] ["Username:", edit] ["Login", button]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Login\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Username:", edit]`, "image": "", "selector": "#user" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Login", button]`, "image": "", "selector": "#fixture > form > button" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render form with multiple buttons", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Edit form'>
                    <label for='title'>Title:</label>
                    <input type='text' id='title'>
                    <button type='submit'>Save</button>
                    <button type='button'>Cancel</button>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Edit form", form region]`, "heading": "", "item": `["Edit form", form region] ["Title:", edit] ["Save", button] ["Cancel", button]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Edit\\ form\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Title:", edit]`, "image": "", "selector": "#title" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Save", button]`, "image": "", "selector": "#fixture > form > button:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Cancel", button]`, "image": "", "selector": "#fixture > form > button:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Form with Fieldsets", function() {
        
        it("Should render form with fieldset", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Survey'>
                    <fieldset>
                        <legend>Personal Information</legend>
                        <label for='age'>Age:</label>
                        <input type='number' id='age'>
                    </fieldset>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Survey", form region]`, "heading": "", "item": `["Survey", form region]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Survey\"]" },
                { "region": "", "heading": "", "item": `[grouping, "Personal Information"]`, "tab_focus": "", "image": "", "selector": "#fixture > form > fieldset" },
                { "region": "", "heading": "", "item": `["Age:", spinbutton, editable]`, "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Age:", spinbutton, editable]`, "image": "", "selector": "#age" },
                { "region": "", "heading": "", "item": "[out of grouping]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render form with multiple fieldsets", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Registration'>
                    <fieldset>
                        <legend>Account</legend>
                        <label for='uname'>Username:</label>
                        <input type='text' id='uname'>
                    </fieldset>
                    <fieldset>
                        <legend>Contact</legend>
                        <label for='phone'>Phone:</label>
                        <input type='tel' id='phone'>
                    </fieldset>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Registration", form region]`, "heading": "", "item": `["Registration", form region]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Registration\"]" },
                { "region": "", "heading": "", "item": `[grouping, "Account"]`, "tab_focus": "", "image": "", "selector": "#fixture > form > fieldset:nth-of-type(1)" },
                { "region": "", "heading": "", "item": `["Username:", edit]`, "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Username:", edit]`, "image": "", "selector": "#uname" },
                { "region": "", "heading": "", "item": "[out of grouping]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": `[grouping, "Contact"]`, "tab_focus": "", "image": "", "selector": "#fixture > form > fieldset:nth-of-type(2)" },
                { "region": "", "heading": "", "item": `["Phone:", edit]`, "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Phone:", edit]`, "image": "", "selector": "#phone" },
                { "region": "", "heading": "", "item": "[out of grouping]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Multiple Form Landmarks", function() {
        
        it("Should render multiple forms with different labels", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Login form'>
                    <label for='user1'>Username:</label>
                    <input type='text' id='user1'>
                </form>
                <form aria-label='Search form'>
                    <label for='query'>Query:</label>
                    <input type='text' id='query'>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Login form", form region]`, "heading": "", "item": `["Login form", form region] ["Username:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Login\\ form\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Username:", edit]`, "image": "", "selector": "#user1" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": `[out of form] ["Search form", form region]`, "heading": "", "item": `["Search form", form region] ["Query:", edit]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Search\\ form\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Query:", edit]`, "image": "", "selector": "#query" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Form Edge Cases", function() {
        
        it("Should render empty form with label", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Empty form'></form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Empty form", form region]`, "heading": "", "item": `["Empty form", form region]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Empty\\ form\"]" },
                { "region": "", "heading": "", "item": `[out of form]`, "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": `[End of document]`, "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render form with heading", function() {
            let fixture = `<div id='fixture'>
                <form aria-label='Contact us'>
                    <h2>Get in Touch</h2>
                    <label for='msg'>Message:</label>
                    <textarea id='msg'></textarea>
                </form>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Contact us", form region]`, "heading": "", "item": `["Contact us", form region]`, "tab_focus": "", "image": "", "selector": "#fixture > form[aria-label=\"Contact\\ us\"]" },
                { "region": "", "heading": `["Get in Touch", heading level 2]`, "item": `[heading level 2] Get in Touch`, "tab_focus": "", "image": "", "selector": "#fixture > form > h2" },
                { "region": "", "heading": ``, "item": `["Message:", edit, multiline] [out of edit]`, "tab_focus": "", "image": "" },
                { "region": "", "heading": ``, "item": "", "tab_focus": `["Message:", edit, multiline]`, "image": "", "selector": "#msg" },
                { "region": "", "heading": "", "item": "[out of form]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob