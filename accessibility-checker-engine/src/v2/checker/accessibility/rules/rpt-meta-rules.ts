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

let a11yRulesMeta: Rule[] = [

    {
        /**
         * Description: Trigger if meta redirect is non-zero
         * Origin: H76, F41, RPT 5.6 G254
         */
        id: "WCAG20_Meta_RedirectZero",
        context: "dom:meta[http-equiv][content]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - NO OUT OF SCOPE hidden in context
            let passed = true;
            if (ruleContext.getAttribute("http-equiv").toLowerCase() == 'refresh') {
                let content = ruleContext.getAttribute("content").toLowerCase();
                let fail = content.indexOf("url") != -1 && !content.startsWith("0;");
                if (fail) {
                    return RuleFail("Fail_1");
                } else {
                    return RulePass("Pass_0");
                }
            } else {
                return null;
            }
        }
    },
    {
        /**
         * Description: Trigger if meta refresh
         * Origin: RPT 5.6 G33
         */
        id: "RPT_Meta_Refresh",
        context: "dom:meta[http-equiv][content]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (ruleContext.getAttribute("http-equiv").toLowerCase() != 'refresh')
                return RulePass("Pass_0");
            let content = ruleContext.getAttribute("content").toLowerCase();
            let fail = content.indexOf("url=") == -1;
            return !fail ? RulePass("Pass_0") : RulePotential("Potential_1");
        }
    }

]

export { a11yRulesMeta }