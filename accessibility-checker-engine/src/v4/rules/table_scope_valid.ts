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

export const table_scope_valid: Rule = {
    id: "table_scope_valid",
    context: "dom:td[scope], dom:th[scope]",
    refactor: {
        "WCAG20_Table_Scope_Valid": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2"}
    },
    help: {
        "en-US": {
            "Pass_0": "table_scope_valid.html",
            "Fail_1": "table_scope_valid.html",
            "Fail_2": "table_scope_valid.html",
            "group": "table_scope_valid.html"
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
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
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