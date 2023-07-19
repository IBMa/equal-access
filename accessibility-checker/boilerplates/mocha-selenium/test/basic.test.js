'use strict';

var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');

var path = require("path");
const aChecker = require("accessibility-checker");
var expect = require("chai").expect;
const { loadSeleniumTestFile } = require("../../util/Util.js");

var browser;
before(function(done) {
    try {
        this.timeout(10000);
        var spath = require('chromedriver').path;
        spath = path.join(spath, "..");
        spath = path.join(spath, "..");
        spath = path.join(spath, "..");
        spath = path.join(spath, "bin");
        spath = path.join(spath, "chromedriver");
        
        var service = new chrome.ServiceBuilder(spath).build();

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
    it("HomePage", function (done) {
        this.timeout(0);
        var sample = path.join(__dirname, "..", "sample", "Hello.html");
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

    it("Hompage, Show Card", function (done) {
        browser.findElement({"id": "clickMe"}).click().then(function() {
            // Perform the accessibility scan using the IBMaScan Wrapper
            aChecker.getCompliance(browser, "HOME_CARD", function (data, doc) {
                try {
                    expect(aChecker.assertCompliance(data)).to.equal(0, aChecker.stringifyResults(data));
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });
});
