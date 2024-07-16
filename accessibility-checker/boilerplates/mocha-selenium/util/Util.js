const fs = require("fs");

module.exports = {
    loadSeleniumTestFile: (browser, testFile) => {
        return browser.get("file://" + testFile);
        // let testContent = fs.readFileSync(testFile);
        // return browser.executeScript(`document.open("text/html");document.write(${JSON.stringify(testContent)});document.close()`);
    },
    loadPuppeteerTestFile: (page, testFile) => {
        return page.goto("file://" + testFile, { waitUntil: 'networkidle0' });

        // let testContent = fs.readFileSync(testFile);
        // return page.evaluate((testContent) => {
        //     document.open("text/html");
        //     document.write(testContent);
        //     document.close()
        // }, testContent);
    }
}