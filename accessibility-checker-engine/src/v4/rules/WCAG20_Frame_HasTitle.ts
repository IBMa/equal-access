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
import { ARIAMapper } from "../../v2/aria/ARIAMapper";

export let WCAG20_Frame_HasTitle: Rule = {
    id: "WCAG20_Frame_HasTitle",
    context: "dom:frame, dom:iframe",
    help: {
        "en-US": {
            "group": "WCAG20_Frame_HasTitle.html",
            "Pass_0": "WCAG20_Frame_HasTitle.html",
            "Fail_1": "WCAG20_Frame_HasTitle.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Inline frames must have a unique, non-empty 'title' attribute",
            "Pass_0": "Rule Passed",
            "Fail_1": "Inline frame does not have a 'title' attribute",
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"], /*Change mapping to 4.1.2 from 2.4.1 typo? */
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: "cae760",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // JCH - NO OUT OF SCOPE hidden in context
        /*removed only the check for role=none. Although role=presentation is not allowed in the
         https://www.w3.org/TR/html-aria/#docconformance  table, the check has been kept due to the
         decisions taken in DAP "Check iframes with role="presentation" should consider role="none" also (96395)*/
        if (RPTUtil.hasRole(ruleContext, "presentation") || RPTUtil.hasRole(ruleContext, "none") || !RPTUtil.isTabbable(ruleContext)) {
            return null;
        } else if (ARIAMapper.computeName(ruleContext).trim().length > 0) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1");
        }
    }
}
