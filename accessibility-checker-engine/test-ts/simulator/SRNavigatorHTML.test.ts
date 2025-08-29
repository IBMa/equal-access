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
        <div id="fixture"><h1>HTML Elements and ARIA Roles/Attributes Examples</h1>

<section id="toc">
    <h2>Table of Contents</h2>
    <ul>
        <li><a href="#html-elements">HTML Elements (without roles)</a></li>
        <li><a href="#aria-roles">ARIA Roles</a></li>
        <li><a href="#aria-attributes">ARIA Attributes</a></li>
    </ul>
</section>

<!-- SECTION 1: HTML ELEMENTS WITHOUT ROLES -->
<section id="html-elements">
    <h2>HTML Elements (without roles)</h2>
    
    <!-- Document Structure -->
    <h3>Document Structure</h3>
    <div class="example">
        <p>Example of <code><html></code>, <code><head></code>, <code><body></code> (see page source)</p>
        <p>Example of <code><main></code>:</p>
        <main>This is the main content area</main>
    </div>

    <!-- Content Sectioning -->
    <h3>Content Sectioning</h3>
    <div class="example">
        <address>
            Example Company<br>
            123 Street Name<br>
            City, Country
        </address>
        
        <article>
            <h4>Article Example</h4>
            <p>This is an article element.</p>
        </article>
        
        <aside>
            <h4>Aside Example</h4>
            <p>This is an aside element.</p>
        </aside>
        
        <footer>This is a footer element.</footer>
        
        <header>This is a header element.</header>
        
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
        
        <nav>
            <ul>
                <li><a href="#">Navigation Link 1</a></li>
                <li><a href="#">Navigation Link 2</a></li>
            </ul>
        </nav>
        
        <section>
            <h4>Section Example</h4>
            <p>This is a section element.</p>
        </section>
    </div>

    <!-- Text Content -->
    <h3>Text Content</h3>
    <div class="example">
        <blockquote cite="https://example.com">
            This is a blockquote with a citation.
        </blockquote>
        
        <dd>This is a description in a description list.</dd>
        
        <div>This is a div element.</div>
        
        <dl>
            <dt>Term 1</dt>
            <dd>Definition 1</dd>
            <dt>Term 2</dt>
            <dd>Definition 2</dd>
        </dl>
        
        <figcaption>This is a figure caption.</figcaption>
        
        <figure>
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ccc'/%3E%3C/svg%3E" alt="Placeholder image">
            <figcaption>A figure with a caption</figcaption>
        </figure>
        
        <hr>
        
        <li>List item outside of a list (not recommended)</li>
        
        <ol>
            <li>Ordered list item 1</li>
            <li>Ordered list item 2</li>
        </ol>
        
        <p>This is a paragraph element.</p>
        
        <pre>This is preformatted text.
