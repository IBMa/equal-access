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

let a11yRulesEmbed: Rule[] = [

    {
        /**
         * Description: Trigger if embed is missing embed, or is not immediately after
         * Origin: WCAG 2.0 Technique H46
         */
        id: "WCAG20_Embed_HasNoEmbed",
        context: "dom:embed",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            //skip the rule
            if (RPTUtil.isNodeHidden(ruleContext)) return null;
            let passed = ruleContext.getElementsByTagName("noembed").length > 0;
            if (!passed) {
                let walkNode = ruleContext.nextSibling;
                while (!passed && walkNode != null) {
                    if (walkNode.nodeName.toLowerCase() == "noembed")
                        passed = true;
                    else if (walkNode.nodeName.toLowerCase() == "#text" && walkNode.nodeValue.trim().length > 0)
                        break;
                    else if (walkNode.nodeType == 1)
                        break;
                    walkNode = walkNode.nextSibling;
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger if Noembed has no content
         * Origin: Valerie
         */
        id: "Valerie_Noembed_HasContent",
        context: "dom:noembed",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            //skip the rule
            if (RPTUtil.isNodeHidden(ruleContext)) return null;
            let passed = RPTUtil.hasInnerContentHidden(ruleContext);
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Provide alternative content for embeded elements.
         * Origin: RPT 5.6 G320 piece not contained in WCAG20_Embed_HaSNoEmbed
         */
        id: "RPT_Embed_HasAlt",
        context: "dom:embed",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            //skip the rule
            if (RPTUtil.isNodeHidden(ruleContext)) return null;
            let passed = RPTUtil.attributeNonEmpty(ruleContext, "alt");
            return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
        }
    },
    {
        /**
         * Description: Trigger if media automatically starts
         * Origin: RPT 5.6 G503
         */
        id: "RPT_Embed_AutoStart",
        context: "dom:param[name=autoplay], dom:param[name=autostart], " +
            "dom:embed[flashvars], dom:embed[src], " +
            "dom:*[autostart=true], dom:*[autostart=1], dom:bgsound",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            //skip the rule
            if (RPTUtil.isNodeHidden(ruleContext)) return null;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let passed;
            if (nodeName == "bgsound") {
                passed = false;
            } else if (nodeName == "param") {
                let content = "";
                if (ruleContext.hasAttribute("value"))
                    content = ruleContext.getAttribute("value").toLowerCase();
                passed = content.indexOf("0;") == 0 ||
                    !(content.indexOf("true") != -1 || content.indexOf("1") != -1);
            } else if (nodeName == "embed") {
                passed = true;
                if (ruleContext.hasAttribute("flashvars")) {
                    let str = ruleContext.getAttribute("flashvars");
                    passed = str.indexOf("autostart=true") == -1 &&
                        str.indexOf("autostart=1") == -1;
                }
                if (passed && ruleContext.hasAttribute("src")) {
                    let str = ruleContext.getAttribute("src");
                    passed = str.indexOf("autostart=true") == -1 &&
                        str.indexOf("autostart=1") == -1;
                }
            }
            if (passed && ruleContext.hasAttribute("autostart")) {
                let val = ruleContext.getAttribute("autostart").toLowerCase();
                passed = val != 'true' && val != '1';
            }
            return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
        }
    }

]

export { a11yRulesEmbed }
