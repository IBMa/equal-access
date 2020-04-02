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
 * NAME: buildAttachmentsFieldsForViolationsCount.spec.js
 * DESCRIPTION: Used to test the buildAttachmentsFieldsForViolationsCount function in
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

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

describe("ACReporterSlack.buildAttachmentsFieldsForViolationsCount", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('buildAttachmentsFieldsForViolationsCount(scanSummary) should return the slack notification attachment fields for violation counts when failing', function (done) {

        var expectedAttachmentsFieldsForViolationsObject = {
            "attachmentFields": unitTestCommon.slackNotificationObjectFail.attachments[0].fields,
            "attachmentFieldsFallback": unitTestCommon.slackNotificationObjectFail.attachments[0].fallback
        };

        // Call the buildAttachmentsFieldsForViolationsCount function with all the information that is needed to get attachments fields object
        var attachmentsFieldsForViolations = ACReporterSlack.buildAttachmentsFieldsForViolationsCount(unitTestCommon.expectScanSummary);

        expect(attachmentsFieldsForViolations).to.deep.equal(expectedAttachmentsFieldsForViolationsObject);
        done();
    });

    it('buildAttachmentsFieldsForViolationsCount(scanSummary) should return the slack notification attachment fields for violation counts when passing', function (done) {

        var expectedAttachmentsFieldsForViolationsObject = {
            "attachmentFields": unitTestCommon.slackNotificationObjectPass.attachments[0].fields,
            "attachmentFieldsFallback": unitTestCommon.slackNotificationObjectPass.attachments[0].fallback
        };

        // Call the buildAttachmentsFieldsForViolationsCount function with all the information that is needed to get attachments fields object
        var attachmentsFieldsForViolations = ACReporterSlack.buildAttachmentsFieldsForViolationsCount(unitTestCommon.expectScanSummary);

        expect(attachmentsFieldsForViolations).to.deep.equal(expectedAttachmentsFieldsForViolationsObject);
        done();
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});
