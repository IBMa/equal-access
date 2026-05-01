/******************************************************************************
    Copyright:: 2020- IBM, Inc

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
 * Comprehensive unit tests for Tree component screen reader rendering
 * Tests tree announcements, selection states, and nested tree structures
 */

let ace = require('../../../src/index');

describe('Tree Component Screen Reader Tests', function() {

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

    describe("Basic Tree - No Selection", function() {
        
        it("Should render tree with no selection - all items rendered", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem'>Quick check deposits</li>"
                + "<li role='treeitem'>Free wire transfers</li>"
                + "<li role='treeitem'>Human monitored phone service</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, 1 of 3] Quick check deposits", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, 2 of 3] Free wire transfers", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[treeview item, 3 of 3] Human monitored phone service", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Tree with First Item Selected", function() {
        
        it("Should render tree with first item selected and tabindex", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem' aria-selected='true' tabindex='0'>Quick check deposits</li>"
                + "<li role='treeitem'>Free wire transfers</li>"
                + "<li role='treeitem'>Human monitored phone service</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, selected, 1 of 3] Quick check deposits", "tab_focus": "[treeview item, selected, 1 of 3] Quick check deposits", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, 2 of 3] Free wire transfers", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[treeview item, 3 of 3] Human monitored phone service", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Tree with Second Item Selected", function() {
        
        it("Should render tree with second item selected and tabindex", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem'>Quick check deposits</li>"
                + "<li role='treeitem' aria-selected='true' tabindex='0'>Free wire transfers</li>"
                + "<li role='treeitem'>Human monitored phone service</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, 1 of 3] Quick check deposits", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, selected, 2 of 3] Free wire transfers", "tab_focus": "[treeview item, selected, 2 of 3] Free wire transfers", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[treeview item, 3 of 3] Human monitored phone service", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Tree with Multiple Items Selected", function() {
        
        it("Should render tree with first and second items selected", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem' aria-selected='true' tabindex='0'>Quick check deposits</li>"
                + "<li role='treeitem' aria-selected='true' tabindex='0'>Free wire transfers</li>"
                + "<li role='treeitem'>Human monitored phone service</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, selected, 1 of 3] Quick check deposits", "tab_focus": "[treeview item, selected, 1 of 3] Quick check deposits", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, selected, 2 of 3] Free wire transfers", "tab_focus": "[treeview item, selected, 2 of 3] Free wire transfers", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[treeview item, 3 of 3] Human monitored phone service", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Two-Level Tree - No Selection", function() {
        
        it("Should render two-level tree with expanded parent", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem' aria-expanded='true'>Banking Services"
                + "<ul role='group'>"
                + "<li role='treeitem'>Quick check deposits</li>"
                + "<li role='treeitem'>Free wire transfers</li>"
                + "</ul>"
                + "</li>"
                + "<li role='treeitem'>Customer Support"
                + "<ul role='group'>"
                + "<li role='treeitem'>Human monitored phone service</li>"
                + "<li role='treeitem'>24/7 chat support</li>"
                + "</ul>"
                + "</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, expanded, 1 of 2] Banking Services", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, level 2, 1 of 2] Quick check deposits", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, level 2, 2 of 2] Free wire transfers", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[treeview item, 2 of 2] Customer Support", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[treeview item, level 2, 1 of 2] Human monitored phone service", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2) > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, level 2, 2 of 2] 24/7 chat support", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(2) > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render two-level tree with collapsed parent", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem' aria-expanded='false'>Banking Services"
                + "<ul role='group'>"
                + "<li role='treeitem'>Quick check deposits</li>"
                + "</ul>"
                + "</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, collapsed, 1 of 1] Banking Services", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]" },
                { "region": "", "heading": "", "item": "[treeview item, level 2, 1 of 1] Quick check deposits", "tab_focus": "", "image": "", "selector": "#fixture > ul > li > ul > li[role=\"treeitem\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Two-Level Tree - With Selection", function() {
        
        it("Should render two-level tree with parent selected", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem' aria-expanded='true' aria-selected='true' tabindex='0'>Banking Services"
                + "<ul role='group'>"
                + "<li role='treeitem'>Quick check deposits</li>"
                + "<li role='treeitem'>Free wire transfers</li>"
                + "</ul>"
                + "</li>"
                + "<li role='treeitem'>Customer Support</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, selected, expanded, 1 of 2] Banking Services", "tab_focus": "[treeview item, selected, expanded, 1 of 2] Banking Services", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, level 2, 1 of 2] Quick check deposits", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, level 2, 2 of 2] Free wire transfers", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[treeview item, 2 of 2] Customer Support", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render two-level tree with child selected", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem' aria-expanded='true'>Banking Services"
                + "<ul role='group'>"
                + "<li role='treeitem' aria-selected='true' tabindex='0'>Quick check deposits</li>"
                + "<li role='treeitem'>Free wire transfers</li>"
                + "</ul>"
                + "</li>"
                + "<li role='treeitem'>Customer Support</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, expanded, 1 of 2] Banking Services", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, selected, level 2, 1 of 2] Quick check deposits", "tab_focus": "[treeview item, selected, level 2, 1 of 2] Quick check deposits", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, level 2, 2 of 2] Free wire transfers", "tab_focus": "", "image": "", "selector": "#fixture > ul > li:nth-of-type(1) > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[treeview item, 2 of 2] Customer Support", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render nested tree with proper level indication", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem' aria-expanded='true' aria-level='1'>Level 1"
                + "<ul role='group'>"
                + "<li role='treeitem' aria-expanded='true' aria-level='2'>Level 2"
                + "<ul role='group'>"
                + "<li role='treeitem' aria-selected='true' tabindex='0' aria-level='3'>Level 3 Item</li>"
                + "</ul>"
                + "</li>"
                + "</ul>"
                + "</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, expanded, level 1, 1 of 1] Level 1", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]" },
                { "region": "", "heading": "", "item": "[treeview item, expanded, level 2, 1 of 1] Level 2", "tab_focus": "", "image": "", "selector": "#fixture > ul > li > ul > li[role=\"treeitem\"]" },
                { "region": "", "heading": "", "item": "[treeview item, selected, level 3, 1 of 1] Level 3 Item", "tab_focus": "[treeview item, selected, level 3, 1 of 1] Level 3 Item", "image": "", "selector": "#fixture > ul > li > ul > li > ul > li[role=\"treeitem\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Tree Edge Cases", function() {
        
        it("Should handle tree with single item", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem'>Single item</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, 1 of 1] Single item", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle tree with aria-setsize and aria-posinset", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='tree'>"
                + "<li role='treeitem' aria-posinset='1' aria-setsize='5' aria-selected='true' tabindex='0'>Item 1</li>"
                + "<li role='treeitem' aria-posinset='2' aria-setsize='5'>Item 2</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            expect(result).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[treeview item, selected, 1 of 5] Item 1", "tab_focus": "[treeview item, selected, 1 of 5] Item 1", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[treeview item, 2 of 5] Item 2", "tab_focus": "", "image": "", "selector": "#fixture > ul > li[role=\"treeitem\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob
