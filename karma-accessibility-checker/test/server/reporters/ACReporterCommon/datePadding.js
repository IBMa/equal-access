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
 * NAME: datePadding.js
 * DESCRIPTION: Used to test the datePadding function in ACReporterCommon.js

 *******************************************************************************/

'use strict';

// Load all the modules that are needed
var test = require('ava');
var path = require('path');

// Load the function that will be tester
var ACReporterCommon = require(path.join(__dirname, '..', '..', '..', '..', 'src', 'lib', 'reporters', 'ACReporterCommon'));

// Load a mock logger and set it in to ACReporterCommon
ACReporterCommon.log = require(path.join(__dirname, '..', '..', 'unitTestCommon', 'commonTestHelpers', 'logger'));

test('datePadding(number) should return padded number for 8', function (ava) {
    // Get the padded date value for 8
    var datePadded = ACReporterCommon.datePadding(8);

    ava.is(datePadded, "08");
});

test('datePadding(number) should return padded number for 10', function (ava) {
    // Get the padded date value for 10
    var datePadded = ACReporterCommon.datePadding(10);

    ava.is(datePadded, 10);
});

test('datePadding(number) should return padded number for 30', function (ava) {
    // Get the padded date value for 30
    var datePadded = ACReporterCommon.datePadding(30);

    ava.is(datePadded, 30);
});
