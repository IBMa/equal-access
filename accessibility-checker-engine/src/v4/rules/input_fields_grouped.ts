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

export let input_fields_grouped: Rule = {
    id: "input_fields_grouped",
    context: "dom:input, dom:textarea, dom:select",
    refactor: {
        "WCAG20_Input_InFieldSet": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "input_fields_grouped.html",
            "Potential_1": "input_fields_grouped.html",
            "group": "input_fields_grouped.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Use the <fieldset> element to group logically related input elements",
            "group": "Groups of logically related input elements should be contained within a <fieldset> element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // Don't trigger for other input types or if we're in a fieldset
        if (ruleContext.nodeName.toLowerCase() == "input" && ruleContext.hasAttribute("type")) {
            let type = ruleContext.getAttribute("type").toLowerCase();
            if (type != "text" && type != "file" && type != "password")
                return RulePass("Pass_0");
        }
        if (RPTUtil.getAncestor(ruleContext, "fieldset") != null)
            return RulePass("Pass_0");

        // No fieldset - see if this input is all by itself - no need to group single inputs
        let parent = RPTUtil.getAncestor(ruleContext, ["form", "body"]);
        let checkTypes = ["input", "textarea", "select"];
        let passed = true;

        for (let i = 0; passed && i < checkTypes.length; ++i) {
            let controls = parent.getElementsByTagName(checkTypes[i]);
            for (let j = 0; passed && j < controls.length; ++j) {

                // Check if the node should be skipped or not based on the Check Hidden Content setting and if the node isVisible or
                // not.
                if (RPTUtil.shouldNodeBeSkippedHidden(controls[j])) {
                    continue;
                }

                // Note that textareas and selects will be called type='text'
                let type = controls[j].hasAttribute("type") ? controls[j].getAttribute("type").toLowerCase() : "text";
                // Only fail if this is another control in the form and its type is another text-like input
                passed = controls[j] == ruleContext || (type != "text" && type != "password" && type != "file");
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}