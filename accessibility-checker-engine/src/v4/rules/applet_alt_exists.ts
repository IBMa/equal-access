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

export let applet_alt_exists: Rule = {
    id: "applet_alt_exists",
    context: "dom:applet",
    refactor: {
        "WCAG20_Applet_HasAlt": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2",
            "Fail_3": "Fail_3"
        }
    },
    help: {
        "en-US": {
            "group": `applet_alt_exists.html`,
            "Pass_0": `applet_alt_exists.html`,
            "Fail_1": `applet_alt_exists.html`,
            "Fail_2": `applet_alt_exists.html`,
            "Fail_3": `applet_alt_exists.html`
        }
    },
    messages: {
        "en-US": {
            "group": "<applet> elements must provide an 'alt' attribute and an alternative description",
            "Pass_0": "Rule Passed",
            "Fail_1": "An <applet> element does not have an 'alt' attribute that provides a short text alternative",
            "Fail_2": "The 'alt' attribute value for an <applet> element duplicates the 'code' attribute",
            "Fail_3": "An <applet> element provides alternative text, but does not provide inner content"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "1.1.1", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        // JCH - NO OUT OF SCOPE hidden in context
        if (!RPTUtil.attributeNonEmpty(ruleContext, "alt")) {
            return RuleFail("Fail_1");
        } else {
            let alt = ruleContext.getAttribute("alt").trim();
            if (ruleContext.hasAttribute("code") && alt == ruleContext.getAttribute("code").trim()) {
                return RuleFail("Fail_2");
            } else if (!RPTUtil.hasInnerContentHidden(ruleContext)) {
                return RuleFail("Fail_3");
            } else {
                return RulePass("Pass_0");
            }
        }
    }
}
    