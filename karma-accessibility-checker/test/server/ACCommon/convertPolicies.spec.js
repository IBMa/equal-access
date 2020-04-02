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

/*******************************************************************************
 * NAME: convertPolicies.spec.js
 * DESCRIPTION: Used to test the convertPolicies function in
 *              ACCommon.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');
var fs = require("fs");

// Load the function that will be tester
var ACCommon = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACCommon.log = require(path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

describe("ACCommon.convertPolicies", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('convertPolicies(policies) should convert provided policies array into array and return it', function (done) {

        // Call the convertPolicies function to convert the policies into an array
        var policiesConverted = ACCommon.convertPolicies(["IBM_Accessibility", "IBM_Accessibility"]);

        expect(policiesConverted).to.deep.equal(["IBM_Accessibility", "IBM_Accessibility"]);
        done();
    });

    it('convertPolicies(policies) should convert provided policies string into array and return it', function (done) {

        // Call the convertPolicies function to convert the policies into an array
        var policiesConverted = ACCommon.convertPolicies("IBM_Accessibility,IBM_Accessibility");

        expect(policiesConverted).to.deep.equal(["IBM_Accessibility", "IBM_Accessibility"]);
        done();
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});