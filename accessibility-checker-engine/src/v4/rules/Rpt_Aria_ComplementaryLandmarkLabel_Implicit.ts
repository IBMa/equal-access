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

export let Rpt_Aria_ComplementaryLandmarkLabel_Implicit: Rule = {
    id: "Rpt_Aria_ComplementaryLandmarkLabel_Implicit",
    context: "dom:*[role], dom:aside",
    dependencies: ["Rpt_Aria_ComplementaryRequiredLabel_Implicit"],
    help: {
        "en-US": {
            "Pass_0": "Rpt_Aria_ComplementaryLandmarkLabel_Implicit.html",
            "Fail_1": "Rpt_Aria_ComplementaryLandmarkLabel_Implicit.html",
            "group": "Rpt_Aria_ComplementaryLandmarkLabel_Implicit.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The element with \"complementary\" role does not have a visible label",
            "group": "Each element with \"complementary\" role should have a visible label that describes its purpose"
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
        if (!RPTUtil.hasRoleInSemantics(ruleContext, "complementary")) {
            return null;
        }

        let passed = RPTUtil.attributeNonEmpty(
            ruleContext,
            "aria-labelledby"
        );
        //return new ValidationResult(passed, [ruleContext], 'role', '', []);
        if (passed) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1");
        }
    }
}