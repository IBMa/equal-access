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
 * NAME: savePageResults.js
 * DESCRIPTION: Used to test the savePageResults function in ACReporterJSON.js

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

test('savePageResults(config, results) should save the scan results to a file', function (ava) {

    // Update the label to add unitTest folder path in the label to write the results into the unitTest
    // folder and also cover testing folder creation if does not exist
    unitTestCommon.scanPageOutput.label = "unitTest/" + unitTestCommon.scanPageOutput.label;

    // Call the savePageResults function to save the scan results to the file based on the label
    ACReporterJSON.savePageResults(unitTestCommon.configMock, unitTestCommon.scanPageOutput);

    // Extract the outputFolder from the ACConfig (this is the user config that they provid)
    var resultDir = unitTestCommon.configMock.client.ACConfig.outputFolder;

    // Build the full file name based on the label provide in the results and also the results dir specified in the
    // configuration.
    var resultsFileName = path.join(__dirname, '..', '..', '..', '..', resultDir, unitTestCommon.scanPageOutput.label + '.json');

    // Load the file where the results should have been saved to verify that they match with expected
    var readResultsFile = require(resultsFileName);

    ava.deepEqual(readResultsFile, unitTestCommon.scanPageOutput);
});

test('savePageResults(config, results) should save the scan results to a file based on hierarchy', function (ava) {

    // Update the label to add unitTest folder path in the label to write the results into the unitTest
    // folder and also cover testing folder creation if does not exist
    unitTestCommon.scanPageOutput.label = "unitTest/one/two/three/four/five/six/seven/" + unitTestCommon.scanPageOutput.label;

    // Call the savePageResults function to save the scan results to the file based on the label
    ACReporterJSON.savePageResults(unitTestCommon.configMock, unitTestCommon.scanPageOutput);

    // Extract the outputFolder from the ACConfig (this is the user config that they provid)
    var resultDir = unitTestCommon.configMock.client.ACConfig.outputFolder;

    // Build the full file name based on the label provide in the results and also the results dir specified in the
    // configuration.
    var resultsFileName = path.join(__dirname, '..', '..', '..', '..', resultDir, unitTestCommon.scanPageOutput.label + '.json');

    // Load the file where the results should have been saved to verify that they match with expected
    var readResultsFile = require(resultsFileName);

    ava.deepEqual(readResultsFile, unitTestCommon.scanPageOutput);
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});
