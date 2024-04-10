// features/step_definitions/browser_steps.js
const By = require('selenium-webdriver').By;
const until = require("selenium-webdriver").until;

const expect = require("chai").expect;
const aChecker = require("accessibility-checker");
const escape = require("html-escape");
const {Given, When, Then} = require('cucumber');

Given(/^I am at URL "([^"]*)"$/, function(url) {
    return this.driver.get(url);
});

When(/^I click on CSS "([^"]*)"$/, function(selector) {
    return this.driver.findElement(By.css(selector)).click();
});

When(/^I click on XPath "([^"]*)"$/, function(selector) {
    const myThis = this;
    const condition = until.elementLocated(By.xpath(selector));
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement(By.xpath(selector)).click();
    });
});

When(/^I click on ID "([^"]*)"$/, function(selector) {
    const myThis = this;
    const condition = until.elementLocated(By.id(selector));
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement(By.id(selector)).click();
    });
});

When(/^I click on XPath "([^"]*)" with text "([^"]*)"$/, function(selector, value, done) {
    const numChecked = 0;
    const myThis = this;
    const condition = until.elementLocated(By.xpath(selector));
    myThis.driver.wait(condition, 8000).then(function() {
        myThis.driver.findElements(By.xpath(selector)).then(function(elements) {
            const numToCheck = elements.length;
            elements.forEach(function(element) {
                (function(element) {
                    element.getText().then(
                        function(valueText) {
                            if (valueText === value) {
                                element.click();
                                done();
                            }
                            ++numChecked;
                            if (numChecked === numToCheck) {
                                done(valueText);
                            }
                        }
                    );
                })(element);
            });
        });
    });
    //        return this.driver.findElement(By.xpath(selector)).click();
});

When(/^I click on Link Text "([^"]*)"$/, function(selector) {
    const myThis = this;
    const condition = until.elementLocated(By.linkText(selector));
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement(By.linkText(selector)).click();
    });
});

When(/^I click on text "([^"]*)"$/, function(text) {
    const myThis = this;
    const xpath = "//*[contains(text(),'" + text + "')]";
    const condition = until.elementLocated({ xpath: xpath });
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement({ xpath: xpath }).click();
    })
});

When(/^I type in CSS "([^"]*)" "([^"]*)"$/, function(selector, keys) {
    return this.driver.findElement(By.css(selector)).sendKeys(keys);
});

When(/^I type in label "([^"]*)" "([^"]*)"$/, function(labelText, valueText) {
    const myThis = this;
    const xpath = "//label[contains(text(),'" + labelText + "')]";
    const condition = until.elementLocated({ xpath: xpath });
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement({ xpath: xpath }).then(function(labelElement) {
            return labelElement.getAttribute("for").then(function(forId) {
                return myThis.driver.findElement(By.id(forId)).sendKeys(valueText);
            });
        });
    })
});

Then(/^Element by CSS "([^"]*)" has value "([^"]*)"$/, function(selector, value, done) {
    const element = this.driver.findElement(By.css(selector))
    element.getAttribute("value").then(
        function(valueText) {
            expect(valueText).to.equal(value);
            done();
        }
    );
});

Then(/^Element by CSS "([^"]*)" has text "([^"]*)"$/, function(selector, value, done) {
    const element = this.driver.findElement(By.css(selector));
    element.getText().then(
        function(valueText) {
            expect(valueText).to.equal(value);
            done();
        }
    );
});

Then(/^Element by CSS "([^"]*)" is (not )?empty$/, function(selector, arg2, done) {
    const condition = until.elementLocated({ "css": selector });
    const myThis = this;
    myThis.driver.wait(condition, 8000).then(function() {
        const element = myThis.driver.findElement(By.css(selector))
        element.getText().then(
            function(valueText) {
                if (arg2 === "not ") {
                    expect(valueText).not.to.match(/^[\s\r\n]*$/);
                } else {
                    expect(valueText).to.match(/^[\s\r\n]*$/);
                }
                done();
            }
        );
    });
});

Then(/^Element by XPath "([^"]*)" has text "([^"]*)"$/, { "timeout": 10000 }, function(selector, value, done) {
    const condition = until.elementLocated({ "xpath": selector });
    const myThis = this;
    myThis.driver.wait(condition, 8000).then(function() {
        const numChecked = 0;
        myThis.driver.findElements(By.xpath(selector)).then(function(elements) {
            const numToCheck = elements.length;
            elements.forEach(function(element) {
                element.getText().then(
                    function(valueText) {
                        if (valueText === value) {
                            done();
                        }
                        ++numChecked;
                        if (numChecked === numToCheck) {
                            done("Not Found");
                        }
                    }
                );
            });
        });
    });
});

Then(/^Button with value "([^"]*)" is (not )?visible$/, function(text, arg2) {
    let condition;
    if (arg2 === "not ") {
        condition = until.elementIsNotVisible({ "xpath": "//*[@value='" + text + "']" });
    } else {
        condition = until.elementIsVisible({ "xpath": "//*[@value='" + text + "']" });
    }
    return this.driver.wait(condition, 8000);
});

Then(/^Element by CSS "([^"]*)" is (not )?visible$/, function(selector, arg2) {
    let condition;
    if (arg2 === "not ") {
        condition = until.elementIsNotVisible(this.driver.findElement({ "css": selector }));
    } else {
        condition = until.elementIsVisible(this.driver.findElement({ "css": selector }));
    }
    return this.driver.wait(condition, 8000);
});

Then(/^I should see "([^"]*)"$/, function(text) {
    const xpath = "//*[contains(text(),'" + text + "')]";
    const condition = until.elementLocated({ xpath: xpath });
    return this.driver.wait(condition, 8000);
});

Then(/^Page is accessible with label "([^"]*)"$/, { "timeout": 30000 }, async function(label) {
    const world = this;
    try {
        const { report } = await aChecker.getCompliance(world.driver, label);
        // If assert fails, value is either 1 or 2 depending on if there's a baseline
        let assertResult = aChecker.assertCompliance(report);
        expect(assertResult).to.equal(0, assertResult === 1 ? "Results do not match baseline": "Failing issues found");
    } catch (e) {
        world.attach(escape(aChecker.stringifyResults(report)));
        const buffer = await world.driver.takeScreenshot();
        await world.attach(buffer, 'image/png');
        return Promise.reject(e);
    } finally {
        await aChecker.close();
    }
})

Then(/^Scan page for accessibility with label "([^"]*)"$/, { "timeout": 30000 }, async function(label) {
    const world = this;
    try {
        const { report } = await aChecker.getCompliance(world.driver, label);
        let assertResult = aChecker.assertCompliance(report);
        expect(assertResult).to.equal(0, assertResult === 1 ? "Results do not match baseline": "Failing issues found");
    } catch (e) {
        world.attach(escape(aChecker.stringifyResults(report)));
        const buffer = await world.driver.takeScreenshot();
        await world.attach(buffer, 'image/png');
    } finally {
        await aChecker.close();
    }
})