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
 * NAME: browser_info.js
 * DESCRIPTION: Used to test the info emmiter function in
 *              ACReporter.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');
var decache = require('decache');
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
var baseReporterDecorator = function (base) {

};

// Build an emitter to mock dispatch emmiter events to be picked up
// by the karma ACReporter
var emitter = new EventEmitter();

test.beforeEach(function () {
    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test('emit(\'browser_info\') write the results to a file as JSON', function (ava) {

    // Create a new object for ACReporter
    var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitter);

    // Call the onRunStart function to init the summary
    ACReporterObject.onRunStart();

    // Call the emmitter to call the browser_info call to write the scan results to a file
    emitter.emit('browser_info', { name: "Firefox 44.0.0 (Mac OS X 10.11.0)" }, { pageResults: unitTestCommon.scanPageOutput });

    // Extract the outputFolder from the ACConfig (this is the user config that they provid)
    var resultDir = unitTestCommon.configMock.client.ACConfig.outputFolder;

    // Build the full file name based on the label provide in the results and also the results dir specified in the
    // configuration.
    var resultsFileName = path.join(__dirname, '..', '..', '..', '..', resultDir, unitTestCommon.scanPageOutput.label + '.json');

    // Load the file where the results should have been saved to verify that they match with expected
    var readResultsFile = require(resultsFileName);

    ava.deepEqual(readResultsFile, unitTestCommon.scanPageOutput);
});

test('emit(\'browser_info\') write the results to a file as JSON and also profile for metrics server', function (ava) {

    delete unitTestCommon.configMock.ACProfile;

    // Build an emitter to mock dispatch emmiter events to be picked up
    // by the karma ACReporter
    var emitterNew = new EventEmitter();

    // Create a new object for ACReporter
    var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitterNew);

    // Call the onRunStart function to init the summary
    ACReporterObject.onRunStart();

    // Call the emmitter to call the browser_info call to write the scan results to a file
    emitterNew.emit('browser_info', { name: "Firefox 44.0.0 (Mac OS X 10.11.0)" }, { pageResults: unitTestCommon.scanPageOutput });

    // Extract the outputFolder from the ACConfig (this is the user config that they provid)
    var resultDir = unitTestCommon.configMock.client.ACConfig.outputFolder;

    // Build the full file name based on the label provide in the results and also the results dir specified in the
    // configuration.
    var resultsFileName = path.join(__dirname, '..', '..', '..', '..', resultDir, unitTestCommon.scanPageOutput.label + '.json');

    // Load the file where the results should have been saved to verify that they match with expected
    var readResultsFile = require(resultsFileName);

    ava.deepEqual(readResultsFile, unitTestCommon.scanPageOutput);
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});