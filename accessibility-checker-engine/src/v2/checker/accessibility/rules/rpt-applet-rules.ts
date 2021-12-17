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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass } from "../../../api/IEngine";
import { RPTUtil } from "../util/legacy";

let a11yRulesApplet : Rule[] = [

{
    /**
     * Description: Trigger if the applet alt text is poor
     * Origin: WCAG 2.0 Technique H35
     */
    id: "WCAG20_Applet_HasAlt",
    context: "dom:applet",
    run: (context: RuleContext, options?: {}) : RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (RPTUtil.isNodeHiddenFromAT(ruleContext)) return null;
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
]
export { a11yRulesApplet }
