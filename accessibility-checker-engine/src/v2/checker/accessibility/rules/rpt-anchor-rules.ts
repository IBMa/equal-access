/******************************************************************************
     Copyright:: 2020- IBM, Inc

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

import { ARIAMapper } from "../../../..";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IEngine";
import { RPTUtil } from "../util/legacy";

let a11yRulesAnchor: Rule[] = [{
    id: "detector_tabbable",
    context: "dom:*",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (!RPTUtil.isTabbable(ruleContext)) {
            return null;
        }
        let hierContext = contextHierarchies.aria[contextHierarchies.aria.length-1];
        return RulePass("Pass_0", [], [{
            name: hierContext.attributes.name,
            role: hierContext.role,
            tabindex: parseInt(ruleContext.getAttribute("tabindex") || "0")
        }]);
    }
},
{
    id: "WCAG20_A_HasText",
    context: "aria:link",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (ruleContext.hasAttribute("aria-hidden") && ruleContext.getAttribute("aria-hidden").toLowerCase() === "true") {
            return null;
        }
        // Rule only passes if an element has inner content,
        // in the case that there is only hidden content under the the element it is a violation
        let passed =
            ARIAMapper.computeName(ruleContext).trim().length > 0
            || RPTUtil.nonTabableChildCheck(ruleContext);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}
    , {
    /**
     * Description: Triggers if there is a target, and text does not specify a new window.
     * Origin: WCAG 2.0 Technique H83, RPT 112, RPT G491
     */
    id: "WCAG20_A_TargetAndText",
    context: "dom:a[target],dom:area[target],dom:base[target]",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (RPTUtil.isNodeHidden(ruleContext)) return null;
        const params = {
            paramWinText: {
                value: ["new window", "new tab"],
                type: "array"
            }
        }

        let tStr = ruleContext.getAttribute("target");
        let passed = tStr == "_parent" || tStr == "_self" || tStr == "_top" || RPTUtil.getFrameByName(ruleContext,tStr) != null;
        if (!passed) {
            // Name is not part of this frameset – must have potential to create new window?
            // See if a new window is mentioned
            let textStr = RPTUtil.getInnerText(ruleContext);
            if (ruleContext.hasAttribute("title"))
                textStr += " " + ruleContext.getAttribute("title");
            for (let i = 0; !passed && i < params.paramWinText.value.length; ++i)
                if (textStr.indexOf(params.paramWinText.value[i]) != -1) passed = true;
        }
        return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
    }
}];
export { a11yRulesAnchor }
