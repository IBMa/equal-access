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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../../v2/dom/VisUtil";

export let fieldset_legend_valid: Rule = {
    id: "fieldset_legend_valid",
    context: "dom:fieldset",
    refactor: {
        "WCAG20_Fieldset_HasLegend": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2",
            "Fail_3": "Fail_3"}
    },
    help: {
        "en-US": {
            "Pass_0": "fieldset_legend_valid.html",
            "Fail_1": "fieldset_legend_valid.html",
            "Fail_2": "fieldset_legend_valid.html",
            "Fail_3": "fieldset_legend_valid.html",
            "group": "fieldset_legend_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "<fieldset> element does not have a <legend>",
            "Fail_2": "<fieldset> element has more than one <legend>",
            "Fail_3": "<fieldset> element <legend> is empty",
            "group": " <fieldset> elements should have a single, non-empty <legend> as a label"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],  //https://www.w3.org/WAI/WCAG22/Techniques/html/H71
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip if the fieldset is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return null;

        // In the case a legend is hidden, we should still trigger a violations for this
        let legends = RPTUtil.getChildByTagHidden(ruleContext, "legend", true, false);
        if (legends.length === 0) {
            // Fieldset has NO Legend
            return RuleFail("Fail_1");
        } else if (legends.length > 1) {
            // Fieldset has more than one legend
            return RuleFail("Fail_2");
        } else if (RPTUtil.getInnerText(legends[0]).trim().length === 0) {
            // Fieldset has legend but legend is empty
            return RuleFail("Fail_3");
        }
        return RulePass("Pass_0");
    }
}