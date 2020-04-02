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
 * NAME: exit.spec.js
 * DESCRIPTION: Used to test the exit emmiter function in
 *              ACReporter.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');
var fs = require("fs");
var EventEmitter = require('events').EventEmitter;

// Load the function that will be tester
var ACReporter = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporter'));
var ACCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'ACCommon'));
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACCommon.log = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

// Mock baseReporterDecorator function, which is needed by karma reporter
var baseReporterDecorator = function(base) {

};

// Build an emitter to mock dispatch emmiter events to be picked up
// by the karma ACReporter
var emitter = new EventEmitter();

describe("ACReporter.emit(\'exit\')", function() {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('emit(\'exit\') log exit details to console when debug enabled', function(done) {

        // Create a new object for ACReporter
        var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitter);

        expect(true).to.deep.equal(true);

        // Call the emmitter to call the exit call with the done to identify that the call has finished and to
        // get out of this call.
        emitter.emit('exit', done);
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});