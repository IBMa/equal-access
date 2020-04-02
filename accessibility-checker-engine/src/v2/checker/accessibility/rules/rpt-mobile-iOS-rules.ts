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

let a11yRulesMobile: Rule[] = [
    {
        /**
         * Description: Triggers if a image role does not have a meaningful alternate text.
         * Origin:  HAAC, G1128
         */
        id: "HAAC_Aria_ImgAlt",
        context: "dom:*[role]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            /* removed the role check role= presentation since if an element has role=img, then there needs to be a check for alt attribute regardless of the presecne of role=presentation
            if (RPTUtil.hasRole(ruleContext, "presentation") || RPTUtil.hasRole(ruleContext, "none")){
                    return RulePass(1);
            }*/

            /* JCH - Points of failure
             *    0. Missing alt attr with value 
             *    1. Missing aria-label or aria-labelledby
             *    2. Missing title attr with value
             */
            // Skip an image with a structural role - img must be in the role list at least
            if (!ruleContext.getAttribute("role").includes("img") || !RPTUtil.hasRole(ruleContext, "img")) return null;
            if (ruleContext.getAttribute("aria-hidden") === "true") return null;

            // If role === img, you must use an aria label
            //check attributes aria-label and aria-labelledby for other tags (e.g. <div>, <span>, etc)
            let passed = RPTUtil.getAriaLabel(ruleContext).length > 0;

            if (!passed) {
                //check title attribute
                passed = RPTUtil.attributeNonEmpty(ruleContext, "title");
                // We should guide people to use alt or label - this is just a secondary approach to silence the rule.
                // So, we should keep the POF from above.
                // if (!passed) POF = "Fail_3";
            }
            //return new ValidationResult(passed, [ruleContext], 'role', '', []);
            if (passed) {
                return RulePass("Pass_0");
            } else {
                return RuleFail("Fail_2")
            }
        }
    }
]

export { a11yRulesMobile }