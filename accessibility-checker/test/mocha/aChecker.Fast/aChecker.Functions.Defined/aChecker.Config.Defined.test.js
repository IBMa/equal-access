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

import * as aChecker from "../../../../src/index.js";
import { expect } from "chai";
let Config;

before(async () => {
    Config = await aChecker.getConfig();
});

// Make sure the Config is defined
describe("Config", function () {
    it("Should be defined in global space", function () {
        expect(typeof Config).to.not.equal("undefined");
    });
});

// Make sure that all the config properties in the Config are defined that need to be defined.
describe("Config property", function () {
    it("DEBUG Should be defined in global space", function () {
        expect(typeof Config.DEBUG).to.not.equal("undefined");
    });

    it("captureScreenshots Should be defined in global space", function () {
        expect(typeof Config.captureScreenshots).to.not.equal("undefined");
    });

    it("checkHiddenContent Should be defined in global space", function () {
        expect(typeof Config.checkHiddenContent).to.not.equal("undefined");
    });

    it("extensions Should be defined in global space", function () {
        expect(typeof Config.extensions).to.not.equal("undefined");
    });

    it("failLevels Should be defined in global space", function () {
        expect(typeof Config.failLevels).to.not.equal("undefined");
    });

    it("label Should be defined in global space", function () {
        expect(typeof Config.label).to.not.equal("undefined");
    });

    it("outputFolder Should be defined in global space", function () {
        expect(typeof Config.outputFolder).to.not.equal("undefined");
    });

    it("policies Should be defined in global space", function () {
        expect(typeof Config.policies).to.not.equal("undefined");
    });

    it("reportLevels Should be defined in global space", function () {
        expect(typeof Config.reportLevels).to.not.equal("undefined");
    });

    it("ruleServer Should be defined in global space", function () {
        expect(typeof Config.ruleServer).to.not.equal("undefined");
    });

    it("scanID Should be defined in global space", function () {
        expect(typeof Config.scanID).to.not.equal("undefined");
    });

    it("toolID Should be defined in global space", function () {
        expect(typeof Config.toolID).to.not.equal("undefined");
    });
});
