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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let input_onchange_review: Rule = {
    id: "input_onchange_review",
    context: "dom:input[onchange], dom:textarea[onchange], dom:select[onchange]",
    refactor: {
        "WCAG20_Input_HasOnchange": {
            "Pass_0": "pass",
            "Potential_1": "potential_warning"}
    },
    help: {
        "en-US": {
            "pass": "input_onchange_review.html",
            "potential_warning": "input_onchange_review.html",
            "group": "input_onchange_review.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Users must be advised if, due to a change of element value, a form automatically submits, a new window opens, or a change in focus occurs",
            "pass": "The user is advised of the automatic form submission, new window opening, or focus change",
            "potential_warning": "Confirm that the user is advised if, due to a change of element value, a form automatically submits, a new window opens, or a change in focus occurs"    
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
            if (type === "hidden" || type === "submit" || type === "image" || type === "button" || type === "reset")
                return null;
        }

        return RulePotential("potential_warning");

    }
}