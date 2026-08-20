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
 * Unit tests for <iframe> screen reader rendering.
 * Fixtures mirror iframe-sr-manual-test.html exactly so the automated suite
 * and the manual SR test page cover identical markup.
 *
 * Environment notes
 * -----------------
 * Tests run inside Karma/Chrome with --disable-web-security.  Chrome can
 * access iframe.contentDocument for same-origin srcdoc frames so
 * canAccessFrame() returns true.
 *
 * All tests are async: each test waits for all iframes in the fixture to
 * fire their 'load' event before calling renderStructure().  srcdoc frames
 * parse asynchronously in Chrome — the body is present immediately but its
 * children are not yet in the DOM until the load event fires.
 *
 * Rendering model
 * ---------------
 * item mode
 *   The DOMWalker walks into the iframe subdocument.  The inner <body> is a
 *   container-enter stop that emits "[name, frame]" (titled) or "[frame]"
 *   (untitled), anchored to selector "html > body".  Inner block elements
 *   (e.g. <p>) appear as subsequent item stops with their text content.
 *   The container-exit "[out of frame]" is prepended to whatever item stop
 *   follows the last stop inside the iframe.
 *
 * tab_focus mode
 *   A tabbable iframe (no tabindex or tabindex >= 0) appears as its own
 *   tab_focus stop with text "[name, frame]" (titled) or "[frame]" (untitled).
 *   An iframe with tabindex="-1" is skipped in tab order and never appears.
 *
 * Hidden iframes
 *   Iframes with aria-hidden="true", display:none, or visibility:hidden
 *   are suppressed — they produce no item stop and no tab_focus stop.
 */

let ace = require('../../../src/index');

// srcdoc strings matching iframe-sr-manual-test.html exactly
const SRCDOC_FULL     = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>This is the embedded content inside the frame.</p></body></html>";
const SRCDOC_NOTITLE  = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Frame content — but the outer frame has no title.</p></body></html>";
const SRCDOC_HELLO    = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Hello from iframe</p></body></html>";
const SRCDOC_INSIDE   = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Inside the frame.</p></body></html>";
const SRCDOC_FRAME    = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Frame content.</p></body></html>";
const SRCDOC_ONE      = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Content of frame one.</p></body></html>";
const SRCDOC_TWO      = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Content of frame two.</p></body></html>";
const SRCDOC_HIDDEN   = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>You should NOT hear this.</p></body></html>";
const SRCDOC_TABNEG   = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Frame not in tab order (tabindex=-1).</p></body></html>";
const SRCDOC_UNTITLED = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Untitled frame content.</p></body></html>";
const SRCDOC_ROLENONE = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'></head><body style='font-family:sans-serif;font-size:13px;padding:8px;margin:0'><p>Frame with role=none — should still be announced.</p></body></html>";

function trimItems(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim(),
        tab_focus: item.tab_focus.trim()
    }));
}

/**
 * Wait for all <iframe> elements within #fixture to fully load before calling
 * the callback.  srcdoc iframes are available immediately but their body
 * children are only populated after the 'load' event fires.
 *
 * For hidden iframes (display:none / aria-hidden) the load event may never
 * fire, so we fall back to a brief setTimeout to avoid hanging.
 */
function waitForFrames(done, callback) {
    const iframes = Array.from(document.querySelectorAll('#fixture iframe'));
    if (iframes.length === 0) {
        callback();
        done();
        return;
    }
    let loaded = 0;
    const onLoad = function () {
        loaded++;
        if (loaded === iframes.length) {
            callback();
            done();
        }
    };
    iframes.forEach(function (iframe) {
        // If the content is already fully available (body has children), count
        // it as loaded immediately.  Otherwise wait for the load event.
        const body = iframe.contentDocument && iframe.contentDocument.body;
        if (body && body.firstChild) {
            onLoad();
        } else {
            iframe.addEventListener('load', onLoad);
        }
    });
    // Safety net: if load events never fire (hidden iframes), proceed after
    // a short delay so the test suite does not hang.
    setTimeout(function () {
        if (loaded < iframes.length) {
            callback();
            done();
        }
    }, 200);
}

