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

import { Rule, RuleResult, RuleFail, RuleContext, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { setCache } from "../util/CacheUtil";
import { CommonUtil } from "../util/CommonUtil";

export let table_aria_descendants: Rule = {
    id: "table_aria_descendants",
    context: "aria:table dom:tr[role], aria:table dom:th[role], aria:table dom:td[role], aria:grid dom:tr[role], aria:grid dom:th[role], aria:grid dom:td[role], aria:treegrid dom:tr[role], aria:treegrid dom:th[role], aria:treegrid dom:td[role]",
    help: {
        "en-US": {
            "group": "table_aria_descendants.html",
            "explicit_role": "table_aria_descendants.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Table structure elements cannot specify an explicit 'role' within table containers",
            "explicit_role": "An explicit ARIA 'role' is not valid for <{0}> element within an ARIA role '{1}' per the ARIA in HTML specification"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element; 
        let parentRole = CommonUtil.isTableDescendant(contextHierarchies);
        // cache the result
        if (parentRole === null || parentRole.length === 0)
            return;

        return RuleFail("explicit_role", [context["dom"].node.nodeName.toLowerCase(), parentRole[0].role]);
    }
}