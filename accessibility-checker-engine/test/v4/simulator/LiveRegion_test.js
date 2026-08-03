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
 * Unit tests for Live Region dynamic announcement functionality
 * Tests that live regions properly announce content changes via addLiveListener
 * 
 * IMPORTANT: Live regions don't appear in normal navigation (renderStructure).
 * They only announce when content changes dynamically. These tests use
 * addLiveListener to verify that content changes trigger proper announcements.
 */

let ace = require('../../../src/index');

describe('Live Region Dynamic Announcement Tests', function() {

    afterEach(function() {
        // Disconnect the SRController to stop mutation observers
        if (ace.SRController.singleton) {
            let controller = ace.SRController.singleton;
            if (controller && controller.disconnect) {
                controller.disconnect();
            }
            ace.SRController.singleton = null;
        }
        
        // Clean up any fixtures
        let fixture = document.getElementById('fixture');
        if (fixture) {
            document.body.removeChild(fixture);
        }
    });

    describe("role='status' dynamic announcements", function() {
        
        it("Should announce content added to empty status", function(done) {
            let fixture = `<div id='fixture'>
                <div id='status' role='status'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Simulate dynamic content update
            setTimeout(() => {
                let statusDiv = document.getElementById('status');
                statusDiv.textContent = 'Upload complete';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).withContext('Should have received announcement').not.toBeNull();
                    expect(announcement).withContext('Should include content').toContain('Upload complete');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });

        it("Should announce text changes in status", function(done) {
            let fixture = `<div id='fixture'>
                <div id='status' role='status'>Connecting...</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Simulate text change
            setTimeout(() => {
                let statusDiv = document.getElementById('status');
                statusDiv.textContent = 'Connected';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('Connected');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });
    });

    describe("aria-live='polite' dynamic announcements", function() {
        
        it("Should announce content added to polite live region", function(done) {
            let fixture = `<div id='fixture'>
                <div id='live' aria-live='polite'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Simulate dynamic content update
            setTimeout(() => {
                let liveDiv = document.getElementById('live');
                liveDiv.textContent = '5 items in cart';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('5 items in cart');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });

        it("Should announce nested content added to live region", function(done) {
            let fixture = `<div id='fixture'>
                <div id='live' aria-live='polite'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Simulate adding nested content
            setTimeout(() => {
                let liveDiv = document.getElementById('live');
                let span = document.createElement('span');
                span.textContent = 'New notification';
                liveDiv.appendChild(span);
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('New notification');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });
    });

    describe("role='alert' dynamic announcements", function() {
        
        it("Should announce content added to alert", function(done) {
            let fixture = `<div id='fixture'>
                <div id='alert' role='alert'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Simulate dynamic content update
            setTimeout(() => {
                let alertDiv = document.getElementById('alert');
                alertDiv.textContent = 'Connection lost';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('Connection lost');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });
    });

    describe("aria-atomic behavior", function() {
        
        it("Should announce entire region with aria-atomic='true'", function(done) {
            let fixture = `<div id='fixture'>
                <div id='status' role='status' aria-atomic='true'>
                    <span>Step 1:</span>
                    <span id='progress'>In progress</span>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Change just the progress span
            setTimeout(() => {
                let progressSpan = document.getElementById('progress');
                progressSpan.textContent = 'Complete';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    // With aria-atomic="true", the entire region should be announced
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('Step 1:');
                    expect(announcement).toContain('Complete');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });

        it("Should announce only changed content with aria-atomic='false'", function(done) {
            let fixture = `<div id='fixture'>
                <div id='live' aria-live='polite' aria-atomic='false'>
                    <span>Existing content</span>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Add new content
            setTimeout(() => {
                let liveDiv = document.getElementById('live');
                let newSpan = document.createElement('span');
                newSpan.textContent = 'New content';
                liveDiv.appendChild(newSpan);
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    // Only the new content should be announced, not the existing content
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('New content');
                    expect(announcement).not.toContain('Existing content');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });
    });

    describe("aria-relevant behavior", function() {
        
        it("Should respect aria-relevant='additions' for log role", function(done) {
            let fixture = `<div id='fixture'>
                <div id='log' role='log'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Add a log entry
            setTimeout(() => {
                let logDiv = document.getElementById('log');
                let entry = document.createElement('div');
                entry.textContent = 'User logged in at 10:30 AM';
                logDiv.appendChild(entry);
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('User logged in at 10:30 AM');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });

        it("Should respect aria-relevant='removals' when content is removed", function(done) {
            // NOTE: Actual screen readers don't actually support removals
            let fixture = `<div id='fixture'>
                <div id='live' aria-live='polite' aria-relevant='removals'>
                    <div id='item'>Item to be removed</div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Remove the item
            setTimeout(() => {
                let item = document.getElementById('item');
                item.remove();
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('[removed]');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });
    });

    describe("aria-busy behavior", function() {
        
        it("Should not announce when aria-busy='true'", function(done) {
            let fixture = `<div id='fixture'>
                <div id='status' role='status' aria-busy='true'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Add content while busy
            setTimeout(() => {
                let statusDiv = document.getElementById('status');
                statusDiv.textContent = 'Loading...';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    // No announcement should be made while aria-busy="true"
                    expect(announcement).toBeNull();
                    
                    // Now set aria-busy="false" and update again
                    statusDiv.setAttribute('aria-busy', 'false');
                    statusDiv.textContent = 'Loading complete';
                    
                    // Wait for mutation observer to process
                    setTimeout(() => {
                        // Now the announcement should be made
                        expect(announcement).not.toBeNull();
                        expect(announcement).toContain('Loading complete');
                        
                        controller.removeLiveListener(listener);
                        done();
                    }, 200);
                }, 200);
            }, 50);
        });
    });

    describe("Multiple updates", function() {
        
        it("Should announce multiple updates in sequence", function(done) {
            let fixture = `<div id='fixture'>
                <div id='status' role='status'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcements = [];
            
            const listener = async (result) => {
                announcements.push(result);
            };
            controller.addLiveListener(listener);
            
            let statusDiv = document.getElementById('status');
            
            // First update
            setTimeout(() => {
                statusDiv.textContent = 'Processing...';
                
                // Second update
                setTimeout(() => {
                    statusDiv.textContent = 'Almost done...';
                    
                    // Third update
                    setTimeout(() => {
                        statusDiv.textContent = 'Complete!';
                        
                        // Wait for all mutations to process
                        setTimeout(() => {
                            expect(announcements.length).toBe(3);
                            expect(announcements[0]).toContain('Processing...');
                            expect(announcements[1]).toContain('Almost done...');
                            expect(announcements[2]).toContain('Complete!');
                            
                            controller.removeLiveListener(listener);
                            done();
                        }, 200);
                    }, 200);
                }, 200);
            }, 50);
        });
    });

    describe("Implicit live regions", function() {
        
        it("Should handle output element as implicit live region", function(done) {
            let fixture = `<div id='fixture'>
                <output id='result'></output>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Update the output
            setTimeout(() => {
                let output = document.getElementById('result');
                output.textContent = '42';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('42');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });

        it("Should announce progressbar role updates", function(done) {
            let fixture = `<div id='fixture'>
                <div id='progress' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'>0%</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Update progress
            setTimeout(() => {
                let progressDiv = document.getElementById('progress');
                progressDiv.setAttribute('aria-valuenow', '50');
                progressDiv.textContent = '50%';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('50');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });

        it("Should announce timer role updates", function(done) {
            let fixture = `<div id='fixture'>
                <div id='timer' role='timer'>5:00</div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Update timer
            setTimeout(() => {
                let timerDiv = document.getElementById('timer');
                timerDiv.textContent = '4:59';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('4:59');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });
    });

    describe("aria-live='assertive' behavior", function() {
        
        it("Should handle aria-live='assertive' with higher priority", function(done) {
            let fixture = `<div id='fixture'>
                <div id='assertive' aria-live='assertive'></div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let controller = ace.SRController.getController(document);
            let announcement = null;
            
            const listener = async (result) => {
                announcement = result;
            };
            controller.addLiveListener(listener);
            
            // Update assertive live region
            setTimeout(() => {
                let assertiveDiv = document.getElementById('assertive');
                assertiveDiv.textContent = 'Critical error occurred!';
                
                // Wait for mutation observer to process
                setTimeout(() => {
                    expect(announcement).not.toBeNull();
                    expect(announcement).toContain('Critical error occurred!');
                    
                    controller.removeLiveListener(listener);
                    done();
                }, 200);
            }, 50);
        });
    });
});

// Made with Bob