describe('IFrame Screen Reader Tests', function () {

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
    // Basic iframe rendering  (TC-01 – TC-03)
    // -------------------------------------------------------------------------
    describe('Basic iframe rendering', function () {

        it('TC-01: Should render an iframe with a title attribute', function (done) {
            // Titled accessible iframe.
            // item mode:     the inner document's <body> is the container-enter stop,
            //                with text '["Embedded content", frame]'.
            //                The inner <p> appears as a separate item stop.
            // tab_focus mode: the <iframe> element itself is a tab stop.
            // The container-exit "[out of frame]" is prepended to "[End of document]"
            // because the <p> is the last inner item stop.
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'><iframe title='Embedded content' srcdoc="${SRCDOC_FULL}"></iframe></div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',                              tab_focus: '',                          image: '', selector: 'body' },
                    { region: '', heading: '', item: '',                                                  tab_focus: '["Embedded content", frame]', image: '', selector: '#fixture > iframe' },
                    { region: '', heading: '', item: '["Embedded content", frame]',                      tab_focus: '',                          image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'This is the embedded content inside the frame.',   tab_focus: '',                          image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[out of frame] [End of document]',                 tab_focus: '',                          image: '' }
                ]);
            });
        });

        it('TC-02: Should render an iframe without a title attribute', function (done) {
            // Untitled iframe — container-enter fires with "[frame]" on the inner body,
            // and the iframe appears as a tab_focus stop with "[frame]".
            // The inner <p> appears as a separate item stop.
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'><iframe srcdoc="${SRCDOC_NOTITLE}"></iframe></div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',                                   tab_focus: '',        image: '', selector: 'body' },
                    { region: '', heading: '', item: '',                                                       tab_focus: '[frame]', image: '', selector: '#fixture > iframe' },
                    { region: '', heading: '', item: '[frame]',                                                tab_focus: '',        image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'Frame content — but the outer frame has no title.',     tab_focus: '',        image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[out of frame] [End of document]',                      tab_focus: '',        image: '' }
                ]);
            });
        });

        it('TC-03: Should render an iframe with a title and srcdoc content', function (done) {
            // Titled srcdoc iframe — same behaviour as a titled src= iframe.
            // The inner <p> appears as a separate item stop.
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'><iframe title='Inline content' srcdoc="${SRCDOC_HELLO}"></iframe></div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',        tab_focus: '',                       image: '', selector: 'body' },
                    { region: '', heading: '', item: '',                            tab_focus: '["Inline content", frame]', image: '', selector: '#fixture > iframe' },
                    { region: '', heading: '', item: '["Inline content", frame]',  tab_focus: '',                       image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'Hello from iframe',           tab_focus: '',                       image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[out of frame] [End of document]', tab_focus: '',                  image: '' }
                ]);
            });
        });

    });

    // -------------------------------------------------------------------------
    // iframe in document flow  (TC-04 – TC-06)
    // -------------------------------------------------------------------------
    describe('iframe in document flow', function () {

        it('TC-04: Should render iframe content between surrounding paragraphs', function (done) {
            // The preceding block (<p>Before</p>) gets its own item stop.
            // The iframe appears as a tab_focus stop, and the inner body fires the
            // container-enter.  The inner <p> "Inside the frame." is a separate item stop.
            // The "[out of frame]" container-exit merges with the next outer item stop
            // (<p>After</p>).
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'>`
                + `<p>Before</p>`
                + `<iframe title='Embedded' srcdoc="${SRCDOC_INSIDE}"></iframe>`
                + `<p>After</p>`
                + `</div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',        tab_focus: '',                   image: '', selector: 'body' },
                    { region: '', heading: '', item: 'Before',                      tab_focus: '',                   image: '', selector: '#fixture > p:nth-of-type(1)' },
                    { region: '', heading: '', item: '',                             tab_focus: '["Embedded", frame]', image: '', selector: '#fixture > iframe' },
                    { region: '', heading: '', item: '["Embedded", frame]',         tab_focus: '',                   image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'Inside the frame.',           tab_focus: '',                   image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[out of frame] After',        tab_focus: '',                   image: '', selector: '#fixture > p:nth-of-type(2)' },
                    { region: '', heading: '', item: '[End of document]',           tab_focus: '',                   image: '' }
                ]);
            });
        });

        it('TC-05: Should render iframe before a heading', function (done) {
            // The inner <p> "Frame content." appears between the container-enter and
            // the outer heading stop.  "[out of frame]" prepends to the heading item stop.
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'>`
                + `<iframe title='Frame' srcdoc="${SRCDOC_FRAME}"></iframe>`
                + `<h2>Heading after frame</h2>`
                + `</div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '',                                          item: '[Start of document]',           tab_focus: '',                image: '', selector: 'body' },
                    { region: '', heading: '',                                          item: '',                               tab_focus: '["Frame", frame]', image: '', selector: '#fixture > iframe' },
                    { region: '', heading: '',                                          item: '["Frame", frame]',               tab_focus: '',                image: '', selector: 'html > body' },
                    { region: '', heading: '',                                          item: 'Frame content.',                 tab_focus: '',                image: '', selector: 'html > body > p' },
                    { region: '', heading: '["Heading after frame", heading level 2]', item: '[out of frame] [heading level 2] Heading after frame', tab_focus: '', image: '', selector: '#fixture > h2' },
                    { region: '', heading: '',                                          item: '[End of document]',              tab_focus: '',                image: '' }
                ]);
            });
        });

        it('TC-06: Should render two iframes in sequence', function (done) {
            // Each iframe gets its own container-enter on the inner body,
            // and its inner <p> appears as a separate item stop.
            // The second iframe's inner body stop shows "[out of frame] ["Frame two", frame]"
            // (exit of frame-one merged with enter of frame-two on the same stop).
            // The final "[out of frame]" merges with "[End of document]".
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'>`
                + `<iframe title='Frame one' srcdoc="${SRCDOC_ONE}"></iframe>`
                + `<iframe title='Frame two' srcdoc="${SRCDOC_TWO}"></iframe>`
                + `</div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',                     tab_focus: '',                    image: '', selector: 'body' },
                    { region: '', heading: '', item: '',                                          tab_focus: '["Frame one", frame]', image: '', selector: '#fixture > iframe:nth-of-type(1)' },
                    { region: '', heading: '', item: '["Frame one", frame]',                     tab_focus: '',                    image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'Content of frame one.',                    tab_focus: '',                    image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '',                                          tab_focus: '["Frame two", frame]', image: '', selector: '#fixture > iframe:nth-of-type(2)' },
                    { region: '', heading: '', item: '[out of frame] ["Frame two", frame]',      tab_focus: '',                    image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'Content of frame two.',                    tab_focus: '',                    image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[out of frame] [End of document]',         tab_focus: '',                    image: '' }
                ]);
            });
        });

    });

    // -------------------------------------------------------------------------
    // Hidden iframes  (TC-07 – TC-09)
    // -------------------------------------------------------------------------
    describe('Hidden iframes', function () {

        it('TC-07: Should not render an iframe with aria-hidden="true"', function (done) {
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'><iframe title='Hidden' aria-hidden='true' srcdoc="${SRCDOC_HIDDEN}"></iframe></div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                // aria-hidden suppresses both item and tab_focus output entirely.
                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]', tab_focus: '', image: '', selector: 'body' },
                    { region: '', heading: '', item: '[End of document]',   tab_focus: '', image: '' }
                ]);
            });
        });

        it('TC-08: Should not render an iframe with display:none', function (done) {
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'><iframe title='Hidden display:none' style='display:none' srcdoc="${SRCDOC_HIDDEN}"></iframe></div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]', tab_focus: '', image: '', selector: 'body' },
                    { region: '', heading: '', item: '[End of document]',   tab_focus: '', image: '' }
                ]);
            });
        });

        it('TC-09: Should not render an iframe with visibility:hidden', function (done) {
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'><iframe title='Invisible' style='visibility:hidden' srcdoc="${SRCDOC_HIDDEN}"></iframe></div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]', tab_focus: '', image: '', selector: 'body' },
                    { region: '', heading: '', item: '[End of document]',   tab_focus: '', image: '' }
                ]);
            });
        });

    });

    // -------------------------------------------------------------------------
    // Tab order behaviour  (TC-10 – TC-11)
    // -------------------------------------------------------------------------
    describe('Tab order behaviour', function () {

        it('TC-10: Should not include an iframe with tabindex="-1" as a tab_focus stop', function (done) {
            // tabindex="-1" removes the iframe from the tab order, but the DOMWalker
            // still traverses into the subdocument.  The container-enter fires on the
            // inner body ("html > body").  The inner <p> is its own item stop.
            // "[out of frame]" is prepended to the next outer item stop (the button after
            // the iframe), exactly as it is for any other element following a frame.
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'>`
                + `<button type='button'>Button before</button>`
                + `<iframe title='Not tabbable' tabindex='-1' srcdoc="${SRCDOC_TABNEG}"></iframe>`
                + `<button type='button'>Button after</button>`
                + `</div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',                                  tab_focus: '',                         image: '', selector: 'body' },
                    { region: '', heading: '', item: '["Button before", button]',                             tab_focus: '',                         image: '', selector: '#fixture' },
                    { region: '', heading: '', item: '',                                                       tab_focus: '["Button before", button]', image: '', selector: '#fixture > button:nth-of-type(1)' },
                    { region: '', heading: '', item: '["Not tabbable", frame]',                               tab_focus: '',                         image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'Frame not in tab order (tabindex=-1).',                 tab_focus: '',                         image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[out of frame] ["Button after", button]',               tab_focus: '["Button after", button]',  image: '', selector: '#fixture > button:nth-of-type(2)' },
                    { region: '', heading: '', item: '[End of document]',                                     tab_focus: '',                         image: '' }
                ]);

                // Confirm the iframe element itself never appears as a tab_focus stop.
                let iframeTabStop = result.find(row => row.selector === '#fixture > iframe');
                expect(iframeTabStop).withContext('iframe with tabindex=-1 should not be a tab_focus stop').toBeUndefined();
            });
        });

        it('TC-11: Should include an untitled iframe as a tab_focus stop when tabbable', function (done) {
            // Default tabindex — iframe is in tab order, shows "[frame]" as its tab_focus
            // label and fires the container-enter on the inner body.  The inner <p> is its
            // own item stop.  "[out of frame]" is prepended to the next outer item stop
            // (the button after the iframe), exactly as it is for any other element
            // following a frame.
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'>`
                + `<button type='button'>Button before</button>`
                + `<iframe srcdoc="${SRCDOC_UNTITLED}"></iframe>`
                + `<button type='button'>Button after</button>`
                + `</div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',                         tab_focus: '',                         image: '', selector: 'body' },
                    { region: '', heading: '', item: '["Button before", button]',                    tab_focus: '',                         image: '', selector: '#fixture' },
                    { region: '', heading: '', item: '',                                              tab_focus: '["Button before", button]', image: '', selector: '#fixture > button:nth-of-type(1)' },
                    { region: '', heading: '', item: '',                                              tab_focus: '[frame]',                   image: '', selector: '#fixture > iframe' },
                    { region: '', heading: '', item: '[frame]',                                       tab_focus: '',                         image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'Untitled frame content.',                       tab_focus: '',                         image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[out of frame] ["Button after", button]',       tab_focus: '["Button after", button]',  image: '', selector: '#fixture > button:nth-of-type(2)' },
                    { region: '', heading: '', item: '[End of document]',                             tab_focus: '',                         image: '' }
                ]);
            });
        });

    });

    // -------------------------------------------------------------------------
    // role="none" / role="presentation"  (TC-12)
    // -------------------------------------------------------------------------
    describe('iframe with presentational role', function () {

        it('TC-12: Should announce an iframe with role="none" as grouping, not frame', function (done) {
            // When role="none" (or role="presentation") is applied to an <iframe>,
            // screen readers treat it as a generic grouping rather than a frame landmark.
            // Both item-mode container-enter/exit and the tab_focus stop should reflect
            // "grouping" instead of "frame".
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'><iframe title='Presentational' role='none' srcdoc="${SRCDOC_ROLENONE}"></iframe></div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',                               tab_focus: '',                               image: '', selector: 'body' },
                    { region: '', heading: '', item: '',                                                   tab_focus: '["Presentational", grouping]',    image: '', selector: '#fixture > iframe[role="none"]' },
                    { region: '', heading: '', item: '["Presentational", grouping]',                      tab_focus: '',                               image: '', selector: 'html > body' },
                    { region: '', heading: '', item: 'Frame with role=none — should still be announced.', tab_focus: '',                               image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[out of grouping] [End of document]',               tab_focus: '',                               image: '' }
                ]);
            });
        });

        it('TC-13: Should suppress grouping messages for an untitled iframe with role="none"', function (done) {
            // When role="none"/"presentation" is combined with no accessible name, the
            // grouping landmark is completely anonymous — screen readers suppress the
            // container-enter/exit announcements and the tab_focus stop entirely.
            // The inner content is still traversed and read; only the wrapper labels
            // ("[grouping]", "[out of grouping]") are omitted.
            document.body.insertAdjacentHTML('afterbegin',
                `<div id='fixture'><iframe role='none' srcdoc="${SRCDOC_ROLENONE}"></iframe></div>`);

            waitForFrames(done, function () {
                let result = trimItems(ace.SRController.renderStructure(document));

                // No tab_focus row for the iframe, no container-enter on the inner body,
                // no "[out of grouping]" prefix — just the inner paragraph content.
                expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                    { region: '', heading: '', item: '[Start of document]',                               tab_focus: '', image: '', selector: 'body' },
                    { region: '', heading: '', item: 'Frame with role=none — should still be announced.', tab_focus: '', image: '', selector: 'html > body > p' },
                    { region: '', heading: '', item: '[End of document]',                                 tab_focus: '', image: '' }
                ]);
            });
        });

    });

});
