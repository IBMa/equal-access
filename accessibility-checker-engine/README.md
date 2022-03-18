# accessibility-checker-engine

For information on creating, modifying rules, see [README-RULES.md]

## Overview

accessibility-checker-engine contains IBM accessibility rules and evaluation engine to help users to check their web pages to identify and report accessibility issues.

## Install

Please review [README.md](../README.md) on how to clone the source. Once the source code is cloned to your local environment, you can build the source code based on the requirements of your local environment.

### build ace.js that can be used in a browser environment

```bash
$ cd accessibility-checker-engine
$ npm install
$ npm run build
```
This will build the ace.js in the dist directory.

### build ace-node.js that can be used in a NodeJS environment

```
$ cd accessibility-checker-engine
$ npm install
$ npm run build-node
```
This will build the ace-node.js in the dist directory.

## API

The most important entry point API is the `check` method of `ace.Checker` object. You can use a callback or Promise mechanism to retrieve the accessibility results for further processing in your javascript or NodeJS program.

```javascript
const checker = new ace.Checker();
checker.check(doc, ["IBM_Accessibility"])
    .then(function(report) {
        // process accessibility report here
    });  
```

* `doc` - can be one of: 
  * a Document Object Model (`DOM`) object representing an HTML document which is usually available in a browser environment as `document`
  * a `DOM` element representing a fragment HTML which can be retrieved from a `DOM` by matching against one or more selectors.
* `["IBM_Accessibility"]` - apply IBM accessibility rules only, IBM design rules only.
* `report` - accessibility results contains identified accessibility issues and their descriptions from the given `doc`, and a summary of the issues. The report is in JSON format (see [details](#report)).

## Checklist and Rulesets

The rule are based on the IBM [Checklist](https://www.ibm.com/able/guidelines/ci162/accessibility_checklist.html), which is a superset of WCAG 2.1 AA. We also provide a WCAG 2.0 AA rulesets. Mappings from the checklists to rules are defined in the [ruleset file](https://github.com/IBMa/equal-access/blob/master/accessibility-checker-engine/src/v2/checker/accessibility/rulesets/index.ts)

## Report

The accessibility report is in JSON format, and contains information about the identified accessibility issues and their descriptions.

```javascript
{
    report: {
        scanID: "18504e0c-fcaa-4a78-a07c-4f96e433f3e7",
        toolID: "@ibma/aat-v2.0.6",
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
            URL: "https://www.ibm.com/en-US/",
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

## Usage examples

This section provides 'AS-IS' code examples, snippets, or logic. The users are expected to make changes according to their environments.

### Command-line in a browser developer tool

You can use the wrapper method `checkDemo` in `ace` object, which is specifically created for checking accessibility in a browser developer tool. The `checkDemo` method outputs both raw accessibility results in JSON format, and the results sorted by elements identified by their xPath. Following are the example steps to use  `ace.checkDemo()` to display the results in a Chrome developer tool:

* Navigate to a page or type the url to the page in Chrome browser
* Open the developer tool in Chrome browser: click `Customize and Control Google Chrome` button, select `More Tools`, then select `Developer Tool`
* Select `Console` tab to show command prompt
* Open the `ace.js` you built in the build step in a text editor, select and copy all the content
* Paste the content you copied to the command prompt in the developer tool, then press `Enter`
* Type in the command prompt: `ace.checkDemo()`, then `Enter`

You can view the accessibility report for the page:  
![use ACE in the Chrome developer tool](img/use-ace-in-developer-tool.png "Use ACE in the Chrome developer tool to test accessibility of a web page")

### Programmatic

The following code snippet demonstrates how to use ACE to test a web page for accessibility in an embedded Chrome environment (`puppeteer`). See [accessibility-checker](../accessibility-checker) for a more complete tool for this environment.

```javascript
(async () => {
  const chromeLauncher = require('chrome-launcher');
  const axios = require('axios');
  const puppeteer = require('puppeteer');
  
  // Initialize a Chrome instance
  const chrome = await chromeLauncher.launch({
    //chromeFlags: ['--headless'],
    logLevel: 'info',
    output: 'json'
  });
  const response = await axios.get(`http://localhost:${chrome.port}/json/version`);
  const { webSocketDebuggerUrl } = response.data;

  // Connect puppeteer to the chrome instance using the endpoint
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

  //get the page
  const [page] = await browser.pages();

  // inject the ace.js into the page when domcontentloaded event is fired, assuming the ace.js is in the same folder
  await page.goto('http://localhost:3000', { waitUtil: 'domcontentloaded' });
  await page.addScriptTag({ path: path.join(__dirname, 'ace.js') });

  //invoke the ace to evaluate the page for accessibility
  await page.evaluate(() => {
    const checker = new ace.Checker();
    checker.check(document, ["IBM_Accessibility"])
        .then(function (report) {
            for (let idx = 0; idx < report.results.length; ++idx) {
                //process the report
            }
        });
  });
})();
```

### Browser extensions

You can use the [accessibility-checker-extension](../accessibility-checker-extension) for Chrome or Firefox. The browser extensions integrate the accessibility web engine (ace.js) and formatted results into the browser developer tool to visually view the accessibility issues and the locations of violating components. For more information and instructions, please view [accessibility-checker-extensions](../accessibility-checker-extension).

### Integration with test frameworks

You can use the [karma-accessibility-checker](../karma-accessibility-checker) to integrate accessibility web engine into [Karma](https://karma-runner.github.io/latest/index.html) or [Selenium](https://www.selenium.dev/) test framework. For more information and instructions, please view [karma-accessibility-checker](../karma-accessibility-checker).

### Reporting bugs

If you think you've found a bug, have questions or suggestions, please report the bug in [GitHub Issues](https://github.com/IBMa/equal-access/issues).

This software includes material copied from or derived from the open ACT-Rules Community. Copyright © 2022 W3C® (MIT, ERCIM, Keio, Beihang).
