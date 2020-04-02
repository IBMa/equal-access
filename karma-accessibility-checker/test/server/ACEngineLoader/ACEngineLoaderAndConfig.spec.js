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
 * NAME: ACEngineLoaderAndConfig.spec.js
 * DESCRIPTION: Used to test the ACEngineLoaderAndConfig function in
 *              ACEngineLoader.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var expect = require("chai").expect;
var path = require('path');
var decache = require('decache');
var fs = require("fs");

// Load the function that will be tester
var ACEngineLoader = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACEngineLoader'));
var ACCommon = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACCommon.log = require(path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

describe("ACEngineLoader.ACEngineLoaderAndConfig", function() {

    beforeEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = require(unitTestCommonModule);
    });

    it('ACEngineLoaderAndConfig(logger, config) should load engine and karma-ibma config into karma config object', function(done) {

        // Clone the config object so that we can verify to the original before any changes were made to it
        var configClone = unitTestCommon.configMock;
        //var configClone = JSON.parse(JSON.stringify(unitTestCommon.configMock));

        // Remove all the files which are in the config, as loading the engine will actually add the files into
        // the object
        unitTestCommon.configMock.files = [];

        // Call the ACEngineLoaderAndConfig function to load engine and karma-ibma config into karma config object
        ACEngineLoader(ACCommon.log, unitTestCommon.configMock);

        // Clean up the expected and actual objects to make them ready for diffing
        delete configClone.client.ACConfig.scanID;
        delete unitTestCommon.configMock.client.ACConfig.scanID;

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

        expect(unitTestCommon.configMock).to.deep.equal(configClone);
        done();
    });

    afterEach(function() {
        decache(unitTestCommonModule);
        unitTestCommon = undefined;
    });
});