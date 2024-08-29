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
import { RPTUtil } from "../util/AriaUtil";
import { VisUtil } from "../util/VisUtil";

export let frame_title_exists: Rule = {
    id: "frame_title_exists",
    context: "dom:frame, dom:iframe",
    refactor: {
        "WCAG20_Frame_HasTitle": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "group": "frame_title_exists.html",
            "Pass_0": "frame_title_exists.html",
            "Fail_1": "frame_title_exists.html"
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
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"], /*Change mapping to 4.1.2 from 2.4.1 typo? */
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: "cae760",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        
        // ignore if an explicit role is specified. this case will be covered in the aria_accessiblename_exists rules
        let role = ruleContext.getAttribute("role");
        if (role) {
            return null;
        }

        if (RPTUtil.attributeNonEmpty(ruleContext, "title")) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1");
        }
    }
}
