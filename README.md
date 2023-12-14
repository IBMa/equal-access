# equal-access

This Git repository hosts tools and supporting components of the [IBM Equal Access Toolkit](https://ibm.com/able/toolkit).

## Overview

This README covers topics for users who want to find the deployed tools as well as topics for developers who want to better understand the various components and build the tools.

The [wiki](https://github.com/IBMa/equal-access/wiki) contains overview information, links to videos, and other resources.

## Usage

The tools have been deployed to the various stores and NPM so they can be easily downloaded and installed:

* [Chrome accessibility-checker-extension](https://chrome.google.com/webstore/detail/ibm-equal-access-accessib/lkcagbfjnkomcinoddgooolagloogehp) : web browser extension that integrates automated accessibility checking capabilities into the Chrome Developer Tools
* [Firefox accessibility-checker-extension](https://addons.mozilla.org/en-US/firefox/addon/accessibility-checker/) : web browser extension that integrates automated accessibility checking capabilities into the Firefox Web Developer Tools
* [Node accessibility-checker](https://www.npmjs.com/package/accessibility-checker): automated accessibility testing within a continuous integration pipeline, such as Travis CI for Node-based test environments, such as Selenium, Puppeteer, Playwright, and Zombie; the ability to validate results against baseline files, and scan local files
* [karma-accessibility-checker](https://www.npmjs.com/package/karma-accessibility-checker): automated accessibility testing for the Karma environment
* [cypress-accessibility-checker](https://www.npmjs.com/package/cypress-accessibility-checker): wrapper of the `accessibility-checker` in the Cypress environment

## Requirements

* [Node Version 18](https://nodejs.org/en/download/).

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

```bash
npm install
```

Now you can select the tool you want to build and follow the tool's README instructions located in its sub-directory.

### What's in this repository?

Please review the README of the selected tool for more information specific to that tool

#### Tools

* [accessibility-checker-extension/README](accessibility-checker-extension/README.md): A web developer tools browser extension that adds automated accessibility checking capabilities
* [accessibility-checker/README](accessibility-checker/README.md): Automated accessibility testing for Node-based test environments, the ability to validate results against baseline files, and scan local files
* [karma-accessibility-checker/README](karma-accessibility-checker/README.md): Automated accessibility testing for the Karma environment
* [cypress-accessibility-checker/README](cypress-accessibility-checker/README.md): Wrapper of accessibility-checker for the Cypress environment

#### Components

* [accessibility-checker-engine/README](accessibility-checker-engine/README.md): accessibility rules and evaluation engine used by
* [rule-server/README](rule-server/README.md): deploys the rules and engine for usage by the tools

## Build

Build all the tools and components from the root directory or build each individual tool separately.

### Build all the tools from root directory

cd to equal-access if you are not already in the root directory, then run:

```bash
$ npm install
$ npm run build
```

#### All the following libraries or tools are built by running the above commands

* In the equal-access/accessibility-checker-engine/dist directory
  * ace-debug.js: uncompressed javascript to be used in a browser environment for development
  * ace.js: compressed javascript to be used in a browser environment for production
  * ace-node-debug.js: uncompressed javascript library to be used in a NodeJS environment for development
  * ace-node.js: compressed javascript library to be used in a NodeJS environment for production
* In the equal-access/accessibility-checker/package directory
  * java script source that can be installed or deployed as npm package that works with an HTML parsing engines, such as Selenium, Puppeteer, Playwright, or Zombie to allow developers to perform integrated accessibility testing within a continuous integration pipeline, such as Travis CI. Please view more [details](accessibility-checker/src/README.md).
* In the equal-access/karma-accessibility-checker/package directory
  * javascript source that can be used as a Karma plugin, see more [details](karma-accessibility-checker/README.md).

### Build each individual tool separately

Please check the README for each individual tool for its build instructions:

* [accessibility-checker-engine/README](accessibility-checker-engine/README.md)
* [accessibility-checker-extension/README](accessibility-checker-extension/README.md)
* [accessibility-checker/README](accessibility-checker/README.md)
* [cypress-accessibility-checker/README](accessibility-checker/README.md)
* [karma-accessibility-checker/README](karma-accessibility-checker/README.md)

## Feedback and reporting bugs

If you think you've found a bug, have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues). If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
