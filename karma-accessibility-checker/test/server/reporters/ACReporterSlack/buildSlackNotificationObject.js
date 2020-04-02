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
 * NAME: buildSlackNotificationObject.js
 * DESCRIPTION: Used to test the buildSlackNotificationObject function in
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

    delete process.env.TRAVIS_REPO_SLUG;
    delete process.env.TRAVIS_BRANCH;
    delete process.env.TRAVIS_BUILD_NUMBER;
    delete process.env.TRAVIS_JOB_ID;
    delete process.env.TRAVIS_COMMIT;
    delete process.env.TRAVIS_COMMIT_RANGE;
    delete process.env.TRAVIS_JOB_NUMBER;
    delete process.env.TRAVIS_PULL_REQUES

    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test('buildSlackNotificationObject(scanSummary, config, result) should return a failing slack notification object for local run', function (ava) {

    var expectedSlackNotificationObject = unitTestCommon.slackNotificationObjectFail;

    // Call the buildSlackNotificationObject function with all the information that is needed to get the slack notification object
    var slackNotificationObject = ACReporterSlack.buildSlackNotificationObject(unitTestCommon.expectScanSummary, unitTestCommon.configMock, unitTestCommon.karmaResultObjectFail);

    ava.deepEqual(slackNotificationObject, expectedSlackNotificationObject);
});

test('buildSlackNotificationObject(scanSummary, config, result) should return a passing slack notification object for local run', function (ava) {

    var expectedSlackNotificationObject = unitTestCommon.slackNotificationObjectPass;

    // Call the buildSlackNotificationObject function with all the information that is needed to get the slack notification object
    var slackNotificationObject = ACReporterSlack.buildSlackNotificationObject(unitTestCommon.expectScanSummary, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass);

    ava.deepEqual(slackNotificationObject, expectedSlackNotificationObject);
});

test('buildSlackNotificationObject(scanSummary, config, result) should return a failing slack notification object for Travis CI run', function (ava) {

    var expectedSlackNotificationObject = unitTestCommon.slackNotificationObjectFail;

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

    // Call the buildSlackNotificationObject function with all the information that is needed to get the slack notification object
    var slackNotificationObject = ACReporterSlack.buildSlackNotificationObject(unitTestCommon.expectScanSummary, unitTestCommon.configMock, unitTestCommon.karmaResultObjectFail);

    // Build regex to parse the user name for slack notification
    var regex = /(.*by \*)(.*)(\* \*[PASSED|FAIL].*)/;
    var match = regex.exec(slackNotificationObject.text);
    console.log(slackNotificationObject.text);
    expectedSlackNotificationObject.text = "Build <https://travis-ci.org/IBMa/karma-accessibility-checker/jobs/1365120|#600.1> (<https://github.ibm.com/IBMa/karma-accessibility-checker/compare/0b6be9934250...0e487f5b9c6d|0e487f5>) of *IBMa/karma-accessibility-checker@slackIntegration in PR <https://github.ibm.com/IBMa/karma-accessibility-checker/pull/123|#123> * by *" + match[2] + "* *FAILED* accessibility tests in *-277778 hrs 13 min -40 sec* with the following:";
    ava.deepEqual(slackNotificationObject, expectedSlackNotificationObject);
});

test('buildSlackNotificationObject(scanSummary, config, result) should return a passing slack notification object for Travis CI run', function (ava) {

    var expectedSlackNotificationObject = unitTestCommon.slackNotificationObjectPass;

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

    // Call the buildSlackNotificationObject function with all the information that is needed to get the slack notification object
    var slackNotificationObject = ACReporterSlack.buildSlackNotificationObject(unitTestCommon.expectScanSummary, unitTestCommon.configMock, unitTestCommon.karmaResultObjectPass);

    // Build regex to parse the user name for slack notification
    // Build regex to parse the user name for slack notification
    var regex = /(.*by \*)(.*)(\* \*[PASSED|FAIL].*)/;
    var match = regex.exec(slackNotificationObject.text);
    console.log(slackNotificationObject.text);
    expectedSlackNotificationObject.text = "Build <https://travis-ci.org/IBMa/karma-accessibility-checker/jobs/1365120|#600.1> (<https://github.ibm.com/IBMa/karma-accessibility-checker/compare/0b6be9934250...0e487f5b9c6d|0e487f5>) of *IBMa/karma-accessibility-checker@slackIntegration in PR <https://github.ibm.com/IBMa/karma-accessibility-checker/pull/123|#123> * by *" + match[2] + "* *PASSED* accessibility tests in *-277778 hrs 13 min -40 sec* with the following:";


    ava.deepEqual(slackNotificationObject, expectedSlackNotificationObject);
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
