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
 * NAME: sendSlackNotificationWithSummary.js
 * DESCRIPTION: Used to test the sendSlackNotificationWithSummary function in
 *              ACReporterSlack.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
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

test.beforeEach(function () {
    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test.cb('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result, done) should dispatch a slack notification for failure case using Slack API', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration";

    var done = function() {
        ava.truthy(true);
        ava.end();
    };

    // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
    // notification
    ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectFail, done);
});

test.cb('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result, done) should dispatch a slack notification for failure case using Slack API without channel', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    var done = function() {
        ava.truthy(true);
        ava.end();
    };

    // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
    // notification
    ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectFail, done);
});

test.cb('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result, done) should dispatch a real slack notification for passing case using Slack API', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "ibm-accessibility:xoxp-30333352626-38940427350-107107541668-670fb433a248e46da027d391f4b3f1a3#a11y-tool-integration";

    var done = function() {
        ava.truthy(true);
        ava.end();
    };

    // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
    // notification
    ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass, done);
});

test.cb('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result, done) should dispatch a slack notification for failure case using webhook', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

    var done = function() {
        ava.truthy(true);
        ava.end();
    };

    // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
    // notification
    ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectFail, done);
});

test.cb('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result, done) should dispatch a slack notification for passing case using webhook', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

    var done = function() {
        ava.truthy(true);
        ava.end();
    };

    // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
    // notification
    ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass, done);
});

test.cb('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result, done) should dispatch a real slack notification for passing case using webook', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "https://hooks.slack.com/services/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";

    var done = function() {
        ava.truthy(true);
        ava.end();
    };

    // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
    // notification
    ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass, done);
});

test.cb('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result, done) should dispatch a slack notification for passing case using Slack API in travis', function (ava) {

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

    var done = function() {
        ava.truthy(true);
        ava.end();
    };

    // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
    // notification
    ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass, done);
});

test.cb('sendSlackNotificationWithSummary(scanSummary, slackTarget, config, result, done) should dispatch a slack notification for passing case using Slack API', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration";

    var done = function() {
        ava.truthy(true);
        ava.end();
    };

    // Call the sendSlackNotificationWithSummary function with all the information that is needed to dispatch a slack
    // notification
    ACReporterSlack.sendSlackNotificationWithSummary(unitTestCommon.expectScanSummary, slackTarget, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass, done);
});

test.afterEach.always(function () {
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
});
