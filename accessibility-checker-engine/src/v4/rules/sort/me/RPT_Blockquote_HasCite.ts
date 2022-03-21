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

export let RPT_Blockquote_HasCite: Rule = {
    id: "RPT_Blockquote_HasCite",
    context: "dom:blockquote",
    help: {
        "en-US": {
            "Pass_0": "RPT_Blockquote_HasCite.html",
            "Potential_1": "RPT_Blockquote_HasCite.html",
            "group": "RPT_Blockquote_HasCite.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that <blockquote> is used only for quotations, not indentation",
            "group": "Use <blockquote> only for quotations, not indentation"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = RPTUtil.attributeNonEmpty(ruleContext, "cite");
        if (!passed) {
            let citeElems = RPTUtil.getDocElementsByTag(ruleContext, "cite");
            passed = citeElems != null && citeElems.length > 0;
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}