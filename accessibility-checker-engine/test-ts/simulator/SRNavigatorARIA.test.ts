/**
 * @jest-environment jsdom
 */

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
 * Unit tests for lib/calculator.js
 */

import * as ace from "../../src/index";
import { writeFileSync } from "node:fs";

describe('SRControllerHTML', function () {
    beforeEach(() => {
        // Get computed style for pseudoelements does not work, so have to ignore those
        if (!(window as any).IBMaPatched) {
            (window as any).IBMaPatched = true;
            let temp = window.getComputedStyle;
            window.getComputedStyle = (el, p) => {
                if (p) return {} as any;
                if (!el) return {} as any;
                try {
                    return temp(el);
                } catch (e) {
                    return null;
                }
            }
        }
        let fixture = `
        <div id="fixture"><h1>ARIA Design Patterns and Implementation Examples</h1>

<section id="toc">
    <h2>Table of Contents</h2>
    <ul>
        <li><a href="#introduction">Introduction to ARIA</a></li>
        <li><a href="#design-patterns">ARIA Design Patterns</a></li>
        <li><a href="#states-properties">ARIA States and Properties</a></li>
        <li><a href="#live-regions">ARIA Live Regions</a></li>
        <li><a href="#landmarks">ARIA Landmark Regions</a></li>
    </ul>
</section>

<!-- SECTION 1: INTRODUCTION TO ARIA -->
<section id="introduction">
    <h2>Introduction to ARIA</h2>
    
    <p>ARIA (Accessible Rich Internet Applications) is a set of attributes that define ways to make web content and web applications more accessible to people with disabilities. These attributes supplement HTML so that interactions and widgets commonly used in applications can be passed to assistive technologies when there is not otherwise a mechanism.</p>
    
    <div class="note">
        <h3>The First Rule of ARIA</h3>
        <p>If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so.</p>
    </div>
</section>

<!-- SECTION 2: ARIA DESIGN PATTERNS -->
<section id="design-patterns">
    <h2>ARIA Design Patterns</h2>
    <p>The following examples demonstrate proper implementation of common UI patterns using ARIA roles, states, and properties according to the <a href="https://www.w3.org/WAI/ARIA/apg/" target="_blank">ARIA Authoring Practices Guide</a>.</p>
    
    <!-- Accordion Pattern -->
    <div class="pattern" id="accordion">
        <h3>Accordion</h3>
        
        <div class="example">
            <div class="accordion">
                <h3>
                    <button aria-expanded="true" 
                            aria-controls="sect1" 
                            id="accordion1id" 
                            class="accordion-trigger">
                        Section 1
                    </button>
                </h3>
                <div id="sect1" 
                        role="region" 
                        aria-labelledby="accordion1id" 
                        class="accordion-panel">
                    <p>Content for section 1. This section is expanded by default.</p>
                </div>
                
                <h3>
                    <button aria-expanded="false" 
                            aria-controls="sect2" 
                            id="accordion2id" 
                            class="accordion-trigger">
                        Section 2
                    </button>
                </h3>
                <div id="sect2" 
                        role="region" 
                        aria-labelledby="accordion2id" 
                        class="accordion-panel" 
                        hidden>
                    <p>Content for section 2. This section is collapsed by default.</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Button Pattern -->
    <div class="pattern" id="button">
        <h3>Button</h3>
        
        <div class="example">
            <!-- Native button -->
            <button type="button">Native Button</button>
            
            <!-- ARIA button -->
            <div role="button" tabindex="0" id="aria-button">ARIA Button</div>
            
            <!-- Toggle button -->
            <button aria-pressed="false" id="toggle-button">Toggle Button</button>
        </div>
    </div>
    
    <!-- Checkbox Pattern -->
    <div class="pattern" id="checkbox">
        <h3>Checkbox</h3>
        
        <div class="example">
            <!-- Native checkbox -->
            <label>
                <input type="checkbox" id="native-checkbox">
                Native Checkbox
            </label>
            
            <br><br>
            
            <!-- ARIA checkbox -->
            <div role="checkbox" 
                    aria-checked="false" 
                    tabindex="0" 
                    id="aria-checkbox">
                ARIA Checkbox
            </div>
            
            <br>
            
            <!-- ARIA checkbox (tri-state) -->
            <div role="checkbox" 
                    aria-checked="mixed" 
                    tabindex="0" 
                    id="aria-checkbox-mixed">
                ARIA Checkbox (Mixed State)
            </div>
        </div>
    </div>
    
    <!-- Dialog (Modal) Pattern -->
    <div class="pattern" id="dialog">
        <h3>Dialog (Modal)</h3>
        
        <div class="example">
            <button id="dialog-trigger">Open Dialog</button>
            
            <div role="dialog" 
                    aria-labelledby="dialog-title" 
                    aria-describedby="dialog-desc" 
                    aria-modal="true" 
                    id="example-dialog" 
                    style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.2); z-index: 1000;">
                <h4 id="dialog-title">Dialog Title</h4>
                <p id="dialog-desc">This is a modal dialog example. When open, focus should be trapped inside the dialog.</p>
                <button id="dialog-close">Close</button>
            </div>
        </div>
    </div>
    
    <!-- Tabs Pattern -->
    <div class="pattern" id="tabs">
        <h3>Tabs</h3>
        
        <div class="example">
            <div class="tabs">
                <div role="tablist" aria-label="Sample Tabs">
                    <button role="tab" 
                            aria-selected="true" 
                            aria-controls="panel-1" 
                            id="tab-1" 
                            tabindex="0">
                        First Tab
                    </button>
                    <button role="tab" 
                            aria-selected="false" 
                            aria-controls="panel-2" 
                            id="tab-2" 
                            tabindex="-1">
                        Second Tab
                    </button>
                    <button role="tab" 
                            aria-selected="false" 
                            aria-controls="panel-3" 
                            id="tab-3" 
                            tabindex="-1">
                        Third Tab
                    </button>
                </div>
                
                <div id="panel-1" 
                        role="tabpanel" 
                        aria-labelledby="tab-1" 
                        tabindex="0">
                    <p>Content for the first tab panel.</p>
                </div>
                
                <div id="panel-2" 
                        role="tabpanel" 
                        aria-labelledby="tab-2" 
                        tabindex="0" 
                        hidden>
                    <p>Content for the second tab panel.</p>
                </div>
                
                <div id="panel-3" 
                        role="tabpanel" 
                        aria-labelledby="tab-3" 
                        tabindex="0" 
                        hidden>
                    <p>Content for the third tab panel.</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Menu Pattern -->
    <div class="pattern" id="menu">
        <h3>Menu</h3>
        
        <div class="example">
            <div>
                <button aria-haspopup="true" aria-expanded="false" id="menubutton">Menu Button</button>
                
                <div role="menu" aria-labelledby="menubutton" id="menu1" style="display: none;">
                    <div role="menuitem" tabindex="-1">Action 1</div>
                    <div role="menuitem" tabindex="-1">Action 2</div>
                    <div role="menuitemcheckbox" aria-checked="true" tabindex="-1">Check 1</div>
                    <div role="menuitemcheckbox" aria-checked="false" tabindex="-1">Check 2</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Combobox Pattern -->
    <div class="pattern" id="combobox">
        <h3>Combobox</h3>
        
        <div class="example">
            <div>
                <label id="combo-label">Choose an option:</label>
                <div class="combo-container">
                    <input type="text" 
                            role="combobox" 
                            aria-expanded="false" 
                            aria-autocomplete="list" 
                            aria-controls="listbox1" 
                            aria-labelledby="combo-label" 
                            id="combo1">
                    <button aria-label="Show options" tabindex="-1" id="combo-button">▼</button>
                    
                    <ul id="listbox1" 
                        role="listbox" 
                        aria-labelledby="combo-label" 
                        style="display: none; position: absolute; width: 200px; background: white; border: 1px solid #ccc; list-style: none; padding: 0; margin: 0;">
                        <li role="option" id="option1">Option 1</li>
                        <li role="option" id="option2">Option 2</li>
                        <li role="option" id="option3">Option 3</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- SECTION 3: ARIA STATES AND PROPERTIES -->
<section id="states-properties">
    <h2>ARIA States and Properties</h2>
    
    <!-- Widget Attributes -->
    <h3>Widget Attributes</h3>
    <div class="example">
        <div aria-autocomplete="inline">aria-autocomplete="inline"</div>
        <div aria-checked="true">aria-checked="true"</div>
        <div aria-disabled="true">aria-disabled="true"</div>
        <div aria-expanded="true">aria-expanded="true"</div>
        <div aria-haspopup="menu">aria-haspopup="menu"</div>
        <div aria-hidden="true">aria-hidden="true"</div>
        <div aria-invalid="true">aria-invalid="true"</div>
        <div aria-label="Label text">aria-label="Label text"</div>
        <div aria-level="2">aria-level="2"</div>
        <div aria-modal="true">aria-modal="true"</div>
        <div aria-multiline="true">aria-multiline="true"</div>
        <div aria-multiselectable="true">aria-multiselectable="true"</div>
        <div aria-orientation="vertical">aria-orientation="vertical"</div>
        <div aria-placeholder="Placeholder text">aria-placeholder="Placeholder text"</div>
        <div aria-pressed="true">aria-pressed="true"</div>
        <div aria-readonly="true">aria-readonly="true"</div>
        <div aria-required="true">aria-required="true"</div>
        <div aria-selected="true">aria-selected="true"</div>
        <div aria-sort="ascending">aria-sort="ascending"</div>
        <div aria-valuemax="100">aria-valuemax="100"</div>
        <div aria-valuemin="0">aria-valuemin="0"</div>
        <div aria-valuenow="50">aria-valuenow="50"</div>
        <div aria-valuetext="50 percent">aria-valuetext="50 percent"</div>
    </div>
    
    <!-- Relationship Attributes -->
    <h3>Relationship Attributes</h3>
    <div class="example">
        <div aria-activedescendant="child-id">aria-activedescendant="child-id"</div>
        <div aria-controls="controlled-id">aria-controls="controlled-id"</div>
        <div aria-describedby="description-id">aria-describedby="description-id"</div>
        <div aria-details="details-id">aria-details="details-id"</div>
        <div aria-errormessage="error-id">aria-errormessage="error-id"</div>
        <div aria-flowto="next-id">aria-flowto="next-id"</div>
        <div aria-labelledby="label-id">aria-labelledby="label-id"</div>
        <div aria-owns="owned-id">aria-owns="owned-id"</div>
    </div>
</section>

<!-- SECTION 4: ARIA LIVE REGIONS -->
<section id="live-regions">
    <h2>ARIA Live Regions</h2>
    
    <h3>Live Region Attributes</h3>
    <div class="example">
        <div aria-live="polite">aria-live="polite"</div>
        <div aria-live="assertive">aria-live="assertive"</div>
        <div aria-atomic="true">aria-atomic="true"</div>
        <div aria-relevant="additions text">aria-relevant="additions text"</div>
        <div aria-busy="true">aria-busy="true"</div>
    </div>
    
    <h3>Live Region Examples</h3>
    <div class="example">
        <!-- Status Message -->
        <div>
            <button id="status-button">Show Status Message</button>
            <div aria-live="polite" id="status-region" class="sr-only">
                <!-- Content will be updated dynamically -->
            </div>
        </div>
        
        <!-- Alert Message -->
        <div>
            <button id="alert-button">Show Alert Message</button>
            <div role="alert" id="alert-region" class="sr-only">
                <!-- Content will be updated dynamically -->
            </div>
        </div>
        
        <!-- Progress Update -->
        <div>
            <button id="progress-button">Start Progress</button>
            <div aria-live="polite" id="progress-region">
                <div role="progressbar" 
                        aria-valuenow="0" 
                        aria-valuemin="0" 
                        aria-valuemax="100" 
                        id="progress-bar">
                    0% Complete
                </div>
            </div>
        </div>
    </div>
</section>

<!-- SECTION 5: ARIA LANDMARK REGIONS -->
<section id="landmarks">
    <h2>ARIA Landmark Regions</h2>
    
    <div class="example">
        <div role="banner">
            <h3>Banner Landmark</h3>
            <p>Typically contains site-oriented content such as the logo, site title, and primary navigation.</p>
        </div>
        
        <div role="navigation" aria-label="Main">
            <h3>Navigation Landmark</h3>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Products</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </div>
        
        <div role="main">
            <h3>Main Landmark</h3>
            <p>Contains the main content of the document.</p>
        </div>
        
        <div role="complementary">
            <h3>Complementary Landmark</h3>
            <p>Supporting content that is complementary to the main content.</p>
        </div>
        
        <div role="search">
            <h3>Search Landmark</h3>
            <form>
                <label for="search-input">Search:</label>
                <input type="search" id="search-input">
                <button type="submit">Search</button>
            </form>
        </div>
        
        <div role="form" aria-labelledby="form-heading">
            <h3 id="form-heading">Form Landmark</h3>
            <form>
                <label for="name">Name:</label>
                <input type="text" id="name">
                <button type="submit">Submit</button>
            </form>
        </div>
        
        <div role="contentinfo">
            <h3>Contentinfo Landmark</h3>
            <p>Contains information about the document such as copyright and links to privacy statements.</p>
        </div>
        
        <div role="region" aria-labelledby="region-heading">
            <h3 id="region-heading">Region Landmark</h3>
            <p>A perceivable section containing content that is relevant to a specific, author-specified purpose.</p>
        </div>
    </div>
</section>

<script>
    // Simple JavaScript to make the examples interactive
    document.addEventListener('DOMContentLoaded', function() {
        // Accordion functionality
        const accordionTriggers = document.querySelectorAll('.accordion-trigger');
        accordionTriggers.forEach(trigger => {
            trigger.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
                const panel = document.getElementById(this.getAttribute('aria-controls'));
                if (expanded) {
                    panel.setAttribute('hidden', '');
                } else {
                    panel.removeAttribute('hidden');
                }
            });
        });
        
        // Toggle button functionality
        const toggleButton = document.getElementById('toggle-button');
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                const pressed = this.getAttribute('aria-pressed') === 'true';
                this.setAttribute('aria-pressed', !pressed);
            });
        }
        
        // ARIA checkbox functionality
        const ariaCheckboxes = document.querySelectorAll('[role="checkbox"]');
        ariaCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('click', function() {
                const checked = this.getAttribute('aria-checked');
                if (checked === 'true') {
                    this.setAttribute('aria-checked', 'false');
                } else if (checked === 'false') {
                    this.setAttribute('aria-checked', 'true');
                } else if (checked === 'mixed') {
                    this.setAttribute('aria-checked', 'true');
                }
            });
            
            checkbox.addEventListener('keydown', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
        
        // Dialog functionality
        const dialogTrigger = document.getElementById('dialog-trigger');
        const dialog = document.getElementById('example-dialog');
        const dialogClose = document.getElementById('dialog-close');
        
        if (dialogTrigger && dialog && dialogClose) {
            dialogTrigger.addEventListener('click', function() {
                dialog.style.display = 'block';
            });
            
            dialogClose.addEventListener('click', function() {
                dialog.style.display = 'none';
            });
        }
        
        // Tab functionality
        const tabs = document.querySelectorAll('[role="tab"]');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Deselect all tabs
                tabs.forEach(t => {
                    t.setAttribute('aria-selected', 'false');
                    t.setAttribute('tabindex', '-1');
                });
                
                // Select clicked tab
                this.setAttribute('aria-selected', 'true');
                this.setAttribute('tabindex', '0');
                
                // Hide all panels
                const tabpanels = document.querySelectorAll('[role="tabpanel"]');
                tabpanels.forEach(panel => {
                    panel.setAttribute('hidden', '');
                });
                
                // Show selected panel
                const panelId = this.getAttribute('aria-controls');
                const panel = document.getElementById(panelId);
                panel.removeAttribute('hidden');
            });
        });
        
        // Menu functionality
        const menuButton = document.getElementById('menubutton');
        const menu = document.getElementById('menu1');
        
        if (menuButton && menu) {
            menuButton.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
                menu.style.display = expanded ? 'none' : 'block';
            });
        }
        
        // Live region examples
        const statusButton = document.getElementById('status-button');
        const statusRegion = document.getElementById('status-region');
        
        if (statusButton && statusRegion) {
            statusButton.addEventListener('click', function() {
                statusRegion.textContent = 'Status updated at ' + new Date().toLocaleTimeString();
            });
        }
        
        const alertButton = document.getElementById('alert-button');
        const alertRegion = document.getElementById('alert-region');
        
        if (alertButton && alertRegion) {
            alertButton.addEventListener('click', function() {
                alertRegion.textContent = 'Alert! Important message at ' + new Date().toLocaleTimeString();
            });
        }
        
        const progressButton = document.getElementById('progress-button');
        const progressBar = document.getElementById('progress-bar');
        
        if (progressButton && progressBar) {
            progressButton.addEventListener('click', function() {
                let progress = 0;
                const interval = setInterval(function() {
                    progress += 10;
                    progressBar.setAttribute('aria-valuenow', progress);
                    progressBar.textContent = progress + '% Complete';
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                    }
                }, 1000);
            });
        }
    });
</script></div>
`;
        document.body.innerHTML = fixture;
    })

    it("Sim Test", function () {
        // let startWalker = new ace.SRWalker(document.documentElement);
        // let results = ace.SRController.renderNext(startWalker, "heading");
        // expect(results).toEqual([{ value: "This is a sample heading", role: "heading"}]);
        // let results = ace.SRController.renderAll("item");
        // results = results.map(result => (result.map(({nameInfo, role, tag}) => ({nameInfo: nameInfo.name, role, tag}))));
        let results = ace.SRController.renderAll("item");
        const expectedResult = [
            "[heading level 1] ARIA Design Patterns and Implementation Examples",
            "[heading level 2] Table of Contents",
            "[list with 5 items] [bullet] [same page link] Introduction to ARIA",
            "[bullet] [same page link] ARIA Design Patterns",
            "[bullet] [same page link] ARIA States and Properties",
            "[bullet] [same page link] ARIA Live Regions",
            "[bullet] [same page link] ARIA Landmark Regions",
            "[out of list] [heading level 2] Introduction to ARIA",
            "ARIA (Accessible Rich Internet Applications) is a set of attributes that define ways to make web content and web applications more accessible to people with disabilities. These attributes supplement HTML so that interactions and widgets commonly used in applications can be passed to assistive technologies when there is not otherwise a mechanism.",
            "[heading level 3] The First Rule of ARIA",
            "If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so.",
            "[heading level 2] ARIA Design Patterns",
            "The following examples demonstrate proper implementation of common UI patterns using ARIA roles, states, and properties according to the [link] ARIA Authoring Practices Guide .",
            "[heading level 3] Accordion",
            "[heading level 3] [button, expanded] Section 1",
            "Section 1 [region] Content for section 1. This section is expanded by default.",
            "[out of region] [heading level 3] [collapsed] [button] Section 2",
            "[heading level 3] Button",
            "[button] Native Button",
            "[button] ARIA Button",
            "[toggle button, not pressed] Toggle Button",
            "[heading level 3] Checkbox",
            "[checkbox, not checked] Native Checkbox ",
            "[blank]",
            "[checkbox, not checked] ARIA Checkbox",
            "[blank]",
            "[checkbox, half checked] ARIA Checkbox (Mixed State)",
            "[heading level 3] Dialog (Modal)",
            "[button] Open Dialog",
            "[heading level 3] Tabs",
            "[tab, selected] First Tab [tab] Second Tab [tab] Third Tab",
            "Content for the first tab panel.",
            "[heading level 3] Menu",
            "[menu button, collapsed] [subMenu] Menu Button",
            "[heading level 3] Combobox",
            "Choose an option:",
            "[combo box, collapsed, has auto complete, editable, opens list] [button] show options",
            "[heading level 2] ARIA States and Properties",
            "[heading level 3] Widget Attributes",
            "aria-autocomplete=\"inline\"",
            "TODO-MORE"
        ];
        writeFileSync("testResultARIA.json", JSON.stringify(results, null, 2));
        writeFileSync("testExpectedARIA.json", JSON.stringify(expectedResult, null, 2));
        expect(results).toEqual(expectedResult);
        // expect(results).toEqual([]);
    });
});