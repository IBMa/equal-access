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

import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../../v2/dom/VisUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { getCache } from "../util/CacheUtil";

export let IBMA_Color_Contrast_WCAG2AA_PV: Rule = {
    id: "IBMA_Color_Contrast_WCAG2AA_PV",
    context: "dom:*",
    dependencies: ["IBMA_Color_Contrast_WCAG2AA"],
    help: {
        "en-US": {
            "group": `IBMA_Color_Contrast_WCAG2AA_PV.html`,
            "Pass_0": `IBMA_Color_Contrast_WCAG2AA_PV.html`,
            "Potential_1": `IBMA_Color_Contrast_WCAG2AA_PV.html`
        }
    },
    messages: {
        "en-US": {
            "group": "The contrast ratio of text with its background (i.e. background with a color gradient or a background image) must meet WCAG 2.1 AA requirements",
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify the contrast ratio of the text against the lightest and the darkest colors of the background meets the WCAG 2.1 AA minimum requirements for text of size {1}px and weight of {2}"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: "1.4.3", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        // avoid diagnosing disabled nodes or those that are not visible.
        if (RPTUtil.isNodeDisabled(ruleContext) ||
            !VisUtil.isNodeVisible(ruleContext) ||
            (VisUtil.hiddenByDefaultElements != null &&
                VisUtil.hiddenByDefaultElements != undefined &&
                VisUtil.hiddenByDefaultElements.indexOf(nodeName) > -1)) {
            return null;
        }
        let precalc = getCache(ruleContext, "EXT_Color_Contrast_WCAG2AA", null);
        if (!precalc) return RulePass("Pass_0");
        let passed = precalc.ratio >= 4.5 || (precalc.ratio >= 3 && precalc.isLargeScale);

        // If element or parent is disabled, this rule does not apply (but may be 3:1 in future)
        if (!passed && precalc.isDisabled) {
            passed = true;
        }

        if (!passed) {
            return RulePotential("Potential_1", [precalc.ratio.toFixed(2), precalc.size, precalc.weight]);
        } else {
            return RulePass("Pass_0", [precalc.ratio.toFixed(2), precalc.size, precalc.weight]);
        }
    }
}