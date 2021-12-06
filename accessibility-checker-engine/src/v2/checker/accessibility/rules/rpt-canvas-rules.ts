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

let a11yRulesCanvas: Rule[] = [
    {
        /**
         * Description: Triggers if the inner html of a canvas element is empty
         * Origin:  HTML 5 - per Richard Schwerdtfeger's requirements. g1143
         */
        id: "HAAC_Canvas",
        context: "dom:canvas",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            //skip the rule
            if (RPTUtil.isNodeHidden(ruleContext)) return null;
            let passed = ruleContext.innerHTML.trim().length > 0;
            if (passed) return RulePass(1);
            if (!passed) return RuleManual("Manual_1");
        }

    }
]
export { a11yRulesCanvas }
