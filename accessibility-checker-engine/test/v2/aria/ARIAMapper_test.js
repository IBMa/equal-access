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

describe('ARIAMapper', function() {

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
        expect(ace.ARIAMapper).toBeDefined;
    });

    describe("Basic Rule", function() {
        beforeEach(function() {
            let fixture = "<div id='fixture'>"
                +"<input id='test1'/>";
            document.body.insertAdjacentHTML(
                'afterbegin',
                fixture);
        });

        // remove the html fixture from the DOM
        afterEach(function() {
            document.body.removeChild(document.getElementById('fixture'));
        });

        it("Text input", function() {
            let mapper = new ace.ARIAMapper();
            let result = mapper.getAttributes(document.getElementById("test1"));
            // console.log(JSON.stringify(result));
        });
    
    })
});