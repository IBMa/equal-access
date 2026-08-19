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
 * Unit tests for <pre> (preformatted text) screen reader rendering.
 * Each newline-delimited line inside a <pre> element must be its own reading stop.
 */

let ace = require('../../../src/index');

// Helper: trim whitespace from each item's "item" field for comparison readability
function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim()
    }));
}

describe('Preformatted Text (<pre>) Screen Reader Tests', function () {

    afterEach(function () {
        if (ace.SRController.getController) {
            let controller = ace.SRController.getController();
            if (controller && controller.disconnect) {
                controller.disconnect();
            }
        }
        let fixture = document.getElementById('fixture');
        if (fixture) {
            document.body.removeChild(fixture);
        }
    });

    // -------------------------------------------------------------------------
    // Basic multi-line pre
    // -------------------------------------------------------------------------
    describe('Basic multi-line pre', function () {

        it('Should render each line of a pre as a separate item', function () {
            let fixture = "<div id='fixture'>"
                + "<pre>line one\nline two\nline three</pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '[preformatted text]',                          tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'line one',                                     tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'line two',                                     tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'line three',                                   tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]', tab_focus: '', image: '' }
            ]);
        });

        it('Should render a single-line pre as a single item (no line splitting)', function () {
            let fixture = "<div id='fixture'>"
                + "<pre>single line content</pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // No newlines → text is rendered inline with the [preformatted text] container announcement
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '[preformatted text]',      tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'single line content',      tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]', tab_focus: '', image: '' }
            ]);
        });

    });

    // -------------------------------------------------------------------------
    // Leading / trailing blank lines are trimmed
    // -------------------------------------------------------------------------
    describe('Leading and trailing blank lines', function () {

        it('Should trim leading and trailing blank lines', function () {
            let fixture = "<div id='fixture'>"
                + "<pre>\nfirst\nsecond\n</pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '[preformatted text]',                          tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'first',                                        tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'second',                                       tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]', tab_focus: '', image: '' }
            ]);
        });

    });

    // -------------------------------------------------------------------------
    // Two pre blocks on the same page
    // -------------------------------------------------------------------------
    describe('Two pre blocks', function () {

        it('Should render two separate pre blocks correctly', function () {
            let fixture = "<div id='fixture'>"
                + "<pre>alpha\nbeta</pre>"
                + "<pre>gamma\ndelta</pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // [out of preformatted text] is prepended to the next item's announcement
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                                         tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '[preformatted text]',                                         tab_focus: '', image: '', selector: '#fixture > pre:nth-of-type(1)' },
                { region: '', heading: '', item: 'alpha',                                                       tab_focus: '', image: '', selector: '#fixture > pre:nth-of-type(1)' },
                { region: '', heading: '', item: 'beta',                                                        tab_focus: '', image: '', selector: '#fixture > pre:nth-of-type(1)' },
                { region: '', heading: '', item: '[out of preformatted text] [preformatted text]',              tab_focus: '', image: '', selector: '#fixture > pre:nth-of-type(2)' },
                { region: '', heading: '', item: 'gamma',                                                       tab_focus: '', image: '', selector: '#fixture > pre:nth-of-type(2)' },
                { region: '', heading: '', item: 'delta',                                                       tab_focus: '', image: '', selector: '#fixture > pre:nth-of-type(2)' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]',                tab_focus: '', image: '' }
            ]);
        });

    });

    // -------------------------------------------------------------------------
    // Pre surrounded by regular content
    // -------------------------------------------------------------------------
    describe('Pre surrounded by paragraphs', function () {

        it('Should render pre between surrounding paragraphs', function () {
            let fixture = "<div id='fixture'>"
                + "<p>Before</p>"
                + "<pre>code line 1\ncode line 2</pre>"
                + "<p>After</p>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // [out of preformatted text] is prepended to the next item — same pattern as lists
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: 'Before',                                       tab_focus: '', image: '', selector: '#fixture > p:nth-of-type(1)' },
                { region: '', heading: '', item: '[preformatted text]',                          tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'code line 1',                                  tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'code line 2',                                  tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: '[out of preformatted text] After',             tab_focus: '', image: '', selector: '#fixture > p:nth-of-type(2)' },
                { region: '', heading: '', item: '[End of document]',                            tab_focus: '', image: '' }
            ]);
        });

    });

    // -------------------------------------------------------------------------
    // Empty pre — produces container enter/exit but no line items
    // -------------------------------------------------------------------------
    describe('Empty pre', function () {

        it('Should not produce any line items for an empty pre', function () {
            let fixture = "<div id='fixture'>"
                + "<pre></pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            // An empty <pre> announces the container enter, then exit prepended to the next item
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '[preformatted text]',                          tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]', tab_focus: '', image: '' }
            ]);
        });

    });

    // -------------------------------------------------------------------------
    // Pre with inline phrasing content (<code>, <b>, etc.)
    // -------------------------------------------------------------------------
    describe('Pre with inline phrasing content', function () {

        it('Should split lines inside <pre><code>', function () {
            let fixture = "<div id='fixture'>"
                + "<pre><code>line one\nline two\nline three</code></pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '[preformatted text]',                          tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'line one',                                     tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'line two',                                     tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'line three',                                   tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]', tab_focus: '', image: '' }
            ]);
        });

        it('Should split lines inside doubly-nested inline elements <pre><code><b>', function () {
            let fixture = "<div id='fixture'>"
                + "<pre><code><b>alpha\nbeta</b></code></pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '[preformatted text]',                          tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'alpha',                                        tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'beta',                                         tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]', tab_focus: '', image: '' }
            ]);
        });

        it('Should collect mixed inline content across text nodes and elements per line', function () {
            // x <b>=</b> 1   (line 1)
            // y <b>=</b> 2   (line 2)
            let fixture = "<div id='fixture'>"
                + "<pre>x <b>=</b> 1\ny <b>=</b> 2</pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '[preformatted text]',                          tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'x = 1',                                        tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: 'y = 2',                                        tab_focus: '', image: '', selector: '#fixture > pre' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]', tab_focus: '', image: '' }
            ]);
        });

    });

    // -------------------------------------------------------------------------
    // Pre with aria-label
    // -------------------------------------------------------------------------
    describe('Pre with accessible name', function () {

        it('Should include aria-label in the preformatted text announcement', function () {
            let fixture = "<div id='fixture'>"
                + "<pre aria-label='Python example'>x = 1\ny = 2</pre>"
                + "</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);

            let result = trimItems(ace.SRController.renderStructure(document));

            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { region: '', heading: '', item: '[Start of document]',                          tab_focus: '', image: '', selector: 'body' },
                { region: '', heading: '', item: '["Python example", preformatted text]',        tab_focus: '', image: '', selector: '#fixture > pre[aria-label="Python\\ example"]' },
                { region: '', heading: '', item: 'x = 1',                                        tab_focus: '', image: '', selector: '#fixture > pre[aria-label="Python\\ example"]' },
                { region: '', heading: '', item: 'y = 2',                                        tab_focus: '', image: '', selector: '#fixture > pre[aria-label="Python\\ example"]' },
                { region: '', heading: '', item: '[out of preformatted text] [End of document]', tab_focus: '', image: '' }
            ]);
        });

    });

});
