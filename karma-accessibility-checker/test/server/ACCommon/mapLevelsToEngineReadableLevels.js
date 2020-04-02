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
 * NAME: mapLevelsToEngineReadableLevels.js
 * DESCRIPTION: Used to test the mapLevelsToEngineReadableLevels function in
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

test('mapLevelsToEngineReadableLevels(levelArray) should return engine readable violation levels', function (ava) {

    // Build a level Array with all the violation levels which can be provided from config file
    var levelArray = [
        "violation",
        "potential violation",
        "recommendation",
        "potential recommendation",
        "manual"
    ];

    // Call the mapLevelsToEngineReadableLevels function to convert the levels into an array that is readable by the engine
    var convertedLevelArray = ACCommon.mapLevelsToEngineReadableLevels(levelArray);

    var expectedLevelArray = [
        "level.violation",
        "level.potentialviolation",
        "level.recommendation",
        "level.potentialrecommendation",
        "level.manual"
    ];

    ava.deepEqual(convertedLevelArray, expectedLevelArray);
});