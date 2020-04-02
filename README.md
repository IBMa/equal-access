# equal-access

Note: This tool release is currently beta. Some links may not resolve.

This Git repository hosts tools that are part of the [IBM Equal Access Toolkit](https://ibm.com/able/toolkit) and supporting components.

## Overview

This README covers topics for developers. For non-developer usage, see the following instruction for individual tools:
* [accessibility-checker-extension for Chrome](accessibility-checker-extension/README.md) and [extension](): web browser extensions that adds automated accessibility checking capabilities to Chrome and other browser that support the Chromium web-extension API
* [accessibility-checker-extension for Firefox](accessibility-checker-extension/README.md) and [extension]() : web browser extensions that adds automated accessibility checking capabilities to Firefox
* [accessibility-checker](accessibility-checker/README.md) and [npm](https://www.npmjs.com/package/accessibility-checker): automated accessibility testing for Node-based test environments
* [karma-accessibility-checker](karma-accessibility-checker/README.md) and [npm](https://www.npmjs.com/package/karma-accessibility-checker): automated accessibility testing for the Karma environment

### What's in this repository?

Tools (description above):
* [accessibility-checker-extension](accessibility-checker-extension/README.md)
* [accessibility-checker](accessibility-checker/README.md)
* [karma-accessibility-checker](karma-accessibility-checker/README.md)

Components:
* [accessibility-checker-engine](accessibility-checker-engine/README.md): accessibility rules and evaluation engine used by the tools
* rule-server: deploys the rules and engine for usage by the tools

## Prerequisites

* [NodeJS with NPM](https://nodejs.org/en/download/).
* [Git](https://git-scm.com/downloads), if you want to clone the repository to your local environment

### Clone Repository

```bash
$ git clone --branch=master https://github.com/IBMa/equal-access.git
$ cd accessibility-checker
```
or with SSH

```bash
$ git clone --branch=master git@github.com:IBMa/equal-access.git
$ cd accessibility-checker
```

If using ssh for clone make sure to follow steps at: [Connecting to GitHub with SSH](https://help.github.com/articles/connecting-to-github-with-ssh/)

## Usage

You can build all the tools from root directory or build each individual tool separately.  

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
  * java script source that can be installed or deployed as npm package that works with an HTML parsing engines such as Selenium, Puppeteer, or Zombie to allow developers to perform integrated accessibility testing within a continuous integration pipeline such as Travis CI. Please view more [details](accessibility-checker/src/README.md).
* In the equal-access/karma-accessibility-checker/package directory
  * javascript source that can be used as a Karma plugin, see more [details](karma-accessibility-checker/README.md).  

### Build each individual tool separately

Please check README for each individual tool for its build instruction:

* [accessibility-checker-engine](accessibility-checker-engine/README.md)
* [accessibility-checker-extension](accessibility-checker-extension/README.md)
* [accessibility-checker](accessibility-checker/README.md)
* [karma-accessibility-checker](karma-accessibility-checker/README.md) 
