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
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { getCache } from "../util/CacheUtil";

export let form_label_unique: Rule = {
    id: "form_label_unique",
    context: "dom:label[for]",
    refactor: {
        "RPT_Label_UniqueFor": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "form_label_unique.html",
            "Fail_1": "form_label_unique.html",
            "group": "form_label_unique.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Form control has more than one label",
            "group": "Form controls should have exactly one label"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // JCH - NO OUT OF SCOPE hidden in context
        let labelIds = getCache(FragmentUtil.getOwnerFragment(ruleContext), "RPT_Label_Single", {})
        let id = ruleContext.getAttribute("for");
        let passed = !(id in labelIds);
        labelIds[id] = true;
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}