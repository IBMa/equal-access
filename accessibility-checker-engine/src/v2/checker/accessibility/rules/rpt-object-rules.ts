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

let a11yRulesObject: Rule[] = [

    {
        /**
         * Description: Trigger if an object element does not have inner text
         * Origin: WCAG 2.0 Technique H27, H53
         */
        id: "WCAG20_Object_HasText",
        context: "dom:object",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - NO OUT OF SCOPE hidden in context

            // Detect if this object is of type text, by checking the object type in the case it is text then do not trigger this rule
            if (ruleContext.hasAttribute("type") && (ruleContext.getAttribute("type")).indexOf("text") !== -1) {
                return null;
            }

            let passed = RPTUtil.hasInnerContentHidden(ruleContext);
            if (passed) {
                return RulePass("Pass_0");
            } else {
                return RuleFail("Fail_1");
            }
        }
    }

]

export { a11yRulesObject }