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

export let meta_refresh_delay: Rule = {
    id: "meta_refresh_delay",
    context: "dom:meta[http-equiv][content]",
    refactor: {
        "RPT_Meta_Refresh": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "group": "meta_refresh_delay.html",
            "Pass_0": "meta_refresh_delay.html",
            "Potential_1": "meta_refresh_delay.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Pages should not refresh automatically",
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify page is not being caused to refresh automatically",
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.2.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [ "bisz58", "bc659a" ],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (ruleContext.getAttribute("http-equiv").toLowerCase() !== 'refresh')
            return null;

        let content = ruleContext.getAttribute("content").toLowerCase();
        // Invalid content field
        if (!content.match(/^\d+$/) && !content.match(/^\d+;/)) {
            return null;
        }
        let fail = !content.match(/^\d+; +[^ ]/);
        return !fail ? RulePass("Pass_0") : RulePotential("Potential_1");
    }
}