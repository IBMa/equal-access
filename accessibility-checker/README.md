[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

# accessibility-checker
An automated accessibility testing for Node-based test environments from [IBM Equal Access Toolkit](https://ibm.com/able/toolkit).

To get started, please review [NPM](https://www.npmjs.com/package/accessibility-checker).

## Features

- Scan single or multiple files, directories, or URLs
- Output scan report results in JSON, CSV, HTML or XLSX formats
- Set a target rule archive
- Configure policies to scan
- Set violation levels that trigger test failures
- Set violation levels that should be reported

## Running Locally

### Install

```bash
$ npm install
```

### Build & Package

```bash
$ npm install
$ npm run build
$ npm run package:zip  or  npm run package:npm
```

### Test

```bash
$ npm test
```

### Reporting bugs 

If you think you've found a bug, have questions or suggestions, please report the bug in [GitHub Issues](https://github.com/IBMa/equal-access/issues).

## Known issues and workarounds

1. If you see `TypeError: ace.Checker is not a constructor`: 
    - Try to run your tests serially using the configuration option in your framework. For example, use `--runInBand` in Jest framework. 


