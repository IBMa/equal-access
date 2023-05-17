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

import * as aChecker from "../../../src/index.js";
import { expect } from "chai";
    
// This Test Suite is to make sure all the objects/function in the OpenAjax namespace are
// defined.
// Need to do this check, to make sure the engine is loaded into the browser correctly by the karma plugin.
describe("Check OpenAjax namespace", function () {
    it("OpenAjax Should be defined", function() {
        expect(typeof OpenAjax).not.toBe("undefined");
    });

    it("OpenAjax.a11y Should be defined", function() {
        expect(typeof OpenAjax.a11y).not.toBe("undefined");
    });

    it("OpenAjax.a11y.addMetadata Should be defined", function() {
        expect(typeof OpenAjax.a11y.addMetadata).not.toBe("undefined");
    });

    it("OpenAjax.a11y.addRules Should be defined", function() {
        expect(typeof OpenAjax.a11y.addRules).not.toBe("undefined");
    });

    it("OpenAjax.a11y.addRuleset Should be defined", function() {
        expect(typeof OpenAjax.a11y.addRuleset).not.toBe("undefined");
    });
});
