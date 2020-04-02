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
import { RPTUtil } from "../../accessibility/util/legacy";

let designRulesGrid: Rule[] = [{
    id: "DESIGN_GridLayout_ImgAspectRatio",
    context: "aria:img",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLImageElement;
        const EPSILON = .0000001;
        let w = ruleContext.naturalWidth;
        let h = ruleContext.naturalHeight;
        let ratio = Math.max(w / h, h / w);
        if (Math.abs(ratio - 16 / 9.0) < EPSILON
            || Math.abs(ratio - 4 / 3.0) < EPSILON
            || Math.abs(ratio - 3 / 2.0) < EPSILON
            || Math.abs(ratio - 2 / 1.0) < EPSILON
            || Math.abs(ratio - 1 / 1.0) < EPSILON) {
            return RulePass(1);
        } else {
            return RuleFail(2);
        }
    }
}]
export { designRulesGrid }