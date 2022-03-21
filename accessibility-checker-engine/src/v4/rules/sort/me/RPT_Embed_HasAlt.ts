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

export let RPT_Embed_HasAlt: Rule = {
    id: "RPT_Embed_HasAlt",
    context: "dom:embed",
    help: {
        "en-US": {
            "Pass_0": "RPT_Embed_HasAlt.html",
            "Potential_1": "RPT_Embed_HasAlt.html",
            "group": "RPT_Embed_HasAlt.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that the <embed> element has alternative content",
            "group": "Provide alternative content for <embed> elements"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_FOUR
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (RPTUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let passed = RPTUtil.attributeNonEmpty(ruleContext, "alt");
        return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
    }
}