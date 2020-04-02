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
import { RPTUtil, NodeWalker } from "../util/legacy";

let a11yRulesForm: Rule[] = [

    {
        /**
         * Description: Trigger if a form does not have a submit button
         * Origin: WCAG 2.0 Technique H32
         */
        id: "WCAG20_Form_HasSubmit",
        context: "dom:form",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = false;
            if (ruleContext.firstChild) {
                // submit buttons are usually at the bottom - walk backwards
                let nw = new NodeWalker(ruleContext, true);
                while (!passed && nw.prevNode() && nw.node != ruleContext) {
                    if (!nw.bEndTag) {
                        let nodeName = nw.node.nodeName.toLowerCase();
                        if (nodeName == "input") {
                            let type = nw.node.getAttribute("type");
                            passed = type == "submit" || type == "image";
                        } else if (nodeName == "button") {
                            passed = nw.node.getAttribute("type") == "submit";
                        } else if (nw.node.nodeType == 1) {
                            passed = RPTUtil.hasRole(nw.node, "button");
                        }
                    }
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    { // Warning
        /**
         * Description: Trigger if onchange is non-empty
         * Origin: RPT 5.6 G492
         */
        id: "RPT_Form_ChangeEmpty",
        context: "dom:select[onchange], dom:input[onchange]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = ruleContext.getAttribute("onchange").trim().length == 0;
            if (passed) return null;
            if (!passed) return RulePotential("Potential_1");
        }
    },

    {
        /**
         * Description: Triggers if there is a target, and text does not specify a new window.
         * Origin: WCAG 2.0 Technique H83, RPT G491
         */
        id: "WCAG20_Form_TargetAndText",
        context: "dom:form[target]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                paramWinText: {
                    value: ["new window"],
                    type: "array"
                }
            }
            const ruleContext = context["dom"].node as Element;
            let tStr = ruleContext.getAttribute("target");
            let passed = tStr == "_parent" || tStr == "_self" || tStr == "_top" || RPTUtil.getFrameByName(ruleContext,tStr) != null;
            if (!passed) {
                // Name is not part of this frameset – must have potential to create new window?
                // See if a new window is mentioned
                let textStr = RPTUtil.getInnerText(ruleContext);
                if (ruleContext.hasAttribute("title"))
                    textStr += " " + ruleContext.getAttribute("title");
                for (let i = 0; !passed && i < validateParams.paramWinText.value.length; ++i)
                    if (textStr.indexOf(validateParams.paramWinText.value[i]) != -1) passed = true;
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    }

]
export { a11yRulesForm }