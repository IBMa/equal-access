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
            if (ruleContext.getAttribute("http-equiv").toLowerCase() !== 'refresh') {
                return null;
            }

            let content = ruleContext.getAttribute("content").toLowerCase();
            // Invalid content field
            if (!content.match(/^\d+$/) && !content.match(/^\d+;/)) {
                return null;
            }
            let fail = content.match(/^\d+; +[^ ]/) && !content.startsWith("0;");
            if (fail) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
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
            if (ruleContext.getAttribute("http-equiv").toLowerCase() !== 'refresh')
                return null;

            let content = ruleContext.getAttribute("content").toLowerCase();
            // Invalid content field
            if (!content.match(/^\d+$/) && !content.match(/^\d+;/)) {
                return null;
            }
            let fail = !content.match(/^\d+; +[^ ]/);
            return !fail ? RulePass("Pass_0") : RulePotential("Potential_1");
        }
    },
    {
        /**
         * Description: Trigger for viewport
         * Origin: ACT b4f0c3 https://act-rules.github.io/rules/b4f0c3
         */
        id: "meta_viewport_zoom",
        context: "dom:meta[name][content]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            
            if (ruleContext.getAttribute("name").toLowerCase() !== 'viewport')
                return null;

            let content = ruleContext.getAttribute("content").toLowerCase();
            // neither maximum-scale nor user-scalable (default yes)
            if (!content || content.trim() === ''|| (!content.includes('maximum-scale') && !content.includes('user-scalable'))) 
                return null;
            
            let user_msg = null;
            let max_msg = null; 
            const props = content.split(",");    
            let user_scale_value = 'yes';
            let maximum_scale_value = '2.0';
            for (const prop  of props)  {
                const pieces = prop.trim().split('=');
                if (pieces.length < 2) continue;
                if (prop.includes('user-scalable')) {
                    user_msg = prop;
                    user_scale_value = pieces[1].trim(); 
                    if (user_scale_value.startsWith("'") || user_scale_value.startsWith('"')) {
                        user_scale_value = user_scale_value.substring(1, user_scale_value.length-1);
                    }
                } else if (prop.includes('maximum-scale')) {
                    max_msg = prop;
                    maximum_scale_value = pieces[1].trim();
                    if (maximum_scale_value.startsWith("'") || maximum_scale_value.startsWith('"')) {
                        maximum_scale_value = maximum_scale_value.substring(1, maximum_scale_value.length-1).trim();
                    }
                }
            }
            
            let value = Number(user_scale_value);
            if (!isNaN(value)) { 
                if (value >=1 || value <= -1) user_scale_value = 'yes';
            }
            
            let maximum_scale = 2.0; 
            value = Number(maximum_scale_value);
            if (!isNaN(value)) { 
                if (value < 0) maximum_scale = 2.0;
                else maximum_scale = value;
            } else {
                if (maximum_scale_value === 'yes') maximum_scale = 1.0;
                else maximum_scale = 0.1;
            }
        
            // user-scalable is not set to 'yes', ignore maximum_scale
            if (user_scale_value !== 'yes' ) {
                return RulePotential("Potential_1", [user_msg]);
            }
            // user-scalable is 'yes', but maximum_scale is too small
            if (maximum_scale < 2.0 ) {
                return RulePotential("Potential_1", [max_msg]);
            }
            return RulePass("Pass_0");
        }
    }

]

export { a11yRulesMeta }