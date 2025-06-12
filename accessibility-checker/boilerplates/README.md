# accessibility-checker boilerplates

In this folder are a series of boilerplates created for a form
of "Hello World" for different testing frameworks.
By using a boilerplate, developers can focus on the unique aspects of their project rather than building automated accessibility testing from scratch.

See the boilerplate `README` for your automated testing framework listed below to get started:

- [batch-scan](batch-scan): scan a set of local files
- [cucumber-selenium](cucumber-selenium): Using [Cucumber](https://www.npmjs.com/package/cucumber) with [Selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) browser automation
- [jest](jest): Using a [Jest](https://www.npmjs.com/package/jest) test environment
- [jest-customRS](jest-customRS): Using a [Jest](https://www.npmjs.com/package/jest) test environment
- [jest-puppeteer-ts](jest-puppeteer-ts): Using a [Jest](https://www.npmjs.com/package/jest) test environment with [Puppeteer](https://www.npmjs.com/package/puppeteer) controlled browser
- [jest-selenium](jest-selenium): Using a [Jest](https://www.npmjs.com/package/jest) test environment with [Selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) browser automation
- [mocha-puppeteer-ts](mocha-puppeteer-ts): Using a [Mocha](https://www.npmjs.com/package/mocha) test environment with a [Puppeteer](https://www.npmjs.com/package/puppeteer) controlled browser, and Typescript
- [mocha-selenium](mocha-selenium): Using a [Mocha](https://www.npmjs.com/package/mocha) test environment with [Selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) browser automation
- [protractor](protractor): Using a [Protractor](https://www.npmjs.com/package/protractor) test environment for Angular and AngularJS applications
- [webdriverio](webdriverio): Using a [Webdriverio](https://www.npmjs.com/package/webdriverio) browser and mobile test automation framework
- and others

## Baselines

Baselines are a helpful feature of `accessibility-checker` that can be used in the test environment. The concept involves capturing a scan result as a _baseline_ so that future scans will pass if they match the _baseline_. If they differ, then the test will fail.
Many boilerplate examples above include _baselines_.
This feature is useful for issues that have been determined to be of the following:

- false positives determined to be ignored
- `Needs review` issues resolved
- issues scheduled to be fixed later
- new regression issues captured

See the [Baseline basics in the Wiki](https://github.com/IBMa/equal-access/wiki#baseline-basics) for an overview.
