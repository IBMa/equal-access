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
 * NAME: isTravisCI.js
 * DESCRIPTION: Used to test the isTravisCI function in ACReporterSlack.js

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

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when all environment vars are undefined', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": undefined,
        "TRAVIS_BRANCH": undefined,
        "TRAVIS_BUILD_NUMBER": undefined,
        "TRAVIS_JOB_ID": undefined,
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": undefined
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when only TRAVIS_REPO_SLUG is provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": "IBMa/karma-accessibility-checker",
        "TRAVIS_BRANCH": undefined,
        "TRAVIS_BUILD_NUMBER": undefined,
        "TRAVIS_JOB_ID": undefined,
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": undefined
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when only TRAVIS_BRANCH is provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": undefined,
        "TRAVIS_BRANCH": "slackIntegration",
        "TRAVIS_BUILD_NUMBER": undefined,
        "TRAVIS_JOB_ID": undefined,
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": undefined
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when only TRAVIS_BUILD_NUMBER is provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": undefined,
        "TRAVIS_BRANCH": undefined,
        "TRAVIS_BUILD_NUMBER": "600",
        "TRAVIS_JOB_ID": undefined,
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": undefined
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when only TRAVIS_JOB_ID is provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": undefined,
        "TRAVIS_BRANCH": undefined,
        "TRAVIS_BUILD_NUMBER": undefined,
        "TRAVIS_JOB_ID": "1365120",
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": undefined
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when only TRAVIS_COMMIT is provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": undefined,
        "TRAVIS_BRANCH": undefined,
        "TRAVIS_BUILD_NUMBER": undefined,
        "TRAVIS_JOB_ID": undefined,
        "TRAVIS_COMMIT": "0e487f5",
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": undefined
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when only TRAVIS_COMMIT_RANGE is provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": undefined,
        "TRAVIS_BRANCH": undefined,
        "TRAVIS_BUILD_NUMBER": undefined,
        "TRAVIS_JOB_ID": undefined,
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": "0b6be9934250...0e487f5b9c6d",
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": undefined
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when only TRAVIS_JOB_NUMBER is provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": undefined,
        "TRAVIS_BRANCH": undefined,
        "TRAVIS_BUILD_NUMBER": undefined,
        "TRAVIS_JOB_ID": undefined,
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": "600",
        "TRAVIS_PULL_REQUEST": undefined
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when only TRAVIS_JOB_NUMBER is provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": undefined,
        "TRAVIS_BRANCH": undefined,
        "TRAVIS_BUILD_NUMBER": undefined,
        "TRAVIS_JOB_ID": undefined,
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": "false"
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is NOT travis CI when couple of environment vars are provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": "IBMa/karma-accessibility-checker",
        "TRAVIS_BRANCH": "slackIntegration",
        "TRAVIS_BUILD_NUMBER": "600",
        "TRAVIS_JOB_ID": "1365120",
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": undefined,
        "TRAVIS_PULL_REQUEST": "false"
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, false);
});

test('isTravisCI(travisCIEnvVar) should return it is travis CI when all required environment vars are provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": "IBMa/karma-accessibility-checker",
        "TRAVIS_BRANCH": "slackIntegration",
        "TRAVIS_BUILD_NUMBER": "600",
        "TRAVIS_JOB_ID": "1365120",
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": "600",
        "TRAVIS_PULL_REQUEST": "false"
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, true);
});

test('isTravisCI(travisCIEnvVar) should return it is travis CI when all environment vars are provided except TRAVIS_COMMIT_RANGE', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": "IBMa/karma-accessibility-checker",
        "TRAVIS_BRANCH": "slackIntegration",
        "TRAVIS_BUILD_NUMBER": "600",
        "TRAVIS_JOB_ID": "1365120",
        "TRAVIS_COMMIT": "0e487f5",
        "TRAVIS_COMMIT_RANGE": undefined,
        "TRAVIS_JOB_NUMBER": "600",
        "TRAVIS_PULL_REQUEST": "false"
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, true);
});

test('isTravisCI(travisCIEnvVar) should return it is travis CI when all environment vars are provided except TRAVIS_COMMIT', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": "IBMa/karma-accessibility-checker",
        "TRAVIS_BRANCH": "slackIntegration",
        "TRAVIS_BUILD_NUMBER": "600",
        "TRAVIS_JOB_ID": "1365120",
        "TRAVIS_COMMIT": undefined,
        "TRAVIS_COMMIT_RANGE": "0b6be9934250...0e487f5b9c6d",
        "TRAVIS_JOB_NUMBER": "600",
        "TRAVIS_PULL_REQUEST": "false"
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, true);
});

test('isTravisCI(travisCIEnvVar) should return it is travis CI when all environment vars are provided', function (ava) {

    var travisCIEnvironmentVariables = {
        "TRAVIS_REPO_SLUG": "IBMa/karma-accessibility-checker",
        "TRAVIS_BRANCH": "slackIntegration",
        "TRAVIS_BUILD_NUMBER": "600",
        "TRAVIS_JOB_ID": "1365120",
        "TRAVIS_COMMIT": "0e487f5",
        "TRAVIS_COMMIT_RANGE": "0b6be9934250...0e487f5b9c6d",
        "TRAVIS_JOB_NUMBER": "600",
        "TRAVIS_PULL_REQUEST": "false"
    };

    // Call isTravisCI function to see if it is in travis or not
    var isTravisCI = ACReporterSlack.isTravisCI(travisCIEnvironmentVariables);

    ava.is(isTravisCI, true);
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});
