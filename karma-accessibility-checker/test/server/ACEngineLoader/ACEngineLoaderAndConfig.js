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
 * NAME: ACEngineLoaderAndConfig.js
 * DESCRIPTION: Used to test the ACEngineLoaderAndConfig function in
 *              ACEngineLoader.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');
var decache = require('decache');
var fs = require("fs");
var difflet = require("difflet");
var diff = difflet({ indent: 2 });

// Load the function that will be tester
var ACEngineLoader = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACEngineLoader'));
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

    var srcLibPath =  __dirname +"/../../../src/lib/";
    if (fs.existsSync(srcLibPath + 'archives.json')){
        fs.copySync(srcLibPath + 'archives.json', srcLibPath + 'archives_original.json');
        if  (fs.existsSync(srcLibPath + 'archives_original.json')) {
            fs.removeSync(srcLibPath + 'archives.json');
            fs.copySync(__dirname + "/../unitTestCommon/archiveFiles/archives.json", srcLibPath + "/archives.json");
        }
    }
});

test('ACEngineLoaderAndConfig(logger, config) should load engine and karma-ibma config into karma config object', function (ava) {

    // Clone the config object so that we can verify to the original before any changes were made to it
    var configClone = JSON.parse(JSON.stringify(unitTestCommon.configMock));

    // Remove all the files which are in the config, as loading the engine will actually add the files into
    // the object
    unitTestCommon.configMock.files = [];

    // Call the ACEngineLoaderAndConfig function to load engine and karma-ibma config into karma config object
    ACEngineLoader(ACCommon.log, unitTestCommon.configMock);

    // Clean up the expected and actual objects to make them ready for diffing
    delete configClone.client.ACConfig.scanID;
    delete unitTestCommon.configMock.client.ACConfig.scanID;
    configClone.client.ACConfig.ruleArchive = "";

    var extractFileRegex = /[\\|\/](?:.+[\\|\/])*((?:.+)\.(?:.+))$/;

    // Loop over all the files and extract only the file name and set that back to pattern to verify with out any
    // path dependencies.
    for (var i = 0; i < configClone.files.length; i++) {
        var patternMatchesBaseline = extractFileRegex.exec(configClone.files[i].pattern);
        configClone.files[i].pattern = patternMatchesBaseline[1];
    }

    for (var j = 0; j < unitTestCommon.configMock.files.length; j++) {
        var patternMatchesActual = extractFileRegex.exec(unitTestCommon.configMock.files[j].pattern);
        if (patternMatchesActual && patternMatchesActual[1]) {
            unitTestCommon.configMock.files[j].pattern = patternMatchesActual[1];
        }
    }

    ava.deepEqual(unitTestCommon.configMock, configClone, diff.compare(unitTestCommon.configMock, configClone));
});

test('ACEngineLoaderAndConfig(logger, config) should load engine and karma-ibma config into karma config object with authToken specified', function (ava) {

    // Clone the config object so that we can verify to the original before any changes were made to it
    var configClone = JSON.parse(JSON.stringify(unitTestCommon.configMock));

    // Remove all the files which are in the config, as loading the engine will actually add the files into
    // the object
    unitTestCommon.configMock.files = [];

    // Change the directory to a different folder where the .achecker.yml file can be loaded from
    process.chdir(path.join(__dirname, "..", "unitTestCommon", "configFiles", "ymlRoot"));

    // Call the ACEngineLoaderAndConfig function to load engine and karma-ibma config into karma config object
    ACEngineLoader(ACCommon.log, unitTestCommon.configMock);

    // Clean up the expected and actual objects to make them ready for diffing

    // Clean up the scanID as that can change from time to time
    delete configClone.client.ACConfig.scanID;
    delete unitTestCommon.configMock.client.ACConfig.scanID;

    // After the object runs through the function it will build a new rulePack as it will read in a authToken
    configClone.client.ACConfig.rulePack = "https://aat.w3ibm.mybluemix.net/token/47994f55-03f8-4edb-93d5-f8e3c066f269/92cf2e70-5a68-4289-8838-6fb0510569b4/latest/js/";
    configClone.client.ACConfig.authToken = "47994f55-03f8-4edb-93d5-f8e3c066f269/92cf2e70-5a68-4289-8838-6fb0510569b4";

    // Manually change the rule archive
    configClone.client.ACConfig.ruleArchive = "February 2019 Deployment (2019FebDeploy)";

    // New config file contains a different notifcations.slack configuration
    configClone.client.ACConfig.notifications.slack = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration";

    // Policies unittest is null and customRuleServer will not exist
    unitTestCommon.configMock.client.ACConfig.policies = null;
    delete configClone.client.ACConfig.customRuleServer;

    var extractFileRegex = /[\\|\/](?:.+[\\|\/])*((?:.+)\.(?:.+))$/;

    // Loop over all the files and extract only the file name and set that back to pattern to verify with out any
    // path dependencies.
    for (var i = 0; i < configClone.files.length; i++) {
        var patternMatchesBaseline = extractFileRegex.exec(configClone.files[i].pattern);
        configClone.files[i].pattern = patternMatchesBaseline[1];
    }

    for (var j = 0; j < unitTestCommon.configMock.files.length; j++) {
        var patternMatchesActual = extractFileRegex.exec(unitTestCommon.configMock.files[j].pattern);
        if (patternMatchesActual && patternMatchesActual[1]) {
            unitTestCommon.configMock.files[j].pattern = patternMatchesActual[1];
        }
    }

    ava.deepEqual(unitTestCommon.configMock, configClone, diff.compare(unitTestCommon.configMock, configClone));
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
    var srcLibPath =  __dirname +"/../../../src/lib/";
    if (fs.existsSync(srcLibPath + 'archives.json') && fs.existsSync(srcLibPath + 'archives_original.json')){
        fs.removeSync(srcLibPath + 'archives.json');
        fs.copySync(srcLibPath + 'archives_original.json', srcLibPath + 'archives.json');
        fs.removeSync(srcLibPath + 'archives_original.json');
    }
});
