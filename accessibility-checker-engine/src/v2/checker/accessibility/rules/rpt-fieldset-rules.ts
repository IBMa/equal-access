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

let a11yRulesFieldset: Rule[] = [

    {
        /**
         * Description: Trigger if fieldset is missing a legend
         * Origin: WCAG 2.0 Technique H71
         */
        id: "WCAG20_Fieldset_HasLegend",
        context: "dom:fieldset",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // In the case a legend is hidden, we should still trigger a violations for this
            let legends = RPTUtil.getChildByTagHidden(ruleContext, "legend", true, false);
            if (legends.length === 0) {
                // Fieldset has NO Legend
                return RuleFail("Fail_1");
            } else if (legends.length > 1) {
                // Fieldset has more than one legend
                return RuleFail("Fail_2");
            } else if (RPTUtil.getInnerText(legends[0]).trim().length === 0) {
                // Fieldset has legend but legend is empty
                return RuleFail("Fail_3");
            } else {
                return RulePass("Pass_0");
            }
        }
    }

]

export { a11yRulesFieldset }