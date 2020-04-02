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
 * NAME: parseSlackTarget.js
 * DESCRIPTION: Used to test the parseSlackTarget function in
 *              ACReporterSlack.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');
var decache = require('decache');

// Load the function that will be tester
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));
var ACReporterSlack = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterSlack'));

// Load a mock logger and set it in to ACReporterCommon
ACReporterCommon.log = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

// Stores the unitTest common objects
var unitTestCommon;

// Path to the unitTest common module
var unitTestCommonModule = path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'unitTestCommon');

test.beforeEach(function () {
    decache(unitTestCommonModule);
    unitTestCommon = require(unitTestCommonModule);
});

test('parseSlackTarget(slackTarget) should return slack information object with account, token and channel', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration";

    var expectedSlackInformation = {
        "slackServerAccount": "ibm-accessibility",
        "token": "xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "channel": "#a11y-tool-integration"
    };

    // Call the parseSlackTarget function with the slack target and get back the parsed slack information
    var parsedSlackInformation = ACReporterSlack.parseSlackTarget(slackTarget);

    ava.deepEqual(parsedSlackInformation, expectedSlackInformation);
});

test('parseSlackTarget(slackTarget) should return slack information object with account, and token', function (ava) {

    // Slack target details for where the slack notification needs to go
    var slackTarget = "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    var expectedSlackInformation = {
        "slackServerAccount": "ibm-accessibility",
        "token": "xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    };

    // Call the parseSlackTarget function with the slack target and get back the parsed slack information
    var parsedSlackInformation = ACReporterSlack.parseSlackTarget(slackTarget);

    ava.deepEqual(parsedSlackInformation, expectedSlackInformation);
});

test.afterEach.always(function () {
    decache(unitTestCommonModule);
    unitTestCommon = undefined;
});
