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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let input_onchange_review: Rule = {
    id: "input_onchange_review",
    context: "dom:input, dom:textarea, dom:select",
    refactor: {
        "WCAG20_Input_HasOnchange": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "input_onchange_review.html",
            "Potential_1": "input_onchange_review.html",
            "group": "input_onchange_review.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that any changes of context are explained in advance to the user",
            "group": "Verify that any changes of context are explained in advance to the user"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["3.2.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (ruleContext.nodeName.toLowerCase() == "input" && ruleContext.hasAttribute("type")) {
            let type = ruleContext.getAttribute("type").toLowerCase();
            if (type != "text" && type != "file" && type != "password" && type != "checkbox" && type != "radio")
                return RulePass("Pass_0");
        }

        let passed = !ruleContext.hasAttribute("onchange");
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}