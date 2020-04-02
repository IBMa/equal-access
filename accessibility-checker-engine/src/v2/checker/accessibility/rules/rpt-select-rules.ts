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

let a11yRulesSelect: Rule[] = [

    {
        /**
         * Description: Triggers if select has javascript for onchange or onfocus
         * Origin: WCAG 2.0 Technique H84
         */
        id: "WCAG20_Select_NoChangeAction",
        context: "dom:select",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = !ruleContext.hasAttribute("onchange") && !ruleContext.hasAttribute("onfocus");
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Triggers if select has more than X options and no optgroups
         * Origin: WCAG 2.0 Technique H85
         */
        id: "WCAG20_Select_HasOptGroup",
        context: "dom:select",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                paramNumOptions: {
                    value: 10,
                    type: "integer"
                }
            }
            const ruleContext = context["dom"].node as Element;
            // Handle the cases where optgroup is hidden, which should trigger a violations
            // but in the case that Check hidden option is set then should not trigger a violation.
            let passed = RPTUtil.getChildByTagHidden(ruleContext, "optgroup", false, true).length > 0 ||
                RPTUtil.getChildByTagHidden(ruleContext, "option", false, true).length <=
                validateParams.paramNumOptions.value;
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    }

]

export { a11yRulesSelect }