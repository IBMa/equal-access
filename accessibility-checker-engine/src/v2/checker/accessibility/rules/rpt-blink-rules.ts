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

let a11yRulesBlink: Rule[] = [

    {
        /**
         * Description: Triggers if there is a blink element
         * Origin: WCAG 2.0 Technique G11
         */
        id: "WCAG20_Blink_AlwaysTrigger",
        context: "dom:blink",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            return RuleFail("Fail_1");
        }
    },
    { // Error
        /**
         * Description: Trigger for CSS usage that blinks
         * Origin: RPT 5.6 G479
         */
        id: "RPT_Blink_CSSTrigger1",
        context: "dom:style, dom:*[style]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let textValue = RPTUtil.getInnerText(ruleContext);
            if (ruleContext.hasAttribute('style')) {
                textValue = ruleContext.getAttribute('style');
            }

            let passed = textValue.toLowerCase().indexOf("text-decoration:blink") == -1;
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    }

]

export { a11yRulesBlink }
