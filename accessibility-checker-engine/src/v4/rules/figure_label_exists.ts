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
import { VisUtil } from "../util/VisUtil";
import { AccNameUtil } from "../util/AccNameUtil";
import { CommonUtil } from "../util/CommonUtil";

export const figure_label_exists: Rule = {
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
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        
        // ignore if an explicit role is specified. this case will be covered in the aria_accessiblename_exists rules
        let role = ruleContext.getAttribute("role");
        if (role) {
            return null;
        }

        //let passed = AriaUtil.hasAriaLabel(ruleContext) || CommonUtil.attributeNonEmpty(ruleContext, "title");
        const pair = AccNameUtil.computeAccessibleName(ruleContext);
        const passed = pair && pair.name && pair.name.trim().length > 0;
        //return new ValidationResult(passed, [ruleContext], '', '', []);
        if (!passed) {
            return RuleFail("Fail_1", []);
        } else {
            return RulePass("Pass_0");
        }
    }
}