It preserves      spaces and
line breaks.</pre>
        
        <ul>
            <li>Unordered list item 1</li>
            <li>Unordered list item 2</li>
        </ul>
    </div>

    <!-- Inline Text Semantics -->
    <h3>Inline Text Semantics</h3>
    <div class="example">
        <p><a href="#">This is a link</a></p>
        <p><abbr title="HyperText Markup Language">HTML</abbr> is an abbreviation</p>
        <p><b>Bold text</b> without strong importance</p>
        <p><bdi>مرحبا</bdi> - Bidirectional isolation</p>
        <p>Text with <bdo dir="rtl">reversed direction</bdo></p>
        <p><br>Line break above</p>
        <p><cite>Citation example</cite></p>
        <p><code>Code example</code></p>
        <p><data value="123456">Data with machine-readable value</data></p>
        <p><dfn>Definition term</dfn></p>
        <p><em>Emphasized text</em></p>
        <p><i>Italic text</i> for alternate voice</p>
        <p><kbd>Keyboard input</kbd></p>
        <p><mark>Marked/highlighted text</mark></p>
        <p><q cite="https://example.com">Inline quotation</q></p>
        <p><ruby>漢 <rt>kan</rt></ruby> - Ruby annotation</p>
        <p><s>Text with strikethrough</s></p>
        <p><samp>Sample output</samp></p>
        <p><small>Small text</small></p>
        <p><span>Generic span container</span></p>
        <p><strong>Strongly emphasized text</strong></p>
        <p><sub>Subscript</sub> text</p>
        <p><sup>Superscript</sup> text</p>
        <p><time datetime="2023-01-01">January 1, 2023</time></p>
        <p><u>Underlined text</u></p>
        <p><var>Variable in a mathematical expression</var></p>
        <p><wbr>Word break opportunity</p>
    </div>

    <!-- Image and Multimedia -->
    <h3>Image and Multimedia</h3>
    <div class="example">
        <p>Image: <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23ccc'/%3E%3C/svg%3E" alt="Example image"></p>
        
        <p>Audio:</p>
        <audio controls>
            <source src="about:blank" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
        
        <p>Video:</p>
        <video width="320" height="240" controls>
            <source src="about:blank" type="video/mp4">
            Your browser does not support the video element.
        </video>
        
        <p>Track (inside video):</p>
        <video width="320" height="240" controls>
            <source src="about:blank" type="video/mp4">
            <track src="about:blank" kind="subtitles" srclang="en" label="English">
            Your browser does not support the video element.
        </video>
        
        <p>Map with area:</p>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect width='200' height='100' fill='%23ccc'/%3E%3C/svg%3E" alt="Image map example" usemap="#example-map">
        <map name="example-map">
            <area shape="rect" coords="0,0,100,100" href="#" alt="Clickable area">
        </map>
    </div>

    <!-- Embedded Content -->
    <h3>Embedded Content</h3>
    <div class="example">
        <p>Embed:</p>
        <embed type="image/svg+xml" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50'%3E%3Crect width='100' height='50' fill='%23ccc'/%3E%3C/svg%3E" width="100" height="50">
        
        <p>iFrame:</p>
        <iframe src="about:blank" width="200" height="100" title="Example iframe"></iframe>
        
        <p>Object:</p>
        <object data="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50'%3E%3Crect width='100' height='50' fill='%23ccc'/%3E%3C/svg%3E" width="100" height="50">
            <param name="name" value="value">
            Fallback content
        </object>
        
        <p>Picture:</p>
        <picture>
            <source media="(min-width: 800px)" srcset="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50'%3E%3Crect width='100' height='50' fill='%23ccc'/%3E%3C/svg%3E">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23ccc'/%3E%3C/svg%3E" alt="Picture element example">
        </picture>
        
        <p>Portal:</p>
        <!-- <portal src="about:blank"></portal> --> <!-- Uncomment when more widely supported -->
        
        <p>Source (inside video/audio):</p>
        <audio controls>
            <source src="about:blank" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    </div>

    <!-- SVG and MathML -->
    <h3>SVG and MathML</h3>
    <div class="example">
        <p>SVG:</p>
        <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
        </svg>
        
        <p>MathML:</p>
        <math>
            <mrow>
                <mi>x</mi>
                <mo>=</mo>
                <mfrac>
                    <mrow>
                        <mo>−</mo>
                        <mi>b</mi>
                        <mo>±</mo>
                        <msqrt>
                            <msup>
                                <mi>b</mi>
                                <mn>2</mn>
                            </msup>
                            <mo>−</mo>
                            <mn>4</mn>
                            <mi>a</mi>
                            <mi>c</mi>
                        </msqrt>
                    </mrow>
                    <mrow>
                        <mn>2</mn>
                        <mi>a</mi>
                    </mrow>
                </mfrac>
            </mrow>
        </math>
    </div>

    <!-- Scripting -->
    <h3>Scripting</h3>
    <div class="example">
        <p>Canvas:</p>
        <canvas id="example-canvas" width="100" height="100" style="border:1px solid #000000;"></canvas>
        <script>
            // Canvas example
            var canvas = document.getElementById("example-canvas");
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(10, 10, 80, 80);
        </script>
        
        <p>Noscript (visible when JavaScript is disabled):</p>
        <noscript>
            <p>JavaScript is disabled in your browser.</p>
        </noscript>
        
        <p>Script (see page source):</p>
        <!-- Script example is in the page source -->
    </div>

    <!-- Demarcating Edits -->
    <h3>Demarcating Edits</h3>
    <div class="example">
        <p><del>This text has been deleted</del></p>
        <p><ins>This text has been inserted</ins></p>
    </div>

    <!-- Table Content -->
    <h3>Table Content</h3>
    <div class="example">
        <table>
            <caption>Example Table</caption>
            <colgroup>
                <col style="background-color: #f1f1f1">
                <col>
            </colgroup>
            <thead>
                <tr>
                    <th>Header 1</th>
                    <th>Header 2</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Row 1, Cell 1</td>
                    <td>Row 1, Cell 2</td>
                </tr>
                <tr>
                    <td>Row 2, Cell 1</td>
                    <td>Row 2, Cell 2</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>Footer 1</td>
                    <td>Footer 2</td>
                </tr>
            </tfoot>
        </table>

        <table>
            <caption>Example Table Colspan</caption>
            <tr>
                <th colspan="2">Header 1 & 2</th>
                <th>Header 3</th>
            </tr>
            <tr>
                <th>Header 4</th>
                <th>Header 5</th>
                <th>Header 6</th>
            </tr>
            <tr>
                <td>Row 1, Cell 1</td>
                <td>Row 1, Cell 2</td>
                <td>Row 1, Cell 3</td>
            </tr>
            <tr>
                <td>Row 2, Cell 1</td>
                <td>Row 2, Cell 2</td>
                <td>Row 2, Cell 3</td>
            </tr>
        </table>

        <table>
            <caption>Example Table Scope</caption>
            <tr>
                <th colspan="2" scope="col">Header 1 & 2</th>
                <th scope="col">Header 3</th>
            </tr>
            <tr>
                <th scope="col">Header 4</th>
                <th scope="col">Header 5</th>
                <th scope="col">Header 6</th>
            </tr>
            <tr>
                <td>Row 1, Cell 1</td>
                <td>Row 1, Cell 2</td>
                <td>Row 1, Cell 3</td>
            </tr>
            <tr>
                <td>Row 2, Cell 1</td>
                <td>Row 2, Cell 2</td>
                <td>Row 2, Cell 3</td>
            </tr>
        </table>

        <table>
            <caption>Example Table Headers</caption>
            <tr>
                <th colspan="2" id="head1_2">Header 1 & 2</th>
                <th id="head3">Header 3</th>
            </tr>
            <tr>
                <th id="head4">Header 4</th>
                <th id="head5">Header 5</th>
                <th id="head6">Header 6</th>
            </tr>
            <tr>
                <td headers="head1_2 head4">Row 1, Cell 1</td>
                <td headers="head1_2 head5">Row 1, Cell 2</td>
                <td headers="head3 head6">Row 1, Cell 3</td>
            </tr>
            <tr>
                <td headers="head1_2 head4">Row 2, Cell 1</td>
                <td headers="head1_2 head5">Row 2, Cell 2</td>
                <td headers="head3 head6">Row 2, Cell 3</td>
            </tr>
        </table>

        <table>
            <caption>Example Table Row Headers</caption>
            <tr>
                <th>RH-Header 1</th>
                <td>Row 1, Cell 1</td>
                <td>Row 1, Cell 2</td>
                <td>Row 1, Cell 3</td>
            </tr>
            <tr>
                <th>Header 2</th>
                <td>Row 2, Cell 1</td>
                <td>Row 2, Cell 2</td>
                <td>Row 2, Cell 3</td>
            </tr>
            <tr>
                <th>Header 3</th>
                <td>Row 3, Cell 1</td>
                <td>Row 3, Cell 2</td>
                <td>Row 3, Cell 3</td>
            </tr>
        </table>

        <table>
            <caption>Example Table Row and Col Headers</caption>
            <tr>
                <th></th>
                <th>Header 1</th>
                <th>Header 2</th>
                <th>Header 3</th>
            </tr>
            <tr>
                <th>Header 4</th>
                <td>Row 1, Cell 1</td>
                <td>Row 1, Cell 2</td>
                <td>Row 1, Cell 3</td>
            </tr>
            <tr>
                <th>Header 5</th>
                <td>Row 2, Cell 1</td>
                <td>Row 2, Cell 2</td>
                <td>Row 2, Cell 3</td>
            </tr>
        </table>

        <table>
            <caption>Example Table Rowspan</caption>
            <tr>
                <th></th>
                <th></th>
                <th>Header 1</th>
                <th>Header 2</th>
            </tr>
            <tr>
                <th rowspan="2">Header Span</th>
                <th>Header 3</th>
                <td>Row 1, Cell 1</td>
                <td>Row 1, Cell 2</td>
            </tr>
            <tr>
                <th>Header 4</th>
                <td>Row 2, Cell 1</td>
                <td>Row 2, Cell 2</td>
            </tr>
        </table>
    </div>

    <!-- Forms -->
    <h3>Forms</h3>
    <div class="example">
        <form action="#" method="get">
            <fieldset>
                <legend>Form Example</legend>
                
                <label for="text-input">Text Input:</label>
                <input type="text" id="text-input" name="text-input"><br><br>
                
                <label for="password-input">Password:</label>
                <input type="password" id="password-input" name="password-input"><br><br>
                
                <label for="checkbox-input">Checkbox:</label>
                <input type="checkbox" id="checkbox-input" name="checkbox-input"><br><br>
                
                <label for="radio-input1">Radio 1:</label>
                <input type="radio" id="radio-input1" name="radio-input" value="1">
                <label for="radio-input2">Radio 2:</label>
                <input type="radio" id="radio-input2" name="radio-input" value="2"><br><br>
                
                <label for="file-input">File:</label>
                <input type="file" id="file-input" name="file-input"><br><br>
                
                <label for="hidden-input">Hidden (not visible):</label>
                <input type="hidden" id="hidden-input" name="hidden-input" value="hidden-value"><br><br>
                
                <label for="image-input">Image Input:</label>
                <input type="image" id="image-input" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='30'%3E%3Crect width='50' height='30' fill='%23ccc'/%3E%3C/svg%3E" alt="Image input"><br><br>
                
                <label for="button-input">Button Input:</label>
                <input type="button" id="button-input" value="Button Input"><br><br>
                
                <label for="submit-input">Submit Input:</label>
                <input type="submit" id="submit-input" value="Submit"><br><br>
                
                <label for="reset-input">Reset Input:</label>
                <input type="reset" id="reset-input" value="Reset"><br><br>
                
                <label for="color-input">Color:</label>
                <input type="color" id="color-input" name="color-input"><br><br>
                
                <label for="date-input">Date:</label>
                <input type="date" id="date-input" name="date-input"><br><br>
                
                <label for="datetime-local-input">Datetime-local:</label>
                <input type="datetime-local" id="datetime-local-input" name="datetime-local-input"><br><br>
                
                <label for="email-input">Email:</label>
                <input type="email" id="email-input" name="email-input"><br><br>
                
                <label for="month-input">Month:</label>
                <input type="month" id="month-input" name="month-input"><br><br>
                
                <label for="number-input">Number:</label>
                <input type="number" id="number-input" name="number-input"><br><br>
                
                <label for="range-input">Range:</label>
                <input type="range" id="range-input" name="range-input"><br><br>
                
                <label for="search-input">Search:</label>
                <input type="search" id="search-input" name="search-input"><br><br>
                
                <label for="tel-input">Tel:</label>
                <input type="tel" id="tel-input" name="tel-input"><br><br>
                
                <label for="time-input">Time:</label>
                <input type="time" id="time-input" name="time-input"><br><br>
                
                <label for="url-input">URL:</label>
                <input type="url" id="url-input" name="url-input"><br><br>
                
                <label for="week-input">Week:</label>
                <input type="week" id="week-input" name="week-input"><br><br>
                
                <label for="textarea">Textarea:</label><br>
                <textarea id="textarea" name="textarea" rows="4" cols="50">This is a textarea.</textarea><br><br>
                
                <label for="select">Select:</label>
                <select id="select" name="select">
                    <optgroup label="Group 1">
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                    </optgroup>
                    <optgroup label="Group 2">
                        <option value="option3">Option 3</option>
                        <option value="option4">Option 4</option>
                    </optgroup>
                </select><br><br>
                
                <label for="datalist-input">Datalist:</label>
                <input list="datalist-options" id="datalist-input" name="datalist-input">
                <datalist id="datalist-options">
                    <option value="Option 1">
                    <option value="Option 2">
                    <option value="Option 3">
                </datalist><br><br>
                
                <output name="result" for="number-input">Output element</output><br><br>
                
                <progress id="progress" value="70" max="100">70%</progress><br><br>
                
                <meter id="meter" value="0.7" min="0" max="1">70%</meter><br><br>
                
                <button type="button">Button Element</button>
            </fieldset>
        </form>
    </div>

    <!-- Interactive Elements -->
    <h3>Interactive Elements</h3>
    <div class="example">
        <details>
            <summary>Details Summary (Click to expand)</summary>
            <p>This is the detailed content that is shown when expanded.</p>
        </details>
        
        <dialog open>
            This is an open dialog element.
            <form method="dialog">
                <button>Close</button>
            </form>
        </dialog>
        
        <menu>
            <li><button type="button">Menu Item 1</button></li>
            <li><button type="button">Menu Item 2</button></li>
        </menu>
    </div>

    <!-- Web Components -->
    <h3>Web Components</h3>
    <div class="example">
        <p>Slot (used in Web Components):</p>
        <template id="template-example">
            <slot name="example-slot">Default content</slot>
        </template>
        
        <p>Template (not rendered until used):</p>
        <template id="template-content">
            <div>This content is inside a template and not rendered directly.</div>
        </template>
    </div>
