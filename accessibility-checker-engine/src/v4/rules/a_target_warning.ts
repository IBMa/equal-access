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

export let a_target_warning: Rule = {
    id: "a_target_warning",
    context: "dom:a[target],dom:area[target],dom:base[target]",
    refactor: {
        "WCAG20_A_TargetAndText": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "group": `a_target_warning.html`,
            "Pass_0": `a_target_warning.html`,
            "Potential_1": `a_target_warning.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Users should be warned in advance if their input action will open a new window or otherwise change their context",
            "Pass_0": "Rule Passed",
            "Potential_1": "Inform the user when their input action will open a new window or otherwise change their context"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "3.2.2", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.RECOMMENDATION,
        toolkitLevel: eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // skip the rule if it's AT hidden and not tabbable
        if (VisUtil.isNodeHiddenFromAT(ruleContext) && !RPTUtil.isTabbable(ruleContext)) return null;
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
}
