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

export let Rpt_Aria_RegionLabel_Implicit: Rule = {
    id: "Rpt_Aria_RegionLabel_Implicit",
    context: "dom:*[role], dom:section",
    help: {
        "en-US": {
            "Pass_0": "Rpt_Aria_RegionLabel_Implicit.html",
            "Fail_1": "Rpt_Aria_RegionLabel_Implicit.html",
            "Fail_2": "Rpt_Aria_RegionLabel_Implicit.html",
            "group": "Rpt_Aria_RegionLabel_Implicit.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Section element with an implicit \"region\" role is not labeled with an 'aria-label' or 'aria-labelledby'",
            "Fail_2": "The element with \"region\" role is not labeled with an 'aria-label' or 'aria-labelledby'",
            "group": "Each element with \"region\" role must have a label that describes its purpose"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.4.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let tagName = ruleContext.tagName.toLowerCase();

        if (
            tagName === "section" &&
            !RPTUtil.hasRole(ruleContext, "region", false)
        ) {
            return null;
        }
        if (
            tagName !== "section" &&
            !RPTUtil.hasRoleInSemantics(ruleContext, "region")
        ) {
            return null;
        }

        let passed = RPTUtil.hasAriaLabel(ruleContext);
        if (passed) {
            return RulePass("Pass_0");
        } else {
            return tagName === "section" ? RuleFail("Fail_1") : RuleFail("Fail_2");
        }
    }
}