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

let a11yRulesBody: Rule[] = [
    {
        id: "WCAG20_Body_FirstASkips_Native_Host_Sematics",
        context: "dom:body",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Get the anchors on the page
            let doc = ruleContext.ownerDocument;

            // Check for landmarks first
            let passed;
            if (RPTUtil.getCache(ruleContext, "IBM_hasLandmarks_Implicit", null) === null) {
                RPTUtil.setCache(ruleContext, "IBM_hasLandmarks_Implicit", RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, ["application", "banner", "complementary", "contentinfo",
                    "form", "main", "navigation", "search"
                ], true, true).length > 0);
            }
            passed = RPTUtil.getCache(ruleContext, "IBM_hasLandmarks_Implicit", false);

            if (!passed) { // No landmarks, check for skip links
                let anchors = RPTUtil.getDocElementsByTag(ruleContext, "a");

                // Skip anchor should be the first one on the page with an href attribute
                let testAnchor = null;
                for (let i = 0; i < anchors.length; ++i) {
                    if (anchors[i].hasAttribute("href") && RPTUtil.isNodeVisible(anchors[i])) {
                        testAnchor = anchors[i];
                        break;
                    }
                }

                // Pull out the target id
                let targetId = null;
                if (testAnchor != null) {
                    let hrefStr = testAnchor.getAttribute("href");
                    let idx = hrefStr.indexOf("#");
                    if (idx != -1) {
                        targetId = hrefStr.substring(idx + 1);
                    }
                }
                // Determine if there is an element id or named anchor on the page with this
                // target id.

                if (targetId != null) {
                    passed = doc.getElementById(targetId) != null;
                    for (let i = 0; !passed && i < anchors.length; ++i) {
                        if (!anchors[i].hasAttribute("href") &&
                            anchors[i].hasAttribute("name") &&
                            anchors[i].getAttribute("name") == targetId) {
                            passed = true;
                        }
                    }
                }
            }
            //return new ValidationResult(passed, [ruleContext], '', '', []);
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if skip text does not contain certain text strings and
         *  there are no landmarks used on the page.
         * Origin: WCAG 2.0 Technique G1
         */
        id: "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics",
        context: "dom:body",
        dependencies: ["WCAG20_Body_FirstASkips_Native_Host_Sematics"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                paramSkipText: {
                    value: ["skip", "jump"],
                    type: "[string]"
                }
            }
            const ruleContext = context["dom"].node as Element;
            // Get the anchors on the page
            let doc = ruleContext.ownerDocument;

            // Check for landmarks first
            let passed;
            if (RPTUtil.getCache(ruleContext, "IBM_hasLandmarks_Implicit", null) === null) {
                RPTUtil.setCache(ruleContext, "IBM_hasLandmarks_Implicit", RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, ["application", "banner", "complementary", "contentinfo",
                    "form", "main", "navigation", "search"
                ], true, true).length > 0);
            }
            passed = RPTUtil.getCache(ruleContext, "IBM_hasLandmarks_Implicit", false);

            if (!passed) { // No landmarks, check for skip links
                let links = doc.links;
                // Skip link should be the first one on the page with an href attribute (i.e., links[0])
                // also if the first link is hidden then we should also trigger a violation.
                if (links && links.length > 0 && RPTUtil.isNodeVisible(links[0])) {
                    let testText = RPTUtil.getInnerText(doc.links[0]).toLowerCase();
                    for (let i = 0; !passed && i < validateParams.paramSkipText.value.length; ++i) {
                        passed = testText.indexOf(validateParams.paramSkipText.value[i]) != -1;
                    }
                } else passed = false;

            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    }
]
export { a11yRulesBody }