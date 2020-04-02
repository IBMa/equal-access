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

let ace = require('../../../src/index');

describe('checker', function() {

    // // inject the HTML fixture for the tests
    // beforeEach(function() {
    //   let fixture = '<div id="fixture"><input id="x" type="text">' + 
    //     '<input id="y" type="text">' + 
    //     '<input id="add" type="button" value="Add Numbers">' +
    //     'Result: <span id="result" /></div>';

    //   document.body.insertAdjacentHTML(
    //     'afterbegin', 
    //     fixture);
    // });

    // // remove the html fixture from the DOM
    // afterEach(function() {
    //   document.body.removeChild(document.getElementById('fixture'));
    // });

    it("Should exist", function() {
        expect(ace.Checker).toBeDefined();
    });

    describe("Basic Rule", function() {
        beforeEach(function() {
            let fixture = "<div id='fixture'>"
                +"<h1></h1><h2>Some Heading</h2></div>";
            document.body.insertAdjacentHTML(
                'afterbegin',
                fixture);
        });

        // remove the html fixture from the DOM
        afterEach(function() {
            document.body.removeChild(document.getElementById('fixture'));
        });

        it("Should run", async function() {
            let checker = new ace.Checker();
            let report = await checker.check(document, null);
            expect(report.results.length).toBeGreaterThan(0);
            expect(report.numExecuted).toEqual(report.results.length);
            // console.log(JSON.stringify(result));
        });
    
    })
});