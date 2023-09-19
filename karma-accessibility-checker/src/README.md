# karma-accessibility-checker

## Overview

`karma-accessibility-checker` is a Karma plugin that allows you to perform the following:

- integrate accessibility testing within a continuous integration pipeline such as Travis CI.
- scan HTML nodes/widgets, URLs, local files, HTML documents, and allows you to scan HTML content in the form of a string
- aside from just performing accessibility scanning, it provides a framework to validate accessibility scan results against baseline files and/or simply failing the test cases based on the levels of violations found during the scan

### Table of Contents

- [karma-accessibility-checker](#karma-accessibility-checker)
  - [Overview](#overview)
    - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
  - [Quick start](#quick-start)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
      - [Install npm](#install-npm)
  - [Configuration](#configuration)
    - [Configuring Karma](#configuring-karma)
      - [Configuring `plugins`](#configuring-plugins)
      - [Configuring `framework` and `reporters`](#configuring-framework-and-reporters)
      - [Configuring `preprocessor`](#configuring-preprocessor)
    - [Configuring the plugin](#configuring-the-plugin)
  - [API-based usage](#api-based-usage)
  - [API](#api)
    - [aChecker.getCompliance(`content`, `label`, `callback`)](#acheckergetcompliancecontent-label-callback)
    - [aChecker.assertCompliance(`actualResults`)](#acheckerassertcomplianceactualresults)
    - [aChecker.getDiffResults(`label`)](#acheckergetdiffresultslabel)
    - [aChecker.getBaseline(`label`)](#acheckergetbaselinelabel)
    - [aChecker.diffResultsWithExpected(`actual`, `expected`, `clean`)](#acheckerdiffresultswithexpectedactual-expected-clean)
    - [aChecker.stringifyResults(`results`)](#acheckerstringifyresultsresults)
  - [Errors](#errors)
    - [Error: labelNotProvided](#error-labelnotprovided)
    - [Error: labelNotUnique](#error-labelnotunique)
    - [Error: slackNotificationTargetIsNotValid](#error-slackNotificationTargetIsNotValid)
    - [Error: SlackAPIError](#error-slackapierror)
    - [Error: SlackWebHookError](#error-slackwebhookerror)
    - [Error: LoadingConfigError](#error-loadingconfigerror)
    - [Error: RuleArchiveInvalid](#error-rulearchiveinvalid)
    - [Error: ValidPoliciesMissing](#error-validpoliciesmissing)
  - [FAQ](#faq)
  - [Known Issues](#known-issues)
  - [Feedback and Reporting bugs](#feedback-and-reporting-bugs)
  - [License](#license)

## Usage

The tools that have been deployed to NPM so it can be easily downloaded and installed:

- [karma-accessibility-checker](https://www.npmjs.com/package/karma-accessibility-checker): automated accessibility testing for the Karma environment

## Quick start

Grab a [boilerplate](https://github.com/IBMa/equal-access/tree/master/karma-accessibility-checker/boilerplates)

## Getting started

1. Setup and initialize - Follow the instructions in the [Prerequisites](#prerequisites) and [Install](#install) sections.
2. Configure Karma and the karma-accessibility-checker plugin - Follow the [Configuration](#configuration) instructions.
3. Learn how to use the `karma-accessibility-checker` APIs to perform accessibility scans - Refer to the [Usage](#usage) and [API](#api) documentation.

### Prerequisites

Install [Node.js and NPM](https://nodejs.org/en/download/)

> Note: Use the latest available Node.js version.

Basic understanding of testing with [Karma](http://karma-runner.github.io/1.0/index.html) testrunner

### Install

> Note: For Windows, you may have to install and use [cygwin](http://www.oracle.com/webfolder/technetwork/tutorials/obe/cloud/objectstorage/installing_cURL/installing_cURL_on_Cygwin_on_Windows.html#section1) CLI with curl package in order to run curl commands on windows.

#### Install npm

Install the `karma-accessibility-checker` plugin from the [npm repository](https://www.npmjs.com/package/karma-accessibility-checker):

```sh
$ npm install --save-dev karma-accessibility-checker
```

## Configuration

Karma needs to be configured before you load the `karma-accessibility-checker` plugin - and then you need to configure the `karma-accessibility-checker` plugin before using it.

### Configuring Karma

#### Configuring `plugins`

If you are using the plugins array in the Karma configuration file (`karma.conf.js`), you will need to add this to the
plugins array to load the `karma-accessibility-checker` plugin.

```js
// karma.conf.js
module.exports = function (config) {
    config.set({
        // Plugins for karma to load
        plugins: [require("karma-accessibility-checker")],

        // ...
    });
};
```

#### Configuring `framework` and `reporters`

Add `aChecker` to the `framework`, `reporters` array in the Karma configuration file (`karma.conf.js`). This will load the `karma-accessibility-checker` plugin.

```js
// karma.conf.js
module.exports = function (config) {
    config.set({
        // Frameworks to use to run the tests that we define
        frameworks: ["jasmine", "aChecker"],

        // Test results reporter to use
        reporters: ["progress", "aChecker"],

        // ...
    });
};
```

#### Configuring `preprocessor`

Use `aChecker` in `preprocessor` to process the baseline files and load them into memory. This saved copy of the files, can then be used for accessibility scan results comparison.

```js
// karma.conf.js
module.exports = function (config) {
    config.set({
        // ...

        // Preprocess matching files before serving them to the browser
        // Note: Preprocessors may be transforming the files and file types that are available at run time.
        preprocessors: {
            "test/baseline/**/*.json": ["aChecker"],
        },

        // List of files / patterns to load in the browser
        // Note: Order matters, the order they are listed here is how they are loaded.
        files: ["test/baseline/**/*.json", "test/**/*.js"],

        // ...
    });
};
```

### Configuring the plugin

Configuring the `karma-accessibility-checker` plugin involves constructing a `.achecker.yml` file in the project root. This file, will contain all of the configuration
options for `karma-accessibility-checker`. This is the structure of the `.achecker.yml` file:

```yml
# optional - Specify the rule archive
# i.e. For march rule archive use ruleArchive: 2017MayDeploy
# Default: latest
# If "latest", will use the latest rule release
# If "versioned", will use latest rule release at the time this version of the tool was released
# Refer to README.md FAQ section below to get the rule archive ID.
ruleArchive: latest

# optional - Specify one or many policies to scan.
# i.e. For one policy use policies: IBM_Accessibility_2017_02
# i.e. Multiple policies: IBM_Accessibility,WCAG_2_1 or refer to below as a list
# Default: null (all policies)
# Refer to README.md FAQ section below to get the policy ID.
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

# optional - Specify one or many violation levels which should be reported
#            i.e. If specified violation then in the report it would only contain
#                 results which are level of violation.
# i.e. reportLevels: violation
# i.e. reportLevels: violation,potentialviolation or refer to below as a list
# Default: violation, potentialviolation, recommendation, potentialrecommendation, manual
reportLevels:
    - violation
    - potentialviolation
    - recommendation
    - potentialrecommendation
    - manual

# Optional - In what format types the results should be output in (json, html)
# Default: json
outputFormat:
    - json

# Optional - Should the timestamp be included in the filename of the reports?
# Default: true
outputFilenameTimestamp: true

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

# optional - Where the tool can read/write cached files (ace-node.js / archive.json)
# Default: `${os.tmpdir()}/accessibility-checker/`
cacheFolder: /tmp/accessibility-checker
```

## API-based usage

`karma-accessibility-checker` is solely an API-based Karma plugin, therefore APIs should be used within test cases on a browser launched by Karma.

To perform an accessibility scan within your test cases and verify the scan results:

```javascript
// Perform the accessibility scan using the aChecker.getCompliance API
aChecker.getCompliance(testDataFileContent, testFile, function (results) {
    // Call the aChecker.assertCompliance API which is used to compare the results with baseline object if we can find one that
    // matches the same label which was provided.
    var returnCode = aChecker.assertCompliance(results);

    // In the case that the violationData is not defined then trigger an error right away.
    expect(returnCode).toBe(
        0,
        "Scanning " + testFile + " failed." + JSON.stringify(results)
    );

    // Mark the testcases as done, when using jasmine as the test framework.
    done();
});
```

Refer to [Examples](https://github.com/IBMa/equal-access/tree/master/karma-accessibility-checker/boilerplates) for sample usage scenarios.

## API

### aChecker.getCompliance(`content`, `label`, `callback`)

Execute accessibility scan on provided content. The content can be in these forms:

- HTML (String)
- Single node/widget (HTMLElement)
- Local file path (String)
- URL (String)
- Document node (HTMLDocument)

Use a callback mechanism (`callback`) to extract the results and perform assertion using accessibility-checker APIs.

- `content` - (String | HTMLElement | HTMLDocument) content to be scanned for accessibility violations.
- `label` - (String) unique label to identify this accessibility scan from others. Using "/" in the label allows for directory hierarchy when results are saved.
- `callback` - (Function) callback that is invoked (indicating success). The callback will be invoked with the `results`
    as a parameter to the callback function provided. This is the outline of the results object which will be passed to the callback function:

```javascript
{
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

Refer to the `actualResults` parameter in aChecker.assertCompliance API for more details about the properties of results object.

### aChecker.assertCompliance(`actualResults`)

Assertion will be perform one of the following ways based on the condition that is met:

1. If a baseline file of scan results is available in memory, it will be compared to the `actualResults`. If the `actualResults` matches the baseline, it will return 0. If not, it will return 1. In this case, assertion is only run on the `XPath` and `ruleId`.

2. If there is _no baseline_ file, assertion will be made based on the provided `failLevels`. In this case, 2 is returned if there are failures based on `failLevels`.

- `actualResults` - (Object) results for which assertion needs to be run. Properties include:
    - **scanID**, (String) auto generated UUID used to associate a session.
    - **toolID**, (String) tool ID for the tool that generated these results.
    - **label**, (String) label provided to identify unique scan results. (provided through the aChecker.getCompliance API).
    - **URL**, (String) contains the URL that was scanned using aChecker.getCompliance API. (provided through aChecker.getCompliance API).
    - **issueMessages**, (Object) violation messages based on language.
        - **messages**, (Object) violation messages indexed by message ID.
        - **lang**, (String) locale of the violation messages.
    - **summary**, (Object) summary of the scan that these results are for. Properties include:
        - **counts**, (Object) number of violations based on the violation level. Properties include:
            - **violation**, (Int) total number of violations.
            - **potentialviolation**, (Int) total number of potential violations.
            - **recommendation**, (Int) total number of recommendations.
            - **potentialrecommendation**, (Int) total number of potential recommendations.
            - **manual**, (Int) total number of manual checks.
        - **scanTime**, (Int) total number of milliseconds it took to perform the scan.
        - **ruleArchive**, (String) rule archive used for this particular scan result.
        - **policies**, (Array) policies used for the scan result.
        - **reportLevels**, (Array) list of violation levels to include in the report. (save to file).
        - **startScan**, (Int) start time of the scan in milliseconds since epoch, GMT.
    - **reports**, (Array) list of reports in the case of multiple iframes are present on the single page. (iframe scanning not support yet) Each array element is an object with these properties:
        - **frameIdx**, (Int) frame index in the page represented as an integer value.
        - **frameTitle**, (String) title of the frame on the page that was scanned.
        - **issues**, (Array) detailed list of violations. Each array element is an objects with these properties:
            - **severityCode**, (String) severity code of the violation.
            - **messageCode**, (String) message code of the violation. Used to map the localized message string.
            - **ruleId**, (String) rule ID of the violation.
            - **help**, (String) help file name of the violation.
            - **msgArgs**, (Array) list of tokens to help provide a detailed error description of the issue.
            - **bounds**, (Object) provides the pixel position of the element that triggered the violation. Properties include:
                - **left**, (Int) left pixel position of the element.
                - **top**, (Int) top pixel position of the element.
                - **height**, (Int) height pixel position of the element.
                - **width**, (Int) width pixel position of the element.
            - **level**, (String) level of the violation.
            - **xpath**, (String) XPath of the element that triggered the violation.
            - **snippet**, (String) snippet for the element that triggered the violation.

- Returns `0` if `actualResults` matches baseline or if no violations match the `failLevels`
- Returns `1` if `actualResults` _do not_ match the baseline
- Returns `2` if there is a failure based on `failLevels`
- Returns `-1` if an exception has occurred during scanning and the results reflected that

### aChecker.getDiffResults(`label`)

Retrieve the diff results for a specified scan (denoted by its label) when API `aChecker.assertCompliance(...)` returns 1 (when the `actualResults` do not match the baseline).

- `label` - (String) label to use when getting the diff results. The label should match the one provided for aChecker.getCompliance(...).

Returns a diff object, where the **left hand side (lhs) is actualResults** and the **right hand side (rhs) is baseline**.
Refer to the [deep-diff](https://github.com/flitbit/diff#simple-examples) documentation for the format of the diff object, and how to interpret the object.

Returns `undefined` if there are no differences.

### aChecker.getBaseline(`label`)

Retrieve the baseline result object based on the label provided.

- `label` - (String) label for which to get the baseline. The label should match the one provided for aChecker.getCompliance(...).

Returns `object` that follows the same structure as the results object outlined in the aChecker.getCompliance
and aChecker.assertCompliance API.

Returns `undefined` if a baseline is not found for the label provided.

### aChecker.diffResultsWithExpected(`actual`, `expected`, `clean`)

Compare provided `actual` and `expected` objects and get the differences between them.

- `actual` - (Object) actual results that you want to compare. Refer to aChecker.assertCompliance for details about available properties to include.
- `expected` - (Object) expected results to compare to. Refer to aChecker.assertCompliance for details about available properties to include.
- `clean` - (boolean) clean the `actual` and `expected` results by converting the objects to match with a basic compliance compare of only `xpath` and `ruleID`.

Returns a diff object, where the **left hand side (lhs) is actualResults** and the **right hand side (rhs) is baseline**.
Refer to the [deep-diff](https://github.com/flitbit/diff#simple-examples) documentation for the format of the diff object, and how to interpret the object.

Returns `undefined` if there are no differences.

### aChecker.stringifyResults(`results`)

Retrieve the readable stringified representation of the scan results.

- `results` - (Object) results which need to be stringified. Refer to aChecker.assertCompliance for details about available properties to include.

Returns a `String` representation of the scan results which can be logged to a console.

## Errors

### Error: labelNotProvided

This is a subtype of `Error` defined by the `karma-accessibility-checker` plugin. It is considered a programming error.

`labelNotProvided` is thrown from the `aChecker.getCompliance(...)` method call when a label is not provided to a function call for the scan that is to be performed.
Note: A label must always be provided when calling the `aChecker.getCompliance(...)` function.

### Error: labelNotUnique

This is a subtype of `Error` defined by the `karma-accessibility-checker` plugin. It is considered a programming error.

`labelNotUnique` is thrown from `aChecker.getCompliance(...)` method call when a unique label is not provided to
function call for the scan that is to be performed. Note: Across all accessibility scans, the label provided
must always be unique.

### Error: slackNotificationTargetIsNotValid

This is a subtype of `Error` defined by the `karma-accessibility-checker` plugin. It is considered a programming error.

`slackNotificationTargetIsNotValid` is thrown from `[framework.aChecker]` during Slack configuration verification.
The error occurs when the provided Slack configuration does not follow one of these formats: `<account>:<token>#<channel>` or webhook URL.

### Error: SlackAPIError

This is a subtype of `Error` defined by the `karma-accessibility-checker` plugin. It is considered a programming error.

`SlackAPIError` is thrown from `[reporter.aChecker]` during Slack notification dispatch using the Slack API.
The error occurs when the provided Slack token and/or channel is incorrect.
A detailed explanation of the error will be provided when this error occurs.

### Error: SlackWebHookError

This is a subtype of `Error` defined by the `karma-accessibility-checker` plugin. It is considered a programming error.

`SlackWebHookError` is thrown from `[reporter.aChecker]` during Slack notification dispatch using webhook.
The error occurs when the provided webhook URL is incorrect.

### Error: LoadingConfigError

This is a subtype of `Error` defined by the `karma-accessibility-checker` plugin. It is considered a programming error.

`LoadingConfigError` is thrown from `[framework.aChecker]` during loading/verification of the configuration file.
The error occurs when the provided configuration file contains syntax errors.

### Error: RuleArchiveInvalid

This is a subtype of `Error` defined by the `karma-accessibility-checker` plugin. It is considered a programming error.

`RuleArchiveInvalid` is thrown from `[framework.aChecker]` during verification of rule archive in the configuration file.
The error occurs when the provided `ruleArchive` value in the configuration file is invalid.

### Error: ValidPoliciesMissing

This is a subtype of `Error` defined by the `karma-accessibility-checker` plugin. It is considered a programming error.

`ValidPoliciesMissing` is thrown from `[aChecker.getCompliance(...)]` method call when no valid policies are in the configuration file.
Note: The valid policies will vary depending on the selected `ruleArchive`.

## FAQ

- How do I get a list of the available `ruleArchive, policies` and their ID's?
    1. run `npx achecker_policies`

## Known Issues

1. Unable to scan URLs due to "permission denied to access property "document"" when trying to access document of generated iframe. This is due to cross domain frame access restrictions in browsers. On firefox there is no provided alternative, Chrome provides a way to override this by adding the following to karma.config.js:

```javascript
 module.exports = function (config) {
    config.set({
        browsers: ['ChromeCustom'],
        customLaunchers: {
            ChromeCustom: {
                base: 'ChromeHeadless',
                flags: ['--disable-web-security']
            }

        }
        ....
    });
}
```

2. Unable to scan local files when provided to `aChecker.getCompliance(...)` API as a local file URL. This is due to a limitation in Karma where it is not able to load local files using `file://` protocol. For scanning local file, there is a work around which can be used to scan them, following are the steps to update karma.config.js file with the following:

````javascript
 module.exports = function (config) {
    config.set({
        browsers: ['Chrome'],

        frameworks: ['jasmine', 'AAT'],

        // Load the local html file that you want to scan here
        files: [
            'src/**/*.html',
            "test/**/*.js"
        ],

        // Use the html2js preprocessor to convert the local html files into javascript which can be accessed in karma browser. Need to install ```karma-html2js-preprocessor``` module
        preprocessors: {
            'src/**/*.html': ['html2js']
        },

        reporters: ['progress', 'AAT'],

        ....
    });
}
````

## Feedback and Reporting bugs

If you think you've found a bug or have feedback, report them in the [Git issues](https://github.com/IBMa/equal-access/issues?q=is%3Aopen+is%3Aissue+label%3Akarma-accessibility-checker), tagged with `karma-accessibility-checker`.

To help us fix the bug, please try to provide a log. You can enable Karma debugging in the Karma configuration file by changing the logLevel to `config.LOG_DEBUG`. Pipe (`karma start > debug.log`) console output to a file and attach the file to the bug report that you open.

If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
