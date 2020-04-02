// spec.js
var AAT = require("@ibma/aat");

describe('Protractor Demo App', function() {
    it("HomePage", function (done) {
        browser.get("http://localhost:3003/Hello.html").then(function() {
            // Perform the accessibility scan using the IBMaScan Wrapper
            AAT.getCompliance(browser, "HOME", function(data, doc) {
                try {
                    console.log(data.reports[0].issues);
                    expect(AAT.assertCompliance(data)).toEqual(0, AAT.getDiffResults("HOME"));
                    done();
                } catch (e) {
                    console.log(AAT.getDiffResults("HOME"));
                    done(e);
                }
            });
        });
    });

    it("Hompage, Show Card", function (done) {
        browser.findElement({"id": "clickMe"}).click().then(function() {
            // Perform the accessibility scan using the IBMaScan Wrapper
            AAT.getCompliance(browser, "HOME_CARD", function (data, doc) {
                try {
                    expect(AAT.assertCompliance(data)).toEqual(0, AAT.getDiffResults("HOME_CARD"));
                    done();
                } catch (e) {
                    console.log(AAT.getDiffResults("HOME_CARD"));
                    done(e);
                }
            });
        });

    });
})