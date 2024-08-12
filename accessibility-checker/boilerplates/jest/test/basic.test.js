/**
 * @jest-environment jsdom
 */
'use strict';

describe("Hello World - Baseline Basics", () => {
    test("Image missing alt w/ Baseline", async () => {
        document.body.innerHTML = "<div><img src='hello.png' /></div>"
        // We expect this test to pass because it will find baselines/IMG_BASELINE.json
        // The checker will ignore issues stored in the baseline
        await expect(document).toBeAccessible("IMG_BASELINE")
    });
    test("Image missing alt without Baseline", async () => {
        // If you add alt='anything' you will no longer see the 'The image has neither an accessible name nor is marked as decorative or redundant' message
        document.body.innerHTML = "<div><img src='hello.png' /></div>"
        await expect(document).toBeAccessible("IMG_NO_BASELINE")
    })
})
