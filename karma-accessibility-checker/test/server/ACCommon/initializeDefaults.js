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
 * NAME: initializeDefaults.js
 * DESCRIPTION: Used to test the initializeDefaults function in
 *              ACCommon.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');
var decache = require('decache');
var fs = require("fs");

// Load the function that will be tester
var ACCommon = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACCommon.log = require(path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

test.beforeEach(function () {
    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test('initializeDefaults(config) should not need to init any default values as all config options provided', function (ava) {

    // Call the initializeDefaults function to init all the defaults
    ACCommon.initializeDefaults(unitTestCommon.ACConfigDefaultMock);

    delete unitTestCommon.ACConfigDefaultMock.scanID;

    // Update the ACConfigDefaultMock to have the latest toolID
    unitTestCommon.ACConfigDefaultMock.toolID = unitTestCommon.toolID;

    ava.deepEqual(unitTestCommon.ACConfigDefaultMock, unitTestCommon.ACConfigDefaultMock);
});

test('initializeDefaults(config) should init notifications.localRun when not provided but still contains notification object', function (ava) {

    // Remove notifications.localRun to cover the case where there is a slack notification but localRun was not provided
    delete unitTestCommon.ACConfigDefaultMock.notifications.localRun;

    // Add a slack notification
    unitTestCommon.ACConfigDefaultMock.notifications = {
        slack: "ibm-cio:asdfasdfasdfasdfasdfsadf#a11y-test-tools"
    }

    // Call the initializeDefaults function to init all the defaults
    ACCommon.initializeDefaults(unitTestCommon.ACConfigDefaultMock);

    delete unitTestCommon.ACConfigDefaultMock.scanID;

    // Update the ACConfigDefaultMock to have the latest toolID
    unitTestCommon.ACConfigDefaultMock.toolID = unitTestCommon.toolID;

    ava.deepEqual(unitTestCommon.ACConfigDefaultMock, unitTestCommon.ACConfigDefaultMock);
});

test('initializeDefaults(config) should init the default values when config provided is empty', function (ava) {

    // Empty aChecker Config value
    var ACConfig = {};

    // Call the initializeDefaults function to init all the defaults
    ACCommon.initializeDefaults(ACConfig);

    delete unitTestCommon.ACConfigDefaultMock.scanID;
    delete ACConfig.scanID;
    delete unitTestCommon.ACConfigDefaultMock.authToken;

    // Update the ACConfigDefaultMock to have the latest toolID
    unitTestCommon.ACConfigDefaultMock.toolID = unitTestCommon.toolID;

    ava.deepEqual(ACConfig, unitTestCommon.ACConfigDefaultMock);
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});