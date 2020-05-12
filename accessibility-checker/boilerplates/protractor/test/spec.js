// spec.js
const aChecker = require("accessibility-checker");

describe('Protractor Demo App', function() {
    it("HomePage", function (done) {
        browser.get("http://localhost:3003/Hello.html").then(function() {
            // Perform the accessibility scan using the IBMaScan Wrapper
            aChecker.getCompliance(browser, "HOME", function(data, doc) {
                try {
                    console.log(data.reports[0].issues);
                    expect(aChecker.assertCompliance(data)).toEqual(0, aChecker.getDiffResults("HOME"));
                    done();
                } catch (e) {
                    console.log(aChecker.getDiffResults("HOME"));
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
                    expect(aChecker.assertCompliance(data)).toEqual(0, aChecker.getDiffResults("HOME_CARD"));
                    done();
                } catch (e) {
                    console.log(aChecker.getDiffResults("HOME_CARD"));
                    done(e);
                }
            });
        });

    });
})