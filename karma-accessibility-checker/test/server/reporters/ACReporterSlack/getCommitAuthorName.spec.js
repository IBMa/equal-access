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
 * NAME: getCommitAuthorName.spec.js
 * DESCRIPTION: Used to test the getCommitAuthorName function in
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

var origPATH = process.env.PATH;
var origCWD = process.cwd();

describe("ACReporterSlack.getCommitAuthorName", function () {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('getCommitAuthorName() should return commit author\'s name', function (done) {

        // Save the current path
        origPATH = process.env.PATH;

        // Call getCommitAuthorName function to get authors name who made the last commit
        var COMMITER_NAME = ACReporterSlack.getCommitAuthorName();

        expect(COMMITER_NAME).to.not.be.equal("UNKNOWN");
        done();
    });

    it('getCommitAuthorName() should return UNKNOWN when git command does not exist', function (done) {

        // Save the current path
        origPATH = process.env.PATH;

        // Set the path to empty so that, we can check what happen when git command is not found
        process.env.PATH = "";

        // Call getCommitAuthorName function to get authors name who made the last commit
        var COMMITER_NAME = ACReporterSlack.getCommitAuthorName();

        expect(COMMITER_NAME).to.be.equal("UNKNOWN");
        done();
    });

    it('getCommitAuthorName() should return UNKNOWN when .git folder does not exist in current directory', function (done) {

        // Save the current working directory to restore back from
        origCWD = process.cwd();

        // change the directory out of the current github repository and move to a place where there is no .git folder
        process.chdir('../../../../../');

        // Call getCommitAuthorName function to get authors name who made the last commit
        var COMMITER_NAME = ACReporterSlack.getCommitAuthorName();

        expect(COMMITER_NAME).to.be.equal("UNKNOWN");
        done();
    });

    afterEach(function (done) {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;

        process.env.PATH = origPATH;
        process.chdir(origCWD);

        done();
    });
});
