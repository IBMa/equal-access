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

export let Rpt_Aria_MultipleMainsVisibleLabel_Implicit: Rule = {
    id: "Rpt_Aria_MultipleMainsVisibleLabel_Implicit",
    context: "dom:body",
    help: {
        "en-US": {
            "Pass_0": "Rpt_Aria_MultipleMainsVisibleLabel_Implicit.html",
            "Fail_1": "Rpt_Aria_MultipleMainsVisibleLabel_Implicit.html",
            "group": "Rpt_Aria_MultipleMainsVisibleLabel_Implicit.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Multiple elements with \"main\" role do not have unique visible labels",
            "group": "Each element with \"main\" role should have a unique visible label that describes its purpose"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.4.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        // Consider the Check Hidden Content setting that is set by the rules
        //call getElementsByRoleHidden with considerImplicit flag as true
        //so that the method returs <main> elements
        let landmarks = RPTUtil.getElementsByRoleHidden(
            ruleContext.ownerDocument,
            "main",
            true,
            true
        );
        if (landmarks.length === 0 || landmarks.length === 1) {
            return null;
        }

        let passed = RPTUtil.hasUniqueAriaLabelledby(landmarks);

        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}