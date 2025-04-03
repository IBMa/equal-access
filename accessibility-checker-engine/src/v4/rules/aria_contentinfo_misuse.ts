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
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";

export const aria_contentinfo_misuse: Rule = {
    id: "aria_contentinfo_misuse",
    context: "dom:*[role], dom:footer, dom:address",
    refactor: {
        "Rpt_Aria_ContentinfoWithNoMain_Implicit": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "Pass_0": "aria_contentinfo_misuse.html",
            "Fail_1": "aria_contentinfo_misuse.html",
            "group": "aria_contentinfo_misuse.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Element with \"contentinfo\" role is present without an element with \"main\" role",
            "group": "Each element with \"contentinfo\" role is only permitted with an element with \"main\" role"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;

        //consider implicit role
        if (!AriaUtil.hasRoleInSemantics(ruleContext, "contentinfo")) {
            return null;
        }

        // Consider the Check Hidden Content setting that is set by the rules
        let passed =
            CommonUtil.getElementsByRoleHidden(
                ruleContext.ownerDocument,
                "main",
                true,
                true
            ).length > 0;

        //return new ValidationResult(passed, [ruleContext], 'role', '', []);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}