# accessibility-checker

## Overview

`accessibility-checker` is a NodeJS module that allows you to do the following:

- perform integrated accessibility testing within a continuous integration pipeline, such as Travis CI
- works with test frameworks (parsing engines), such as Selenium, Puppeteer, Playwright, and Zombie
- allows users to scan HTML nodes/widgets, URLs, local files, HTML documents, and HTML content in the form of a string
- aside from just performing accessibility scanning, it provides a framework to validate accessibility scan results against baseline files and/or simply failing the test cases based on the levels of violations found during the scan

The NodeJS module is a component of the [IBM Equal Access Toolkit](https://ibm.com/able/toolkit).
The Toolkit provides the tools and guidance to create experiences that are delightful for people of all abilities.
The guidance is organized by phase, such as Plan, Design, Develop, and Verify, and explains how to integrate the automated testing tools into the [Verify phase](https://www.ibm.com/able/toolkit/verify/overview).
The Toolkit is a major part of the accessibility information and applications at [ibm.com/able](https://ibm.com/able/).

Note that we have seen some non-standard CSS parsing with Zombie, so be aware of inconsistencies as a result.

## Usage

### Command-line and multi-scan

This module provides some basic command-line utilities that will allow scanning files, directories, and URLs:

- Create a .txt file with path(s) to files, directories, or a list of URLs to be scanned
- Provide the `npx achecker` the full path of the .txt file to start the scan (e.g., `npx achecker path/to/your/file.txt`)
- Run `npx achecker`

### Programmatic

The following is how to perform an accessibility scan within your test cases and verify the scan results:

```javascript
const aChecker = require("accessibility-checker");
// Perform the accessibility scan using the aChecker.getCompliance API
aChecker.getCompliance(testDataFileContent, testLabel).then((results) => {
    const report = results.report;

    // Call the aChecker.assertCompliance API which is used to compare the results with the baseline object if we can find one that
    // matches the same label which was provided.
    const returnCode = aChecker.assertCompliance(report);

    // In the case that the violationData is not defined then trigger an error right away.
    expect(returnCode).toBe(0, "Scanning " + testLabel + " failed.");
});
```

Refer to [Examples](https://github.com/IBMa/equal-access/tree/master/accessibility-checker/boilerplates) for sample usage scenarios.

## Quick Start and installation

Grab a [boilerplate](https://github.com/IBMa/equal-access/tree/master/accessibility-checker/boilerplates)

Install accessibility-checker:

```bash
$ npm install --save-dev accessibility-checker
```

Use the command-line version:
* Install globally
```bash
$ npm install -g accessibility-checker
```
* Run command-line tool after globally installed
```bash
$ achecker
```

## Setup

1. Setup and Initialize - Follow the [Prerequisites](#prerequisites) and [Install](#install) instructions.
1. Configure accessibility-checker - Follow the [Configuration](#Configuration) instructions.
1. Learn how to use APIs to perform accessibility scans - Refer to [Usage](#usage) and [APIs](#apis) documentation.
1. Give us feedback.

### Prerequisites

1. Install [NodeJS and NPM](https://nodejs.org/en/download/)
2. Some testing framework (e.g., mocha, jasmine)
3. Browser automation / parser (e.g., Selenium, Puppeteer, Playwright, Zombie)

#### Install

Install the `accessibility-checker` module:

```sh
$ npm install --save-dev accessibility-checker
```

## Configuration

### Configuring `accessibility-checker`

A default configuration is defined which uses the latest archive, `IBM_Accessibility` policy, and some default settings. If you would like to override any of these values,
create an accessibility-checker configuration file.

Configuring `accessibility-checker` plugin involves constructing a `.achecker.yml` file in the project root, which will contain all the configuration
options for `accessibility-checker`. Following is the structure of the `.achecker.yml` file:

```yml
# optional - Specify the rule archive
# Default: latest
# Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids.
# If "latest", will use the latest rule release
# If "versioned" (supported in 3.1.61+), will use the latest rule release at
# the time this version of the tool was released 
ruleArchive: latest

# optional - Specify one or many policies to scan.
# i.e. For one policy use policies: IBM_Accessibility
# i.e. Multiple policies: IBM_Accessibility, WCAG_2_1
# Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids
policies:
    - IBM_Accessibility

# optional - Specify one or many violation levels on which to fail the test
#            i.e. If specified violation then the testcase will only fail if
#                 a violation is found during the scan.
# i.e. failLevels: violation
# i.e. failLevels: violation,potential violation or refer to below as a list
# Default: violation, potentialviolation
failLevels:
    - violation
    - potentialviolation

# optional - Specify one or many violation levels that should be reported
#            i.e. If specified violation then in the report it would only contain
#                 results which are level of violation.
# i.e. reportLevels: violation
# Valid values: violation, potentialviolation, recommendation, potentialrecommendation, manual
# Default: violation, potentialviolation
reportLevels:
    - violation
    - potentialviolation
    - recommendation
    - potentialrecommendation
    - manual

# Optional - In which formats should the results be output
# Valid values: json, csv, xlsx, html, disable
# Default: json
outputFormat:
    - json

# Optional - Specify labels that you would like associated to your scan
#
# i.e.
#   label: Firefox,master,V12,Linux
#   label:
#       - Firefox
#       - master
#       - V12
#       - Linux
# Default: N/A
label:
    - master

# optional - Where the scan results should be saved.
# Default: results
outputFolder: results

# Optional - Should the timestamp be included in the filename of the reports?
# Default: true
outputFilenameTimestamp: true

# optional - Where the baseline results should be loaded from
# Default: baselines
baselineFolder: test/baselines

# optional - Where the tool can read/write cached files (ace-node.js / archive.json)
# Default: `${os.tmpdir()}/accessibility-checker/`
cacheFolder: /tmp/accessibility-checker
```

A similar `aceconfig.js` file can also be used:

```js
module.exports = {
    ruleArchive: "latest",
    policies: ["IBM_Accessibility"],
    failLevels: ["violation", "potentialviolation"],
    reportLevels: [
        "violation",
        "potentialviolation",
        "recommendation",
        "potentialrecommendation",
        "manual",
        "pass",
    ],
    outputFormat: ["json"],
    outputFilenameTimestamp: true,
    label: [process.env.TRAVIS_BRANCH],
    outputFolder: "results",
    baselineFolder: "test/baselines",
    cacheFolder: "/tmp/accessibility-checker"
};
```

## APIs

### async aChecker.getCompliance(`content`, `label` : string)

Execute accessibility scan on provided content. `content` can be in the following form:

- HTML content (String)
- Single node/widget (HTMLElement)
- Local file path (String)
- URL (String)
- Document node (HTMLDocument)
- Selenium WebDriver (WebDriver)
- Puppeteer page
- Playwright page

Note: When using Selenium WebDriver the aChecker.getCompliance API will only take Selenium WebDriver (WebDriver) instance. When using Puppeteer, aChecker.getCompliance expects the Page object.

Using a callback mechanism (`callback`) to extract the results and perform assertion using accessibility-checker APIs.

- `content` - (String | HTMLElement | HTMLDocument | Selenium WebDriver) content to be scanned for accessibility violations.
- `label` - (String) unique label to identify this accessibility scan from others. Using "/" in the label allows for directory hierarchy when results are saved.
- Returns a promise with an object of the form below:

```javascript
{
    // reference to a webdriver object if Selenium WebDriver was used for the scan
    webdriver: undefined,
    // reference to a puppeteer object if Puppeteer was used for the scan
    // Puppeteer is used for string, URL, and file scans
    puppeteer: undefined,
    report: {
        scanID: "18504e0c-fcaa-4a78-a07c-4f96e433f3e7",
        toolID: "accessibility-checker-v3.0.0",
        // Label passed to getCompliance
        label: "MyTestLabel",
        // Number of rules executed
        numExecuted: 137,
        nls: {
            // Mapping of result.ruleId, result.reasonId to get a tokenized string for the result. Message args are result.messageArgs
            "WCAG20_Html_HasLang": {
                "Pass_0": "Page language detected as {0}"
            },
            // ...
        },
        summary: {
            URL: "https://www.ibm.com",
            counts: {
                violation: 1,
                potentialviolation: 0,
                recommendation: 0,
                potentialrecommendation: 0,
                manual: 0,
                pass: 136,
                ignored: 0
            },
            scanTime: 29,
            ruleArchive: "September 2019 Deployment (2019SeptDeploy)",
            policies: [
                "IBM_Accessibility"
            ],
            reportLevels: [
                "violation",
                "potentialviolation",
                "recommendation",
                "potentialrecommendation",
                "manual"
            ],
            startScan: 1470103006149
        },
        results: [
            {
                // Which rule triggered?
                "ruleId": "WCAG20_Html_HasLang",
                // In what way did the rule trigger?
                "reasonId": "Pass_0",
                "value": [
                    // Is this rule based on a VIOLATION, RECOMMENDATION or INFORMATION
                    "VIOLATION",
                    // PASS, FAIL, POTENTIAL, or MANUAL
                    "PASS"
                ],
                "path": {
                    // xpath
                    "dom": "/html[1]",
                    // path of ARIA roles
                    "aria": "/document[1]"
                },
                "ruleTime": 0,
                // Generated message
                "message": "Page language detected as en",
                // Arguments to the message
                "messageArgs": [
                    "en"
                ],
                "apiArgs": [],
                // Bounding box of the element
                "bounds": {
                    "left": 0,
                    "top": 0,
                    "height": 143,
                    "width": 800
                },
                // HTML snippet of the element
                "snippet": "<html lang=\"en\">",
                // What category is this rule?
                "category": "Accessibility",
                // Was this issue ignored due to a baseline?
                "ignored": false,
                // Summary of the value: violation, potentialviolation, recommendation, potentialrecommendation, manual, pass
                "level": "pass"
            },
            // ...
        ]
    }
}
```

### aChecker.assertCompliance(`report`)

Perform assertion on the scan results. Will perform one of the following assertions based on the condition that is met:

1. In the case a baseline file is provided and available in memory for these scan results, a compare of baseline to `report` will be made. In this case if `report` matches the baseline, it returns 0, otherwise returns 1. For this case, assertion is only run on the xpath and ruleId.

2. In the case **_no baseline_** file is provided for this particular scan, assertion will be made based on the provided `failLevels`. In this case, it returns 2 if there are failures based on failLevels. (violation level matches at least one provided in the `failLevels` object)

`report` - (Object) results for which assertion needs to be run. See above for report format.

- Returns `0` in the case `actualResults` matches the baseline or no violations fall into the failLevels
- Returns `1` in the case `actualResults` **_don't match_** baseline
- Returns `2` in the case that there is a failure based on failLevels.
- Returns `-1` in the case that an exception has occurred during scanning and the results reflected that.

### aChecker.getDiffResults(`label`)

Retrieve the diff results based on label in the case API `aChecker.assertCompliance(...)` returns 1, when actualResults DON'T match baseline.

-   `label` - (String) label for which to get the diff results for. (should match the one provided for aChecker.getCompliance(...))

Returns a diff object, where **left hand side (lhs) is actualResults** and **right hand side (rhs) is baseline**.
Refer to [deep-diff](https://github.com/flitbit/diff#simple-examples) documentation for the format of the diff object,
and how to interpret the object.

Returns `undefined` if there are no differences.

### aChecker.getBaseline(`label`)

Retrieve the baseline result object based on the label provided.

- `label` - (String) label for which to get the baseline for. (should match the one provided for aChecker.getCompliance(...))

Returns `object` which will follow the same structure as the results object outlined in aChecker.getCompliance
and aChecker.assertCompliance APIs.

Returns `undefined` in the case baseline is not found for the label provided.

### aChecker.diffResultsWithExpected(`actual`, `expected`, `clean`)

Compare provided `actual` and `expected` objects and get the differences if there are any.

- `actual` - (Object) actual results which need to be compared.
    Refer to aChecker.assertCompliance APIs for details on properties include.
- `expected` - (Object) expected results to compare to.
    Refer to aChecker.assertCompliance APIs for details on properties include.
- `clean` - (boolean) clean the `actual` and `expected` results by converting the objects to match with a basic compliance
    compare of only xpath and ruleID

Returns a diff object, where **left hand side (lhs) is actualResults** and **right hand side (rhs) is baseline**.
Refer to [deep-diff](https://github.com/flitbit/diff#simple-examples) documentation for the format of the diff object,
and how to interpret the object.

Returns `undefined` if there are no differences.

### aChecker.stringifyResults(`report`)

Retrieve the readable stringified representation of the scan results.

- `report` - (Object) results which need to be stringified.
    Refer to aChecker.assertCompliance APIs for details on properties to include

Returns `String` representation of the scan results which can be logged to the console.

### async aChecker.getConfig()

Retrieve the configuration object used by accessibility-checker. See aceconfig.js / .achecker.yml above for details

### async aChecker.close()

Close puppeteer pages and other resources that may be used by accessibility-checker.

## Errors

### Error: labelNotProvided

This is a subtype of `Error` defined by the `accessibility-checker` plugin. It is considered a programming error.
`labelNotProvided` is thrown from `aChecker.getCompliance(...)` method call when a label is not provided to
function call for the scan that is to be performed. Note: A label must always be provided when calling
`aChecker.getCompliance(...)` function.

### Error: labelNotUnique

This is a subtype of `Error` defined by the `accessibility-checker` plugin. It is considered a programming error.
`labelNotUnique` is thrown from `aChecker.getCompliance(...)` method call when a unique label is not provided to
function call for the scan that is to be performed. Note: Across all accessibility scans the label provided
must always be unique.

### Error: RuleArchiveInvalid

This is a subtype of `Error` defined by the `accessibility-checker` plugin. It is considered a programming error.

`RuleArchiveInvalid` is thrown from `[aChecker.getCompliance(...)]` during verification of rule archive in the configuration file.
The error occurs when the provided `ruleArchive` value in the configuration file is invalid.

### Error: ValidPoliciesMissing

This is a subtype of `Error` defined by the `accessibility-checker` plugin. It is considered a programming error.

`ValidPoliciesMissing` is thrown from `[aChecker.getCompliance(...)]` method call when no valid policies are in the configuration file.
Note: The valid policies will vary depending on the selected `ruleArchive`.

## Known issues and workarounds

1. If you see `TypeError: ace.Checker is not a constructor`: 
    - Try to run your tests serially using the configuration option in your framework. For example, use `--runInBand` in Jest framework. 

2. If your site has a `Content Security Policy`, the engine script may be
    prevented from loading. In the browser console, you'll see something like:
    > VM43:24 Refused to load the script ‘https://cdn.jsdelivr.net/npm/accessibility-checker-engine@3.1.42/ace.js’ because it violates the following Content Security Policy directive:

    If you would prefer not to add cdn.jsdelivr.net to the CSP, you can add able.ibm.com instead via your config file (e.g., ruleServer: "https://able.ibm.com/rules")

## Feedback and reporting bugs

If you think you've found a bug, have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues?q=is%3Aopen+is%3Aissue+label%3Anode-accessibility-checker), tagged with `node-accessibility-checker`.

If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
