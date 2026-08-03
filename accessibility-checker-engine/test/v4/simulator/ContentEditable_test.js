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
 * Comprehensive unit tests for contenteditable screen reader rendering.
 * Tests plain contenteditable elements (no explicit ARIA role), labelled variants,
 * nested content, and state modifiers such as aria-disabled and aria-readonly.
 */

let ace = require('../../../src/index');

// Helper: strip leading/trailing whitespace from item and region fields
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim(),
        region: item.region.trim()
    }));
}

describe('ContentEditable Screen Reader Tests', function() {

    afterEach(function() {
        if (ace.SRController.getController) {
            let controller = ace.SRController.getController();
            if (controller && controller.disconnect) {
                controller.disconnect();
            }
        }
        let fixture = document.getElementById('fixture');
        if (fixture) {
            document.body.removeChild(fixture);
        }
    });

    // -------------------------------------------------------------------------
    // Basic contenteditable
    // -------------------------------------------------------------------------
    describe("Basic contenteditable='true'", function() {

        it("Should announce an unlabelled contenteditable div as editable section", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='true'>Type here</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[section, editable] Type here [out of section]", "tab_focus": `[section, editable] Type here`, "image": "", "selector": "#fixture > div" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce a contenteditable div with aria-label", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='true' aria-label='Editable content'>Type here</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Editable content", section, editable] Type here [out of section]`, "tab_focus": `["Editable content", section, editable] Type here`, "image": "", "selector": "#fixture > div[aria-label=\"Editable\\ content\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce a contenteditable div with aria-labelledby", function() {
            let fixture = `<div id='fixture'>
                <span id='ce-label'>Notes</span>
                <div contenteditable='true' aria-labelledby='ce-label'>Add notes here</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "Notes", "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": `["Notes", section, editable] Add notes here [out of section]`, "tab_focus": `["Notes", section, editable] Add notes here`, "image": "", "selector": "#fixture > div" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce an empty contenteditable div", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='true' aria-label='Empty editor'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Empty editor", section, editable] [out of section]`, "tab_focus": `["Empty editor", section, editable]`, "image": "", "selector": "#fixture > div[aria-label=\"Empty\\ editor\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    // -------------------------------------------------------------------------
    // contenteditable="" (equivalent to contenteditable="true" per HTML spec)
    // -------------------------------------------------------------------------
    describe("contenteditable='' (empty string)", function() {

        it("Should treat contenteditable='' as editable section", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='' aria-label='Plain editable'>Hello</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": '["Plain editable", section, editable] Hello [out of section]', "tab_focus": '["Plain editable", section, editable] Hello', "image": "", "selector": '#fixture > div[aria-label="Plain\\ editable"]' },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    // -------------------------------------------------------------------------
    // contenteditable="false" — NOT editable; treated as a read-only region
    // -------------------------------------------------------------------------
    describe("contenteditable='false'", function() {

        it("Should NOT treat contenteditable='false' as editable section", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='false'>Not editable</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // contenteditable="false" elements are not editable; the div resolves
            // to generic role and is rendered transparently (text content only).
            // isTabbable() only returns true for contenteditable="true" or contenteditable=""
            // so tab_focus is empty here.
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "Not editable", "tab_focus": "", "image": "", "selector": "#fixture > div" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    // -------------------------------------------------------------------------
    // State modifiers
    // -------------------------------------------------------------------------
    describe("State modifiers on contenteditable", function() {

        it("Should announce aria-disabled on a contenteditable div", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='true' aria-label='Disabled editor' aria-disabled='true'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // aria-disabled=true → isTabbable() still returns true (contenteditable is present),
            // so the tab_focus channel also fires.
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Disabled editor", section, editable, disabled] [out of section]`, "tab_focus": `["Disabled editor", section, editable, disabled]`, "image": "", "selector": "#fixture > div[aria-label=\"Disabled\\ editor\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should NOT announce aria-readonly on a contenteditable div", function() {
            // aria-readonly is not a valid/supported state on contenteditable elements.
            // Screen readers (JAWS/NVDA) ignore it, so the simulator must not surface it.
            let fixture = `<div id='fixture'>
                <div contenteditable='true' aria-label='Readonly editor' aria-readonly='true'>Read me</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Readonly editor", section, editable] Read me [out of section]`, "tab_focus": `["Readonly editor", section, editable] Read me`, "image": "", "selector": "#fixture > div[aria-label=\"Readonly\\ editor\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    // -------------------------------------------------------------------------
    // Nested content
    // -------------------------------------------------------------------------
    describe("Nested content inside contenteditable", function() {

        it("Should read text with inline formatting inside contenteditable", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='true' aria-label='Rich editor'>Hello <strong>world</strong></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Rich editor", section, editable] Hello world [out of section]`, "tab_focus": `["Rich editor", section, editable] Hello world`, "image": "", "selector": "#fixture > div[aria-label=\"Rich\\ editor\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should read a link inside a contenteditable div", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='true' aria-label='Editor with link'>Visit <a href='https://example.com'>Example</a></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // The contenteditable div is the navigable "item"; the link inside it becomes
            // its own item row (rendered as "[link] Example [out of section]") and the
            // tab_focus row shows "Example [link]" in reverse-announce order.
            // The tab_focus for the outer div includes all textContent: "Visit Example".
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Editor with link", section, editable] Visit`, "tab_focus": `["Editor with link", section, editable] Visit Example`, "image": "", "selector": "#fixture > div[aria-label=\"Editor\\ with\\ link\"]" },
                { "region": "", "heading": "", "item": "[link] Example [out of section]", "tab_focus": "Example [link]", "image": "", "selector": "#fixture > div > a" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce a nested contenteditable='false' as a non-editable read-only island", function() {
            let fixture = `<div id='fixture'>
                <div contenteditable='true' aria-label='Outer editor'>
                    Editable text
                    <span contenteditable='false'>Read-only island</span>
                    More editable
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // The outer editable section item includes all text. The nested
            // contenteditable="false" span is NOT tabbable (isTabbable now correctly
            // requires "true" or "" value), so it gets no tab_focus row.
            // The tab_focus for the outer div appends all textContent (no spaces between nodes).
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Outer editor", section, editable] Editable text Read-only island More editable [out of section]`, "tab_focus": `["Outer editor", section, editable] Editable text Read-only island More editable`, "image": "", "selector": "#fixture > div[aria-label=\"Outer\\ editor\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    // -------------------------------------------------------------------------
    // Interaction with explicit ARIA roles
    // -------------------------------------------------------------------------
    describe("contenteditable combined with explicit ARIA roles", function() {

        it("Should prefer role='textbox' over contenteditable when both present", function() {
            // When an author adds role="textbox" explicitly, the textbox rule fires first
            // and the element is announced as "edit", not "editable section".
            let fixture = `<div id='fixture'>
                <div role='textbox' contenteditable='true' aria-label='ARIA textbox' tabindex='0'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["ARIA textbox", edit]`, "tab_focus": `["ARIA textbox", edit]`, "image": "", "selector": "#fixture > div[role=\"textbox\"][aria-label=\"ARIA\\ textbox\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should prefer role='textbox' multiline over contenteditable when both present", function() {
            let fixture = `<div id='fixture'>
                <div role='textbox' aria-multiline='true' contenteditable='true' aria-label='Multiline editor' tabindex='0'>Line one</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Multiline editor", edit, multiline] Line one`, "tab_focus": `["Multiline editor", edit, multiline] Line one`, "image": "", "selector": "#fixture > div[role=\"textbox\"][aria-label=\"Multiline\\ editor\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    // -------------------------------------------------------------------------
    // Non-div host elements
    // -------------------------------------------------------------------------
    describe("contenteditable on non-div elements", function() {

        it("Should announce a contenteditable paragraph as editable section", function() {
            let fixture = `<div id='fixture'>
                <p contenteditable='true' aria-label='Editable paragraph'>Paragraph text</p>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Editable paragraph", paragraph, editable] Paragraph text [out of paragraph]`, "tab_focus": `["Editable paragraph", paragraph, editable] Paragraph text`, "image": "", "selector": "#fixture > p[aria-label=\"Editable\\ paragraph\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce a contenteditable span as editable section", function() {
            let fixture = `<div id='fixture'>
                <p>Edit this: <span contenteditable='true' aria-label='Inline editor'>click me</span></p>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // The span is an inline element so the parent <p> carries the item row;
            // the span gets its own tab_focus row (it is tabbable via contenteditable).
            // tab_focus includes the label + appended textContent.
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `Edit this: ["Inline editor", section, editable] click me [out of section]`, "tab_focus": "", "image": "", "selector": "#fixture > p" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Inline editor", section, editable] click me`, "image": "", "selector": "#fixture > p > span[aria-label=\"Inline\\ editor\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with IBM Bob
