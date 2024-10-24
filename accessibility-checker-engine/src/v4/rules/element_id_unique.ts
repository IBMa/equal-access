/******************************************************************************
  Copyright:: 2022- IBM, Inc
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

import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";

export const element_id_unique: Rule = {
    id: "element_id_unique",
    context: "dom:*[id]",
    refactor: {
        "RPT_Elem_UniqueId": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2"
        }
    },
    help: {
        "en-US": {
            "group": "element_id_unique.html",
            "Pass_0": "element_id_unique.html",
            "Fail_1": "element_id_unique.html",
            "Fail_2": "element_id_unique.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Element 'id' attribute values must be unique within a document",
            "Pass_0": "Rule Passed",
            "Fail_1": "The <{0}> element has the id \"{1}\" that is empty",
            "Fail_2": "The <{0}> element has the id \"{1}\" that is already in use"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next"],
        "num": ["HTML"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [{
        "3ea0c8": {
            "Pass_0": "pass",
            "Fail_1": "pass",
            "Fail_2": "fail"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        let id = ruleContext.getAttribute("id");

        // In the case that id is empty we should trigger a violation right away with out checking 
        // for uniqueness.
        if (id === "") {
            //return new ValidationResult(false, [ruleContext], '', '', [ruleContext.nodeName.toLowerCase(), id]);
            return RuleFail("Fail_1", [ruleContext.nodeName.toLowerCase(), id]);
        }

        let element = FragmentUtil.getById(ruleContext, id);
        let passed = element === ruleContext;
        //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [ruleContext.nodeName.toLowerCase(), id]);
        if (!passed) {
            return RuleFail("Fail_2", [ruleContext.nodeName.toLowerCase(), id]);
        } else {
            return RulePass("Pass_0");
        }
    }
}