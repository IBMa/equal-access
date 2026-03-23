/******************************************************************************
  Copyright:: 2020- IBM, Inc

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*****************************************************************************/

import * as aChecker from "../../../../src/mjs/index.js";
import { expect } from "chai";

before(async () => {
    await aChecker.getConfig();
});

after(async () => {
    await aChecker.close();
});

// Test Suite for getSimulation function
describe("aChecker.getSimulation function tests", function () {
    // Set a reasonable timeout for all tests
    this.timeout(30000);
    
    // // Test that the function is defined
    // it("aChecker.getSimulation should be defined", function () {
    //     expect(typeof aChecker.getSimulation).to.not.equal("undefined");
    //     expect(typeof aChecker.getSimulation).to.equal("function");
    // });

    // // Test with null content - should throw error
    // it("should throw error when content is null", async function () {
    //     try {
    //         await aChecker.getSimulation(null, "test-label");
    //         expect.fail("Should have thrown an error");
    //     } catch (error) {
    //         expect(error.message).to.include("Unable to get simulation of null or undefined object");
    //     }
    // });

    // // Test with undefined content - should throw error
    // it("should throw error when content is undefined", async function () {
    //     try {
    //         await aChecker.getSimulation(undefined, "test-label");
    //         expect.fail("Should have thrown an error");
    //     } catch (error) {
    //         expect(error.message).to.include("Unable to get simulation of null or undefined object");
    //     }
    // });

    // Test with valid HTML content and verify structure
    it("should return simulation structure for valid HTML content", async function () {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Test Page</title>
            </head>
            <body>
                <h1>Test Heading</h1>
                <p>Test paragraph</p>
                <button>Click me</button>
            </body>
            </html>
        `;
        
        const result = await aChecker.getSimulation(htmlContent, "test-structure");
        
        // Verify result is an array (ISimulatorStructure type)
        expect(result).to.be.an("array");
        
        // Verify array contains objects with string key-value pairs
        if (result.length > 0) {
            expect(result[0]).to.be.an("object");
            // Check that values are strings
            for (const key in result[0]) {
                expect(result[0][key]).to.be.a("string");
            }
        }
    });

    // Test with callback function
    it("should call callback with simulation results when callback is provided", function (done) {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Test Page</title>
            </head>
            <body>
                <h1>Test Heading</h1>
                <nav>
                    <a href="#home">Home</a>
                    <a href="#about">About</a>
                </nav>
            </body>
            </html>
        `;
        
        aChecker.getSimulation(htmlContent, "test-callback", (result) => {
            try {
                expect(result).to.be.an("array");
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    // Test with complex HTML structure
    it("should handle complex HTML with ARIA attributes", async function () {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Complex Test Page</title>
            </head>
            <body>
                <header role="banner">
                    <h1>Site Title</h1>
                </header>
                <nav role="navigation" aria-label="Main navigation">
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                    </ul>
                </nav>
                <main role="main">
                    <article>
                        <h2>Article Title</h2>
                        <p>Article content</p>
                    </article>
                </main>
            </body>
            </html>
        `;
        
        const result = await aChecker.getSimulation(htmlContent, "test-complex");
        
        expect(result).to.be.an("array");
        expect(result.length).to.be.greaterThan(0);
    });

    // Test with form elements
    it("should handle form elements correctly", async function () {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Form Test Page</title>
            </head>
            <body>
                <form>
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name">
                    <button type="submit">Submit</button>
                </form>
            </body>
            </html>
        `;
        
        const result = await aChecker.getSimulation(htmlContent, "test-form");
        
        expect(result).to.be.an("array");
    });

    // Test with minimal HTML
    it("should handle minimal HTML content", async function () {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Minimal</title></head>
            <body><p>Content</p></body>
            </html>
        `;
        
        const result = await aChecker.getSimulation(htmlContent, "test-minimal");
        
        expect(result).to.be.an("array");
    });
});

// Made with Bob
