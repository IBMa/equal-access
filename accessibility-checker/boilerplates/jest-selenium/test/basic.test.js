'use strict';

const webdriver = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');
const By = webdriver.By;

const path = require("path");
const AAT = require("@ibma/aat");

let browser;
beforeAll(function() {
    try {
        let spath = require('chromedriver').path;
        spath = path.join(spath, "..");
        spath = path.join(spath, "..");
        spath = path.join(spath, "..");
        spath = path.join(spath, "bin");
        spath = path.join(spath, "chromedriver");
        
        const service = new chrome.ServiceBuilder(spath).build();
        chrome.setDefaultService(service);
        browser = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();
    } catch (e) {
        console.log(e);
    }
})

afterAll(function(done) {
    browser.quit().then(done);
})

describe("Hello World Basics", () => {
    test("HomePage", (done) => {
        const sample = path.join(__dirname, "..", "sample", "Hello.html");
        browser.get("file://"+sample).then(async function() {
            // Perform the accessibility scan using the IBMaScan Wrapper
            let results = await AAT.getCompliance(browser, "HOME");
            let report = results.report;
            expect(AAT.assertCompliance(report)).toEqual(0);
            done();
        });
    });
    
    test("Added content", (done) => {
        browser.findElement(By.css("#clickMe")).click()
        .then(async () => {
            let results = await AAT.getCompliance(browser, "HOME2");
            let report = results.report;
            expect(AAT.assertCompliance(report)).toEqual(0);
            done();
        })
    });
});
