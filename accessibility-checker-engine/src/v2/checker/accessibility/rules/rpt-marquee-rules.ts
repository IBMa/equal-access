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

let a11yRulesMarquee: Rule[] = [

    {
        /**
         * Description: Triggers if there is a marquee element
         * Origin: RPT 5.6 G5
         */
        id: "RPT_Marquee_Trigger",
        context: "dom:marquee",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            //skip the rule
            if (RPTUtil.isNodeHidden(ruleContext)) return null;
            // JCH - NO OUT OF SCOPE hidden in context
            return RuleFail("Fail_1");
        }
    }

]
export { a11yRulesMarquee }
