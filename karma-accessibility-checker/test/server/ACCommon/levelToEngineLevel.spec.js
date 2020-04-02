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
 * NAME: levelToEngineLevel.spec.js
 * DESCRIPTION: Used to test the levelToEngineLevel function in
 *              ACCommon.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');

// Load the function that will be tester
var ACCommon = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACCommon.log = require(path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

describe("ACCommon.levelToEngineLevel", function () {

    it('levelToEngineLevel(level) should return "level.violation"', function (done) {

        var expectedEngineReadableViolationLevel = "level.violation";

        // Call the levelToEngineLevel function to get engine readable of "violation"
        var engineViolationLevel = ACCommon.levelToEngineLevel("violation");

        expect(engineViolationLevel).to.equal(expectedEngineReadableViolationLevel);
        done();
    });

    it('levelToEngineLevel(level) should return "level.potentialviolation"', function (done) {

        var expectedEngineReadableViolationLevel = "level.potentialviolation";

        // Call the levelToEngineLevel function to get engine readable of "potential violation"
        var engineViolationLevel = ACCommon.levelToEngineLevel("potential violation");

        expect(engineViolationLevel).to.equal(expectedEngineReadableViolationLevel);
        done();
    });

    it('levelToEngineLevel(level) should return "level.recommendation"', function (done) {

        var expectedEngineReadableViolationLevel = "level.recommendation";

        // Call the levelToEngineLevel function to get engine readable of "recommendation"
        var engineViolationLevel = ACCommon.levelToEngineLevel("recommendation");

        expect(engineViolationLevel).to.equal(expectedEngineReadableViolationLevel);
        done();
    });

    it('levelToEngineLevel(level) should return "level.potentialrecommendation"', function (done) {

        var expectedEngineReadableViolationLevel = "level.potentialrecommendation";

        // Call the levelToEngineLevel function to get engine readable of "potential recommendation"
        var engineViolationLevel = ACCommon.levelToEngineLevel("potential recommendation");

        expect(engineViolationLevel).to.equal(expectedEngineReadableViolationLevel);
        done();
    });

    it('levelToEngineLevel(level) should return "level.manual"', function (done) {

        var expectedEngineReadableViolationLevel = "level.manual";

        // Call the levelToEngineLevel function to get engine readable of "manual"
        var engineViolationLevel = ACCommon.levelToEngineLevel("manual");

        expect(engineViolationLevel).to.equal(expectedEngineReadableViolationLevel);
        done();
    });

    it('levelToEngineLevel(level) should return "undefined"', function (done) {

        var expectedEngineReadableViolationLevel = "undefined";

        // Call the levelToEngineLevel function to get engine readable of "undefined"
        var engineViolationLevel = ACCommon.levelToEngineLevel("undefined");

        expect(engineViolationLevel).to.equal(expectedEngineReadableViolationLevel);
        done();
    });
});
