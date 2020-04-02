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

// Make sure the ACConfig is defined
describe("ACConfig", function () {
    it("Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig).not.toBe("undefined");
    });
});

// Make sure that all the config properties in the ACConfig are defined that need to be defined.
describe("ACConfig property", function () {
    it("DEBUG Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.DEBUG).not.toBe("undefined");
    });

    it("captureScreenshots Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.captureScreenshots).not.toBe("undefined");
    });

    it("checkHiddenContent Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.checkHiddenContent).not.toBe("undefined");
    });

    it("engineFileName Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.engineFileName).not.toBe("undefined");
    });

    it("extensions Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.extensions).not.toBe("undefined");
    });

    it("failLevels Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.failLevels).not.toBe("undefined");
    });

    it("label Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.label).not.toBe("undefined");
    });

    it("outputFolder Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.outputFolder).not.toBe("undefined");
    });

    it("policies Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.policies).not.toBe("undefined");
    });

    it("reportLevels Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.reportLevels).not.toBe("undefined");
    });

    it("rulePack Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.rulePack).not.toBe("undefined");
    });

    it("scanID Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.scanID).not.toBe("undefined");
    });

    it("toolID Should be defined in global space", function() {
        expect(typeof window.__karma__.config.ACConfig.rulePack).not.toBe("undefined");
    });
});
