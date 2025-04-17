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
 * NAME: writeObjectToFileAsJSON.spec.js
 * DESCRIPTION: Used to test the writeObjectToFileAsJSON function in ACReporterJSON.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');
var fs = require('fs');

// Load the function that will be tester
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));
var ACReporterJSON = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterJSON'));

// Load a mock logger and set it in to ACReporterCommon
ACReporterCommon.log = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

describe("ACReporterJSON.writeObjectToFileAsJSON", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('writeObjectToFileAsJSON(fileName, content) should write JSON object to a file', function (done) {

        // Extract the outputFolder from the ACConfig (this is the user config that they provid)
        var resultDir = unitTestCommon.configMock.client.ACConfig.outputFolder;

        // Build the full file name of the scan summary file based on the following scan session
        var unitTestFileName = path.join(__dirname, '..', '..', '..', '..', resultDir, "unitTestFileWithoutHierarchy.json");

        // Call the writeObjectToFileAsJSON function to write a JSON object to a file
        ACReporterJSON.writeObjectToFileAsJSON(unitTestFileName, unitTestCommon.expectScanSummary);

        // Load the file where the results should have been saved to verify that they match with expected
        var scanSummaryFile = require(unitTestFileName);

        expect(scanSummaryFile).to.deep.equal(unitTestCommon.expectScanSummary);
        done();
    });

    it('writeObjectToFileAsJSON(fileName, content) should write JSON object to a file based on hierarchy', function (done) {

        // Extract the outputFolder from the ACConfig (this is the user config that they provid)
        var resultDir = unitTestCommon.configMock.client.ACConfig.outputFolder;

        // Remove all the directories which will be created by this testcase if they exists already
        fs.removeSync(path.join(__dirname, '..', '..', '..', '..', resultDir, "one"));

        // Build the full file name of the scan summary file based on the following scan session
        var unitTestFileName = path.join(__dirname, '..', '..', '..', '..', resultDir, "one", "two", "three", "four", "five", "six", "unitTestFileWithHierarchy.json");

        // Call the writeObjectToFileAsJSON function to write a JSON object to a file
        ACReporterJSON.writeObjectToFileAsJSON(unitTestFileName, unitTestCommon.expectScanSummary);

        // Load the file where the results should have been saved to verify that they match with expected
        var scanSummaryFile = require(unitTestFileName);

        expect(scanSummaryFile).to.deep.equal(unitTestCommon.expectScanSummary);
        done();
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});
