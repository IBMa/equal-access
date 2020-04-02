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
 * NAME: index.js
 * DESCRIPTION: Used to test main karma-ibma loader, to verify that loading works
 *              in karma. Verify the objects that the loader would return back.

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require("path");

// Load the function that will be tester
var MAINLoader = require(path.join(__dirname, '..', '..', '..', 'src', 'index'));

var expectedLoadConfig = {
    "preprocessor:aChecker": {
        "type": "factory",
        "content": "function",
        "$inject": [
            "logger"
        ]
    },
    "framework:aChecker": {
        "type": "factory",
        "content": "function",
        "$inject": [
            "logger",
            "config"
        ]
    },
    "reporter:aChecker": {
        "type": "type",
        "content": "function",
        "$inject": [
            "baseReporterDecorator",
            "config",
            "logger",
            "emitter"
        ]
    }
};


test('loading: preprocessor:aChecker should verify that type, function and inject is correct', function (ava) {

    // Build preprocessor load content to verify
    var preprocessorLoad = {
        "type": MAINLoader["preprocessor:aChecker"][0],
        "content": typeof MAINLoader["preprocessor:aChecker"][1],
        "$inject": MAINLoader["preprocessor:aChecker"][1].$inject
    };

    ava.deepEqual(preprocessorLoad, expectedLoadConfig["preprocessor:aChecker"]);
});

test('loading: framework:aChecker should verify that type, function and inject is correct', function (ava) {

    // Build framework load content to verify
    var frameworkLoad = {
        "type": MAINLoader["framework:aChecker"][0],
        "content": typeof MAINLoader["framework:aChecker"][1],
        "$inject": MAINLoader["framework:aChecker"][1].$inject
    };

    ava.deepEqual(frameworkLoad, expectedLoadConfig["framework:aChecker"]);
});

test('loading: reporter:aChecker should verify that type, function and inject is correct', function (ava) {

    // Build reporter load content to verify
    var reporterLoad = {
        "type": MAINLoader["reporter:aChecker"][0],
        "content": typeof MAINLoader["reporter:aChecker"][1],
        "$inject": MAINLoader["reporter:aChecker"][1].$inject
    };

    ava.deepEqual(reporterLoad, expectedLoadConfig["reporter:aChecker"]);
});