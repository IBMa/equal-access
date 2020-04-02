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
 * NAME: exit.js
 * DESCRIPTION: Used to test the exit emmiter function in
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
var emitter = null;

// Fetch the exit function to restore back
var exitFunction = process.exit;

// Fetch if this is travis env or not and use this to set or unset and reset
var travis = null;

test.beforeEach(function () {
    // Set any empty function for exit
    // process.exit = function(returnCode) {

    // };
    travis = process.env.TRAVIS;
    emitter = new EventEmitter();
    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test.cb('emit(\'exit\') should send no slack notification when error occured and not on TRAVIS ENV', function (ava) {

    // Set env variable TRAVIS to cover testing for local slack notification
    delete process.env.TRAVIS;

    // Create a new object for ACReporter
    var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitter);

    // Call the onRunStart function to init the summary
    ACReporterObject.onRunStart();

    // Call the onRunComplete function to identify that the test was successful
    // Sending empty browser object currently as we don't make use of it currently
    // Sending empty result object currently as we don't make use of it currently
    ACReporterObject.onRunComplete({}, {});

    // Build a wrapper done function around ava assertion
    var done = function () {
        ava.is(true, true);
        ava.end();
    };

    // Call the emmitter to call the exit call with the done to identify that the call has finished and to
    // get out of this call.
    emitter.emit('exit', done);
});

test.cb('emit(\'exit\') should send no slack notification when error occured and on TRAVIS ENV', function (ava) {

    // Set env variable TRAVIS to cover testing for local slack notification
    process.env.TRAVIS = true;

    // Reset the scan summary
    ACReporterCommon.scanSummary = null;

    // Set the slack notification object
    unitTestCommon.configMock.client.ACConfig.notifications = {
        localRun: false,
        slack: "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration"
    };

    // Create a new object for ACReporter
    var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitter);

    // Call the onRunStart function to init the summary
    ACReporterObject.onRunStart();

    // Call the onRunComplete function to identify that the test was successful
    // Sending empty browser object currently as we don't make use of it currently
    ACReporterObject.onRunComplete({}, {error: true, success: 0, failed: 0});

    // Build a wrapper done function around ava assertion
    var done = function () {
        ava.is(true, true);
        ava.end();
    };

    // Call the emmitter to call the exit call with the done to identify that the call has finished and to
    // get out of this call.
    emitter.emit('exit', done);
});

test.cb('emit(\'exit\') should send no slack notification when on TRAVIS ENV', function (ava) {

    // Set env variable TRAVIS to dispatch slack notification
    process.env.TRAVIS = true;

    // Reset the scan summary
    ACReporterCommon.scanSummary = null;

    // Set the slack notification object
    unitTestCommon.configMock.client.ACConfig.notifications = {
        localRun: false,
        slack: "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration"
    };

    // Create a new object for ACReporter
    var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitter);

    // Call the onRunStart function to init the summary
    ACReporterObject.onRunStart();

    // Call the onRunComplete function to identify that the test was successful
    // Sending empty browser object currently as we don't make use of it currently
    ACReporterObject.onRunComplete({}, {error: false, success: 1, failed: 1});

    // Build a wrapper done function around ava assertion
    var done = function () {
        ava.is(true, true);
        ava.end();
    };

    // Call the emmitter to call the exit call with the done to identify that the call has finished and to
    // get out of this call.
    emitter.emit('exit', done);
});

test.cb('emit(\'exit\') should send slack notification when running locally', function (ava) {

    // Set env variable TRAVIS to cover testing for local slack notification
    delete process.env.TRAVIS;

    // Reset the scan summary
    ACReporterCommon.scanSummary = null;

    // Set the slack notification object
    unitTestCommon.configMock.client.ACConfig.notifications = {
        localRun: true,
        slack: "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration"
    };

    // Create a new object for ACReporter
    var ACReporterObject = new ACReporter(baseReporterDecorator, unitTestCommon.configMock, ACCommon.log, emitter);

    // Call the onRunStart function to init the summary
    ACReporterObject.onRunStart();

    // Call the onRunComplete function to identify that the test was successful
    // Sending empty browser object currently as we don't make use of it currently
    ACReporterObject.onRunComplete({}, {error: false, success: 1, failed: 1});

    // Build a wrapper done function around ava assertion
    var done = function () {
        ava.is(true, true);
        ava.end();
    };

    // Call the emmitter to call the exit call with the done to identify that the call has finished and to
    // get out of this call.
    emitter.emit('exit', done);
});

test.afterEach.always(function () {
    // Restore the exit function
    process.exit = exitFunction;

    emitter = null;

    // Re-set TRAVIS env
    process.env.TRAVIS = travis;

    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});