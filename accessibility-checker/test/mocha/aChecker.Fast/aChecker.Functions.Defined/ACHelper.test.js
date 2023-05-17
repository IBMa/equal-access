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

before(async () => {
    await aChecker.getConfig();
});

// This Test Suite is to make sure all the objects/function added by ACHelper.js is added
describe("Check objects/function added by ACHelper.js are defined", function () {

    it("aChecker.getCompliance Should be defined", function () {
        expect(typeof aChecker.getCompliance).to.not.equal("undefined");
    });

    it("aChecker.assertCompliance Should be defined", function () {
        expect(typeof aChecker.assertCompliance).to.not.equal("undefined");
    });

    it("aChecker.getDiffResults Should be defined", function () {
        expect(typeof aChecker.getDiffResults).to.not.equal("undefined");
    });

    it("aChecker.getBaseline Should be defined", function () {
        expect(typeof aChecker.getBaseline).to.not.equal("undefined");
    });

    it("aChecker.diffResultsWithExpected Should be defined", function () {
        expect(typeof aChecker.diffResultsWithExpected).to.not.equal("undefined");
    });

    it("aChecker.stringifyResults Should be defined", function () {
        expect(typeof aChecker.stringifyResults).to.not.equal("undefined");
    });
    it("aChecker.getConfig Should be defined", function () {
        expect(typeof aChecker.getConfig).to.not.equal("undefined");
    });
    it("aChecker.close Should be defined", function () {
        expect(typeof aChecker.close).to.not.equal("undefined");
    });
});
