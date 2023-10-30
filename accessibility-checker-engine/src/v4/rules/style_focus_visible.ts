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
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { getDefinedStyles } from "../util/CSSUtil";

export let style_focus_visible: Rule = {
    id: "style_focus_visible",
    context: "dom:*",
    refactor: {
        "RPT_Style_HinderFocus1": {
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "group": `style_focus_visible.html`,
            "Potential_1": `style_focus_visible.html`
        }
    },
    messages: {
        "en-US": {
            "group": "The keyboard focus indicator must be highly visible when default border or outline is modified by CSS",
            "Potential_1": "Check the keyboard focus indicator is highly visible when using CSS declaration for 'border' or 'outline'"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "2.4.7", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            skipNodes: {
                value: ["table"],
                type: "[string]"
            },
            checkParams: {
                value: ["border", "border-width", "border-color", "border-style",
                    "outline", "outline-width", "outline-color", "outline-style"],
                type: "[string]"
            }
        }
        const ruleContext = context["dom"].node as HTMLElement;
        if (!RPTUtil.isTabbable(ruleContext) || validateParams.skipNodes.value.includes(ruleContext.nodeName.toLowerCase())) {
            return null;
        }
        let arrStyles = []
        arrStyles.push(getDefinedStyles(ruleContext));
        arrStyles.push(getDefinedStyles(ruleContext, ":focus"));
        arrStyles.push(getDefinedStyles(ruleContext, ":focus-visible"));
        arrStyles.push(getDefinedStyles(ruleContext, ":focus-within"));
        for (const st of arrStyles) {
            for (const param of validateParams.checkParams.value) {
                if (param in st) {
                    return RulePotential("Potential_1");
                }
            }
        }
        return null;
    }
}
