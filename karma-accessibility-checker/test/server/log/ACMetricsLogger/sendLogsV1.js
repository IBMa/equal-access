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
 * NAME: sendLogsV1.js
 * DESCRIPTION: Used to test the sendLogsV1 function in ACMetricsLogger.js

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

test('sendLogs(browser) should send scan results to metrics server and ACMetricsLoggerObject.scanTimesV1 should be empty', function (ava) {

    // Re-init ACMetricsLoggerObject.scanTimeV1
    ACMetricsLoggerObject.scanTimesV1 = [];

    // Call the profile function with scan time
    ACMetricsLoggerObject.profileV1(123);

    // Send the logs to the metrics server
    ACMetricsLoggerObject.sendLogsV1(encodeURIComponent("Firefox 44.0.0 (Mac OS X 10.11.0)"));

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV1, []);
});

test('sendLogs(browser) should NOT send mertics logs and ACMetricsLoggerObject.scanTimesV1 should be empty', function (ava) {

    // Re-init ACMetricsLoggerObject.scanTime
    ACMetricsLoggerObject.scanTimesV1 = [];

    // Send the logs to the metrics server
    ACMetricsLoggerObject.sendLogsV1(encodeURIComponent("Firefox 44.0.0 (Mac OS X 10.11.0)"));

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV1, []);
});