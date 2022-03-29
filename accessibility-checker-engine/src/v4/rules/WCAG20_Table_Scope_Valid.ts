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

export let WCAG20_Table_Scope_Valid: Rule = {
    id: "WCAG20_Table_Scope_Valid",
    context: "dom:td[scope], dom:th[scope]",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Table_Scope_Valid.html",
            "Fail_1": "WCAG20_Table_Scope_Valid.html",
            "Fail_2": "WCAG20_Table_Scope_Valid.html",
            "group": "WCAG20_Table_Scope_Valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Value provided is invalid for the 'scope' attribute",
            "Fail_2": "The 'scope' attribute should only be used on a <th> element",
            "group": "Value for 'scope' attribute must be \"row\", \"col\", \"rowgroup\", or \"colgroup\""
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        const nodeName = ruleContext.nodeName.toLowerCase();
        if (nodeName === 'td')
            return RuleFail("Fail_2");

        //only continue for 'th'
        let scopeVal = ruleContext.getAttribute("scope").trim().toLowerCase();
        let passed = /^(row|col|rowgroup|colgroup)$/.test(scopeVal);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}