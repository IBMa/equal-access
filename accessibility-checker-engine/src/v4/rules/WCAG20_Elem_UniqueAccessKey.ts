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
import { getCache } from "../util/CacheUtil";

export let WCAG20_Elem_UniqueAccessKey: Rule = {
    id: "WCAG20_Elem_UniqueAccessKey",
    context: "dom:*[accesskey]",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Elem_UniqueAccessKey.html",
            "Fail_1": "WCAG20_Elem_UniqueAccessKey.html",
            "group": "WCAG20_Elem_UniqueAccessKey.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "'accesskey' attribute value on the element is not unique",
            "group": "'accesskey' attribute values on each element must be unique for the page"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let map = getCache(ruleContext.ownerDocument, "WCAG20_Elem_UniqueAccessKey", {});

        let key = ruleContext.getAttribute("accesskey");

        let passed = !(key in map);
        map[key] = true;
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}