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
 * NAME: sendLogsV2.js
 * DESCRIPTION: Used to test the sendLogsV2 function in ACMetricsLogger.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');
var decache = require('decache');

// Load the function that will be tester
var ACMetricsLogger = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'log', 'ACMetricsLogger'));

// Load a mock logger
var logger = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Create a new object for ACMetricsLogger
var ACMetricsLoggerObject = new ACMetricsLogger("karma-accessibility-checker-v2.4.0", logger, ["IBM_Accessibility"]);

test('sendLogsV2(done, rulePack) should send scan results to metrics server and ACMetricsLogger.scanTimesV2 should be empty', function (ava) {

    // Re-init ACMetricsLoggerObject.scanTimeV2
    ACMetricsLoggerObject.scanTimesV2 = {};

    // Call the profile function with scan time
    ACMetricsLoggerObject.profileV2(123, "Chrome");

    var done = function () {
    };

    // Send the logs to the metrics server
    ACMetricsLoggerObject.sendLogsV2(done, "http://localhost:3000");

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV2, {"Chrome": []});
});

test('sendLogsV2(done, rulePack) should NOT send mertics logs and ACMetricsLogger.scanTimesV2 should be empty with aChecker rulePack', function (ava) {

    // Re-init ACMetricsLoggerObject.scanTimeV2
    ACMetricsLoggerObject.scanTimesV2 = {};

    var done = function () {
    };

    // Send the logs to the metrics server
    ACMetricsLoggerObject.sendLogsV2(done, "https://aat.w3ibm.mybluemix.net/token/47994f55-03f8-4edb-93d5-f8e3c066f269/92cf2e70-5a68-4289-8838-6fb0510569b4/dap/js/latest/");

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV2, {});
});

test('sendLogsV2(done, rulePack) should NOT send mertics logs and ACMetricsLogger.scanTimesV2 should be empty with invalid aat server', function (ava) {

    // Re-init ACMetricsLoggerObject.scanTimeV2
    ACMetricsLoggerObject.scanTimesV2 = {};

    var done = function () {
    };

    // Send the logs to the metrics server
    ACMetricsLoggerObject.sendLogsV2(done, "https://aat.w3ibm.mybluemix.net/");

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV2, {});
});

test('sendLogsV2(done, rulePack) should NOT send mertics logs and ACMetricsLogger.scanTimesV2 should be empty and should set timeout', function (ava) {

    // Re-init ACMetricsLoggerObject.scanTimeV2
    ACMetricsLoggerObject.scanTimesV2 = {};

    ACMetricsLoggerObject.timeout = function (time) {
    };

    var done = function () {
    };

    // Send the logs to the metrics server
    ACMetricsLoggerObject.sendLogsV2(done, "https://aat.w3ibm.mybluemix.net/");

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV2, {});
});