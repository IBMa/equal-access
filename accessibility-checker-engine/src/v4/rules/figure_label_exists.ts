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
import { VisUtil } from "../../v2/dom/VisUtil";

export let figure_label_exists: Rule = {
    id: "figure_label_exists",
    context: "dom:figure",
    refactor: {
        "HAAC_Figure_label": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "figure_label_exists.html",
            "Fail_1": "figure_label_exists.html",
            "group": "figure_label_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The <figure> element does not have an associated label",
            "group": "A <figure> element must have an associated label"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        
        let passed = false;
        let figures = ruleContext.getElementsByTagName("figcaption");

        // Loop over all the figcaption elements to make sure there is at least one that is not empty and not hidden.
        for (let i = 0; !passed && i < figures.length; ++i) {

            // Mark this rule as passed if any one of the figurecaption element has content and is visible
            if (figures[i].innerHTML.trim().length > 0 && VisUtil.isNodeVisible(figures[i])) {
                passed = true;
            }
        }

        if (!passed) {
            // we only check if the "aria-labelledby" is there. There is a different rule to check if the id is valid.
            passed = ruleContext.hasAttribute("aria-labelledby") && ruleContext.getAttribute("aria-labelledby").trim().length > 0;
        }

        //return new ValidationResult(passed, [ruleContext], '', '', []);
        if (!passed) {
            return RuleFail("Fail_1", []);
        } else {
            return RulePass("Pass_0");
        }
    }
}