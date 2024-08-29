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

import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { RPTUtil } from "../util/AriaUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let meta_redirect_optional: Rule = {
    id: "meta_redirect_optional",
    context: "dom:meta[http-equiv][content]",
    refactor: {
        "WCAG20_Meta_RedirectZero": {
            "pass": "pass",
            "fail": "fail",
            "fail_longrefresh": "fail_longrefresh"
        }
    },
    help: {
        "en-US": {
            "group": "meta_redirect_optional.html",
            "pass": "meta_redirect_optional.html",
            "fail": "meta_redirect_optional.html",
            "fail_longrefresh": "meta_redirect_optional.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Page should not automatically refresh without warning or option to turn it off or adjust the time limit",
            "pass": "Rule Passed",
            "fail": "Check page does not automatically refresh without warning or options",
            "fail_longrefresh": "Check page does not automatically refresh without warning or options"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.2.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    // Removed ACT bisz58 AAA
    act: [{ 
        "bc659a" : {
            "pass": "pass",
            "fail": "fail",
            "fail_longrefresh": "pass"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // JCH - NO OUT OF SCOPE hidden in context
        if (ruleContext.getAttribute("http-equiv").toLowerCase() !== 'refresh') {
            return null;
        }

        let content = ruleContext.getAttribute("content").toLowerCase();
        // Invalid content field
        if (!content.match(/^\d+$/) && !content.match(/^\d+;/)) {
            return null;
        }
        // Only check the first one since it takes priority
        if (RPTUtil.triggerOnce(FragmentUtil.getOwnerFragment(ruleContext), "meta_redirect_optional", false)) {
            return null;
        }
        let timeMatch = content.match(/^(\d+); +[^ ]/);
        if (!timeMatch || parseInt(timeMatch[1]) === 0) {
            return RulePass("pass");
        } else {
            let time = parseInt(timeMatch[1]);
            if (time < 72001) {
                return RuleFail("fail");
            } else {
                return RuleFail("fail_longrefresh");
            }
        }
    }
}