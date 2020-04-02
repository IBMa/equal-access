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

describe('Context', function() {

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
        expect(ace).toBeDefined();
        expect(ace.Context).toBeDefined();
    });

    it("Should parse dom:something", function() {
        let context = new ace.Context("dom:something");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something dom:somethingElse", function() {
        let context = new ace.Context("dom:something dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [], connector: ' '},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something>dom:somethingElse", function() {
        let context = new ace.Context("dom:something>dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [], connector: '>'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something+dom:somethingElse", function() {
        let context = new ace.Context("dom:something+dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [], connector: '+'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something~dom:somethingElse", function() {
        let context = new ace.Context("dom:something~dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [], connector: '~'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse !dom:something~dom:somethingElse", function() {
        let context = new ace.Context("!dom:something~dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: false, namespace:"dom", role: 'something', attrs: [], connector: '~'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse DOM:something~dom:somethingElse", function() {
        let context = new ace.Context("DOM:something~dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [], connector: '~'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something[attrOne]~dom:somethingElse", function() {
        let context = new ace.Context("dom:something[attrOne]~dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [
                {"inclusive":true, "attr":"attrone"}
            ], connector: '~'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something[attrOne=val1]~dom:somethingElse", function() {
        let context = new ace.Context("dom:something[attrOne=val1]~dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [
                {"inclusive":true, "attr":"attrone", "eq": "=", "value": "val1"}
            ], connector: '~'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something[attrOne!=val1]~dom:somethingElse", function() {
        let context = new ace.Context("dom:something[attrOne!=val1]~dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [
                {"inclusive":true, "attr":"attrone", "eq": "!=", "value": "val1"}
            ], connector: '~'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something[attrOne~val1]~dom:somethingElse", function() {
        let context = new ace.Context("dom:something[attrOne~val1]~dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [
                {"inclusive":true, "attr":"attrone", "eq": "~", "value": "val1"}
            ], connector: '~'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })

    it("Should parse dom:something[attrOne!~val1]~dom:somethingElse", function() {
        let context = new ace.Context("dom:something[attrOne!~val1]~dom:somethingElse");
        expect(JSON.stringify(context.contextInfo)).toEqual(JSON.stringify([
            {inclusive: true, namespace:"dom", role: 'something', attrs: [
                {"inclusive":true, "attr":"attrone", "eq": "!~", "value": "val1"}
            ], connector: '~'},
            {inclusive: true, namespace:"dom", role: 'somethingelse', attrs: [], connector: ''}
        ]));
    })
});