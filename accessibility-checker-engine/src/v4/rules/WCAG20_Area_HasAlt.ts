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

export let WCAG20_Area_HasAlt: Rule = {
    id: "WCAG20_Area_HasAlt",
    context: "dom:area",
    help: {
        "en-US": {
            "group": `WCAG20_Area_HasAlt.html`,
            "Pass_0": `WCAG20_Area_HasAlt.html`,
            "Fail_1": `WCAG20_Area_HasAlt.html`
        }
    },
    messages: {
        "en-US": {
            "group": "<area> elements in an image map must have a text alternative",
            "Pass_0": "Rule Passed",
            "Fail_1": "<area> element in an image map has no text alternative"
            }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
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
        if (RPTUtil.attributeNonEmpty(ruleContext, "alt")) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1");
        }
    }
}
    