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
 * NAME: getViolationMappingToHumanReadable.spec.js
 * DESCRIPTION: Used to test the getViolationMappingToHumanReadable function in
 *              ACReporterSlack.js

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

describe("ACReporterSlack.getViolationMappingToHumanReadable", function () {

    it('getViolationMappingToHumanReadable(violationType) should return "Violations"', function (done) {

        var expectedHumanReadableViolationType = "Violations";

        // Call the getViolationMappingToHumanReadable function to get human readable of "violation"
        var attachmentsFieldsForViolations = ACReporterSlack.getViolationMappingToHumanReadable("violation");

        expect(attachmentsFieldsForViolations).to.equal(expectedHumanReadableViolationType);
        done();
    });

    it('getViolationMappingToHumanReadable(violationType) should return "Potential Violations"', function (done) {

        var expectedHumanReadableViolationType = "Potential Violations";

        // Call the getViolationMappingToHumanReadable function to get human readable of "potentialviolation"
        var attachmentsFieldsForViolations = ACReporterSlack.getViolationMappingToHumanReadable("potentialviolation");

        expect(attachmentsFieldsForViolations).to.equal(expectedHumanReadableViolationType);
        done();
    });

    it('getViolationMappingToHumanReadable(violationType) should return "Recommendations"', function (done) {

        var expectedHumanReadableViolationType = "Recommendations";

        // Call the getViolationMappingToHumanReadable function to get human readable of "recommendation"
        var attachmentsFieldsForViolations = ACReporterSlack.getViolationMappingToHumanReadable("recommendation");

        expect(attachmentsFieldsForViolations).to.equal(expectedHumanReadableViolationType);
        done();
    });

    it('getViolationMappingToHumanReadable(violationType) should return "Potential Recommendations"', function (done) {

        var expectedHumanReadableViolationType = "Potential Recommendations";

        // Call the getViolationMappingToHumanReadable function to get human readable of "potentialrecommendation"
        var attachmentsFieldsForViolations = ACReporterSlack.getViolationMappingToHumanReadable("potentialrecommendation");

        expect(attachmentsFieldsForViolations).to.equal(expectedHumanReadableViolationType);
        done();
    });

    it('getViolationMappingToHumanReadable(violationType) should return "Manual Checks"', function (done) {

        var expectedHumanReadableViolationType = "Manual Checks";

        // Call the getViolationMappingToHumanReadable function to get human readable of "manual"
        var attachmentsFieldsForViolations = ACReporterSlack.getViolationMappingToHumanReadable("manual");

        expect(attachmentsFieldsForViolations).to.equal(expectedHumanReadableViolationType);
        done();
    });

    it('getViolationMappingToHumanReadable(violationType) should return "UNKNOWN"', function (done) {

        var expectedHumanReadableViolationType = "UNKNOWN";

        // Call the getViolationMappingToHumanReadable function to get human readable of "UNKNOWN"
        var attachmentsFieldsForViolations = ACReporterSlack.getViolationMappingToHumanReadable("UNKNOWN");

        expect(attachmentsFieldsForViolations).to.equal(expectedHumanReadableViolationType);
        done();
    });
});
