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

let a11yRulesFrame: Rule[] = [

    {
        /**
         * Description: Trigger if the frame element is missing a title
         * Origin: WCAG 2.0 Technique H64
         */
        id: "WCAG20_Frame_HasTitle",
        context: "dom:frame, dom:iframe",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - NO OUT OF SCOPE hidden in context
            /*removed only the check for role=none. Although role=presentation is not allowed in the
             https://www.w3.org/TR/html-aria/#docconformance  table, the check has been kept due to the
             decisions taken in DAP "Check iframes with role="presentation" should consider role="none" also (96395)*/
            if (RPTUtil.hasRole(ruleContext, "presentation")) {
                return null;
            } else if (RPTUtil.attributeNonEmpty(ruleContext, "title")) {
                return RulePass("Pass_0");
            } else {
                return RuleFail("Fail_1");
            }
        }
    },
    {
        /**
         * Description: Trigger if the frame element points at something that isn't html
         * Origin: Valerie
         */
        id: "Valerie_Frame_SrcHtml",
        context: "dom:frame, dom:iframe",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = RPTUtil.attributeNonEmpty(ruleContext, "src") &&
                RPTUtil.isHtmlExt(RPTUtil.getFileExt(ruleContext.getAttribute("src")));
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    }

]

export { a11yRulesFrame }