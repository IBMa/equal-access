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

let a11yRulesHeading: Rule[] = [

    { // Error
        /**
         * Description: Trigger headers that are empty
         * Origin: RPT 5.6 G489
         */
        id: "RPT_Header_HasContent",
        context: "dom:h1, dom:h2, dom:h3, dom:h4, dom:h5, dom:h6",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = RPTUtil.hasInnerContentHidden(ruleContext);
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    { // Warning
        /**
         * Description: Trigger for all heading elements
         * Origin: RPT 5.6 489
         */
        id: "RPT_Header_Trigger",
        context: "dom:h1, dom:h2, dom:h3, dom:h4, dom:h5, dom:h6",
        dependencies: ["RPT_Header_HasContent"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = RPTUtil.triggerOnce(ruleContext.ownerDocument, "RPT_Header_Trigger", false);
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger on headers (<h1>, <h2>, <h3>, <h4>,<h5>, <h6>) that have more than N words.
         * Origin: RPT 5.6
         */
        id: "RPT_Headers_FewWords",
        context: "dom:h1, dom:h2, dom:h3, dom:h4, dom:h5, dom:h6",
        dependencies: ["RPT_Header_HasContent"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                headingLengthThresh: {
                    value: 20,
                    type: "integer"
                }
            }
            const ruleContext = context["dom"].node as Element;
            let headingLengthThresh = validateParams.headingLengthThresh.value;
            let passed = RPTUtil.wordCount(RPTUtil.getInnerText(ruleContext)) <= headingLengthThresh;
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },

    {
        /**
         * Description: Trigger on <p>, <div>, or between <br>'s whose text content is less than N words
         * and is all emphasized.
         * Emphasized text is contained in a <b>, <em>, <i>, <strong>, <u> or a <font> with size > "4"
         * or a relative increased size.
         * Origin: RPT 5.6 G322
         */
        id: "RPT_Block_ShouldBeHeading",
        context: "dom:p, dom:div, dom:br",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                numWords: {
                    value: 10,
                    type: "integer"
                }
            }
    
            const ruleContext = context["dom"].node as Element;
            let numWords = validateParams.numWords.value;
            let wordsSeen = 0;
            let wordStr : string[] = [];
            let emphasizedText = false;
            let nw = new NodeWalker(ruleContext);
            let passed = false;
            while (!passed &&
                nw.nextNode() &&
                nw.node != ruleContext &&
                nw.node != ruleContext.parentNode &&
                !["br", "div", "p"].includes(nw.node.nodeName.toLowerCase())) // Don't report twice
            {
                let nwName = nw.node.nodeName.toLowerCase();
                if ((nwName == "b" || nwName == "em" || nwName == "i" ||
                    nwName == "strong" || nwName == "u" || nwName == "font") && !RPTUtil.shouldNodeBeSkippedHidden(nw.node)) {
                    let nextStr = RPTUtil.getInnerText(nw.node);
                    let wc = RPTUtil.wordCount(nextStr);
                    if (wc > 0) {
                        wordStr.push(nextStr);
                        emphasizedText = true;
                        wordsSeen += wc;
                    }
                    passed = wordsSeen > numWords;
                    // Skip this node because it's emphasized
                    nw.bEndTag = true;
                } else {
                    passed =
                        (nw.node.nodeType == 1 && RPTUtil.attributeNonEmpty(nw.node, "alt") &&
                            (nwName == "applet" || nwName == "embed" || nwName == "img" ||
                                (nwName == "input" && nw.node.hasAttribute("type") && nw.node.getAttribute("type") == "image")
                            )
                        )
                        || (nwName == "#text" && nw.node.nodeValue.trim().length > 0)
                        // Give them the benefit of the doubt if there's a link
                        || (nwName == "a" && nw.node.hasAttribute("href") && RPTUtil.attributeNonEmpty(nw.node, "href"));
                }
            }
            if (wordsSeen == 0) passed = true;

            if (passed) {
                return RulePass("Pass_0");
            } else {
                return RulePotential("Potential_1", [wordStr.join(" ")]);
            }
        }
    }


]

export { a11yRulesHeading }