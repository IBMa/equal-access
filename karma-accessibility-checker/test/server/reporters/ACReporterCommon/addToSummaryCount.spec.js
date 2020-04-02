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
 * NAME: addToSummaryCount.spec.js
 * DESCRIPTION: Used to test the addToSummaryCount function in ACReporterCommon.js

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

describe("ACReporterCommon.addToSummaryCount", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('addToSummaryCount(pageCount) should add scan summary count to ACReporterCommon.scanSummary.counts', function (done) {

        // Pass the mock config object into initialize summary function to add results to global
        ACReporterCommon.scanSummary = ACReporterCommon.initializeSummary(unitTestCommon.configMock);

        // Remove the counts from the init, as init will actually init the counts as well
        delete ACReporterCommon.scanSummary.counts;

        // Add scan summary counts into the global summary count object
        ACReporterCommon.addToSummaryCount(unitTestCommon.scanPageOutput.summary.counts);

        // Expected results once results are added to global
        var pageCount = {
            "manual": 0,
            "potentialrecommendation": 0,
            "potentialviolation": 0,
            "recommendation": 0,
            "violation": 1
        };

        expect(ACReporterCommon.scanSummary.counts).to.deep.equal(unitTestCommon.scanPageOutput.summary.counts);
        done();
    });

    it('addToSummaryCount(pageCount) should update scan summary count at ACReporterCommon.scanSummary.counts', function (done) {

        // Pass the mock config object into initialize summary function to add results to global
        ACReporterCommon.scanSummary = ACReporterCommon.initializeSummary(unitTestCommon.configMock);

        // Add scan summary counts into the global summary count object
        ACReporterCommon.addToSummaryCount(unitTestCommon.scanPageOutput.summary.counts);

        // update scan summary count in global with another scan count
        ACReporterCommon.addToSummaryCount(unitTestCommon.scanPageOutput.summary.counts);

        // Expected results once 2 results are combined
        var scanSummaryCount = {
            "manual": 0,
            "potentialrecommendation": 0,
            "potentialviolation": 0,
            "recommendation": 0,
            "violation": 2
        };

        expect(ACReporterCommon.scanSummary.counts).to.deep.equal(scanSummaryCount);
        done();
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});
