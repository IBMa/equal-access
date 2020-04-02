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
 * NAME: processKarmaConfiguration.js
 * DESCRIPTION: Used to test the processKarmaConfiguration function in
 *              ACCommon.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');
var decache = require('decache');
var fs = require("fs");
var sinon = require("sinon");

// Load the function that will be tester
var ACCommon = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACCommon.log = require(path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

// Fetch the exit function to restore back
var exitFunction = process.exit;

test.beforeEach(function () {

    exitFunction = process.exit;

    // Setup a spy call for process.exit as we expect it to be called
    process.exit = sinon.spy();

    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test('processKarmaConfiguration(config) should process the config and return the exact same config back', function (ava) {

    // Change the directory to a different folder where the achecker.js file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "empty"));

    // Fetch the karma config object
    var karmaConfig = unitTestCommon.configMock;

    // Call the processKarmaConfiguration function process the karma config object provided
    ACCommon.processKarmaConfiguration(karmaConfig);

    ava.deepEqual(karmaConfig, karmaConfig);
});

test('processKarmaConfiguration(config) should process the config and update it based on loading config from file', function (ava) {

    // Change the directory to a different folder where the achecker.js file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "ymlRoot"));

    // Fetch the karma config object
    var karmaConfig = unitTestCommon.configMock;

    // Call the processKarmaConfiguration function process the karma config object provided
    ACCommon.processKarmaConfiguration(karmaConfig);

    ava.deepEqual(karmaConfig, karmaConfig);
});

test('processKarmaConfiguration(config) should process the config and update it based on ACConfig in karma config file', function (ava) {

    // Fetch the karma config object
    var karmaConfig = unitTestCommon.configMock;

    // Set the current ACConfig in the client into ACConfig of the root
    karmaConfig.ACConfig = unitTestCommon.configMock.client.ACConfig;

    // Change the directory to a different folder where the achecker.js file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "empty"));

    // Call the processKarmaConfiguration function process the karma config object provided
    ACCommon.processKarmaConfiguration(karmaConfig);

    ava.deepEqual(karmaConfig, karmaConfig);
});

test.afterEach.always(function () {
    // Restore the exit function
    process.exit = exitFunction;

    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});