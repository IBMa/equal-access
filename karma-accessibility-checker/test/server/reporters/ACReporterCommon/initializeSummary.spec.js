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
 * NAME: initializeSummary.spec.js
 * DESCRIPTION: Used to test the initializeSummary function in ACReporterCommon.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');

// Load the function that will be tester
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACReporterCommon.log = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

describe("ACReporterCommon.initializeSummary", function() {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('initializeSummary(config) should return initialized scan summary object based on mock config object', function(done) {
        // Pass the mock config object into initialize summary function to get a scanSummary
        var scanSummary = ACReporterCommon.initializeSummary(unitTestCommon.configMock);

        // Update the toolID to make sure it is latest
        unitTestCommon.expectScanSummary.toolID = unitTestCommon.toolID;

        // Update some of the items to make sure they are consistent with expected scan
        scanSummary.startReport = 999999999999;

        expect(scanSummary).to.deep.equal(unitTestCommon.expectScanSummary);
        done();
    });

    it('initializeSummary(config) should return initialized scan summary object based on mock config object with counts populated by default values', function(done) {
        // Remove reportLevels from the ACConfig object to verify that init is able to populate it automatically.
        delete unitTestCommon.configMock.client.ACConfig.reportLevels;

        // Pass the mock config object into initialize summary function to get a scanSummary
        var scanSummary = ACReporterCommon.initializeSummary(unitTestCommon.configMock);

        // Update the expectScanSummary to adjust expect scan summary
        unitTestCommon.expectScanSummary.toolID = unitTestCommon.toolID;
        unitTestCommon.expectScanSummary.reportLevels = undefined;

        // Update some of the items to make sure they are consistent with expected scan
        scanSummary.startReport = 999999999999;

        expect(scanSummary).to.deep.equal(unitTestCommon.expectScanSummary);
        done();
    });

    it('initializeSummary(config) should return initialized scan summary object based on mock config object with counts populated with some violations levels', function(done) {
        // Remove reportLevels from the ACConfig object to verify that init is able to populate it automatically.
        unitTestCommon.configMock.client.ACConfig.reportLevels = [
            "violation",
            "potentialrecommendation",
            "manual"
        ];

        // Pass the mock config object into initialize summary function to get a scanSummary
        var scanSummary = ACReporterCommon.initializeSummary(unitTestCommon.configMock);

        // Update the expectScanSummary to adjust expect scan summary
        unitTestCommon.expectScanSummary.toolID = unitTestCommon.toolID;
        unitTestCommon.expectScanSummary.counts = {
            "violation": 0,
            "potentialrecommendation": 0,
            "manual": 0
        };
        unitTestCommon.expectScanSummary.reportLevels = [
            "violation",
            "potentialrecommendation",
            "manual"
        ];

        // Update some of the items to make sure they are consistent with expected scan
        scanSummary.startReport = 999999999999;

        expect(scanSummary).to.deep.equal(unitTestCommon.expectScanSummary);
        done();
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});
