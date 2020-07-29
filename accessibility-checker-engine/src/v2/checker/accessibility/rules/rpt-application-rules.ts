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

let a11yRulesApp: Rule[] = [
    {
        /**
         * Description: Triggers if any child of application role is not an article or a document
         * Origin:  WAI-ARIA 1.1
         * 			https://www.w3.org/TR/wai-aria-1.1/#application
         */
        id: "HAAC_Application_Role_Text",
        context: "dom:*[role]",
        run: (context: RuleContext, options?: {}) : RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
            let passed = true;
            if (RPTUtil.hasRoleInSemantics(ruleContext, "application")) {
                let children = ruleContext.childNodes;
                for (let i = 0; passed && i < children.length; i++) {
                    if (children[i].nodeType === 1) {
                        if (RPTUtil.isNodeVisible(children[i])) {
                            passed = RPTUtil.hasRoleInSemantics(children[i], "document") || RPTUtil.hasRoleInSemantics(children[i], "article");
                        }
                    } else if (children[i].nodeType === 3) {
                        passed = children[i].nodeValue.trim().length === 0;
                    }
                }
            }

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    }
]

export { a11yRulesApp }
