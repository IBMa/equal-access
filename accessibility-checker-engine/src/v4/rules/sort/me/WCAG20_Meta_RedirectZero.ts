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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../../../api/IRule";
import { RPTUtil } from "../../../../v2/checker/accessibility/util/legacy";

export let WCAG20_Meta_RedirectZero: Rule = {
    id: "WCAG20_Meta_RedirectZero",
    context: "dom:meta[http-equiv][content]",
    help: {
        "en-US": {
            "group": "WCAG20_Meta_RedirectZero.html",
            "Pass_0": "WCAG20_Meta_RedirectZero.html",
            "Fail_1": "WCAG20_Meta_RedirectZero.html",
        }
    },
    messages: {
        "en-US": {
            "group": "Page should not automatically refresh without warning or option to turn it off or adjust the time limit",
            "Pass_0": "Rule Passed",
            "Fail_1": "Check page does not automatically refresh without warning or options"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.2.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [ "bisz58", "bc659a" ],
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
        let fail = content.match(/^\d+; +[^ ]/) && !content.startsWith("0;");
        if (fail) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}