</section></div>
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
            "[heading level 1] HTML Elements and ARIA Roles/Attributes Examples",
            "[heading level 2] Table of Contents",
            "[list with 3 items] [bullet] [same page link] HTML Elements (without roles)",
            "[bullet] [same page link] ARIA Roles",
            "[bullet] [same page link] ARIA Attributes",
            "[out of list] [heading level 2] HTML Elements (without roles)",
            "[heading level 3] Document Structure",
            "Example of , , (see page source)",
            "Example of ",
            "[main landmark] :",
            "[main landmark] This is the main content area",
            "[heading level 3] Content Sectioning",
            " Example Company",
            " 123 Street Name",
            " City, Country ",
            "[heading level 4] Article Example",
            "This is an article element.",
            "[heading level 4] Aside Example",
            "This is an aside element.",
            "This is a footer element.",
            "This is a header element.",
            "[heading level 1] Heading 1",
            "[heading level 2] Heading 2",
            "[heading level 3] Heading 3",
            "[heading level 4] Heading 4",
            "[heading level 5] Heading 5",
            "[heading level 6] Heading 6",
            "[navigation landmark] [list with 2 items] [bullet] [same page link] Navigation Link 1",
            "[bullet] [same page link] Navigation Link 2",
            "[out of list] [heading level 4] Section Example",
            "This is a section element.",
            "[heading level 3] Text Content",
            "[blockquote] This is a blockquote with a citation. ",
            "[out of blockquote] This is a description in a description list.",
            "This is a div element.",
            "[list with 4 items] Term 1",
            "Definition 1",
            "Term 2",
            "Definition 2",
            "[out of list] [caption] This is a figure caption.",
            "[out of caption] [figure] [graphic] Placeholder image",
            "[caption] A figure with a caption",
            "[out of caption] [out of figure] [separator]",
            "[bullet] List item outside of a list (not recommended)",
            "[list with 2 items] 1. Ordered list item 1",
            "2. Ordered list item 2",
            "[out of list] This is a paragraph element.",
            "This is preformatted text.",
            "It preserves spaces and",
            "line breaks.",
            "[list with 2 items] [bullet] Unordered list item 1",
            "[bullet] Unordered list item 2",
            "[out of list] [heading level 3] Inline Text Semantics",
            "[same page link] This is a link",
            "HTML is an abbreviation",
            "Bold text without strong importance",
            "مرحبا - Bidirectional isolation",
            "Text with reversed direction",
            "[blank]",
            "Line break above",
            "Citation example",
            "Code example",
            "Data with machine-readable value",
            "Definition term",
            "Emphasized text",
            "Italic text for alternate voice",
            "Keyboard input",
            "[highlighted] Marked/highlighted text [out of highlighted]",
            "Inline quotation",
            "漢 ",
            "kan - Ruby annotation",
            "[deleted] Text with strikethrough",
            "Sample output",
            "Small text",
            "Generic span container",
            "Strongly emphasized text",
            "Subscript text",
            "Superscript text",
            "January 1, 2023",
            "Underlined text",
            "Variable in a mathematical expression",
            "Word break opportunity",
            "[heading level 3] Image and Multimedia",
            "Image: [graphic] Example image",
            "Audio:",
            " Your browser does not support the audio element. ",
            "Video:",
            " Your browser does not support the video element. ",
            "Track (inside video):",
            " Your browser does not support the video element. ",
            "Map with area:",
            "[same page link] Clickable area",
            "[heading level 3] Embedded Content",
            "Embed:",
            "[blank]",
            "iFrame:",
            "Example iframe frame about:blank",
            "[out of frame object]",
            "[blank]",
            "Picture:",
            "[graphic] Picture element example",
            "Portal:",
            "Source (inside video/audio):",
            " Your browser does not support the audio element. ",
            "[heading level 3] SVG and MathML",
            "SVG:",
            "[Unlabeled graphic]",
            "MathML:",
            "[heading level 3] Scripting",
            "Canvas:",
            "Noscript (visible when JavaScript is disabled):",
            "Script (see page source):",
            "[heading level 3] Demarcating Edits",
            "[deleted] This text has been deleted",
            "[inserted] This text has been inserted",

            "[heading level 3] Table Content",
            "[table with 4 rows and 2 columns] [caption] Example Table",
            "[out of caption] [row 1] [column 1] Header 1",
            "[column 2] Header 2",
            "[row 2] [Header 1, column 1] Row 1, Cell 1",
            "[Header 2, column 2] Row 1, Cell 2",
            "[row 3] [Header 1, column 1] Row 2, Cell 1",
            "[Header 2, column 2] Row 2, Cell 2",
            "[row 4] [Header 1, column 1] Footer 1",
            "[Header 2, column 2] Footer 2",

            "[out of table] [table with 4 rows and 3 columns] [caption] Example Table Colspan",
            "[out of caption] [row 1] [Header 4, Header 5, column 1 through 2] Header 1 & 2",
            "[Header 6, column 3] Header 3",
            "[row 2] [Header 1 & 2, column 1] Header 4",
            "[Header 1 & 2, column 2] Header 5",
            "[Header 3, column 3] Header 6",
            "[row 3] [Header 1 & 2, Header 4, column 1] Row 1, Cell 1",
            "[Header 1 & 2, Header 5, column 2] Row 1, Cell 2",
            "[Header 3, Header 6, column 3] Row 1, Cell 3",
            "[row 4] [Header 1 & 2, Header 4, column 1] Row 2, Cell 1",
            "[Header 1 & 2, Header 5, column 2] Row 2, Cell 2",
            "[Header 3, Header 6, column 3] Row 2, Cell 3",

            "[out of table] [table with 4 rows and 3 columns] [caption] Example Table Scope",
            "[out of caption] [row 1] [Header 4, Header 5, column 1 through 2] Header 1 & 2",
            "[Header 6, column 3] Header 3",
            "[row 2] [Header 1 & 2, column 1] Header 4",
            "[Header 1 & 2, column 2] Header 5",
            "[Header 3, column 3] Header 6",
            "[row 3] [Header 1 & 2, Header 4, column 1] Row 1, Cell 1",
            "[Header 1 & 2, Header 5, column 2] Row 1, Cell 2",
            "[Header 3, Header 6, column 3] Row 1, Cell 3",
            "[row 4] [Header 1 & 2, Header 4, column 1] Row 2, Cell 1",
            "[Header 1 & 2, Header 5, column 2] Row 2, Cell 2",
            "[Header 3, Header 6, column 3] Row 2, Cell 3",

            "[out of table] [table with 4 rows and 3 columns] [caption] Example Table Headers",
            "[out of caption] [row 1] [Header 4, Header 5, column 1 through 2] Header 1 & 2",
            "[Header 6, column 3] Header 3",
            "[row 2] [Header 1 & 2, column 1] Header 4",
            "[Header 1 & 2, column 2] Header 5",
            "[Header 3, column 3] Header 6",
            "[row 3] [Header 1 & 2, Header 4, column 1] Row 1, Cell 1",
            "[Header 1 & 2, Header 5, column 2] Row 1, Cell 2",
            "[Header 3, Header 6, column 3] Row 1, Cell 3",
            "[row 4] [Header 1 & 2, Header 4, column 1] Row 2, Cell 1",
            "[Header 1 & 2, Header 5, column 2] Row 2, Cell 2",
            "[Header 3, Header 6, column 3] Row 2, Cell 3",

            "[out of table] [table with 3 rows and 4 columns] [caption] Example Table Row Headers",
            "[out of caption] [row 1] [column 1] RH-Header 1",
            "[column 2] Row 1, Cell 1",
            "[column 3] Row 1, Cell 2",
            "[column 4] Row 1, Cell 3",
            "[row 2] [column 1] Header 2",
            "[column 2] Row 2, Cell 1",
            "[column 3] Row 2, Cell 2",
            "[column 4] Row 2, Cell 3",
            "[row 3] [column 1] Header 3",
            "[column 2] Row 3, Cell 1",
            "[column 3] Row 3, Cell 2",
            "[column 4] Row 3, Cell 3",
            
            "[out of table] [table with 3 rows and 4 columns] [caption] Example Table Row and Col Headers",
            "[out of caption] [row 1] [column 2] Header 1",
            "[column 3] Header 2",
            "[column 4] Header 3",
            "[row 2] [column 1] Header 4",
            "[Header 1, column 2] Row 1, Cell 1",
            "[Header 2, column 3] Row 1, Cell 2",
            "[Header 3, column 4] Row 1, Cell 3",
            "[row 3] [column 1] Header 5",
            "[Header 1, column 2] Row 2, Cell 1",
            "[Header 2, column 3] Row 2, Cell 2",
            "[Header 3, column 4] Row 2, Cell 3",

            "[out of table] [table with 3 rows and 4 columns] [caption] Example Table Rowspan",
            "[out of caption] [row 1] [column 3] Header 1",
            "[column 4] Header 2",
            "[Header 3, Header 4, row 2 through 3] [column 1] Header Span",
            "[Header Span, row 2] [column 2] Header 3",
            "[Header 1, column 3] Row 1, Cell 1",
            "[Header 2, column 4] Row 1, Cell 2",
            "[Header Span, row 3] [column 2] Header 4",
            "[Header 1, column 3] Row 2, Cell 1",
            "[Header 2, column 4] Row 2, Cell 2",

            "[out of table] [heading level 3] Forms",
            "[grouping] Form Example",
            "Text Input: [edit] ",
            "[blank]",
            "Password: [edit protected]",
            "[blank]",
            "[checkbox, not checked] Checkbox:",
            "[blank]",
            "[radio button, not checked] Radio 1: [radio button, not checked] Radio 2",
            "[blank]",
            "File: [button] File: [No file chosen]",
            "[blank]",
            "Hidden (not visible):",
            "[blank]",
            "Image Input: [button] Image input",
            "[blank]",
            "Button Input: [button] Button Input",
            "[blank]",
            "Submit Input: [button] Submit Input:",
            "[blank]",
            "Reset Input: [button] Reset Input:",
            "[blank]",
            "Color: [clickable] [0% red 0% green 0% blue]",
            "[blank]",
            "Date:",
            "[clickable] [spin button, 0] / [spin button, 0] / [spin button, 0]",
            "[menu button] [subMenu] Show date picker",
            "[blank]",
            "[blank]",
            "Datetime-local:",
            "[clickable] [spin button, 0] / [spin button, 0] / [spin button, 0] [spin button, 0] : [spin button, 0] [spin button, 0]",
            "[menu button] [subMenu] Show local date and time picker",
            "[blank]",
            "[blank]",
            "Email: [edit] ",
            "[blank]",
            "Month:",
            "[clickable] [spin button, 0] [spin button, 0]",
            "[menu button] [subMenu] Show month picker",
            "[blank]",
            "[blank]",
            "Number: [spinbutton, editable]",
            "[blank]",
            "Range: [slider, 50]",
            "[blank]",
            "Search: [edit]",
            "[blank]",
            "Tel: [edit] ",
            "[blank]",
            "Time:",
            "[grouping clickable [spin button, 0] : [spin button, 0] [spin button, 0]",
            "[menu button] [subMenu] Show time picker",
            "[out of grouping] [blank]",
            "[blank]",
            "URL: [edit] ",
            "[blank]",
            "Week:",
            "[clickable] [spin button, 0], [spin button, 0]",
            "[menu button] [subMenu] Show week picker",
            "[blank]",
            "[blank]",
            "Textarea:",
            "[edit, multiline] This is a textarea.",
            "[out of edit] [blank]",
            "[blank]",
            "Select: [combo box, collapsed] Option 1",
            "[blank]",
            "Datalist: [combo box, has auto complete, editable, opens list]",
            "[blank]",
            "Output element",
            "[blank]",
            "[progress bar, 70]",
            "[blank]",
            "[progress bar, 0.7]",
            "[blank]",
            "[button] Button Element",
            "[out of grouping] [heading level 3] Interactive Elements",
            "[button, collapsed] Details Summary (Click to expand)",
            "[dialog]",
            "[list with 2 items] [bullet] [button] Menu Item 1",
            "[bullet] [button] Menu Item 2",
            "[out of list] [heading level 3] Web Components",
            "Slot (used in Web Components):",
            "Template (not rendered until used):",
        ]
        writeFileSync("testResult.json", JSON.stringify(results, null, 2));
        writeFileSync("testExpected.json", JSON.stringify(expectedResult, null, 2));
        expect(results).toEqual(expectedResult);
        // expect(results).toEqual([]);
    });
});