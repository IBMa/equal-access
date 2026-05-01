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
 * Comprehensive unit tests for Navigation landmark screen reader rendering
 * Tests both implicit (<nav>) and explicit (role="navigation") navigation landmarks
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

describe('Navigation Landmark Screen Reader Tests', function() {

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

    describe("Implicit Navigation Role", function() {
        
        it("Should render basic nav element", function() {
            let fixture = "<div id='fixture'>"
                + "<nav>"
                + "<a href='/home'>Home</a>"
                + "<a href='/about'>About</a>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[navigation region] [link] Home", "heading": "", "item": "[navigation region] [link] Home", "tab_focus": "", "image": "", "selector": "#fixture > nav" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav > a:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[link] About", "tab_focus": "About \[link\]", "image": "", "selector": "#fixture > nav > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render nav with aria-label", function() {
            let fixture = "<div id='fixture'>"
                + "<nav aria-label='Main navigation'>"
                + "<a href='/home'>Home</a>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Main navigation", navigation region]`, "heading": "", "item": `["Main navigation", navigation region] [link] Home`, "tab_focus": "", "image": "", "selector": `#fixture > nav[aria-label="Main\\ navigation"]` },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav > a" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render nav with aria-labelledby", function() {
            let fixture = "<div id='fixture'>"
                + "<h2 id='nav-heading'>Site Navigation</h2>"
                + "<nav aria-labelledby='nav-heading'>"
                + "<a href='/home'>Home</a>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Site Navigation", heading level 2]`, "item": "[heading level 2] Site Navigation", "tab_focus": "", "image": "", "selector": "#nav-heading" },
                { "region": `["Site Navigation", navigation region]`, "heading": "", "item": `["Site Navigation", navigation region] [link] Home`, "tab_focus": "", "image": "", "selector": "#fixture > nav" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav > a" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Navigation Role", function() {
        
        it("Should render div with role='navigation'", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='navigation'>"
                + "<a href='/home'>Home</a>"
                + "<a href='/about'>About</a>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[navigation region] [link] Home", "heading": "", "item": "[navigation region] [link] Home", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"navigation\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > div > a:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[link] About", "tab_focus": "About \[link\]", "image": "", "selector": "#fixture > div > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='navigation' and aria-label", function() {
            let fixture = "<div id='fixture'>"
                + "<div role='navigation' aria-label='Footer navigation'>"
                + "<a href='/privacy'>Privacy</a>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Footer navigation", navigation region]`, "heading": "", "item": `["Footer navigation", navigation region] [link] Privacy`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"navigation\"][aria-label=\"Footer\\ navigation\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Privacy \[link\]", "image": "", "selector": "#fixture > div > a" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Multiple Navigation Landmarks", function() {
        
        it("Should render multiple navigation landmarks with labels", function() {
            let fixture = "<div id='fixture'>"
                + "<nav aria-label='Primary'>"
                + "<a href='/home'>Home</a>"
                + "</nav>"
                + "<nav aria-label='Secondary'>"
                + "<a href='/help'>Help</a>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Primary", navigation region]`, "heading": "", "item": `["Primary", navigation region] [link] Home`, "tab_focus": "", "image": "", "selector": "#fixture > nav[aria-label=\"Primary\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav:nth-of-type(1) > a" },
                { "region": `["Secondary", navigation region]`, "heading": "", "item": `[out of navigation region] ["Secondary", navigation region] [link] Help`, "tab_focus": "", "image": "", "selector": "#fixture > nav[aria-label=\"Secondary\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Help \[link\]", "image": "", "selector": "#fixture > nav:nth-of-type(2) > a" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render multiple unlabeled navigation landmarks", function() {
            let fixture = "<div id='fixture'>"
                + "<nav>"
                + "<a href='/home'>Home</a>"
                + "</nav>"
                + "<nav>"
                + "<a href='/help'>Help</a>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[navigation region] [link] Home", "heading": "", "item": "[navigation region] [link] Home", "tab_focus": "", "image": "", "selector": "#fixture > nav:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav:nth-of-type(1) > a" },
                { "region": "[navigation region] [link] Help", "heading": "", "item": "[out of navigation region] [navigation region] [link] Help", "tab_focus": "", "image": "", "selector": "#fixture > nav:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Help \[link\]", "image": "", "selector": "#fixture > nav:nth-of-type(2) > a" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Navigation with Lists", function() {
        
        it("Should render navigation with unordered list", function() {
            let fixture = "<div id='fixture'>"
                + "<nav aria-label='Main menu'>"
                + "<ul>"
                + "<li><a href='/home'>Home</a></li>"
                + "<li><a href='/about'>About</a></li>"
                + "<li><a href='/contact'>Contact</a></li>"
                + "</ul>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Main menu", navigation region]`, "heading": "", "item": `["Main menu", navigation region]`, "tab_focus": "", "image": "", "selector": "#fixture > nav[aria-label=\"Main\\ menu\"]" },
                { "region": "", "heading": "", "item": "[list of 3 items]", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul" },
                { "region": "", "heading": "", "item": "[bullet] [link] Home", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav > ul > li:nth-of-type(1) > a" },
                { "region": "", "heading": "", "item": "[bullet] [link] About", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "About \[link\]", "image": "", "selector": "#fixture > nav > ul > li:nth-of-type(2) > a" },
                { "region": "", "heading": "", "item": "[bullet] [link] Contact", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul > li:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Contact \[link\]", "image": "", "selector": "#fixture > nav > ul > li:nth-of-type(3) > a" },
                { "region": "", "heading": "", "item": "[out of list] [out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render navigation with nested lists", function() {
            let fixture = "<div id='fixture'>"
                + "<nav>"
                + "<ul>"
                + "<li><a href='/products'>Products</a>"
                + "<ul>"
                + "<li><a href='/products/software'>Software</a></li>"
                + "<li><a href='/products/hardware'>Hardware</a></li>"
                + "</ul>"
                + "</li>"
                + "</ul>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[navigation region] [link] Products", "heading": "", "item": "[navigation region]", "tab_focus": "", "image": "", "selector": "#fixture > nav" },
                { "region": "", "heading": "", "item": "[list of 1 items]", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul" },
                { "region": "", "heading": "", "item": "[bullet] [link] Products", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul > li" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Products \[link\]", "image": "", "selector": "#fixture > nav > ul > li > a" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul > li > ul" },
                { "region": "", "heading": "", "item": "[bullet] [link] Software", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul > li > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Software \[link\]", "image": "", "selector": "#fixture > nav > ul > li > ul > li:nth-of-type(1) > a" },
                { "region": "", "heading": "", "item": "[bullet] [link] Hardware", "tab_focus": "", "image": "", "selector": "#fixture > nav > ul > li > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Hardware \[link\]", "image": "", "selector": "#fixture > nav > ul > li > ul > li:nth-of-type(2) > a" },
                { "region": "", "heading": "", "item": "[out of list] [out of list] [out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Navigation with Headings", function() {
        
        it("Should render navigation with heading", function() {
            let fixture = "<div id='fixture'>"
                + "<nav>"
                + "<h2>Site Navigation</h2>"
                + "<a href='/home'>Home</a>"
                + "<a href='/about'>About</a>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[navigation region] Site Navigation", "heading": "", "item": "[navigation region]", "tab_focus": "", "image": "", "selector": "#fixture > nav" },
                { "region": "", "heading": `["Site Navigation", heading level 2]`, "item": "[heading level 2] Site Navigation", "tab_focus": "", "image": "", "selector": "#fixture > nav > h2" },
                { "region": "", "heading": "", "item": "[link] Home", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav > a:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[link] About", "tab_focus": "About \[link\]", "image": "", "selector": "#fixture > nav > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Navigation Edge Cases", function() {
        
        it("Should render empty navigation", function() {
            let fixture = "<div id='fixture'>"
                + "<nav aria-label='Empty nav'></nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Empty nav", navigation region]`, "heading": "", "item": `["Empty nav", navigation region]`, "tab_focus": "", "image": "", "selector": "#fixture > nav[aria-label=\"Empty\\ nav\"]" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render navigation with text content", function() {
            let fixture = "<div id='fixture'>"
                + "<nav>"
                + "Navigate to: <a href='/home'>Home</a> or <a href='/about'>About</a>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[navigation region] Navigate to:", "heading": "", "item": "[navigation region] Navigate to:", "tab_focus": "", "image": "", "selector": "#fixture > nav" },
                { "region": "", "heading": "", "item": "[link] Home", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav > a:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "or", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[link] About", "tab_focus": "About \[link\]", "image": "", "selector": "#fixture > nav > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render navigation with buttons", function() {
            let fixture = "<div id='fixture'>"
                + "<nav aria-label='Actions'>"
                + "<button>Save</button>"
                + "<button>Cancel</button>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Actions", navigation region]`, "heading": "", "item": `["Actions", navigation region] ["Save", button] ["Cancel", button]`, "tab_focus": "", "image": "", "selector": "#fixture > nav[aria-label=\"Actions\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Save", button]`, "image": "", "selector": "#fixture > nav > button:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Cancel", button]`, "image": "", "selector": "#fixture > nav > button:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render nested navigation landmarks", function() {
            let fixture = "<div id='fixture'>"
                + "<nav aria-label='Outer'>"
                + "<a href='/home'>Home</a>"
                + "<nav aria-label='Inner'>"
                + "<a href='/sub'>Sub</a>"
                + "</nav>"
                + "</nav>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Outer", navigation region]`, "heading": "", "item": `["Outer", navigation region] [link] Home`, "tab_focus": "", "image": "", "selector": "#fixture > nav[aria-label=\"Outer\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Home \[link\]", "image": "", "selector": "#fixture > nav > a" },
                { "region": `["Inner", navigation region]`, "heading": "", "item": `["Inner", navigation region] [link] Sub`, "tab_focus": "", "image": "", "selector": "#fixture > nav > nav[aria-label=\"Inner\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Sub \[link\]", "image": "", "selector": "#fixture > nav > nav > a" },
                { "region": "", "heading": "", "item": "[out of navigation region] [out of navigation region] [End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob