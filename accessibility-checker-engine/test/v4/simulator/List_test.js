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
 * Comprehensive unit tests for List component screen reader rendering
 * Tests ordered lists, unordered lists, description lists, and explicit list roles
 */

let ace = require('../../../src/index');

// Helper function to trim item fields in results
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim()
    }));
}

describe('List Component Screen Reader Tests', function() {

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

    describe("Unordered List", function() {
        
        it("Should render basic unordered list", function() {
            let fixture = "<div id='fixture'>"
                + "<ul>"
                + "<li>First item</li>"
                + "<li>Second item</li>"
                + "<li>Third item</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 3 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul" },
                { "region": "", "heading": "", "item": "[bullet] First item", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] Second item", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[bullet] Third item", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render unordered list with single item", function() {
            let fixture = "<div id='fixture'>"
                + "<ul>"
                + "<li>Only item</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 1 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul" },
                { "region": "", "heading": "", "item": "[bullet] Only item", "tab_focus": "", "image": "", "selector": "#fixture > ul > li" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render unordered list with aria-label", function() {
            let fixture = "<div id='fixture'>"
                + "<ul aria-label='Shopping list'>"
                + "<li>Apples</li>"
                + "<li>Bananas</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[\"Shopping list\", list of 2 items]", "tab_focus": "", "image": "", "selector": `#fixture > ul[aria-label="Shopping\\ list"]` },
                { "region": "", "heading": "", "item": "[bullet] Apples", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] Bananas", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": `["Shopping list", out of list] [End of document]`, "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Ordered List", function() {
        
        it("Should render basic ordered list", function() {
            let fixture = "<div id='fixture'>"
                + "<ol>"
                + "<li>Step one</li>"
                + "<li>Step two</li>"
                + "<li>Step three</li>"
                + "</ol>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 3 items]", "tab_focus": "", "image": "", "selector": "#fixture > ol" },
                { "region": "", "heading": "", "item": "1. Step one", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "2. Step two", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "3. Step three", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render ordered list with start attribute", function() {
            let fixture = "<div id='fixture'>"
                + "<ol start='5'>"
                + "<li>Fifth item</li>"
                + "<li>Sixth item</li>"
                + "</ol>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > ol" },
                { "region": "", "heading": "", "item": "5. Fifth item", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "6. Sixth item", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Description List", function() {
        
        it("Should render basic description list", function() {
            let fixture = `<div id='fixture'>
                <dl>
                    <dt>Term 1</dt>
                    <dd>Definition 1</dd>
                    <dt>Term 2</dt>
                    <dd>Definition 2</dd>
                </dl>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            // JAWS and NVDA do not announce terms and definitions
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[definition list of 2 terms]", "tab_focus": "", "image": "", "selector": "#fixture > dl" },
                { "region": "", "heading": "", "item": "Term 1", "tab_focus": "", "image": "", "selector": "#fixture > dl > dt:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "Definition 1", "tab_focus": "", "image": "", "selector": "#fixture > dl > dd:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "Term 2", "tab_focus": "", "image": "", "selector": "#fixture > dl > dt:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "Definition 2", "tab_focus": "", "image": "", "selector": "#fixture > dl > dd:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of definition list]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render description list with multiple definitions", function() {
            let fixture = `<div id='fixture'>
                <dl>
                    <dt>Color</dt>
                    <dd>Red</dd>
                    <dd>Blue</dd>
                    <dd>Green</dd>
                </dl>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[definition list of 1 terms]", "tab_focus": "", "image": "", "selector": "#fixture > dl" },
                { "region": "", "heading": "", "item": "Color", "tab_focus": "", "image": "", "selector": "#fixture > dl > dt" },
                { "region": "", "heading": "", "item": "Red", "tab_focus": "", "image": "", "selector": "#fixture > dl > dd:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "Blue", "tab_focus": "", "image": "", "selector": "#fixture > dl > dd:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "Green", "tab_focus": "", "image": "", "selector": "#fixture > dl > dd:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[out of definition list]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit List Role", function() {
        
        it("Should render div with role='list'", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='list'>"
                + "<div role='listitem'>Custom item 1</div>"
                + "<div role='listitem'>Custom item 2</div>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"list\"]" },
                { "region": "", "heading": "", "item": "Custom item 1", "tab_focus": "", "image": "", "selector": "#fixture > div > div[role=\"listitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "Custom item 2", "tab_focus": "", "image": "", "selector": "#fixture > div > div[role=\"listitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render list with aria-setsize and aria-posinset", function() {
            let fixture = `<div id='fixture'>
                <div role='list'>
                    <div role='listitem' aria-setsize='5' aria-posinset='1'>Item 1 of 5</div>
                    <div role='listitem' aria-setsize='5' aria-posinset='2'>Item 2 of 5</div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            // In item mode, neither JAWS nor NVDA announce [listitem, 1 of 5] or [listitem, 2 of 5]
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"list\"]" },
                { "region": "", "heading": "", "item": "Item 1 of 5", "tab_focus": "", "image": "", "selector": "#fixture > div > div[role=\"listitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "Item 2 of 5", "tab_focus": "", "image": "", "selector": "#fixture > div > div[role=\"listitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of list]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Nested Lists", function() {
        
        it("Should render nested unordered lists", function() {
            let fixture = "<div id='fixture'>"
                + "<ul>"
                + "<li>Parent item 1"
                + "<ul>"
                + "<li>Child item 1.1</li>"
                + "<li>Child item 1.2</li>"
                + "</ul>"
                + "</li>"
                + "<li>Parent item 2</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul" },
                { "region": "", "heading": "", "item": "[bullet] Parent item 1", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul" },
                { "region": "", "heading": "", "item": "[bullet] Child item 1.1", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] Child item 1.2", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of list] [bullet] Parent item 2", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render mixed ordered and unordered nested lists", function() {
            let fixture = "<div id='fixture'>"
                + "<ol>"
                + "<li>Step 1"
                + "<ul>"
                + "<li>Note A</li>"
                + "<li>Note B</li>"
                + "</ul>"
                + "</li>"
                + "<li>Step 2</li>"
                + "</ol>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > ol" },
                { "region": "", "heading": "", "item": "1. Step 1", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(1) > ul" },
                { "region": "", "heading": "", "item": "[bullet] Note A", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(1) > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] Note B", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(1) > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of list] 2. Step 2", "tab_focus": "", "image": "", "selector": "#fixture > ol > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("List Items with Interactive Content", function() {
        
        it("Should render list items with links", function() {
            let fixture = "<div id='fixture'>"
                + "<ul>"
                + "<li><a href='/page1'>Page 1</a></li>"
                + "<li><a href='/page2'>Page 2</a></li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul" },
                { "region": "", "heading": "", "item": "[bullet] [link] Page 1", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Page 1 [link]", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > a" },
                { "region": "", "heading": "", "item": "[bullet] [link] Page 2", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Page 2 [link]", "image": "", "selector": "#fixture > ul > li:nth-of-type(2) > a" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render list items with checkboxes", function() {
            let fixture = "<div id='fixture'>"
                + "<ul>"
                + "<li><input type='checkbox' id='task1'> <label for='task1'>Task 1</label></li>"
                + "<li><input type='checkbox' id='task2' checked> <label for='task2'>Task 2</label></li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul" },
                { "region": "", "heading": "", "item": `[bullet] [checkbox, not checked, "Task 1"]`, "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, not checked, "Task 1"]`, "image": "", "selector": "#task1" },
                { "region": "", "heading": "", "item": `[bullet] [checkbox, checked, "Task 2"]`, "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `[checkbox, checked, "Task 2"]`, "image": "", "selector": "#task2" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("List Edge Cases", function() {
        
        it("Should render empty list", function() {
            let fixture = "<div id='fixture'>"
                + "<ul></ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            // JAWS and NVDA do not announce empty lists
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render list with empty list items", function() {
            let fixture = "<div id='fixture'>"
                + "<ul>"
                + "<li></li>"
                + "<li>Content</li>"
                + "<li></li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[list of 3 items]", "tab_focus": "", "image": "", "selector": "#fixture > ul" },
                { "region": "", "heading": "", "item": "[bullet]", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] Content", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[bullet]", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[out of list] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render list with presentation role (removes list semantics)", function() {
            let fixture = `<div id='fixture'>
                <ul role='presentation'>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            // The list has no presentation, but the li still renders a bullet, which is read
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[bullet] Item 1", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] Item 2", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob