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
 * NAME: loadConfigFromYAMLorJSONFile.js
 * DESCRIPTION: Used to test the loadConfigFromYAMLorJSONFile function in
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

test('loadConfigFromYAMLorJSONFile() should load .achecker.yml and return config object', function (ava) {

    // Change the directory to a different folder where the .achecker.yml file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "ymlRoot"));

    // Call the loadConfigFromYAMLorJSONFile function to load .achecker.yml from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, unitTestCommon.ACConfigMock);
});

test('loadConfigFromYAMLorJSONFile() should load .achecker.yaml and return config object', function (ava) {

    // Change the directory to a different folder where the .achecker.yaml file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "yamlRoot"));

    // Call the loadConfigFromYAMLorJSONFile function to load .achecker.yaml from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, unitTestCommon.ACConfigMock);
});

test('loadConfigFromYAMLorJSONFile() should load achecker.json and return config object', function (ava) {

    // Change the directory to a different folder where the achecker.json file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "jsonRoot"));

    // Call the loadConfigFromYAMLorJSONFile function to load achecker.json from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, unitTestCommon.ACConfigMock);
});

test('loadConfigFromYAMLorJSONFile() should load achecker.js and return config object', function (ava) {

    // Change the directory to a different folder where the achecker.js file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "jsRoot"));

    // Call the loadConfigFromYAMLorJSONFile function to load achecker.js from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, unitTestCommon.ACConfigMock);
});

test('loadConfigFromYAMLorJSONFile() should load .config/.achecker.yml and return config object', function (ava) {

    // Change the directory to a different folder where the .config/.achecker.yml file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "ymlConfig"));

    // Call the loadConfigFromYAMLorJSONFile function to load .config/.achecker.yml from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, unitTestCommon.ACConfigMock);
});

test('loadConfigFromYAMLorJSONFile() should load .config/.achecker.yaml and return config object', function (ava) {

    // Change the directory to a different folder where the .config/.achecker.yaml file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "yamlConfig"));

    // Call the loadConfigFromYAMLorJSONFile function to load .config/.achecker.yaml from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, unitTestCommon.ACConfigMock);
});

test('loadConfigFromYAMLorJSONFile() should load .config/achecker.json and return config object', function (ava) {

    // Change the directory to a different folder where the .config/achecker.json file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "jsonConfig"));

    // Call the loadConfigFromYAMLorJSONFile function to load .config/achecker.json from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, unitTestCommon.ACConfigMock);
});

test('loadConfigFromYAMLorJSONFile() should load .config/achecker.js and return config object', function (ava) {

    // Change the directory to a different folder where the achecker.js file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "jsConfig"));

    // Call the loadConfigFromYAMLorJSONFile function to load .config/achecker.js from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, unitTestCommon.ACConfigMock);
});

test('loadConfigFromYAMLorJSONFile() should load nothing and return empty config object', function (ava) {

    // Change the directory to a different folder where the achecker.js file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "empty"));

    // Call the loadConfigFromYAMLorJSONFile function to load .config/achecker.js from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, {});
});

test('loadConfigFromYAMLorJSONFile() should load empty config and return empty config object', function (ava) {

    // Change the directory to a different folder where the achecker.js file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "emptyConfigFile"));

    // Call the loadConfigFromYAMLorJSONFile function to load .config/achecker.js from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.deepEqual(configObject, {});
});

test('loadConfigFromYAMLorJSONFile() should throw an exception when invalid yml/yaml file provided for parsing', function (ava) {

    // Change the directory to a different folder where the achecker.js file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "invalidYml"));

    // Call the loadConfigFromYAMLorJSONFile function to load .config/achecker.js from a specific folder and
    // return the config object
    var configObject = ACCommon.loadConfigFromYAMLorJSONFile();

    ava.true(process.exit.calledOnce);
});

test.afterEach.always(function () {
    // Restore the exit function
    process.exit = exitFunction;

    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});