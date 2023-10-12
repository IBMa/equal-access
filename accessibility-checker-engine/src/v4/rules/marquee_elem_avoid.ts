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

export let marquee_elem_avoid: Rule = {
    id: "marquee_elem_avoid",
    context: "dom:marquee",
    refactor: {
        "RPT_Marquee_Trigger": {
            "Passed_0": "Passed_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Passed_0": "marquee_elem_avoid.html",
            "Fail_1": "marquee_elem_avoid.html",
            "group": "marquee_elem_avoid.html"
        }
    },
    messages: {
        "en-US": {
            "Passed_0": "Rule Passed",
            "Fail_1": "Scrolling content found that uses the obsolete <marquee> element",
            "group": "The <marquee> element is obsolete and should not be used"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.2.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // JCH - NO OUT OF SCOPE hidden in context
        return RuleFail("Fail_1");
    }
}