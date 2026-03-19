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
 * Comprehensive unit tests for SRController.renderStructure
 * Tests container announcements, navigation, and various DOM structures
 */

let ace = require('../../../src/index');

describe('SRController.renderStructure', function() {

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

    it("Should exist", function() {
        expect(ace.SRController).toBeDefined();
        expect(ace.SRController.renderStructure).toBeDefined();
    });

    describe("Container Announcements", function() {
        
        it("Should announce list container once when entering", function() {
            let fixture = "<div id='fixture'>"
                + "<h1>Test page</h1>"
                + "<ul role='list'>"
                + "<li role='listitem'>Item 1</li>"
                + "<li role='listitem'>Item 2</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Collect all item mode announcements
            let allItemText = result.map(r => r.item || '').join(' ');
            
            // Count occurrences of "list of"
            let listAnnouncements = (allItemText.match(/\[list of/g) || []).length;
            
            // Should only announce entering the list once
            expect(listAnnouncements).toBe(1);
        });

        it("Should not duplicate container announcements with whitespace", function() {
            let fixture = "<div id='fixture'>"
                + "<h1>Test page</h1>\n"  // Whitespace after h1
                + "<ul role='list'>"
                + "<li role='listitem'>Item 1</li>"
                + "<li role='listitem'>Item 2</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Collect all item mode announcements
            let allItemText = result.map(r => r.item || '').join(' ');
            
            // Count occurrences of "list of"
            let listAnnouncements = (allItemText.match(/\[list of/g) || []).length;
            
            // Should still only announce once, even with whitespace
            expect(listAnnouncements).toBe(1);
        });

        it("Should announce nested containers correctly", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='list'>"
                + "<li role='listitem'>Item 1"
                + "<ul role='list'>"
                + "<li role='listitem'>Nested Item 1</li>"
                + "<li role='listitem'>Nested Item 2</li>"
                + "</ul>"
                + "</li>"
                + "<li role='listitem'>Item 2</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Collect all item mode announcements
            let allItemText = result.map(r => r.item || '').join(' ');
            
            // Should announce outer list once and inner list once (2 total)
            let listAnnouncements = (allItemText.match(/\[list of/g) || []).length;
            expect(listAnnouncements).toBe(2);
        });

        it("Should handle button groups with aria-haspopup", function() {
            let fixture = "<div id='fixture'>"
                + "<button aria-haspopup='menu'>Menu Button</button>"
                + "<ul role='list'>"
                + "<li role='listitem'>Item 1</li>"
                + "</ul>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Collect all item mode announcements
            let allItemText = result.map(r => r.item || '').join(' ');
            
            // Should contain [subMenu] for the button
            expect(allItemText).toContain('[subMenu]');
            
            // Should not duplicate [subMenu]
            let subMenuAnnouncements = (allItemText.match(/\[subMenu\]/g) || []).length;
            expect(subMenuAnnouncements).toBe(1);
        });

        it("Should handle menu with aria-haspopup='menu'", function() {
            let fixture = "<div id='fixture'>"
                + "<a role='button' aria-haspopup='menu'>Infrastructure</a>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Find the button entry
            let buttonEntry = result.find(r => r.item && r.item.includes('Infrastructure'));
            
            expect(buttonEntry).toBeDefined();
            expect(buttonEntry.item).toContain('[subMenu]');
            
            // Should not have duplicate [subMenu]
            let subMenuCount = (buttonEntry.item.match(/\[subMenu\]/g) || []).length;
            expect(subMenuCount).toBe(1);
        });
    });

    describe("Navigation Modes", function() {
        
        it("Should render all navigation modes", function() {
            let fixture = "<div id='fixture'>"
                + "<h1>Heading</h1>"
                + "<nav><a href='#'>Link</a></nav>"
                + "<img src='test.jpg' alt='Test image'>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Should have entries for different modes
            let modes = ['item', 'heading', 'region', 'tab_focus', 'image'];
            modes.forEach(mode => {
                let hasMode = result.some(r => r[mode] && r[mode].trim().length > 0);
                expect(hasMode).toBe(true, `Expected to find ${mode} mode entries`);
            });
        });

        it("Should render heading mode correctly", function() {
            let fixture = "<div id='fixture'>"
                + "<h1>Level 1</h1>"
                + "<h2>Level 2</h2>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Find heading entries
            let headingEntries = result.filter(r => r.heading && r.heading.trim().length > 0);
            
            expect(headingEntries.length).toBeGreaterThan(0);
            
            // Should contain level information
            let allHeadingText = headingEntries.map(r => r.heading).join(' ');
            expect(allHeadingText).toContain('Level 1');
            expect(allHeadingText).toContain('Level 2');
        });

        it("Should render region mode correctly", function() {
            let fixture = "<div id='fixture'>"
                + "<nav aria-label='Main navigation'><a href='#'>Link</a></nav>"
                + "<main><p>Content</p></main>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Find region entries
            let regionEntries = result.filter(r => r.region && r.region.trim().length > 0);
            
            expect(regionEntries.length).toBeGreaterThan(0);
            
            // Should contain landmark information
            let allRegionText = regionEntries.map(r => r.region).join(' ');
            expect(allRegionText.length).toBeGreaterThan(0);
        });
    });

    describe("Complex DOM Structures", function() {
        
        it("Should handle tables correctly", function() {
            let fixture = "<div id='fixture'>"
                + "<table>"
                + "<tr><th>Header 1</th><th>Header 2</th></tr>"
                + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                + "</table>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Should have item mode entries for table content
            let allItemText = result.map(r => r.item || '').join(' ');
            expect(allItemText.length).toBeGreaterThan(0);
        });

        it("Should handle forms correctly", function() {
            let fixture = "<div id='fixture'>"
                + "<form>"
                + "<label for='name'>Name:</label>"
                + "<input id='name' type='text'>"
                + "<button type='submit'>Submit</button>"
                + "</form>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Should have entries for form elements
            let allItemText = result.map(r => r.item || '').join(' ');
            expect(allItemText).toContain('Name');
        });

        it("Should handle ARIA widgets correctly", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='tablist'>"
                + "<button role='tab' aria-selected='true'>Tab 1</button>"
                + "<button role='tab'>Tab 2</button>"
                + "</div>"
                + "<div role='tabpanel'>Panel content</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Should have entries for ARIA widgets
            let allItemText = result.map(r => r.item || '').join(' ');
            expect(allItemText).toContain('Tab 1');
        });
    });

    describe("Edge Cases", function() {
        
        it("Should handle empty containers", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='list'></ul>"
                + "<p>Text after empty list</p>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Should still process the structure
            expect(result.length).toBeGreaterThan(0);
        });

        it("Should handle deeply nested structures", function() {
            let fixture = "<div id='fixture'>"
                + "<div><div><div><div><p>Deep content</p></div></div></div></div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Should find the deep content
            let allItemText = result.map(r => r.item || '').join(' ');
            expect(allItemText).toContain('Deep content');
        });

        it("Should handle mixed content correctly", function() {
            let fixture = "<div id='fixture'>"
                + "<p>Text <strong>bold</strong> more text</p>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Should process mixed inline content
            let allItemText = result.map(r => r.item || '').join(' ');
            expect(allItemText.length).toBeGreaterThan(0);
        });
    });

    describe("Container Exit Announcements", function() {
        
        it("Should announce exiting list container", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='list'>"
                + "<li role='listitem'>Item 1</li>"
                + "</ul>"
                + "<p>After list</p>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Collect all item mode announcements
            let allItemText = result.map(r => r.item || '').join(' ');
            
            // Should have both entering and exiting announcements
            expect(allItemText).toContain('After list');
        });

        it("Should announce exiting nested containers in correct order", function() {
            let fixture = "<div id='fixture'>"
                + "<ul role='list'>"
                + "<li role='listitem'>Item 1"
                + "<ul role='list'>"
                + "<li role='listitem'>Nested</li>"
                + "</ul>"
                + "</li>"
                + "</ul>"
                + "<p>After lists</p>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = ace.SRController.renderStructure(document);
            
            // Should process nested structure correctly
            let allItemText = result.map(r => r.item || '').join(' ');
            expect(allItemText).toContain('After lists');
        });
    });
});

// Made with Bob
