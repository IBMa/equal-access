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

let a11yRulesTitle: Rule[] = [

    {
        /**
         * Description: Triggers if a document does not have a title
         * Origin: WCAG 2.0 Technique H25
         */
        id: "WCAG20_Doc_HasTitle",
        // Note: context is HTML, because a document with no head at all is also missing a title.
        // HTMLUnit seems to add a head in anyway, but we cannot rely on that.
        context: "dom:html",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Node;
            // JCH - NO OUT OF SCOPE hidden in context
            let offNode = ruleContext;
            // First, find the head element
            let findHead = ruleContext.firstChild as Node;
            let findTitle = null;
            while (findHead != null) {
                if (findHead.nodeName.toLowerCase() == "head")
                    break;
                findHead = findHead.nextSibling;
            }
            if (findHead != null) { // have head
                offNode = findHead;
                findTitle = findHead.firstChild as Node;
                while (findTitle != null) {
                    if (findTitle.nodeName.toLowerCase() == "title")
                        break;
                    findTitle = findTitle.nextSibling;
                }
            } else { // don't have head so first PoF
                return RuleFail("Fail_1");
            }

            if (findTitle == null) { // don't have title second PoF
                return RuleFail("Fail_2");
            }

            // if we get here we have <head> and <title>

            if (findTitle != null && RPTUtil.getInnerText(findTitle).trim().length > 0) {
                return RulePass("Pass_0");
            } else { // <title> has no innerHTML third PoF
                return RuleFail("Fail_3");
            }
        }
    },
    {
        /**
         * Description: Trigger if title contains bad values
         * Origin: RPT 5.6 G484
         */
        id: "RPT_Title_Valid",
        context: "dom:head dom:title",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;

            let titleStr = RPTUtil.getInnerText(ruleContext).trim();

            // allow .com, .net and .org
            let titleStrLowercase = titleStr.toLowerCase();
            if (titleStrLowercase.includes(".com") || titleStrLowercase.includes(".net") || titleStrLowercase.includes(".org")) {
                return RulePass("Pass_0",[titleStr]);
            }

            if (titleStr.length === 0) {
                // This is covered by WCAG20_Doc_HasTitle
                return null;//RuleFail("Fail_1");
            } else {
                let passed = !/^\S*\.[a-zA-Z]{1,4}(?!.)|^https?:\/\/\S*/i.test(titleStr);

                if (!passed) {
                    return RulePotential("Potential_2");
                } else {
                    return RulePass("Pass_0",[titleStr]);
                }
            }
        }
    }

]
export { a11yRulesTitle }