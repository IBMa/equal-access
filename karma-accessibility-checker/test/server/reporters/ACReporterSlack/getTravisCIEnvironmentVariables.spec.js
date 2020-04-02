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
 * NAME: getTravisCIEnvironmentVariables.spec.js
 * DESCRIPTION: Used to test the getTravisCIEnvironmentVariables function in
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

describe("ACReporterSlack.getTravisCIEnvironmentVariables", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('getTravisCIEnvironmentVariables() should read and return TRAVIS CI environments (all empty)', function (done) {

        var expectedtravisCIEnvironmentVariables = {
            "TRAVIS_REPO_SLUG": undefined,
            "TRAVIS_BRANCH": undefined,
            "TRAVIS_BUILD_NUMBER": undefined,
            "TRAVIS_JOB_ID": undefined,
            "TRAVIS_COMMIT": undefined,
            "TRAVIS_COMMIT_RANGE": undefined,
            "TRAVIS_JOB_NUMBER": undefined,
            "TRAVIS_PULL_REQUEST": undefined
        };

        // Call getTravisCIEnvironmentVariables function to get travis ci environment variables
        var travisCIEnvironmentVariables = ACReporterSlack.getTravisCIEnvironmentVariables();

        expect(travisCIEnvironmentVariables).to.deep.equal(expectedtravisCIEnvironmentVariables);
        done();
    });

    it('getTravisCIEnvironmentVariables() should read and return TRAVIS CI environments (all filled)', function (done) {

        var expectedtravisCIEnvironmentVariables = {
            "TRAVIS_REPO_SLUG": "IBMa/karma-accessibility-checker",
            "TRAVIS_BRANCH": "slackIntegration",
            "TRAVIS_BUILD_NUMBER": "600",
            "TRAVIS_JOB_ID": "1365120",
            "TRAVIS_COMMIT": "0e487f5",
            "TRAVIS_COMMIT_RANGE": "0b6be9934250...0e487f5b9c6d",
            "TRAVIS_JOB_NUMBER": "600",
            "TRAVIS_PULL_REQUEST": "false"
        };

        // Set all the Travis CI variables which are read by karma-ibma to detect if running in travis env
        // Also build a different tyle of slack notification object.
        process.env.TRAVIS_REPO_SLUG = "IBMa/karma-accessibility-checker";
        process.env.TRAVIS_BRANCH = "slackIntegration";
        process.env.TRAVIS_BUILD_NUMBER = "600";
        process.env.TRAVIS_JOB_ID = "1365120";
        process.env.TRAVIS_COMMIT = "0e487f5";
        process.env.TRAVIS_COMMIT_RANGE = "0b6be9934250...0e487f5b9c6d";
        process.env.TRAVIS_JOB_NUMBER = "600";
        process.env.TRAVIS_PULL_REQUEST = "false";

        // Call getTravisCIEnvironmentVariables function to get travis ci environment variables
        var travisCIEnvironmentVariables = ACReporterSlack.getTravisCIEnvironmentVariables();

        expect(travisCIEnvironmentVariables).to.deep.equal(expectedtravisCIEnvironmentVariables);
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
