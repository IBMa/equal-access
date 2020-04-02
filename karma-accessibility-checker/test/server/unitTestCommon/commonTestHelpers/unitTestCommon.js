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
 * NAME: unitTestCommon.js
 * DESCRIPTION: Contains common objects that are needed for the tests.

 *******************************************************************************/

// Load all the modules that are needed
var path = require('path');

// Load in the package.json file so that we can extract the module name and the version to build
// a toolID which needs to be used when results are build for the purpose of keeping track of
// which tool is uploading the results.
var packageObject = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'package.json'));

// Build the toolID based on name and version
var toolID = packageObject.name + "-v" + packageObject.version;

// Load any and all mock data that is needed for this test
var configMock = require(path.join(__dirname, '..', 'configMocks', 'karmaConfig'));

// Fetch the expected Scan Summary
var expectScanSummary = require(path.join(__dirname, '..', 'expectedMockObjects', 'scanSummaryDefault'));

// Fetch the expected Scan Summary
var scanPageOutput = require(path.join(__dirname, '..', 'expectedMockObjects', 'scanPageOutputDefault'));

// Fetch the karma result object with failing testcases
var karmaResultObjectFail = require(path.join(__dirname, '..', 'expectedMockObjects', 'karmaResultObjectFailDefault'));

// Fetch the karma result object with passing testcases
var karmaResultObjectPass = require(path.join(__dirname, '..', 'expectedMockObjects', 'karmaResultObjectPassDefault'));

// Fetch the slack notification failure object
var slackNotificationObjectFail = require(path.join(__dirname, '..', 'expectedMockObjects', 'slackNotificationObjectFailDefault'));

// Fetch the slack notification passing object
var slackNotificationObjectPass = require(path.join(__dirname, '..', 'expectedMockObjects', 'slackNotificationObjectPassDefault'));

// Fetch the expected constants
var expectedConstants = require(path.join(__dirname, '..', 'expectedMockObjects', 'expectedConstants'));

// Fetch the mock aChecker config object
var ACConfigMock = require(path.join(__dirname, '..', 'configMocks', 'ACConfigMock'));

// Fetch the mock aChecker config default when no config options provided
var ACConfigDefaultMock = require(path.join(__dirname, '..', 'configMocks', 'ACConfigDefaultMock'));

var unitTestCommon = {
    toolID: toolID,
    configMock: configMock,
    expectScanSummary: expectScanSummary,
    scanPageOutput: scanPageOutput,
    karmaResultObjectFail: karmaResultObjectFail,
    karmaResultObjectPass: karmaResultObjectPass,
    slackNotificationObjectFail: slackNotificationObjectFail,
    slackNotificationObjectPass: slackNotificationObjectPass,
    expectedConstants: expectedConstants,
    ACConfigMock: ACConfigMock,
    ACConfigDefaultMock: ACConfigDefaultMock
};

// Export the common objects needed for tests
module.exports = unitTestCommon;