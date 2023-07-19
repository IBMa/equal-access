'use strict';

const webdriver = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');
const By = webdriver.By;

const path = require("path");
//const { loadSeleniumTestFile } = require("../util/Util");
const { loadSeleniumTestFile } = require("../../util/Util.js");

let browser;
beforeAll(function() {
    try {
        let spath = require('chromedriver').path;
        spath = path.join(spath, "..");
        spath = path.join(spath, "..");
        spath = path.join(spath, "..");
        spath = path.join(spath, "bin");
        spath = path.join(spath, "chromedriver");
        
        const options = new chrome.Options();
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--headless=new");
        options.addArguments('--ignore-certificate-errors')

        const service = new chrome.ServiceBuilder(spath).build();
        // setDefaultService function is removed since web-driver v4.3.1+
        //chrome.setDefaultService(service);
        chrome.Driver.createSession(options, service);

        browser = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();
    } catch (e) {
        console.log(e);
    }
})

afterAll(function(done) {
    browser.quit().then(done);
})

describe("Hello World Basics", () => {
    test("HomePage", async() => {
        const sample = path.join(__dirname, "..", "sample", "Hello.html");
        await loadSeleniumTestFile(browser, sample);
        // Perform the accessibility scan using the IBMaScan Wrapper
        await expect(browser).toBeAccessible("HOME");
    });
    
    test("Added content", async () => {
        await browser.findElement(By.css("#clickMe")).click();
        await expect(browser).toBeAccessible("HOME2");
    });
});
