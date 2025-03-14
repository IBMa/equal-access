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

var expect = require('chai').expect;
var aChecker = require("../../../src/");

// This Test Suite is to make sure all the objects/function in the RPT namespace are
// defined.
describe("Check RPT namespace", function () {
    it("RPT Should be defined", function() {
        expect(typeof RPT).not.toBe("undefined");
    });

    it("RPT.plugin Should be defined", function() {
        expect(typeof RPT.plugin).not.toBe("undefined");
    });

    it("RPT.plugin.addNLS Should be defined", function() {
        expect(typeof RPT.plugin.addNLS).not.toBe("undefined");
    });

    it("RPT.plugin.addNLSFiles Should be defined", function() {
        expect(typeof RPT.plugin.addNLSFiles).not.toBe("undefined");
    });

    it("RPT.plugin.addRules Should be defined", function() {
        expect(typeof RPT.plugin.addRules).not.toBe("undefined");
    });

    it("RPT.plugin.addRuleset Should be defined", function() {
        expect(typeof RPT.plugin.addRuleset).not.toBe("undefined");
    });

    it("RPT.plugin.addRulesetFiles Should be defined", function() {
        expect(typeof RPT.plugin.addRulesetFiles).not.toBe("undefined");
    });

    it("RPT.plugin.addNLS Should be defined", function() {
        expect(typeof RPT.plugin.addNLS).not.toBe("undefined");
    });
});
