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
 * Comprehensive unit tests for the <details>/<summary> disclosure widget
 * screen reader rendering.
 *
 * Rendering model:
 *  - <details> (role=group) emits [button, collapsed] or [button, expanded] in
 *    item mode to announce the widget boundary.  It is NOT a tab stop.
 *  - <summary> (first child of <details>) renders as
 *    ["label", button, collapsed/expanded] in both item and tab_focus — it is
 *    the focusable disclosure button.
 *  - Non-summary children of a CLOSED <details> are hidden from the AT
 *    (browsers apply display:none via UA stylesheet); they are skipped.
 *  - Non-summary children of an OPEN <details> are fully readable.
 *  - No "out of grouping" is announced when leaving a <details>.
 */

let ace = require('../../../src/index');

// Helper: trim whitespace from item/region fields
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim(),
        region: item.region.trim(),
        tab_focus: item.tab_focus.trim()
    }));
}

describe('Details/Summary Disclosure Widget Screen Reader Tests', function() {

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

    // ------------------------------------------------------------------ //
    //  Collapsed state (no "open" attribute)
    // ------------------------------------------------------------------ //
    describe('Collapsed details (no "open" attribute)', function() {

        it('Should announce collapsed state with summary text and skip hidden body content', function() {
            let fixture = `<div id='fixture'>
                <details id='d1'>
                    <summary>More information</summary>
                    <p>Hidden content</p>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]",                          "tab_focus": "",                              "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["More information", button, collapsed]`,       "tab_focus": `["More information", button, collapsed]`, "image": "", "selector": "#d1 > summary" },
                { "region": "", "heading": "", "item": "[End of document]",                            "tab_focus": "",                              "image": "" }
            ]);
        });

        it('Should handle details without an explicit summary', function() {
            // jsdom does not inject a UA-default <summary>, so there is no
            // summary item.  The details container announcement still appears.
            let fixture = `<div id='fixture'>
                <details id='d2'>
                    <p>No explicit summary</p>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]",           "tab_focus": "",                              "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Details", button, collapsed]`, "tab_focus": `["Details", button, collapsed]`, "image": "", "selector": "#d2" },
                { "region": "", "heading": "", "item": "[End of document]",             "tab_focus": "",                              "image": "" }
            ]);
        });
    });

    // ------------------------------------------------------------------ //
    //  Expanded state ("open" attribute present)
    // ------------------------------------------------------------------ //
    describe('Expanded details ("open" attribute)', function() {

        it('Should announce expanded state and expose inner paragraph content', function() {
            let fixture = `<div id='fixture'>
                <details id='d3' open>
                    <summary>Show details</summary>
                    <p id='detail-body'>Visible content</p>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]",                    "tab_focus": "",                           "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Show details", button, expanded]`,      "tab_focus": `["Show details", button, expanded]`, "image": "", "selector": "#d3 > summary" },
                { "region": "", "heading": "", "item": "Visible content",                        "tab_focus": "",                           "image": "", "selector": "#detail-body" },
                { "region": "", "heading": "", "item": "[End of document]",                      "tab_focus": "",                           "image": "" }
            ]);
        });

        it('Should expose heading inside open details', function() {
            let fixture = `<div id='fixture'>
                <details id='d4' open>
                    <summary>Expandable section</summary>
                    <h2 id='inner-heading'>Section Title</h2>
                    <p id='section-p'>Section content</p>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "",                              "item": "[Start of document]",                          "tab_focus": "",                                  "image": "", "selector": "body" },
                { "region": "", "heading": "",                              "item": `["Expandable section", button, expanded]`,       "tab_focus": `["Expandable section", button, expanded]`, "image": "", "selector": "#d4 > summary" },
                { "region": "", "heading": `["Section Title", heading level 2]`, "item": "[heading level 2] Section Title",           "tab_focus": "",                                  "image": "", "selector": "#inner-heading" },
                { "region": "", "heading": "",                              "item": "Section content",                               "tab_focus": "",                                  "image": "", "selector": "#section-p" },
                { "region": "", "heading": "",                              "item": "[End of document]",                             "tab_focus": "",                                  "image": "" }
            ]);
        });
    });

    // ------------------------------------------------------------------ //
    //  Summary label variations
    // ------------------------------------------------------------------ //
    describe('Summary element content variations', function() {

        it('Should derive the button name from inline markup inside summary', function() {
            let fixture = `<div id='fixture'>
                <details id='d5'>
                    <summary><strong>Bold</strong> summary</summary>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]",                     "tab_focus": "",                               "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Bold summary", button, collapsed]`,      "tab_focus": `["Bold summary", button, collapsed]`, "image": "", "selector": "#d5 > summary" },
                { "region": "", "heading": "", "item": "[End of document]",                       "tab_focus": "",                               "image": "" }
            ]);
        });

        it('Should use aria-label on summary as the button name', function() {
            let fixture = `<div id='fixture'>
                <details id='d6'>
                    <summary aria-label='Toggle FAQ answer'>FAQ question text</summary>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]",                                           "tab_focus": "",                                                         "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Toggle FAQ answer", button, collapsed, "FAQ question text"]`, "tab_focus": `["Toggle FAQ answer", button, collapsed, "FAQ question text"]`, "image": "", "selector": `#d6 > summary[aria-label="Toggle\\ FAQ\\ answer"]` },
                { "region": "", "heading": "", "item": "[End of document]",                                            "tab_focus": "",                                                         "image": "" }
            ]);
        });
    });

    // ------------------------------------------------------------------ //
    //  Multiple details widgets on the same page
    // ------------------------------------------------------------------ //
    describe('Multiple details widgets', function() {

        it('Should render two adjacent collapsed details independently', function() {
            let fixture = `<div id='fixture'>
                <details id='da'>
                    <summary>Section A</summary>
                    <p>Content A</p>
                </details>
                <details id='db'>
                    <summary>Section B</summary>
                    <p>Content B</p>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]",              "tab_focus": "",                         "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Section A", button, collapsed]`, "tab_focus": `["Section A", button, collapsed]`, "image": "", "selector": "#da > summary" },
                { "region": "", "heading": "", "item": `["Section B", button, collapsed]`, "tab_focus": `["Section B", button, collapsed]`, "image": "", "selector": "#db > summary" },
                { "region": "", "heading": "", "item": "[End of document]",                "tab_focus": "",                         "image": "" }
            ]);
        });

        it('Should render one collapsed and one expanded details correctly', function() {
            let fixture = `<div id='fixture'>
                <details id='dc'>
                    <summary>Collapsed</summary>
                    <p>Hidden</p>
                </details>
                <details id='dd' open>
                    <summary>Expanded</summary>
                    <p id='expanded-content'>Shown</p>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]",             "tab_focus": "",                        "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Collapsed", button, collapsed]`, "tab_focus": `["Collapsed", button, collapsed]`, "image": "", "selector": "#dc > summary" },
                { "region": "", "heading": "", "item": `["Expanded", button, expanded]`,  "tab_focus": `["Expanded", button, expanded]`, "image": "", "selector": "#dd > summary" },
                { "region": "", "heading": "", "item": "Shown",                           "tab_focus": "",                        "image": "", "selector": "#expanded-content" },
                { "region": "", "heading": "", "item": "[End of document]",               "tab_focus": "",                        "image": "" }
            ]);
        });
    });

    // ------------------------------------------------------------------ //
    //  Nested details
    // ------------------------------------------------------------------ //
    describe('Nested details', function() {

        it('Should render outer (open) and inner (collapsed) details independently', function() {
            let fixture = `<div id='fixture'>
                <details id='outer' open>
                    <summary>Outer summary</summary>
                    <details id='inner'>
                        <summary>Inner summary</summary>
                        <p>Inner content</p>
                    </details>
                </details>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]",               "tab_focus": "",                          "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Outer summary", button, expanded]`, "tab_focus": `["Outer summary", button, expanded]`, "image": "", "selector": "#outer > summary" },
                { "region": "", "heading": "", "item": `["Inner summary", button, collapsed]`, "tab_focus": `["Inner summary", button, collapsed]`, "image": "", "selector": "#inner > summary" },
                { "region": "", "heading": "", "item": "[End of document]",                 "tab_focus": "",                          "image": "" }
            ]);
        });
    });
});

// Made with IBM Bob
