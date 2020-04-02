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
 * NAME: indexACbaselinePreprocessor.spec.js
 * DESCRIPTION: Used to test the indexACbaselinePreprocessor function in
 *              ACPreprocessor.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');
var fs = require("fs");

// Load the function that will be tester
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));
var ACPreprocessor = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACPreprocessor'));

// Load a mock logger and set it in to ACReporterCommon
ACReporterCommon.log = require(path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

describe("ACPreprocessor.indexACbaselinePreprocessor", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('indexACbaselinePreprocessor(logger) should return a function', function (done) {

        // Call the preprocessor function to get back the function which is called to process the files
        var processFile = ACPreprocessor(ACReporterCommon.log);

        expect(typeof processFile).to.equal("function");
        done();
    });

    it('indexACbaselinePreprocessor(logger) should load baseline', function (done) {

        // Build path name of the baseline file
        var baselineFile = path.join(__dirname, "baselinePreprocessSample.json");

        // Read the content of the baseline file
        var content = fs.readFileSync(baselineFile, 'utf8');

        // Build a karma file object which is needed by the preprocessor function called
        // This is a mock fail object which is what karma would send to the preprocessor
        var karmaFileObject = {
            path: baselineFile,
            originalPath: baselineFile,
            contentPath: baselineFile,
            mtime: "Mon Nov 14 2016 19:49:29 GMT-0500 (Eastern Standard Time)",
            isUrl: false,
            doNotCache: false
        };

        // Build the path to the expected baseline processed content
        var expectedBaselinePreprocessContent = path.join(__dirname, "..", "unitTestCommon", "expectedMockObjects", "expectedBaselinePreprocess.js");

        // Read in the expected content
        var expectedContent = fs.readFileSync(expectedBaselinePreprocessContent, 'utf8');

        // Create a callback function which will be used to verify the processed/converted content from the karma preprocessor
        var callbackFunction = function (newContent) {
            expect(newContent).to.equal(expectedContent);
            done();
        };

        // Call the preprocessor function to get back the function which is called to process the files
        var processFile = ACPreprocessor(ACReporterCommon.log);

        // Call the function which was returned from the ACPreprocessor
        processFile(content, karmaFileObject, callbackFunction, ACReporterCommon.log);
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});