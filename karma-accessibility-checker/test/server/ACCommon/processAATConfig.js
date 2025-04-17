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
 * NAME: processACConfig.js
 * DESCRIPTION: Used to test the processACConfig function in
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
var ACConstants = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACConstants'));

// Load a mock logger and set it in to ACReporterCommon
ACCommon.log = require(path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

test.beforeEach(function () {
    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
    //move the archives json file to use a dummy archives for our testing purposes
    var srcLibPath =  __dirname +"/../../../src/lib/";
    if (fs.existsSync(srcLibPath + 'archives.json')){
        fs.copySync(srcLibPath + 'archives.json', srcLibPath + 'archives_original.json');
        if  (fs.existsSync(srcLibPath + 'archives_original.json')) {
            fs.removeSync(srcLibPath + 'archives.json');
            fs.copySync(__dirname + "/../unitTestCommon/archiveFiles/archives.json", srcLibPath + "/archives.json");
        }
    }
});

test('processACConfig(ACConfig) should process the config and return the exact same config back', function (ava) {

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    ava.deepEqual(ACConfigProcessed, unitTestCommon.ACConfigDefaultMock);
});

test('processACConfig(ACConfig) should process the config and return an updated config with policies processed from array', function (ava) {

    // Add an array of policies into the object to process
    unitTestCommon.ACConfigDefaultMock.policies = ["IBM_Accessibility", "IBM_Accessibility"];

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    ava.deepEqual(ACConfigProcessed.policies, ["IBM_Accessibility", "IBM_Accessibility"]);
});

test('processACConfig(ACConfig) should process the config and return an updated config with policies processed from string', function (ava) {

    // Add an string comma seperated list of policies into the object to process
    unitTestCommon.ACConfigDefaultMock.policies = "IBM_Accessibility,IBM_Accessibility";

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    ava.deepEqual(ACConfigProcessed.policies, ["IBM_Accessibility", "IBM_Accessibility"]);
});

test('processACConfig(ACConfig) should process the config and return an updated config with slack notification verified', function (ava) {

    // Add slack notification
    unitTestCommon.ACConfigDefaultMock.notifications = {
        slack: "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration"
    };

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    ava.deepEqual(ACConfigProcessed.notifications, unitTestCommon.ACConfigDefaultMock.notifications);
});

test('processACConfig(ACConfig) should process the config and return an updated config with baseA11yServerURL verified and a new rulePack', function (ava) {

    // Add a baseA11yServerURL
    unitTestCommon.ACConfigDefaultMock.baseA11yServerURL = "https://localhost:9443";

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    // Set the expected rulePack server
    unitTestCommon.ACConfigDefaultMock.rulePack = "https://localhost:9443/token/47994f55-03f8-4edb-93d5-f8e3c066f269/92cf2e70-5a68-4289-8838-6fb0510569b4/latest/js/";

    ava.deepEqual(ACConfigProcessed.rulePack, unitTestCommon.ACConfigDefaultMock.rulePack);
});

test('processACConfig(ACConfig) should process the config and return an updated config with rule archive path verified and a new rulePack', function (ava) {

        // Add a baseA11yServerURL
    unitTestCommon.ACConfigDefaultMock.ruleArchive = "2017MarchDeploy";

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    // Set the expected rulePack server
    unitTestCommon.ACConfigDefaultMock.rulePack = "https://localhost:9443/token/47994f55-03f8-4edb-93d5-f8e3c066f269/92cf2e70-5a68-4289-8838-6fb0510569b4/archives/2017MarchDeploy/js/";

    ava.deepEqual(ACConfigProcessed.rulePack, unitTestCommon.ACConfigDefaultMock.rulePack);
});

test('processACConfig(ACConfig) should exit as no ruleArchive with that name exist or rule achive has been sunset', function (ava) {

    var exitFunction = process.exit;

    // overright the process.exit function
    process.exit = function(exitCode) {

    };
    // Set a sunset ruleArchive
    unitTestCommon.ACConfigDefaultMock.ruleArchive = "2016OctDeploy";

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    // Restore exit function
    process.exit = exitFunction;

    ava.deepEqual(ACConfigProcessed.rulePack, unitTestCommon.ACConfigDefaultMock.rulePack);
});

test('processACConfig(ACConfig) should exit as no authToken is provided', function (ava) {

    // backup the exit function
    var exitFunction = process.exit;

    // overright the process.exit function
    process.exit = function(exitCode) {

    };

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    // Restore exit function
    process.exit = exitFunction;

    ava.deepEqual(ACConfigProcessed.rulePack, unitTestCommon.ACConfigDefaultMock.rulePack);
});

test('processACConfig(ACConfig) should process the config and return an updated config with baseA11yServerURL verified and a new rulePack', function (ava) {

    // Remove authToken
    delete unitTestCommon.ACConfigDefaultMock.authToken;

    // Set customRuleServer to true
    unitTestCommon.ACConfigDefaultMock.customRuleServer = true;

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    ava.deepEqual(ACConfigProcessed.rulePack, unitTestCommon.ACConfigDefaultMock.rulePack);
});

test('processACConfig(ACConfig) should exit as authToken is not in a valid format', function (ava) {

    // backup the exit function
    var exitFunction = process.exit;

    // overright the process.exit function
    process.exit = function(exitCode) {

    };

    // Set an invalid formatted authentication token
    unitTestCommon.ACConfigDefaultMock.authToken = "0-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000";

    // Call the processACConfig function to verify that all the config options are correct
    var ACConfigProcessed = ACCommon.processACConfig(unitTestCommon.ACConfigDefaultMock);

    // Restore exit function
    process.exit = exitFunction;

    ava.deepEqual(ACConfigProcessed.rulePack, unitTestCommon.ACConfigDefaultMock.rulePack);
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
    // delete the archives File, and replace with the original archives file
    var srcLibPath =  __dirname +"/../../../src/lib/";
    if (fs.existsSync(srcLibPath + 'archives.json') && fs.existsSync(srcLibPath + 'archives_original.json')){
        fs.removeSync(srcLibPath + 'archives.json');
        fs.copySync(srcLibPath + 'archives_original.json', srcLibPath + 'archives.json');
        fs.removeSync(srcLibPath + 'archives_original.json');
    }

});