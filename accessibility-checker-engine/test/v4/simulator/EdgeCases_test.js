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
 * Edge case tests for screen reader simulator
 * Tests custom roles, tabindex, side panels, and other edge cases
 */

let ace = require('../../../src/index');

// Helper function to trim region fields in results
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim(),
        region: item.region.trim(),
        tab_focus: item.tab_focus.trim()
    }));
}

describe('Edge Cases Screen Reader Tests', function() {

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

    describe("Custom Role Descriptions (aria-roledescription)", function() {
        
        it("Should announce custom role description on button", function() {
            let fixture = `<div id='fixture'>
                <button aria-roledescription='save button'>Save Document</button>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Save Document", save button]`, "tab_focus": ``, "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": ``, "tab_focus": `["Save Document", save button]`, "image": "", "selector": "#fixture > button" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce custom role description on region", function() {
            let fixture = `<div id='fixture'>
                <div role='region' aria-label='Product features' aria-roledescription='feature panel'>
                    <p>Feature list</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Product features", feature panel]`, "heading": "", "item": `["Product features", feature panel]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"region\"][aria-label=\"Product\\ features\"]" },
                { "region": "", "heading": "", "item": "Feature list", "tab_focus": "", "image": "", "selector": "#fixture > div > p" },
                { "region": "", "heading": "", "item": "[out of feature panel]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce custom role description on article", function() {
            let fixture = `<div id='fixture'>
                <article aria-roledescription='blog post' aria-label='Latest news'>
                    <h2>News Title</h2>
                    <p>News content</p>
                </article>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Latest news", blog post]`, "tab_focus": "", "image": "", "selector": "#fixture > article[aria-label=\"Latest\\ news\"]" },
                { "region": "", "heading": `["News Title", heading level 2]`, "item": "[heading level 2] News Title", "tab_focus": "", "image": "", "selector": "#fixture > article > h2" },
                { "region": "", "heading": "", "item": "News content", "tab_focus": "", "image": "", "selector": "#fixture > article > p" },
                { "region": "", "heading": "", "item": "[out of blog post]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce custom role description on slider", function() {
            let fixture = `<div id='fixture'>
                <div role='slider'
                     aria-roledescription='temperature control'
                     aria-label='Room temperature'
                     aria-valuemin='60'
                     aria-valuemax='80'
                     aria-valuenow='72'
                     tabindex='0'>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Room temperature", temperature control, 72]`, "tab_focus": `["Room temperature", temperature control, 72]`, "image": "", "selector": "#fixture > div[role=\"slider\"][aria-label=\"Room\\ temperature\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should announce custom role description on navigation", function() {
            let fixture = `<div id='fixture'>
                <nav aria-roledescription='breadcrumb trail' aria-label='Breadcrumbs'>
                    <a href='#'>Home</a>
                    <a href='#'>Products</a>
                    <a href='#'>Details</a>
                </nav>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Breadcrumbs", breadcrumb trail]`, "heading": "", "item": `["Breadcrumbs", breadcrumb trail]`, "tab_focus": "", "image": "", "selector": "#fixture > nav[aria-label=\"Breadcrumbs\"]" },
                { "region": "", "heading": "", "item": `[same page link] Home`, "tab_focus": `Home [same page link]`, "image": "", "selector": "#fixture > nav > a:nth-of-type(1)" },
                { "region": "", "heading": "", "item": `[same page link] Products`, "tab_focus": `Products [same page link]`, "image": "", "selector": "#fixture > nav > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": `[same page link] Details`, "tab_focus": `Details [same page link]`, "image": "", "selector": "#fixture > nav > a:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[out of breadcrumb trail]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Tabindex Behavior", function() {
        
        it("Should render element with tabindex='0' in tab order", function() {
            let fixture = `<div id='fixture'>
                <div tabindex='0' role='button' aria-label='Custom button'>Click me</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Custom button", button]`, "tab_focus": `["Custom button", button]`, "image": "", "selector": "#fixture > div[role=\"button\"][aria-label=\"Custom\\ button\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should NOT render element with tabindex='-1' in tab order", function() {
            let fixture = `<div id='fixture'>
                <div tabindex='-1' role='button' aria-label='Not tabbable'>Not in tab order</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Not tabbable", button]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"button\"][aria-label=\"Not\\ tabbable\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render element with positive tabindex in custom tab order", function() {
            let fixture = `<div id='fixture'>
                <button tabindex='2'>Second</button>
                <button tabindex='1'>First</button>
                <button>Third</button>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Second", button] ["First", button] ["Third", button]`, "tab_focus": "", "image": "", "selector": "#fixture" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Second", button]`, "image": "", "selector": "#fixture > button:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["First", button]`, "image": "", "selector": "#fixture > button:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Third", button]`, "image": "", "selector": "#fixture > button:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with tabindex and role as focusable", function() {
            let fixture = `<div id='fixture'>
                <div tabindex='0' role='region' aria-label='Focusable region'>
                    <p>Content here</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Focusable region", region]`, "heading": "", "item": `["Focusable region", region]`, "tab_focus": `["Focusable region", region]`, "image": "", "selector": "#fixture > div[role=\"region\"][aria-label=\"Focusable\\ region\"]" },
                { "region": "", "heading": "", "item": "Content here", "tab_focus": "", "image": "", "selector": "#fixture > div > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Side Panel Information Persistence", function() {
        
        it("Should NOT show side panel info after panel is closed", function(done) {
            let fixture = `<div id='fixture'>
                <button id='open-panel'>Open Panel</button>
                <div id='side-panel' role='dialog' aria-label='Side panel' style='display:block;'>
                    <h2>Panel Title</h2>
                    <p>Panel content</p>
                    <button id='close-panel'>Close</button>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            // Get initial state with panel open
            let initialResult = trimItems(ace.SRController.renderStructure(document));
            
            expect(initialResult).withContext(JSON.stringify(initialResult, null, 2)).toContain(
                jasmine.objectContaining({
                    "item": jasmine.stringContaining("Side panel")
                })
            );
            
            // Close the panel
            setTimeout(() => {
                let panel = document.getElementById('side-panel');
                panel.style.display = 'none';
                panel.setAttribute('aria-hidden', 'true');
                
                // Check that panel info is not shown
                let updatedResult = trimItems(ace.SRController.renderStructure(document));
                
                // Panel should not be in the results
                let hasPanelInfo = updatedResult.some(item => 
                    item.item.includes('Side panel') || 
                    item.item.includes('Panel Title') ||
                    item.item.includes('Panel content')
                );
                
                expect(hasPanelInfo).withContext('Panel info should not be present after closing').toBe(false);
                
                done();
            }, 100);
        });

        it("Should handle panel with aria-hidden='true'", function() {
            let fixture = `<div id='fixture'>
                <button>Main content button</button>
                <div role='dialog' aria-label='Hidden panel' aria-hidden='true'>
                    <p>This should not be announced</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            // Hidden panel should not appear in results
            let hasHiddenContent = result.some(item => 
                item.item.includes('Hidden panel') || 
                item.item.includes('This should not be announced')
            );
            
            expect(hasHiddenContent).withContext('Hidden panel should not be in results').toBe(false);
        });

        it("Should handle panel with display:none", function() {
            let fixture = `<div id='fixture'>
                <button>Visible button</button>
                <div role='dialog' aria-label='Hidden dialog' style='display:none;'>
                    <p>Hidden content</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            // Hidden dialog should not appear in results
            let hasHiddenDialog = result.some(item => 
                item.item.includes('Hidden dialog') || 
                item.item.includes('Hidden content')
            );
            
            expect(hasHiddenDialog).withContext('Hidden dialog should not be in results').toBe(false);
        });

        it("Should handle panel with visibility:hidden", function() {
            let fixture = `<div id='fixture'>
                <button>Visible button</button>
                <div role='dialog' aria-label='Invisible panel' style='visibility:hidden;'>
                    <p>Invisible content</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            // Invisible panel should not appear in results
            let hasInvisiblePanel = result.some(item => 
                item.item.includes('Invisible panel') || 
                item.item.includes('Invisible content')
            );
            
            expect(hasInvisiblePanel).withContext('Invisible panel should not be in results').toBe(false);
        });

        it("Should show panel when reopened", function(done) {
            let fixture = `<div id='fixture'>
                <button id='toggle'>Toggle Panel</button>
                <div id='panel' role='dialog' aria-label='Toggleable panel' style='display:none;'>
                    <p>Panel content</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            // Initially hidden
            let initialResult = trimItems(ace.SRController.renderStructure(document));
            let initiallyHidden = !initialResult.some(item => item.item.includes('Toggleable panel'));
            
            expect(initiallyHidden).withContext('Panel should be initially hidden').toBe(true);
            
            // Show the panel
            setTimeout(() => {
                let panel = document.getElementById('panel');
                panel.style.display = 'block';
                panel.removeAttribute('aria-hidden');
                
                // Check that panel is now visible
                let updatedResult = trimItems(ace.SRController.renderStructure(document));
                
                expect(updatedResult).withContext(JSON.stringify(updatedResult, null, 2)).toContain(
                    jasmine.objectContaining({
                        "item": jasmine.stringContaining("Toggleable panel")
                    })
                );
                
                done();
            }, 100);
        });
    });

    describe("Complex Edge Cases", function() {
        
        it("Should handle element with multiple ARIA attributes", function() {
            let fixture = `<div id='fixture'>
                <div role='button' 
                     tabindex='0' 
                     aria-label='Complex button' 
                     aria-pressed='false' 
                     aria-describedby='desc'>
                    Button text
                </div>
                <span id='desc'>Additional description</span>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `[toggle button, not pressed, "Complex button", "Additional description"]`, "tab_focus": `[toggle button, not pressed, "Complex button", "Additional description"]`, "image": "", "selector": `#fixture > div[role="button"][aria-label="Complex\\ button"]` },
                { "region": "", "heading": "", "item": `Additional description`, "tab_focus": ``, "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle nested custom roles", function() {
            let fixture = `<div id='fixture'>
                <div role='main' aria-label='Main content'>
                    <div role='article' aria-label='Article 1'>
                        <h2>Article Title</h2>
                        <p>Article content</p>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Main content", main region]`, "heading": "", "item": `["Main content", main region]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"main\"][aria-label=\"Main\\ content\"]" },
                { "region": "", "heading": "", "item": `["Article 1", article]`, "tab_focus": "", "image": "", "selector": "#fixture > div > div[role=\"article\"][aria-label=\"Article\\ 1\"]" },
                { "region": "", "heading": `["Article Title", heading level 2]`, "item": "[heading level 2] Article Title", "tab_focus": "", "image": "", "selector": "#fixture > div > div > h2" },
                { "region": "", "heading": "", "item": "Article content", "tab_focus": "", "image": "", "selector": "#fixture > div > div > p" },
                { "region": "", "heading": "", "item": "[out of article]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[out of main region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob