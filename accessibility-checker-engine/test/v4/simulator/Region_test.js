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
 * Comprehensive unit tests for Region landmark screen reader rendering
 * Tests both implicit (<section>) and explicit (role="region") region landmarks
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

describe('Region Landmark Screen Reader Tests', function() {

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

    describe("Implicit Region Role", function() {
        
        it("Should render section with aria-label as region", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Featured content'>
                        <p>This is featured content.</p>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Featured content", region]`, "heading": "", "item": `["Featured content", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Featured\\ content\"]" },
                { "region": "", "heading": "", "item": "This is featured content.", "tab_focus": "", "image": "", "selector": "#fixture > section > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render section with aria-labelledby as region", function() {
            let fixture = `
                <div id='fixture'>
                    <h2 id='section-title'>Important Section</h2>
                    <section aria-labelledby='section-title'>
                        <p>Section content here.</p>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Important Section", heading level 2]`, "item": "[heading level 2] Important Section", "tab_focus": "", "image": "", "selector": "#section-title" },
                { "region": `["Important Section", region]`, "heading": "", "item": `["Important Section", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section" },
                { "region": "", "heading": "", "item": "Section content here.", "tab_focus": "", "image": "", "selector": "#fixture > section > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should NOT render section without accessible name as region", function() {
            let fixture = `
                <div id='fixture'>
                    <section>
                        <p>This section has no accessible name.</p>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "This section has no accessible name.", "tab_focus": "", "image": "", "selector": "#fixture > section > p" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Region Role", function() {
        
        it("Should render div with role='region' and aria-label", function() {
            let fixture = `
                <div id='fixture'>
                    <div role='region' aria-label='Custom region'>
                        <p>Custom region content.</p>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Custom region", region]`, "heading": "", "item": `["Custom region", region]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"region\"][aria-label=\"Custom\\ region\"]" },
                { "region": "", "heading": "", "item": "Custom region content.", "tab_focus": "", "image": "", "selector": "#fixture > div > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render div with role='region' and aria-labelledby", function() {
            let fixture = `
                <div id='fixture'>
                    <h3 id='region-heading'>Region Title</h3>
                    <div role='region' aria-labelledby='region-heading'>
                        <p>Region content.</p>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": `["Region Title", heading level 3]`, "item": "[heading level 3] Region Title", "tab_focus": "", "image": "", "selector": "#region-heading" },
                { "region": `["Region Title", region]`, "heading": "", "item": `["Region Title", region]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"region\"]" },
                { "region": "", "heading": "", "item": "Region content.", "tab_focus": "", "image": "", "selector": "#fixture > div > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should NOT render div with role='region' without accessible name", function() {
            let fixture = `
                <div id='fixture'>
                    <div role='region'>
                        <p>Region without name.</p>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "Region without name.", "tab_focus": "", "image": "", "selector": "#fixture > div > p" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Multiple Region Landmarks", function() {
        
        it("Should render multiple regions with different labels", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='News'>
                        <p>Latest news.</p>
                    </section>
                    <section aria-label='Events'>
                        <p>Upcoming events.</p>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["News", region]`, "heading": "", "item": `["News", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"News\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "Latest news.", "tab_focus": "", "image": "", "selector": "#fixture > section:nth-of-type(1) > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": `["Events", region]`, "heading": "", "item": `["Events", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Events\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "Upcoming events.", "tab_focus": "", "image": "", "selector": "#fixture > section:nth-of-type(2) > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render multiple regions with same label", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Article'>
                        <p>First article.</p>
                    </section>
                    <section aria-label='Article'>
                        <p>Second article.</p>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Article", region]`, "heading": "", "item": `["Article", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Article\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "First article.", "tab_focus": "", "image": "", "selector": "#fixture > section:nth-of-type(1) > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": `["Article", region]`, "heading": "", "item": `["Article", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Article\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "Second article.", "tab_focus": "", "image": "", "selector": "#fixture > section:nth-of-type(2) > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Region with Headings", function() {
        
        it("Should render region with heading inside", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Product features'>
                        <h2>Features</h2>
                        <p>Feature description.</p>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Product features", region]`, "heading": "", "item": `["Product features", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Product\\ features\"]" },
                { "region": "", "heading": `["Features", heading level 2]`, "item": "[heading level 2] Features", "tab_focus": "", "image": "", "selector": "#fixture > section > h2" },
                { "region": "", "heading": "", "item": "Feature description.", "tab_focus": "", "image": "", "selector": "#fixture > section > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render region with multiple headings", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Documentation'>
                        <h2>Getting Started</h2>
                        <p>Introduction text.</p>
                        <h3>Installation</h3>
                        <p>Installation steps.</p>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Documentation", region]`, "heading": "", "item": `["Documentation", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Documentation\"]" },
                { "region": "", "heading": `["Getting Started", heading level 2]`, "item": "[heading level 2] Getting Started", "tab_focus": "", "image": "", "selector": "#fixture > section > h2" },
                { "region": "", "heading": "", "item": "Introduction text.", "tab_focus": "", "image": "", "selector": "#fixture > section > p:nth-of-type(1)" },
                { "region": "", "heading": `["Installation", heading level 3]`, "item": "[heading level 3] Installation", "tab_focus": "", "image": "", "selector": "#fixture > section > h3" },
                { "region": "", "heading": "", "item": "Installation steps.", "tab_focus": "", "image": "", "selector": "#fixture > section > p:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Region with Interactive Content", function() {
        
        it("Should render region with links", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Quick links'>
                        <a href='/docs'>Documentation</a>
                        <a href='/support'>Support</a>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Quick links", region]`, "heading": "", "item": `["Quick links", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Quick\\ links\"]" },
                { "region": "", "heading": "", "item": "[link] Documentation", "tab_focus": "Documentation [link]", "image": "", "selector": "#fixture > section > a:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[link] Support", "tab_focus": "Support [link]", "image": "", "selector": "#fixture > section > a:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render region with buttons", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Actions'>
                        <button>Edit</button>
                        <button>Delete</button>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Actions", region]`, "heading": "", "item": `["Actions", region] ["Edit", button] ["Delete", button]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Actions\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Edit", button]`, "image": "", "selector": "#fixture > section > button:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Delete", button]`, "image": "", "selector": "#fixture > section > button:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render region with form controls", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Search'>
                        <label for='search-input'>Search:</label>
                        <input type='text' id='search-input'>
                        <button>Go</button>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Search", region]`, "heading": "", "item": `["Search", region] ["Search:", edit] ["Go", button]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Search\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Search:", edit]`, "image": "", "selector": "#search-input" },
                { "region": "", "heading": "", "item": "", "tab_focus": `["Go", button]`, "image": "", "selector": "#fixture > section > button" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Region with Lists", function() {
        
        it("Should render region with list", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Features'>
                        <ul>
                            <li>Feature 1</li>
                            <li>Feature 2</li>
                            <li>Feature 3</li>
                        </ul>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Features", region]`, "heading": "", "item": `["Features", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Features\"]" },
                { "region": "", "heading": "", "item": "[list of 3 items]", "tab_focus": "", "image": "", "selector": "#fixture > section > ul" },
                { "region": "", "heading": "", "item": "[bullet] Feature 1", "tab_focus": "", "image": "", "selector": "#fixture > section > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] Feature 2", "tab_focus": "", "image": "", "selector": "#fixture > section > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[bullet] Feature 3", "tab_focus": "", "image": "", "selector": "#fixture > section > ul > li:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[out of list]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Nested Regions", function() {
        
        it("Should render nested regions", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Outer region'>
                        <p>Outer content.</p>
                        <section aria-label='Inner region'>
                            <p>Inner content.</p>
                        </section>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Outer region", region]`, "heading": "", "item": `["Outer region", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Outer\\ region\"]" },
                { "region": "", "heading": "", "item": "Outer content.", "tab_focus": "", "image": "", "selector": "#fixture > section > p" },
                { "region": `["Inner region", region]`, "heading": "", "item": `["Inner region", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section > section[aria-label=\"Inner\\ region\"]" },
                { "region": "", "heading": "", "item": "Inner content.", "tab_focus": "", "image": "", "selector": "#fixture > section > section > p" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Region Edge Cases", function() {
        
        it("Should render empty region", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Empty region'></section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Empty region", region]`, "heading": "", "item": `["Empty region", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Empty\\ region\"]" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render region with only whitespace", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Whitespace region'>   </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Whitespace region", region]`, "heading": "", "item": `["Whitespace region", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Whitespace\\ region\"]" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render region with complex content", function() {
            let fixture = `
                <div id='fixture'>
                    <section aria-label='Complex region'>
                        <h2>Title</h2>
                        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
                        <ul>
                            <li>Item 1</li>
                            <li>Item 2</li>
                        </ul>
                        <a href='/more'>Read more</a>
                    </section>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Complex region", region]`, "heading": "", "item": `["Complex region", region]`, "tab_focus": "", "image": "", "selector": "#fixture > section[aria-label=\"Complex\\ region\"]" },
                { "region": "", "heading": `["Title", heading level 2]`, "item": "[heading level 2] Title", "tab_focus": "", "image": "", "selector": "#fixture > section > h2" },
                { "region": "", "heading": "", "item": "Paragraph with bold and italic text.", "tab_focus": "", "image": "", "selector": "#fixture > section > p" },
                { "region": "", "heading": "", "item": "[list of 2 items]", "tab_focus": "", "image": "", "selector": "#fixture > section > ul" },
                { "region": "", "heading": "", "item": "[bullet] Item 1", "tab_focus": "", "image": "", "selector": "#fixture > section > ul > li:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[bullet] Item 2", "tab_focus": "", "image": "", "selector": "#fixture > section > ul > li:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of list]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[link] Read more", "tab_focus": "Read more [link]", "image": "", "selector": "#fixture > section > a" },
                { "region": "", "heading": "", "item": "[out of region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Header and Footer Landmarks", function() {
        
        it("Should render header landmark", function() {
            let fixture = `<div id='fixture'>
                <header>
                    <h1>Site Title</h1>
                    <nav aria-label='Main navigation'>
                        <a href='/'>Home</a>
                    </nav>
                </header>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[banner region] Site Title", "heading": "", "item": "[banner region]", "tab_focus": "", "image": "", "selector": "#fixture > header" },
                { "region": "", "heading": `["Site Title", heading level 1]`, "item": "[heading level 1] Site Title", "tab_focus": "", "image": "", "selector": "#fixture > header > h1" },
                { "region": `["Main navigation", navigation region]`, "heading": "", "item": `["Main navigation", navigation region]`, "tab_focus": "", "image": "", "selector": "#fixture > header > nav[aria-label=\"Main\\ navigation\"]" },
                { "region": "", "heading": "", "item": "[link] Home", "tab_focus": "Home [link]", "image": "", "selector": "#fixture > header > nav > a" },
                { "region": "", "heading": "", "item": "[out of navigation region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[out of banner region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render footer landmark", function() {
            let fixture = `<div id='fixture'>
                <footer>
                    <p>Copyright 2026</p>
                    <nav aria-label='Footer links'>
                        <a href='/privacy'>Privacy</a>
                    </nav>
                </footer>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "[content info region] Copyright 2026", "heading": "", "item": "[content info region]", "tab_focus": "", "image": "", "selector": "#fixture > footer" },
                { "region": "", "heading": "", "item": "Copyright 2026", "tab_focus": "", "image": "", "selector": "#fixture > footer > p" },
                { "region": `["Footer links", navigation region]`, "heading": "", "item": `["Footer links", navigation region]`, "tab_focus": "", "image": "", "selector": "#fixture > footer > nav[aria-label=\"Footer\\ links\"]" },
                { "region": "", "heading": "", "item": "[link] Privacy", "tab_focus": "Privacy [link]", "image": "", "selector": "#fixture > footer > nav > a" },
                { "region": "", "heading": "", "item": "[out of navigation region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[out of content info region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render header with aria-label", function() {
            let fixture = `<div id='fixture'>
                <header aria-label='Site header'>
                    <p>Welcome</p>
                </header>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Site header", banner region]`, "heading": "", "item": `["Site header", banner region]`, "tab_focus": "", "image": "", "selector": "#fixture > header[aria-label=\"Site\\ header\"]" },
                { "region": "", "heading": "", "item": "Welcome", "tab_focus": "", "image": "", "selector": "#fixture > header > p" },
                { "region": "", "heading": "", "item": "[out of banner region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render footer with aria-label", function() {
            let fixture = `<div id='fixture'>
                <footer aria-label='Site footer'>
                    <p>Contact us</p>
                </footer>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": `["Site footer", content info region]`, "heading": "", "item": `["Site footer", content info region]`, "tab_focus": "", "image": "", "selector": "#fixture > footer[aria-label=\"Site\\ footer\"]" },
                { "region": "", "heading": "", "item": "Contact us", "tab_focus": "", "image": "", "selector": "#fixture > footer > p" },
                { "region": "", "heading": "", "item": "[out of content info region]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should NOT render nested header as banner", function() {
            let fixture = `<div id='fixture'>
                <article>
                    <header>
                        <h2>Article Title</h2>
                    </header>
                </article>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[article]", "tab_focus": "", "image": "", "selector": "#fixture > article" },
                { "region": "", "heading": `["Article Title", heading level 2]`, "item": "[heading level 2] Article Title", "tab_focus": "", "image": "", "selector": "#fixture > article > header > h2" },
                { "region": "", "heading": "", "item": "[out of article]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should NOT render nested footer as contentinfo", function() {
            let fixture = `<div id='fixture'>
                <article>
                    <footer>
                        <p>Article footer</p>
                    </footer>
                </article>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[article]", "tab_focus": "", "image": "", "selector": "#fixture > article" },
                { "region": "", "heading": "", "item": "Article footer", "tab_focus": "", "image": "", "selector": "#fixture > article > footer > p" },
                { "region": "", "heading": "", "item": "[out of article]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob