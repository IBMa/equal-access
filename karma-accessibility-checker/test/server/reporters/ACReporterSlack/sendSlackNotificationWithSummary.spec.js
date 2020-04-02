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
 * NAME: sendSlackNotificationWithSummary.spec.js
 * DESCRIPTION: Used to test the sendSlackNotificationWithSummary function in
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

describe("ACReporterSlack.sendSlackNotificationWithSummary", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result) should dispatch a slack notification for failure case using Slack API', function (done) {

        // Slack target details for where the slack notification needs to go
        var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration";

        // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
        // notification
        ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectFail);

        expect(true).to.deep.equal(true);
        done();
    });

    it('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result) should dispatch a slack notification for failure case using Slack API without channel', function (done) {

        // Slack target details for where the slack notification needs to go
        var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

        // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
        // notification
        ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectFail);

        expect(true).to.deep.equal(true);
        done();
    });

    it('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result) should dispatch a slack notification for passing case using Slack API', function (done) {

        // Slack target details for where the slack notification needs to go
        var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration";

        // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
        // notification
        ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass);

        expect(true).to.deep.equal(true);
        done();
    });

    it('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result) should dispatch a slack notification for failure case using webhook', function (done) {

        // Slack target details for where the slack notification needs to go
        var slackTarget = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

        // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
        // notification
        ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectFail);

        expect(true).to.deep.equal(true);
        done();
    });

    it('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result) should dispatch a slack notification for passing case using webhook', function (done) {

        // Slack target details for where the slack notification needs to go
        var slackTarget = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

        // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
        // notification
        ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass);

        expect(true).to.deep.equal(true);
        done();
    });

    it('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result) should dispatch a slack notification for passing case using Slack API in travis', function (done) {

        // Slack target details for where the slack notification needs to go
        var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration";

        // Set all the Travis CI variables which are read by karma-ibma to detect if running in travis env
        // Also build a different tyle of slack notification object.
        process.env.TRAVIS_REPO_SLUG = "IBMa/karma-accessibility-checker";
        process.env.TRAVIS_BRANCH = "slackIntegration";
        process.env.TRAVIS_BUILD_NUMBER = "600";
        process.env.TRAVIS_JOB_ID = "1365120";
        process.env.TRAVIS_COMMIT = "0e487f5";
        process.env.TRAVIS_COMMIT_RANGE = "0b6be9934250...0e487f5b9c6d";
        process.env.TRAVIS_JOB_NUMBER = "600.1";
        process.env.TRAVIS_PULL_REQUEST = "123";

        // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
        // notification
        ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass);

        expect(true).to.deep.equal(true);
        done();
    });

    afterEach(function (done) {
        // delete all the Travis CI variables which are read by karma-ibma
        delete process.env.TRAVIS_REPO_SLUG;
        delete process.env.TRAVIS_BRANCH;
        delete process.env.TRAVIS_BUILD_NUMBER;
        delete process.env.TRAVIS_JOB_ID;
        delete process.env.TRAVIS_COMMIT;
        delete process.env.TRAVIS_COMMIT_RANGE;
        delete process.env.TRAVIS_JOB_NUMBER;
        delete process.env.TRAVIS_PULL_REQUEST;

        decache(unitTestCommonModule);
        unitTestCommon = undefined;

        done();
    });
});
