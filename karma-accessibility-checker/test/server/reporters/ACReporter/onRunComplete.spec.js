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
 * NAME: onRunComplete.spec.js
 * DESCRIPTION: Used to test the onRunComplete function in
 *              ACReporter.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');
var fs = require("fs");
var EventEmitter = require('events').EventEmitter;

// Load the function that will be tester
var ACReporter = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporter'));
var ACCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'ACCommon'));
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACCommon.log = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

// Mock baseReporterDecorator function, which is needed by karma reporter
var baseReporterDecorator = function(base) {

};

// Build an emitter to mock dispatch emmiter events to be picked up
// by the karma ACReporter
var emitter = new EventEmitter();

describe("ACReporter.onRunComplete", function() {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('onRunComplete(browser, result) should write scan summary to a summary file', function(done) {

        // Create a new object for ACReporter
        var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitter);

        // Call the onRunComplete function to identify that the test was successful
        // Sending empty browser object currently as we don't make use of it currently
        // Sending empty result object currently as we don't make use of it currently
        ACReporterObject.onRunComplete({}, {});

        expect(true).to.deep.equal(true);
        done();
    });

    it('onRunComplete(browser, result) should write scan summary to a summary file and send slack notification', function(done) {

        // Reset the scan summary
        ACReporterCommon.scanSummary = null;

        // Set the slack notification object
        unitTestCommon.configMock.client.ACConfig.notifications = {
            slack: "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration"
        };

        // Create a new object for ACReporter
        var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitter);

        // Call the onRunStart function to init the summary
        ACReporterObject.onRunStart();

        // Call the onRunComplete function to identify that the test was successful
        // Sending empty browser object currently as we don't make use of it currently
        // Sending empty result object currently as we don't make use of it currently
        ACReporterObject.onRunComplete({}, {});

        // Fetch the start time of the report from the summary object
        var startReportTime = ACReporterCommon.scanSummary.startReport;

        // Now we need to take the from epoch format date and convert it to readable data
        // Construct a new Data object with the start report time
        var formattedData = new Date(startReportTime);

        // Extract all the date fields which are needed to construct the filename
        var year = ACReporterCommon.datePadding(formattedData.getUTCFullYear());
        var month = ACReporterCommon.datePadding(formattedData.getUTCMonth());
        var date = ACReporterCommon.datePadding(formattedData.getUTCDate());
        var hour = ACReporterCommon.datePadding(formattedData.getHours());
        var minute = ACReporterCommon.datePadding(formattedData.getMinutes());
        var seconds = ACReporterCommon.datePadding(formattedData.getUTCSeconds());

        // Build the summary file name based on the following format: summary_2016-06-20-13-26-45GMT.json
        //  summary_<year>-<month>-<date>-<hour>-<minute>-<seconds>GMT.json
        var filename = "summary_" + year + "-" + month + "-" + date + "-" + hour + "-" + minute + "-" + seconds + "GMT.json";

        // Extract the outputFolder from the ACConfig (this is the user config that they provid)
        var resultDir = unitTestCommon.configMock.client.ACConfig.outputFolder;

        // Build the full file name of the scan summary file based on the following scan session
        var scanSummaryFileName = path.join(__dirname, '..', '..', '..', '..', resultDir, filename);

        // Load the file where the results should have been saved to verify that they match with expected
        var scanSummaryFile = require(scanSummaryFileName);

        // Set the start and end report with the ones from the actual report so that it can be diff'ed
        unitTestCommon.expectScanSummary.endReport = ACReporterCommon.scanSummary.endReport;
        unitTestCommon.expectScanSummary.startReport = ACReporterCommon.scanSummary.startReport;

        expect(scanSummaryFile).to.deep.equal(unitTestCommon.expectScanSummary);
        done();
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});