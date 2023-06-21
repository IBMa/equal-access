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

// This Test Suite is to make sure all the objects/function added by ACHelper.js is added
describe("Check objects/function added by ACHelper.js are defined", function () {
    it("aChecker.DEBUG Should be defined", function() {
        expect(typeof aChecker.DEBUG).not.toBe("undefined");
    });

    it("aChecker.getCompliance Should be defined", function() {
        expect(typeof aChecker.getCompliance).not.toBe("undefined");
    });

    it("aChecker.isLabelUnique Should be defined", function() {
        expect(typeof aChecker.isLabelUnique).not.toBe("undefined");
    });

    it("aChecker.buildIframeAndGetDoc Should be defined", function() {
        expect(typeof aChecker.buildIframeAndGetDoc).not.toBe("undefined");
    });

    it("aChecker.assertCompliance Should be defined", function() {
        expect(typeof aChecker.assertCompliance).not.toBe("undefined");
    });

    it("aChecker.compareBasedOnFailLevels Should be defined", function() {
        expect(typeof aChecker.compareBasedOnFailLevels).not.toBe("undefined");
    });

    it("aChecker.cleanComplianceObjectBeforeCompare Should be defined", function() {
        expect(typeof aChecker.cleanComplianceObjectBeforeCompare).not.toBe("undefined");
    });

    it("aChecker.getBaseline Should be defined", function() {
        expect(typeof aChecker.getBaseline).not.toBe("undefined");
    });

    it("aChecker.getDiffResults Should be defined", function() {
        expect(typeof aChecker.getDiffResults).not.toBe("undefined");
    });

    it("aChecker.stringifyResults Should be defined", function() {
        expect(typeof aChecker.stringifyResults).not.toBe("undefined");
    });

    it("aChecker.getBaseline Should work", function() {
        expect(aChecker.getBaseline("JSONObjectStructureVerification.html")).toBeDefined();
        expect(aChecker.getBaseline("JSONObjectStructureVerification.html")).not.toBeNull();
    });

});
