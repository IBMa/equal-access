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

export let aria_main_label_unique: Rule = {
    id: "aria_main_label_unique",
    context: "aria:main",
    refactor: {
        "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "aria_main_label_unique.html",
            "Fail_1": "aria_main_label_unique.html",
            "group": "aria_main_label_unique.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Multiple elements with \"main\" role do not have unique labels",
            "group": "Each element with \"main\" role must have unique label that describes its purposes"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let contextLabel = RPTUtil.getAriaLabel(ruleContext);

        let parentDocRole = RPTUtil.getAncestorWithRole(
            ruleContext,
            "document",
            true
        );
        let mains = RPTUtil.getElementsByRoleHidden(
            ruleContext.ownerDocument,
            "main",
            true,
            true
        );
        let result = null;
        for (let i = 0; i < mains.length; ++i) {
            if (mains[i] === ruleContext) continue;
            result = RulePass("Pass_0");
            let thisParentDocRole = RPTUtil.getAncestorWithRole(
                mains[i],
                "document",
                true
            );
            if (thisParentDocRole === parentDocRole) {
                if (RPTUtil.getAriaLabel(mains[i]) === contextLabel) {
                    result = RuleFail("Fail_1");
                    break;
                }
            }
        }
        return result;
    }
}