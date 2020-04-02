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
 * NAME: processACConfig.spec.js
 * DESCRIPTION: Used to test the processACConfig function in
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

describe("ACCommon.processACConfig", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('processACConfig(ACConfig) should process the config and return the exact same config back', function (done) {

        // Call the processACConfig function to verify that all the config options are correct
        var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

        expect(ACConfigProcessed).to.deep.equal(unitTestCommon.ACConfigDefaultMock);
        done();
    });

    it('processACConfig(ACConfig) should process the config and return an updated config with policies processed from array', function (done) {

        // Add an array of policies into the object to process
        unitTestCommon.ACConfigDefaultMock.policies = ["IBM_Accessibility", "IBM_Accessibility"];

        // Call the processACConfig function to verify that all the config options are correct
        var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

        expect(ACConfigProcessed.policies).to.deep.equal(["IBM_Accessibility", "IBM_Accessibility"]);
        done();
    });

    it('processACConfig(ACConfig) should process the config and return an updated config with policies processed from string', function (done) {

        // Add an string comma seperated list of policies into the object to process
        unitTestCommon.ACConfigDefaultMock.policies = "IBM_Accessibility,IBM_Accessibility";

        // Call the processACConfig function to verify that all the config options are correct
        var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

        expect(ACConfigProcessed.policies).to.deep.equal(["IBM_Accessibility", "IBM_Accessibility"]);
        done();
    });

    it('processACConfig(ACConfig) should process the config and return an updated config with slack notification verified', function (done) {

        // Add slack notification
        unitTestCommon.ACConfigDefaultMock.notifications = {
            slack: "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration"
        };

        // Call the processACConfig function to verify that all the config options are correct
        var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

        expect(ACConfigProcessed.notifications).to.deep.equal(unitTestCommon.ACConfigDefaultMock.notifications);
        done();
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});