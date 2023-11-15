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

export let input_placeholder_label_visible: Rule = {
    id: "input_placeholder_label_visible",
    context: "dom:input[placeholder], dom:textarea[placeholder]",
    refactor: {
        "HAAC_Input_Placeholder": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1",
            "Potential_2": "Potential_2"}
    },
    help: {
        "en-US": {
            "Pass_0": "input_placeholder_label_visible.html",
            "Potential_1": "input_placeholder_label_visible.html",
            "Potential_2": "input_placeholder_label_visible.html",
            "group": "input_placeholder_label_visible.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "HTML5 placeholder is the only visible label",
            "Potential_2": "Additional visible label referenced by 'aria-labelledby' is not valid",
            "group": "HTML5 'placeholder' attribute must not be used as a visible label replacement"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["3.3.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (ruleContext.hasAttribute("type")) {
            let type = ruleContext.getAttribute("type").toLowerCase();
            if (type == "hidden" || type == "button") {
                return RulePass("Pass_0");
            }
        }

        if (ruleContext.hasAttribute("hidden")) {
            let hidden = ruleContext.getAttribute("hidden");
            if (hidden == "" || hidden.toLowerCase() == "hidden") { // when hidden is empty in the element, "" is returned, same as it has a value of "".
                return RulePass("Pass_0");
            }
        }

        if (ruleContext.hasAttribute("aria-label")) {
            return RulePotential("Potential_1");
        }

        if (ruleContext.hasAttribute("aria-labelledby") && ruleContext.hasAttribute("id")) {
            let id = ruleContext.getAttribute("id").trim();
            let refIds = ruleContext.getAttribute("aria-labelledby").trim().split(/\s+/); // separated by one or more white spaces
            if (!refIds.includes(id)) {
                return RulePass("Pass_0");
            } else {
                return RulePotential("Potential_2");
            }
        }

        return RulePass("Pass_0");
    }
}