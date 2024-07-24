# accessibility-checker-engine

## Overview

`accessibility-checker-engine` is a rules-based engine for detecting issues in the Document Object Model (DOM) of web applications and content.

- The engine is used by the [IBM Equal Access Accessibility Checker](https://www.ibm.com/able/toolkit/tools#develop) suite of tools.
- The rules and engine are written in JavaScript and can be injected directly into web pages and applications.

## Get the engine

Install accessibility-checker-engine in a Node environment to inject into a browser environment:
```
$ npm install --save-dev accessibility-checker-engine
```

Use a CDN to access the engine in a browser environment:
```
<script src="https://unpkg.com/accessibility-checker-engine@latest/ace.js"></script>
```

## Quick start

See [CodeSandbox Demo](https://codesandbox.io/s/accessibility-checker-engine-demo-r1k1k3?file=/index.html) for a more complete example.

```
const checker = new ace.Checker();
const report = await checker.check(document, ["IBM_Accessibility"]);
```

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
* `["IBM_Accessibility"]` - apply IBM accessibility ruleset.
* `report` - accessibility results contains identified accessibility issues and their descriptions from the given `doc`, and a summary of the issues. The report is in JSON format (see [details](#report)).

## Rules and Rulesets

* Rules are based on the [IBM Accessibility requirements](https://www.ibm.com/able/requirements/requirements/), which is a unified set of WCAG, EN 301 549, and US 508 standards.
* Rules are harmonized with the open rules published by the [W3C ACT-Rules Community](https://www.w3.org/community/act-r/) group as reported in the [IBM Equal Access Accessibility Checker ACT implementation report](https://wai-wcag-act-rules.netlify.app/standards-guidelines/act/implementations/equal-access/).
* Rule sets, such as `IBM Accessibility v7.2`, `WCAG 2.2 (A & AA)`, `WCAG 2.1 (A & AA)`, and `WCAG 2.0 (A & AA)`and mappings of the rules to the standards (Requirements), Rule IDs, the individual failure messages, and links to the Help files are published at [Checker rule sets](https://www.ibm.com/able/requirements/checker-rule-sets).
* Mappings of the rules are defined in the [individual rule_ID_name.ts files](https://github.com/IBMa/equal-access/tree/master/accessibility-checker-engine/src/v4/rules).

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
* Open `ace.js` select and copy all the content
* Paste the content you copied to the command prompt in the developer tool, then press `Enter`
* Type in the command prompt: `ace.checkDemo()`, then `Enter`

You can view the accessibility report for the page:  
![use ACE in the Chrome developer tool](img/use-ace-in-developer-tool.png "Use ACE in the Chrome developer tool to test accessibility of a web page")

### Programmatic

The following code snippet demonstrates how to use ACE to test a web page for accessibility in an embedded Chrome environment (`puppeteer`). See [accessibility-checker](https://www.npmjs.com/package/accessibility-checker) for a more complete tool for this environment.

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
  await page.goto('http://localhost:3000', { waitUtil: 'domcontentloaded' };
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

You can use the [accessibility-checker-extension](https://www.ibm.com/able/toolkit/tools/#develop) for Chrome, Edge, or Firefox. The browser extensions integrate the accessibility web engine (ace.js) and formatted results into the browser developer tool to view the accessibility issues and the locations of violating components. For more information and instructions, please view [accessibility-checker-extensions](https://www.ibm.com/able/toolkit/tools/#develop).

### Integration with test frameworks

You can use the [karma-accessibility-checker](https://www.npmjs.com/package/karma-accessibility-checker) to integrate accessibility web engine into [Karma](https://karma-runner.github.io/latest/index.html) or [Selenium](https://www.selenium.dev/) test framework. For more information and instructions, please view [karma-accessibility-checker](https://www.npmjs.com/package/karma-accessibility-checker).

### Reporting bugs

If you think you've found a bug, have questions or suggestions, please report the bug in [GitHub Issues](https://github.com/IBMa/equal-access/issues).

This software includes material copied from or derived from the open ACT-Rules Community. Copyright © 2022 W3C® (MIT, ERCIM, Keio, Beihang).