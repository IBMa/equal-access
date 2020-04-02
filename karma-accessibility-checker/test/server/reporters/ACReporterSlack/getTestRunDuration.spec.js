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
 * NAME: getTestRunDuration.spec.js
 * DESCRIPTION: Used to test the getTestRunDuration function in ACReporterSlack.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');

// Load the function that will be tester
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));
var ACReporterSlack = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterSlack'));

// Load a mock logger and set it in to ACReporterCommon
ACReporterCommon.log = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

describe("ACReporterSlack.getTestRunDuration", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('getTestRunDuration(scanSummary) should return a duration with hour and 0 sec', function (done) {

        unitTestCommon.expectScanSummary.startReport = 1480906017000;
        unitTestCommon.expectScanSummary.endReport = 1480909617000;

        // Call getTestRunDuration function to get the duration
        var duration = ACReporterSlack.getTestRunDuration(unitTestCommon.expectScanSummary);

        expect(duration).to.equal("1 hrs 0 sec");
        done();
    });

    it('getTestRunDuration(scanSummary) should return a duration with min and 0 sec', function (done) {

        unitTestCommon.expectScanSummary.startReport = 1480906017000;
        unitTestCommon.expectScanSummary.endReport = 1480906617000;

        // Call getTestRunDuration function to get the duration
        var duration = ACReporterSlack.getTestRunDuration(unitTestCommon.expectScanSummary);

        expect(duration).to.equal("10 min 0 sec");
        done();
    });

    it('getTestRunDuration(scanSummary) should return a duration with sec', function (done) {

        unitTestCommon.expectScanSummary.startReport = 1480906572000;
        unitTestCommon.expectScanSummary.endReport = 1480906617000;

        // Call getTestRunDuration function to get the duration
        var duration = ACReporterSlack.getTestRunDuration(unitTestCommon.expectScanSummary);

        expect(duration).to.equal("45 sec");
        done();
    });

    it('getTestRunDuration(scanSummary) should return a duration with hr, min and sec', function (done) {

        unitTestCommon.expectScanSummary.startReport = 1480905010000;
        unitTestCommon.expectScanSummary.endReport = 1480909557000;

        // Call getTestRunDuration function to get the duration
        var duration = ACReporterSlack.getTestRunDuration(unitTestCommon.expectScanSummary);

        expect(duration).to.equal("1 hrs 15 min 47 sec");
        done();
    });

    afterEach(function (done) {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;

        done();
    });
});
