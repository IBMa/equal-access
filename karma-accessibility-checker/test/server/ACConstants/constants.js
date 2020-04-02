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
 * NAME: constants.js
 * DESCRIPTION: Used to test the constants from ACConstants.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');
var decache = require('decache');
var fs = require("fs");

// Load the function that will be tester
var ACConstants = require(path.join(__dirname, '..', '..', '..', 'src', 'lib', 'ACConstants'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

test.beforeEach(function () {
    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test('ACConstants.constants should match expected', function (ava) {
    var isWin = /^win/.test(process.platform);

    if (isWin) {
        unitTestCommon.expectedConstants.configFiles = [
            ".achecker.yml",
            ".achecker.yaml",
            "achecker",
            ".config\\.achecker.yml",
            ".config\\.achecker.yaml",
            ".config\\achecker"
        ];
    }

    ava.deepEqual(ACConstants, unitTestCommon.expectedConstants);
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});