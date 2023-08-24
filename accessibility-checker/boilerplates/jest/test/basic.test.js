/**
 * @jest-environment jsdom
 */
'use strict';

var path = require("path");

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Hello World Basics", () => {
    test("Image missing alt w/ Baseline", async () => {
        document.body.innerHTML = "<div><img src='hello.png' /></div>";
        await expect(document).toBeAccessible("IMG_BASELINE");
    });
    test("Image missing alt without Baseline", async () => {
        document.body.innerHTML = "<div><img src='hello.png' /></div>";
        await expect(document).toBeAccessible("IMG_NO_BASELINE");
    });
});
