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

import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { CommonUtil } from "../util/CommonUtil";

export const form_interaction_review: Rule = {
    id: "form_interaction_review",
    context: "dom:form[target]",
    refactor: {
        "WCAG20_Form_TargetAndText": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "form_interaction_review.html",
            "Potential_1": "form_interaction_review.html",
            "group": "form_interaction_review.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that interacting with content will not open pop-up windows or change the active window without informing the user",
            "group": "User should be informed in advance when interacting with content causes a change of context"
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
        const validateParams = {
            paramWinText: {
                value: ["new window"],
                type: "array"
            }
        }
        const ruleContext = context["dom"].node as Element;
        let tStr = ruleContext.getAttribute("target");
        let passed = tStr === "_parent" || tStr === "_self" || tStr === "_top" || CommonUtil.getFrameByName(ruleContext, tStr) != null;
        if (!passed) {
            // Name is not part of this frameset – must have potential to create new window?
            // See if a new window is mentioned
            let textStr = CommonUtil.getInnerText(ruleContext);
            if (ruleContext.hasAttribute("title"))
                textStr += " " + ruleContext.getAttribute("title");
            for (let i = 0; !passed && i < validateParams.paramWinText.value.length; ++i)
                if (textStr.indexOf(validateParams.paramWinText.value[i]) != -1) passed = true;
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}