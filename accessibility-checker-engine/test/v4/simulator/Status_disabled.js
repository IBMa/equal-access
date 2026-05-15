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
 * Comprehensive unit tests for Status role screen reader rendering
 * Tests status messages, live regions, and dynamic content announcements
 */

let ace = require('../../../src/index');

// Helper function to trim region fields in results
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim(),
        region: item.region.trim()
    }));
}

describe('Status Role Screen Reader Tests', function() {

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

    describe("Status Role", function() {
        
        it("Should render element with role='status'", function() {
            let fixture = `<div id='fixture'>
                <div role='status'>Operation completed successfully</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[status] Operation completed successfully", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"status\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render status with aria-label", function() {
            let fixture = `<div id='fixture'>
                <div role='status' aria-label='Loading status'>
                    <span>Loading...</span>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Loading status", status] Loading...`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"status\"][aria-label=\"Loading\\ status\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render empty status", function() {
            let fixture = `<div id='fixture'>
                <div role='status' aria-label='Status message'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["Status message", status]`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"status\"][aria-label=\"Status\\ message\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Live Regions - aria-live", function() {
        
        it("Should render aria-live='polite' region", function() {
            let fixture = `<div id='fixture'>
                <div aria-live='polite'>
                    <p>New message received</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[live region, polite] New message received", "tab_focus": "", "image": "", "selector": "#fixture > div[aria-live=\"polite\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render aria-live='assertive' region", function() {
            let fixture = `<div id='fixture'>
                <div aria-live='assertive'>
                    <p>Error: Action failed</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[live region, assertive] Error: Action failed", "tab_focus": "", "image": "", "selector": "#fixture > div[aria-live=\"assertive\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render aria-live='off' region (no announcement)", function() {
            let fixture = `<div id='fixture'>
                <div aria-live='off'>
                    <p>This should not be announced</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "This should not be announced", "tab_focus": "", "image": "", "selector": "#fixture > div > p" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Alert Role", function() {
        
        it("Should render role='alert'", function() {
            let fixture = `<div id='fixture'>
                <div role='alert'>Warning: Low disk space</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[alert] Warning: Low disk space", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"alert\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render alert with aria-label", function() {
            let fixture = `<div id='fixture'>
                <div role='alert' aria-label='System alert'>
                    <strong>Critical:</strong> System update required
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": `["System alert", alert] Critical: System update required`, "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"alert\"][aria-label=\"System\\ alert\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Dynamic Content Updates", function() {
        
        it("Should announce status message during dynamic update", function(done) {
            let fixture = `<div id='fixture'>
                <div id='status-msg' role='status' aria-live='polite'>Initial message</div>
                <button id='update-btn'>Update</button>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            // Get initial state
            let initialResult = trimItems(ace.SRController.renderStructure(document));
            
            expect(initialResult).withContext(JSON.stringify(initialResult, null, 2)).toContain(
                jasmine.objectContaining({
                    "item": "[status] Initial message"
                })
            );
            
            // Simulate dynamic update
            setTimeout(() => {
                let statusMsg = document.getElementById('status-msg');
                statusMsg.textContent = 'Updated message';
                
                // Check updated state
                let updatedResult = trimItems(ace.SRController.renderStructure(document));
                
                expect(updatedResult).withContext(JSON.stringify(updatedResult, null, 2)).toContain(
                    jasmine.objectContaining({
                        "item": "[status] Updated message"
                    })
                );
                
                done();
            }, 100);
        });

        it("Should announce alert during dynamic insertion", function(done) {
            let fixture = `<div id='fixture'>
                <div id='alert-container'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            // Simulate dynamic alert insertion
            setTimeout(() => {
                let container = document.getElementById('alert-container');
                container.innerHTML = '<div role="alert">New alert message</div>';
                
                // Check for alert
                let result = trimItems(ace.SRController.renderStructure(document));
                
                expect(result).withContext(JSON.stringify(result, null, 2)).toContain(
                    jasmine.objectContaining({
                        "item": "[alert] New alert message"
                    })
                );
                
                done();
            }, 100);
        });

        it("Should handle status message removal", function(done) {
            let fixture = `<div id='fixture'>
                <div id='temp-status' role='status'>Temporary message</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            // Get initial state
            let initialResult = trimItems(ace.SRController.renderStructure(document));
            
            expect(initialResult).withContext(JSON.stringify(initialResult, null, 2)).toContain(
                jasmine.objectContaining({
                    "item": "[status] Temporary message"
                })
            );
            
            // Remove status message
            setTimeout(() => {
                let statusMsg = document.getElementById('temp-status');
                statusMsg.remove();
                
                // Check that status is gone
                let updatedResult = trimItems(ace.SRController.renderStructure(document));
                
                expect(updatedResult).withContext(JSON.stringify(updatedResult, null, 2)).not.toContain(
                    jasmine.objectContaining({
                        "item": "[status] Temporary message"
                    })
                );
                
                done();
            }, 100);
        });
    });

    describe("aria-atomic", function() {
        
        it("Should render region with aria-atomic='true'", function() {
            let fixture = `<div id='fixture'>
                <div role='status' aria-atomic='true'>
                    <span>Part 1</span>
                    <span>Part 2</span>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[status, atomic] Part 1 Part 2", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"status\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render region with aria-atomic='false'", function() {
            let fixture = `<div id='fixture'>
                <div role='status' aria-atomic='false'>
                    <span>Part A</span>
                    <span>Part B</span>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[status] Part A Part B", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"status\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("aria-relevant", function() {
        
        it("Should render region with aria-relevant='additions'", function() {
            let fixture = `<div id='fixture'>
                <div role='log' aria-relevant='additions' aria-live='polite'>
                    <p>Log entry 1</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[log, live region, polite] Log entry 1", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"log\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render region with aria-relevant='all'", function() {
            let fixture = `<div id='fixture'>
                <div role='status' aria-relevant='all' aria-live='polite'>
                    <p>Status update</p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[status, live region, polite] Status update", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"status\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Status Edge Cases", function() {
        
        it("Should handle nested status regions", function() {
            let fixture = `<div id='fixture'>
                <div role='status'>
                    <p>Outer status</p>
                    <div role='status'>Inner status</div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[status] Outer status [status] Inner status", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"status\"]" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should handle status with interactive content", function() {
            let fixture = `<div id='fixture'>
                <div role='status'>
                    <p>Action completed. <a href='/details'>View details</a></p>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimItems(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[status] Action completed. [link] View details", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"status\"]" },
                { "region": "", "heading": "", "item": "", "tab_focus": "View details [link]", "image": "", "selector": "#fixture > div > p > a" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob