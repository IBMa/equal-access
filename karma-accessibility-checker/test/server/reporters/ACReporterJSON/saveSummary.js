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
 * NAME: saveSummary.js
 * DESCRIPTION: Used to test the saveSummary function in ACReporterJSON.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');
var decache = require('decache');

// Load the function that will be tester
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));
var ACReporterJSON = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterJSON'));

// Load a mock logger and set it in to ACReporterCommon
ACReporterCommon.log = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

test.beforeEach(function () {
    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test('saveSummary(config, summary) should save the scan summary to a file', function (ava) {

    // Call the saveSummary function to save the scan summary to the file based on the start time
    ACReporterJSON.saveSummary(unitTestCommon.configMock, unitTestCommon.expectScanSummary);

    // Fetch the start time of the report from the summary object
    var startReportTime = unitTestCommon.expectScanSummary.startReport;

    // Now we need to take the from epoch format date and convert it to readable data
    // Construct a new Data object with the start report time
    var formattedData = new Date(startReportTime);

    // Extract all the date fields which are needed to construct the filename
    var year = ACReporterCommon.datePadding(formattedData.getUTCFullYear());
    var month = ACReporterCommon.datePadding(formattedData.getUTCMonth()+1);
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

    ava.deepEqual(scanSummaryFile, unitTestCommon.expectScanSummary);
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});
