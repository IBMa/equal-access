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

let a11yRulesScript: Rule[] = [
    {
        /**
         * Description: Trigger when onclick events are used on elements other than links, and reference
         * an HTML page.
         * Origin: RPT 5.6 G470 Error
         */
        id: "RPT_Script_OnclickHTML1",
        context: "dom:*[onclick]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                failSubstring: {
                    value: [".asp", ".aspx", ".cfm", ".cfml", ".cgi", ".htm", ".html", ".shtm",
                        ".shtml", ".php", ".pl", ".py", ".shtm", ".shtml", ".xhtml",
                        "location.href"],
                    type: "[string]"
                }
            };
            const ruleContext = context["dom"].node as Element;
            // If there's an aria-role specified, don't trigger this.
            let passed = RPTUtil.attributeNonEmpty(ruleContext, "role");
            // If this is an a or area, don't trigger if there's an href.
            let nodeName = ruleContext.nodeName.toLowerCase();
            passed = passed || ((nodeName == "a" || nodeName == "area") && RPTUtil.attributeNonEmpty(ruleContext, "href"));

            // If the guards failed, check to see if they're looking at links
            if (!passed) {
                let failSubstring = validateParams.failSubstring.value;;
                let onclick = ruleContext.getAttribute("onclick").toLowerCase();
                passed = true;
                for (let i = 0; passed && i < failSubstring.length; ++i) {
                    passed = onclick.indexOf(failSubstring[i]) == -1;
                }
            }

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger when onclick events are used.
         * Origin: RPT 5.6 G470 Warning
         */
        id: "RPT_Script_OnclickHTML2",
        context: "dom:*[onclick]",
        dependencies: ["RPT_Script_OnclickHTML1"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Don't trigger this for SVG element for now until a determination is made (by Rich)
            // to support SVG at a point when the SVG a11y spec is ready.
            if (RPTUtil.getAncestor(ruleContext, "svg")) {
                return RulePass("Pass_0");
            }
            // If there's an aria-role specified, don't trigger this.
            if (RPTUtil.attributeNonEmpty(ruleContext, "role"))
                return RulePass("Pass_0");

            let nodeName = ruleContext.nodeName.toLowerCase();
            let passed = nodeName == "a" || nodeName == "area" || nodeName == "input";
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },

    {
        /**
         * Description: Triggers if the script blurs on focus
         * Origin: WCAG 2.0 F55
         */
        id: "WCAG20_Script_FocusBlurs",
        context: "dom:*[onfocus]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = ruleContext.getAttribute("onfocus").indexOf(".blur(") == -1;
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    }


]
export { a11yRulesScript }