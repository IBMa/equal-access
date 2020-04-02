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
 * NAME: profileV2.js
 * DESCRIPTION: Used to test the profileV2 function in ACMetricsLogger.js

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
var ACMetricsLoggerObject = new ACMetricsLogger("karma-accessibility-checker-v2.4.0", logger, null);

test('profileV2(scanTime) should add scan time to ACMetricsLogger.scanTimeV2 and expect {"Chrome": [123]}', function (ava) {

    // Call the profile function with scan time
    ACMetricsLoggerObject.profileV2(123, "Chrome");

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV2, {"Chrome": [123]});
});

test('profileV2(scanTime) should add scan time to ACMetricsLogger.scanTimeV2 and expect {"Chrome": [123], "Firefox": [123]}', function (ava) {

    // Call the profile function with scan time
    ACMetricsLoggerObject.profileV2(123, "Firefox");

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV2, {"Chrome": [123], "Firefox": [123]});
});

test('profileV2(scanTime) should add scan time to ACMetricsLogger.scanTimeV2 and expect {"Chrome": [123,123], "Firefox": [123]}', function (ava) {

    // Call the profile function with scan time
    ACMetricsLoggerObject.profileV2(123, "Chrome");

    ava.deepEqual(ACMetricsLoggerObject.scanTimesV2, {"Chrome": [123,123], "Firefox": [123]});
});