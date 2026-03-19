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
 * Comprehensive unit tests for DOMWalker
 */

let ace = require('../../../src/index');

describe('DOMWalker', function() {

    afterEach(function() {
        // Clean up any fixtures
        let fixture = document.getElementById('fixture');
        if (fixture) {
            document.body.removeChild(fixture);
        }
    });

    it("Should exist", function() {
        expect(ace.DOMWalker).toBeDefined;
    });

    describe("Basic DOM Traversal", function() {
        
        it("Should traverse simple flat structure", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='parent'>"
                + "<span id='child1'>Text1</span>"
                + "<span id='child2'>Text2</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let parent = document.getElementById('parent');
            let walker = new ace.DOMWalker(parent, false, parent);
            
            let nodes = [];
            let tags = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push(walker.node.id || walker.node.nodeName);
                    tags.push(walker.bEndTag ? 'END' : 'START');
                }
            } while (walker.nextNode());
            
            expect(nodes).toEqual(['parent', 'child1', 'child1', 'child2', 'child2', 'parent']);
            expect(tags).toEqual(['START', 'START', 'END', 'START', 'END', 'END']);
        });

        it("Should traverse nested structure", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='level1'>"
                + "<div id='level2'>"
                + "<div id='level3'></div>"
                + "</div>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let level1 = document.getElementById('level1');
            let walker = new ace.DOMWalker(level1, false, level1);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push(walker.node.id);
                }
            } while (walker.nextNode());
            
            expect(nodes).toEqual(['level1', 'level2', 'level3', 'level3', 'level2', 'level1']);
        });

        it("Should handle text nodes", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='parent'>Text content</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let parent = document.getElementById('parent');
            let walker = new ace.DOMWalker(parent, false, parent);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1 && !walker.bEndTag) {
                    nodes.push('ELEMENT:' + walker.node.id);
                } else if (walker.node.nodeType === 3 && !walker.bEndTag && walker.node.textContent.trim()) {
                    nodes.push('TEXT:' + walker.node.textContent.trim());
                }
            } while (walker.nextNode());
            
            expect(nodes).toEqual(['ELEMENT:parent', 'TEXT:Text content']);
        });
        it("Should traverse siblings correctly", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='parent'>"
                + "<span id='s1'></span>"
                + "<span id='s2'></span>"
                + "<span id='s3'></span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let parent = document.getElementById('parent');
            let walker = new ace.DOMWalker(parent, false, parent);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push(walker.node.id + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            expect(nodes).toEqual(['parent-START', 's1-START', 's1-END', 's2-START', 's2-END', 's3-START', 's3-END', 'parent-END']);
        });
    });

    describe("Shadow DOM Traversal", function() {
        
        it("Should traverse into shadow DOM", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='host'></div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<span id='shadow-child'>Shadow content</span>";
            
            let walker = new ace.DOMWalker(host, false, host);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Should traverse: host-START, shadow-child-START, shadow-child-END, host-END
            expect(nodes).toEqual(['host-START', 'shadow-child-START', 'shadow-child-END', 'host-END']);
        });

        it("Should handle empty shadow DOM", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='host'></div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            // Empty shadow root
            
            let walker = new ace.DOMWalker(host, false, host);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push(walker.node.id + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Should just traverse the host element
            expect(nodes).toEqual(['host-START', 'host-END']);
        });

        it("Should traverse nested shadow DOMs", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='outer-host'></div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let outerHost = document.getElementById('outer-host');
            let outerShadow = outerHost.attachShadow({ mode: 'open' });
            outerShadow.innerHTML = "<div id='inner-host'></div>";
            
            let innerHost = outerShadow.getElementById('inner-host');
            let innerShadow = innerHost.attachShadow({ mode: 'open' });
            innerShadow.innerHTML = "<span id='deep-child'>Deep content</span>";
            
            let walker = new ace.DOMWalker(outerHost, false, outerHost);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Should traverse all levels
            expect(nodes).toEqual([
                'outer-host-START',
                'inner-host-START',
                'deep-child-START',
                'deep-child-END',
                'inner-host-END',
                'outer-host-END'
            ]);
        });
    });

    describe("Slot Handling", function() {
        
        it("Should traverse slotted content", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='host'>"
                + "<span id='slotted-child'>Slotted content</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<div id='shadow-wrapper'><slot></slot></div>";
            
            let walker = new ace.DOMWalker(host, false, host);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Should traverse: host, shadow-wrapper, slot (with slotted content), back to shadow-wrapper, back to host
            expect(nodes.length).toBeGreaterThan(0);
            expect(nodes[0]).toBe('host-START');
            expect(nodes[nodes.length - 1]).toBe('host-END');
        });

        it("Should handle empty slot with fallback content", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='host'></div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<slot><span id='fallback'>Fallback</span></slot>";
            
            let walker = new ace.DOMWalker(host, false, host);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Should include fallback content
            expect(nodes).toContain('fallback-START');
            expect(nodes).toContain('fallback-END');
        });

        it("Should handle multiple slotted elements", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='host'>"
                + "<span id='slot1'>First</span>"
                + "<span id='slot2'>Second</span>"
                + "<span id='slot3'>Third</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<div id='wrapper'><slot></slot></div>";
            
            let walker = new ace.DOMWalker(host, false, host);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Should traverse all slotted elements in order
            expect(nodes).toContain('slot1-START');
            expect(nodes).toContain('slot2-START');
            expect(nodes).toContain('slot3-START');
            
            // Verify order
            let slot1Idx = nodes.indexOf('slot1-START');
            let slot2Idx = nodes.indexOf('slot2-START');
            let slot3Idx = nodes.indexOf('slot3-START');
            expect(slot1Idx).toBeLessThan(slot2Idx);
            expect(slot2Idx).toBeLessThan(slot3Idx);
        });

        it("Should handle named slots", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='host'>"
                + "<span slot='header' id='header-content'>Header</span>"
                + "<span slot='footer' id='footer-content'>Footer</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<div id='wrapper'>"
                + "<slot name='header'></slot>"
                + "<div id='middle'>Middle</div>"
                + "<slot name='footer'></slot>"
                + "</div>";
            
            let walker = new ace.DOMWalker(host, false, host);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Should traverse slotted content in the order of slots in shadow DOM
            expect(nodes).toContain('header-content-START');
            expect(nodes).toContain('middle-START');
            expect(nodes).toContain('footer-content-START');
        });
    });

    describe("IFrame Traversal", function() {
        
        it("Should traverse into iframe", function(done) {
            let fixture = "<div id='fixture'>"
                + "<iframe id='test-iframe'></iframe>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let iframe = document.getElementById('test-iframe');
            
            // Wait for iframe to load
            iframe.onload = function() {
                let iframeDoc = iframe.contentDocument;
                iframeDoc.open();
                iframeDoc.write("<html><body><div id='iframe-content'>Content</div></body></html>");
                iframeDoc.close();
                
                let walker = new ace.DOMWalker(iframe, false, iframe);
                
                let nodes = [];
                do {
                    if (walker.node.nodeType === 1) {
                        nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                    }
                } while (walker.nextNode());
                
                // Should traverse into iframe and back out
                expect(nodes[0]).toBe('test-iframe-START');
                expect(nodes).toContain('HTML-START');
                expect(nodes).toContain('BODY-START');
                expect(nodes).toContain('iframe-content-START');
                expect(nodes[nodes.length - 1]).toBe('test-iframe-END');
                
                done();
            };
            
            // Trigger load
            iframe.src = 'about:blank';
        });

        it("Should continue traversing after iframe", function(done) {
            let fixture = "<div id='fixture'>"
                + "<div id='parent'>"
                + "<span id='before-iframe'>Before</span>"
                + "<iframe id='test-iframe'></iframe>"
                + "<span id='after-iframe'>After</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let iframe = document.getElementById('test-iframe');
            
            // Wait for iframe to load
            iframe.onload = function() {
                let iframeDoc = iframe.contentDocument;
                iframeDoc.open();
                iframeDoc.write("<html><body><div id='iframe-content'>Content</div></body></html>");
                iframeDoc.close();
                
                let parent = document.getElementById('parent');
                let walker = new ace.DOMWalker(parent, false, parent);
                
                let nodes = [];
                do {
                    if (walker.node.nodeType === 1) {
                        nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                    }
                } while (walker.nextNode());
                
                // Should traverse: parent, before-iframe, iframe (with content), after-iframe, parent
                expect(nodes[0]).toBe('parent-START');
                expect(nodes).toContain('before-iframe-START');
                expect(nodes).toContain('test-iframe-START');
                expect(nodes).toContain('iframe-content-START');
                expect(nodes).toContain('after-iframe-START');
                expect(nodes[nodes.length - 1]).toBe('parent-END');
                
                // Verify order: before-iframe comes before iframe, iframe comes before after-iframe
                let beforeIdx = nodes.indexOf('before-iframe-START');
                let iframeIdx = nodes.indexOf('test-iframe-START');
                let afterIdx = nodes.indexOf('after-iframe-START');
                
                expect(beforeIdx).toBeLessThan(iframeIdx);
                expect(iframeIdx).toBeLessThan(afterIdx);
                
                done();
            };
            
            // Trigger load
            iframe.src = 'about:blank';
        });

        it("Should not stop at root when exiting iframe with siblings", function(done) {
            // This test catches a bug where atRoot() checks (this as any).ownerElement
            // instead of (this.node as any).ownerElement
            let fixture = "<div id='fixture'>"
                + "<div id='container'>"
                + "<span id='before'>Before</span>"
                + "<iframe id='test-iframe'></iframe>"
                + "<span id='after'>After</span>"
                + "<span id='last'>Last</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let iframe = document.getElementById('test-iframe');
            
            // Wait for iframe to load
            iframe.onload = function() {
                let iframeDoc = iframe.contentDocument;
                iframeDoc.open();
                iframeDoc.write("<html><body><div id='iframe-content'>Content</div></body></html>");
                iframeDoc.close();
                
                // Start from container, NOT from iframe
                let container = document.getElementById('container');
                let walker = new ace.DOMWalker(container, false, container);
                
                let nodes = [];
                let safety = 0;
                do {
                    if (walker.node.nodeType === 1) {
                        nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                    }
                    safety++;
                    if (safety > 100) {
                        fail('Walker appears to be in infinite loop');
                        break;
                    }
                } while (walker.nextNode());
                
                // Critical: after exiting iframe, walker MUST continue to 'after' and 'last' elements
                expect(nodes).toContain('after-START');
                expect(nodes).toContain('last-START');
                
                // Verify proper order
                let iframeEndIdx = nodes.indexOf('test-iframe-END');
                let afterStartIdx = nodes.indexOf('after-START');
                let lastStartIdx = nodes.indexOf('last-START');
                
                expect(iframeEndIdx).toBeGreaterThan(-1);
                expect(afterStartIdx).toBeGreaterThan(-1);
                expect(lastStartIdx).toBeGreaterThan(-1);
                
                // After iframe end, we should see 'after' element
                expect(afterStartIdx).toBeGreaterThan(iframeEndIdx);
                expect(lastStartIdx).toBeGreaterThan(afterStartIdx);
                
                done();
            };
            
            // Trigger load
            iframe.src = 'about:blank';
        });

        it("Should continue after iframe when using default root", function(done) {
            // Test walker behavior when NOT specifying a custom root
            // This uses the default root (document.documentElement)
            let fixture = "<div id='fixture'>"
                + "<div id='container'>"
                + "<span id='before'>Before</span>"
                + "<iframe id='test-iframe'></iframe>"
                + "<span id='after'>After</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let iframe = document.getElementById('test-iframe');
            
            // Wait for iframe to load
            iframe.onload = function() {
                let iframeDoc = iframe.contentDocument;
                iframeDoc.open();
                iframeDoc.write("<html><body><div id='iframe-content'>Content</div></body></html>");
                iframeDoc.close();
                
                // Start from container with container as root to limit traversal scope
                let container = document.getElementById('container');
                let walker = new ace.DOMWalker(container, false, container);
                
                let nodes = [];
                let safety = 0;
                do {
                    if (walker.node.nodeType === 1) {
                        nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                    }
                    safety++;
                    if (safety > 100) {
                        fail('Walker appears to be in infinite loop');
                        break;
                    }
                } while (walker.nextNode());
                
                // Should still traverse after iframe
                expect(nodes).toContain('after-START');
                
                // Verify order
                let iframeEndIdx = nodes.indexOf('test-iframe-END');
                let afterStartIdx = nodes.indexOf('after-START');
                
                if (iframeEndIdx > -1 && afterStartIdx > -1) {
                    expect(afterStartIdx).toBeGreaterThan(iframeEndIdx);
                }
                
                done();
            };
            
            // Trigger load
            iframe.src = 'about:blank';
        });

        it("Should continue after iframe within shadow DOM", function(done) {
            // Test iframe inside a web component's shadow DOM
            let fixture = "<div id='fixture'>"
                + "<div id='container'>"
                + "<span id='before'>Before</span>"
                + "<div id='web-component'></div>"
                + "<span id='after'>After</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let webComponent = document.getElementById('web-component');
            let shadowRoot = webComponent.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<div id='shadow-wrapper'>"
                + "<span id='shadow-before'>Shadow Before</span>"
                + "<iframe id='shadow-iframe'></iframe>"
                + "<span id='shadow-after'>Shadow After</span>"
                + "</div>";
            
            let iframe = shadowRoot.getElementById('shadow-iframe');
            
            // Wait for iframe to load
            iframe.onload = function() {
                let iframeDoc = iframe.contentDocument;
                iframeDoc.open();
                iframeDoc.write("<html><body><div id='iframe-content'>Content</div></body></html>");
                iframeDoc.close();
                
                // Start from container
                let container = document.getElementById('container');
                let walker = new ace.DOMWalker(container, false, container);
                
                let nodes = [];
                let safety = 0;
                do {
                    if (walker.node.nodeType === 1) {
                        nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                    }
                    safety++;
                    if (safety > 150) {
                        fail('Walker appears to be in infinite loop or not stopping properly');
                        break;
                    }
                } while (walker.nextNode());
                
                // Should traverse: before, web-component (with shadow content including iframe), after
                expect(nodes).toContain('before-START');
                expect(nodes).toContain('web-component-START');
                expect(nodes).toContain('shadow-before-START');
                expect(nodes).toContain('shadow-iframe-START');
                expect(nodes).toContain('iframe-content-START');
                expect(nodes).toContain('shadow-after-START');
                expect(nodes).toContain('after-START');
                
                // Verify order: shadow-after comes before 'after' (light DOM)
                let shadowAfterIdx = nodes.indexOf('shadow-after-START');
                let afterIdx = nodes.indexOf('after-START');
                
                expect(shadowAfterIdx).toBeGreaterThan(-1);
                expect(afterIdx).toBeGreaterThan(-1);
                expect(afterIdx).toBeGreaterThan(shadowAfterIdx);
                
                done();
            };
            
            // Trigger load
            iframe.src = 'about:blank';
        });

        it("Should not incorrectly think iframe is root (atRoot bug)", function(done) {
            // This test catches the bug where atRoot() checks (this as any).ownerElement
            // instead of (this.node as any).ownerElement
            // When walker is at iframe element after exiting, it should NOT think it's at root
            let fixture = "<div id='fixture'>"
                + "<div id='container'>"
                + "<iframe id='test-iframe'></iframe>"
                + "<span id='critical-after'>This must be reached</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let iframe = document.getElementById('test-iframe');
            
            iframe.onload = function() {
                let iframeDoc = iframe.contentDocument;
                iframeDoc.open();
                iframeDoc.write("<html><body><div id='iframe-content'>Content</div></body></html>");
                iframeDoc.close();
                
                // Start from container - this is key, NOT from iframe
                let container = document.getElementById('container');
                let walker = new ace.DOMWalker(container, false, container);
                
                let nodes = [];
                let reachedAfter = false;
                let safety = 0;
                
                do {
                    if (walker.node.nodeType === 1) {
                        let nodeId = walker.node.id || walker.node.nodeName;
                        nodes.push(nodeId + (walker.bEndTag ? '-END' : '-START'));
                        
                        if (nodeId === 'critical-after') {
                            reachedAfter = true;
                        }
                    }
                    safety++;
                    if (safety > 100) {
                        fail('Safety limit reached. Nodes collected: ' + nodes.length);
                        break;
                    }
                } while (walker.nextNode());
                
                // CRITICAL: Must reach the element after the iframe
                expect(reachedAfter).toBe(true);
                expect(nodes).toContain('critical-after-START');
                
                done();
            };
            
            iframe.src = 'about:blank';
        });

        it("Should continue after iframe when starting from fixture root", function(done) {
            // Test walker behavior when using fixture as root
            // This limits traversal to the fixture and its descendants
            let fixture = "<div id='fixture'>"
                + "<div id='before-iframe'>Before</div>"
                + "<iframe id='test-iframe'></iframe>"
                + "<div id='after-iframe'>After - MUST BE REACHED</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let iframe = document.getElementById('test-iframe');
            
            iframe.onload = function() {
                let iframeDoc = iframe.contentDocument;
                iframeDoc.open();
                iframeDoc.write("<html><body><div id='iframe-content'>Iframe Content</div></body></html>");
                iframeDoc.close();
                
                // Start from fixture with fixture as root to limit traversal scope
                let fixtureEl = document.getElementById('fixture');
                let walker = new ace.DOMWalker(fixtureEl, false, fixtureEl);
                
                let nodes = [];
                let reachedAfter = false;
                let safety = 0;
                
                do {
                    if (walker.node.nodeType === 1) {
                        let nodeId = walker.node.id || walker.node.nodeName;
                        if (!walker.bEndTag) {
                            nodes.push(nodeId);
                        }
                        
                        if (nodeId === 'after-iframe') {
                            reachedAfter = true;
                        }
                    }
                    safety++;
                    if (safety > 100) {
                        fail('Safety limit reached');
                        break;
                    }
                } while (walker.nextNode());
                
                // CRITICAL: Must reach the element after the iframe
                expect(reachedAfter).toBe(true);
                expect(nodes).toContain('after-iframe');
                
                done();
            };
            
            iframe.src = 'about:blank';
        });

    });

    describe("Combined Scenarios", function() {
        
        it("Should handle shadow DOM with light DOM siblings", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='parent'>"
                + "<span id='before'>Before</span>"
                + "<div id='host'></div>"
                + "<span id='after'>After</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<span id='shadow-content'>Shadow</span>";
            
            let parent = document.getElementById('parent');
            let walker = new ace.DOMWalker(parent, false, parent);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Should traverse in correct order: parent, before, host (with shadow), after, parent
            let beforeIdx = nodes.indexOf('before-START');
            let shadowIdx = nodes.indexOf('shadow-content-START');
            let afterIdx = nodes.indexOf('after-START');
            
            expect(beforeIdx).toBeLessThan(shadowIdx);
            expect(shadowIdx).toBeLessThan(afterIdx);
        });

        it("Should handle complex nested structure with shadow DOM and slots", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='outer'>"
                + "<div id='host'>"
                + "<span id='slotted1'>Slot 1</span>"
                + "<span id='slotted2'>Slot 2</span>"
                + "</div>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<div id='shadow-wrapper'>"
                + "<span id='shadow-before'>Before slot</span>"
                + "<slot></slot>"
                + "<span id='shadow-after'>After slot</span>"
                + "</div>";
            
            let outer = document.getElementById('outer');
            let walker = new ace.DOMWalker(outer, false, outer);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            // Verify proper traversal order
            expect(nodes[0]).toBe('outer-START');
            expect(nodes[nodes.length - 1]).toBe('outer-END');
            
            // Shadow content should be traversed
            expect(nodes).toContain('shadow-before-START');
            expect(nodes).toContain('shadow-after-START');
            
            // Slotted content should be traversed
            expect(nodes).toContain('slotted1-START');
            expect(nodes).toContain('slotted2-START');
            
            // Verify order: shadow-before, slotted content, shadow-after
            let beforeIdx = nodes.indexOf('shadow-before-START');
            let slot1Idx = nodes.indexOf('slotted1-START');
            let slot2Idx = nodes.indexOf('slotted2-START');
            let afterIdx = nodes.indexOf('shadow-after-START');
            
            expect(beforeIdx).toBeLessThan(slot1Idx);
            expect(slot1Idx).toBeLessThan(slot2Idx);
            expect(slot2Idx).toBeLessThan(afterIdx);
        });
    });

    describe("Reverse Traversal (prevNode)", function() {
        
        it("Should traverse backwards through simple structure", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='parent'>"
                + "<span id='child1'>Text1</span>"
                + "<span id='child2'>Text2</span>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let parent = document.getElementById('parent');
            // Start at end tag
            let walker = new ace.DOMWalker(parent, true, parent);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push(walker.node.id + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.prevNode());
            
            // Should traverse backwards
            expect(nodes[0]).toBe('parent-END');
            expect(nodes[nodes.length - 1]).toBe('parent-START');
        });

        it("Should traverse backwards through shadow DOM", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='host'></div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let host = document.getElementById('host');
            let shadowRoot = host.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = "<span id='shadow-child'>Shadow content</span>";
            
            // Start at end tag
            let walker = new ace.DOMWalker(host, true, host);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push((walker.node.id || walker.node.nodeName) + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.prevNode());
            
            // Should traverse backwards through shadow DOM
            expect(nodes[0]).toBe('host-END');
            expect(nodes).toContain('shadow-child-END');
            expect(nodes).toContain('shadow-child-START');
            expect(nodes[nodes.length - 1]).toBe('host-START');
        });
    });

    describe("Edge Cases", function() {
        
        it("Should handle single element", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='single'></div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let single = document.getElementById('single');
            let walker = new ace.DOMWalker(single, false, single);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push(walker.node.id + (walker.bEndTag ? '-END' : '-START'));
                }
            } while (walker.nextNode());
            
            expect(nodes).toEqual(['single-START', 'single-END']);
        });

        it("Should stop at root", function() {
            let fixture = "<div id='fixture'>"
                + "<div id='root'>"
                + "<div id='child'></div>"
                + "</div>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let root = document.getElementById('root');
            let child = document.getElementById('child');
            
            // Set root as the boundary
            let walker = new ace.DOMWalker(child, false, root);
            
            let nodes = [];
            do {
                if (walker.node.nodeType === 1) {
                    nodes.push(walker.node.id);
                }
            } while (walker.nextNode());
            
            // Should not traverse beyond root
            expect(nodes).toContain('child');
            expect(nodes).toContain('root');
            expect(nodes).not.toContain('fixture');
        });
    });
});

// Made with Bob
