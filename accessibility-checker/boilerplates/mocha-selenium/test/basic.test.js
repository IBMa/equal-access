'use strict';

const webdriver = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');
const By = webdriver.By;

const path = require("path");
const aChecker = require("accessibility-checker");
//const expect = require("chai").expect;
//const { loadSeleniumTestFile } = require("../util/Util");
var expect = require("chai").expect;
const { loadSeleniumTestFile } = require("../../util/Util.js");

let browser;
before(function(done) {
    try {
        this.timeout(10000);
        let spath = require('chromedriver').path;
        spath = path.join(spath, "..");
        spath = path.join(spath, "..");
        spath = path.join(spath, "..");
        spath = path.join(spath, "bin");
        spath = path.join(spath, "chromedriver");

        const options = new chrome.Options();
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--headless");
        options.addArguments('--ignore-certificate-errors')

        // setDefaultService function is removed since web-driver v4.3.1+
        //chrome.setDefaultService(service);
        chrome.Driver.createSession(options, service);

        browser = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();
        expect(typeof browser).to.not.equal("undefined");
        done();
    } catch (e) {
        console.log(e);
    }
})

after(function(done) {
    browser.quit().then(done);
})

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Hello World Basics", function () {
    this.timeout(0);
    it("HomePage", function (done) {
        const sample = path.join(__dirname, "..", "sample", "Hello.html");
        loadSeleniumTestFile(browser, sample).then(function() {
            // Perform the accessibility scan using the IBMaScan Wrapper
            aChecker.getCompliance(browser, "HOME", function (data, doc) {
                try {
                    expect(aChecker.assertCompliance(data)).to.equal(0, aChecker.stringifyResults(data));
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });

    it("Hompage, Show Card", async () => {
        await browser.findElement({"id": "clickMe"}).click();
        let result = await aChecker.getCompliance(browser, "HOME_CARD");
        let report = result.report;
        expect(aChecker.assertCompliance(report)).to.equal(0, aChecker.stringifyResults(report));
    });
});
