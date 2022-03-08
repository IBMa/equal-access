[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

# equal-access

This Git repository hosts tools that are part of the [IBM Equal Access Toolkit](https://ibm.com/able/toolkit) and supporting components.

## Overview

This README covers topics for developers. For non-developer usage, see the following instruction for individual tools:
* [accessibility-checker-extension for Chrome](https://chrome.google.com/webstore/detail/ibm-equal-access-accessib/lkcagbfjnkomcinoddgooolagloogehp) : web browser extensions that adds automated accessibility checking capabilities to Chrome and other browser that support the Chromium web-extension API
* [accessibility-checker-extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/accessibility-checker/) : web browser extensions that adds automated accessibility checking capabilities to Firefox
* [accessibility-checker](https://www.npmjs.com/package/accessibility-checker): automated accessibility testing for Node-based test environments
* [karma-accessibility-checker](https://www.npmjs.com/package/karma-accessibility-checker): automated accessibility testing for the Karma environment
* [cypress-accessibility-checker](https://www.npmjs.com/package/cypress-accessibility-checker): wrapper of accessibility-checker in the Cypress environment


## Getting started

* [Node Version 16](https://nodejs.org/en/download/).

### Clone Repository

```bash
$ git clone --branch=master https://github.com/IBMa/equal-access.git
$ cd equal-access
```
or with SSH

```bash
$ git clone --branch=master git@github.com:IBMa/equal-access.git
$ cd equal-access
```

### Install dependencies

Under the equal-access directory

```
npm install
```
Now you can select the tool you want to use and follow the README.MD instructions


### What's in this repository?

Please review the README.md of each tool/components for more information

Tools (description above):
* [accessibility-checker-extension](accessibility-checker-extension/README.md): A web browser extensions that adds automated accessibility checking capabilities
* [accessibility-checker](accessibility-checker/README.md): Automated accessibility testing for Node-based test environments
* [karma-accessibility-checker](karma-accessibility-checker/README.md): Automated accessibility testing for the Karma environment
* [cypress-accessibility-checker](cypress-accessibility-checker/README.md): Wrapper of accessibility-checker for the Cypress environment

Components:
* [accessibility-checker-engine](accessibility-checker-engine/README.md): accessibility rules and evaluation engine used by
* [rule-server](https://github.com/IBMa/equal-access/tree/master/rule-server): deploys the rules and engine for usage by the tools


## Usage

You can build all the tools from the root directory or build each individual tool separately.

### Build all the tools from root directory

cd to equal-access if you are not already in the directory, then run:

```bash
$ npm install
$ npm run build
```

#### The following libraries or tools are built by running the above commands

* In the equal-access/accessibility-checker-engine/dist directory
  * ace-debug.js: uncompressed javascript to be used in a browser environment for development
  * ace.js: compressed javascript to be used in a browser environment for production
  * ace-node-debug.js: uncompressed javascript library to be used in a NodeJS environment for development
  * ace-node.js: compressed javascript library to be used in a NodeJS environment for production
* In the equal-access/accessibility-checker/package directory
  * java script source that can be installed or deployed as npm package that works with an HTML parsing engines such as Selenium, Puppeteer, Playwright, or Zombie to allow developers to perform integrated accessibility testing within a continuous integration pipeline such as Travis CI. Please view more [details](accessibility-checker/src/README.md).
* In the equal-access/karma-accessibility-checker/package directory
  * javascript source that can be used as a Karma plugin, see more [details](karma-accessibility-checker/README.md).

### Build each individual tool separately

Please check README for each individual tool for its build instruction:

* [accessibility-checker-engine](accessibility-checker-engine/README.md)
* [accessibility-checker-extension](accessibility-checker-extension/README.md)
* [accessibility-checker](accessibility-checker/README.md)
* [karma-accessibility-checker](karma-accessibility-checker/README.md)
