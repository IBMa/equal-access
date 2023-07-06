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

const ACTasks = require("./lib/ACTasks");
const { BaselineManager } = require("./lib/common/report/BaselineManager");
const { ReporterManager } = require("./lib/common/report/ReporterManager");

// /**
//  * Object format:
//  *
//  * html: HTML string to scan
//  * label: Label of report
//  */
// function getCompliance({ html, label }) {
//     return new Promise((resolve, reject) => {
//         ACTasks.getCompliance(html, label).then(
//             /* Only send back the report.  If we send back Puppeteer object is creates circular JSON and breaks. */
//             (result) => resolve({ report: result.report }),
//             () => reject('accessibility-checker: Failed to get compliance')
//         );
//     });
// }

function onRunComplete() {
    return ACTasks.onRunComplete();
}

/**
 * Object format:
 *
 * report: Report data from `getCompliance()` call
 */
function assertCompliance({ report }) {
    return BaselineManager.assertCompliance(report);
}

/**
 * Object format:
 *
 * label: Label of the baseline results to return.
 */
function getBaseline({ label }) {
    return BaselineManager.getBaseline(label);
}

/**
 * Object format:
 *
 * actual: Actual scan results that need to be compared.
 * expected: Expected scan results to compare to.
 * clean: Whether or not to clean the results by converting the objects to match basic compliance of only xpath and ruleid.
 */
function diffResultsWithExpected({ actual, expected, clean }) {
    return BaselineManager.diffResultsWithExpected(actual, expected, clean);
}

/**
 * Object format:
 *
 * report: Report to be stringified.
 */
function stringifyResults({ report }) {
    return ReporterManager.stringifyResults(report);
}

/**
 * Object format:
 *
 * N/A
 */
function getConfig() {
    return new Promise((resolve, reject) => {
        ACTasks.getConfig().then(
            (config) => resolve(config),
            () => reject('accessibility-checker: Failed to get config')
        );
    });
}

function sendResultsToReporter(profile, startScan, url, title, label, report) {
    return ACTasks.sendResultsToReporter(profile, startScan, url, title, label, report);
}

function getDiffResults({ label }) {
    return BaselineManager.getDiffResults(label);
}
/**
 * Config format:
 *
 * task: string - Name of the task to run.
 * data: Object - Data to pass to the task.
 */
module.exports = ({ task, data }) => {
    switch (task) {
        case 'sendResultsToReporter':
            return sendResultsToReporter(data.profile, data.startScan, data.url, data.title, data.label, data.report)
        case 'assertCompliance':
            return assertCompliance(data);
        case 'getBaseline':
            return getBaseline(data);
        case 'diffResultsWithExpected':
            return diffResultsWithExpected(data);
        case 'stringifyResults':
            return stringifyResults(data);
        case 'getConfig':
            return getConfig(data);
        case 'onRunComplete':
            return onRunComplete();
        case 'getDiffResults':
            return getDiffResults(data);
        default:
            throw new Error(
                'accessibility-checker: Invalid task ID sent.  Accessibility checker tasks should only be called by the accessibility-checker commands.'
            );
    }
};
