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

export let Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit: Rule = {
    id: "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit",
    context: "dom:*[role], dom:footer, dom:address",
    help: {
        "en-US": {
            "Pass_0": "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit.html",
            "Fail_1": "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit.html",
            "group": "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Multiple elements with \"contentinfo\" role found on a page",
            "group": "A page, document or application should only have one element with \"contentinfo\" role"
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
        //find out if <footer> element has siblings as <footer> has implicit contentinfo role
        if (!RPTUtil.hasRoleInSemantics(ruleContext, "contentinfo")) {
            return null;
        }

        let passed = !RPTUtil.getSiblingWithRoleHidden(
            ruleContext,
            "contentinfo",
            true,
            true
        );

        //return new ValidationResult(passed, [ruleContext], 'role', '', []);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}