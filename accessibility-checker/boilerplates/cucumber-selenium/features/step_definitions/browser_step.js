// features/step_definitions/browser_steps.js
var By = require('selenium-webdriver').By;
var until = require("selenium-webdriver").until;

var expect = require("chai").expect;
var AAT = require("@ibma/aat");
const escape = require("html-escape");
var {Given, When, Then} = require('cucumber');

Given(/^I am at URL "([^"]*)"$/, function(url) {
    return this.driver.get(url);
});

When(/^I click on CSS "([^"]*)"$/, function(selector) {
    return this.driver.findElement(By.css(selector)).click();
});

When(/^I click on XPath "([^"]*)"$/, function(selector) {
    var myThis = this;
    var condition = until.elementLocated(By.xpath(selector));
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement(By.xpath(selector)).click();
    });
});

When(/^I click on ID "([^"]*)"$/, function(selector) {
    var myThis = this;
    var condition = until.elementLocated(By.id(selector));
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement(By.id(selector)).click();
    });
});

When(/^I click on XPath "([^"]*)" with text "([^"]*)"$/, function(selector, value, done) {
    var numChecked = 0;
    var myThis = this;
    var condition = until.elementLocated(By.xpath(selector));
    myThis.driver.wait(condition, 8000).then(function() {
        myThis.driver.findElements(By.xpath(selector)).then(function(elements) {
            var numToCheck = elements.length;
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
    var myThis = this;
    var condition = until.elementLocated(By.linkText(selector));
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement(By.linkText(selector)).click();
    });
});

When(/^I click on text "([^"]*)"$/, function(text) {
    var myThis = this;
    var xpath = "//*[contains(text(),'" + text + "')]";
    var condition = until.elementLocated({ xpath: xpath });
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement({ xpath: xpath }).click();
    })
});

When(/^I type in CSS "([^"]*)" "([^"]*)"$/, function(selector, keys) {
    return this.driver.findElement(By.css(selector)).sendKeys(keys);
});

When(/^I type in label "([^"]*)" "([^"]*)"$/, function(labelText, valueText) {
    var myThis = this;
    var xpath = "//label[contains(text(),'" + labelText + "')]";
    var condition = until.elementLocated({ xpath: xpath });
    return myThis.driver.wait(condition, 8000).then(function() {
        return myThis.driver.findElement({ xpath: xpath }).then(function(labelElement) {
            return labelElement.getAttribute("for").then(function(forId) {
                return myThis.driver.findElement(By.id(forId)).sendKeys(valueText);
            });
        });
    })
});

Then(/^Element by CSS "([^"]*)" has value "([^"]*)"$/, function(selector, value, done) {
    var element = this.driver.findElement(By.css(selector))
    element.getAttribute("value").then(
        function(valueText) {
            expect(valueText).to.equal(value);
            done();
        }
    );
});

Then(/^Element by CSS "([^"]*)" has text "([^"]*)"$/, function(selector, value, done) {
    var element = this.driver.findElement(By.css(selector));
    element.getText().then(
        function(valueText) {
            expect(valueText).to.equal(value);
            done();
        }
    );
});

Then(/^Element by CSS "([^"]*)" is (not )?empty$/, function(selector, arg2, done) {
    var condition = until.elementLocated({ "css": selector });
    var myThis = this;
    myThis.driver.wait(condition, 8000).then(function() {
        var element = myThis.driver.findElement(By.css(selector))
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
    var condition = until.elementLocated({ "xpath": selector });
    var myThis = this;
    myThis.driver.wait(condition, 8000).then(function() {
        var numChecked = 0;
        myThis.driver.findElements(By.xpath(selector)).then(function(elements) {
            var numToCheck = elements.length;
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
    var condition;
    if (arg2 === "not ") {
        condition = until.elementIsNotVisible({ "xpath": "//*[@value='" + text + "']" });
    } else {
        condition = until.elementIsVisible({ "xpath": "//*[@value='" + text + "']" });
    }
    return this.driver.wait(condition, 8000);
});

Then(/^Element by CSS "([^"]*)" is (not )?visible$/, function(selector, arg2) {
    var condition;
    if (arg2 === "not ") {
        condition = until.elementIsNotVisible(this.driver.findElement({ "css": selector }));
    } else {
        condition = until.elementIsVisible(this.driver.findElement({ "css": selector }));
    }
    return this.driver.wait(condition, 8000);
});

Then(/^I should see "([^"]*)"$/, function(text) {
    var xpath = "//*[contains(text(),'" + text + "')]";
    var condition = until.elementLocated({ xpath: xpath });
    return this.driver.wait(condition, 8000);
});

Then(/^Page is accessible with label "([^"]*)"$/, { "timeout": 30000 }, function(label, done) {
    var world = this;
    AAT.getCompliance(world.driver, label, function(data, doc) {
        try {
            // If assert fails, value is either 1 or 2 depending on if there's a baseline
            expect(AAT.assertCompliance(data)).to.equal(0, data === 1 ? "Results do not match baseline": "Failing issues found");
            done();
        } catch (e) {
            world.attach(escape(AAT.stringifyResults(data)));
            world.driver.takeScreenshot().then(function (buffer) {
                return world.attach(buffer, 'image/png');
            })
            .then(function() {
                done(e);
            });
        }
    });
})

Then(/^Scan page for accessibility with label "([^"]*)"$/, { "timeout": 30000 }, function(label, done) {
    var world = this;
    AAT.getCompliance(this.driver, label, function(data, doc) {
        try {
            expect(AAT.assertCompliance(data)).to.equal(0, data === 1 ? "Results do not match baseline": "Failing issues found");
            done();
        } catch (e) {
            world.attach(escape(AAT.stringifyResults(data)));
            world.driver.takeScreenshot().then(function (buffer) {
                return world.attach(buffer, 'image/png');
            })
            .then(function() {
                done();
            });
        }
    });
})