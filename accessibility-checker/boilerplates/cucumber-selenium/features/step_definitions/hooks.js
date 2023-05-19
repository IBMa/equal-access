// Load required libraries

const webdriver = require('selenium-webdriver');

// Define which browser we're testing with
const userBrowser = process.env.BROWSER || "CHROME";

function getBrowserFirefox() {
    require('geckodriver');
    let capabilities = webdriver.Capabilities.firefox();
    capabilities.set('moz:firefoxOptions', {
        "binary": process.env.FIREFOX_PATH || "/Applications/Firefox Quantum.app/Contents/MacOS/firefox"
    });

    return new webdriver.Builder()
        .withCapabilities(capabilities)
        .build();
}

function getBrowserChrome() {
    const chrome = require('selenium-webdriver/chrome');
    const path = require("path");
    let spath = require('chromedriver').path;
    spath = path.join(spath, "..", "..", "..", "bin", "chromedriver");

    const options = new chrome.Options();
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--headless=new");
    options.addArguments('--ignore-certificate-errors')

    let service = new chrome.ServiceBuilder(spath).build();
    chrome.Driver.createSession(options, service);

    return new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();
}

function getBrowser() {
    if (userBrowser.toUpperCase() === "FIREFOX") {
        return getBrowserFirefox();
    } else if (userBrowser.toUpperCase() === "CHROME") {
        return getBrowserChrome();
    }
}


// features/step_definitions/hooks.js
let driver;
const {BeforeAll, AfterAll, Before} = require("cucumber");
    Before(function() {
        this.driver = driver;
    })

    AfterAll(function() {
        return driver.quit();
    });

    BeforeAll(function() {
        driver = getBrowser();
        /*
        return new Promise(function(resolve, reject) {
            aChecker.onRunComplete(resolve);
        });
        */
    })
