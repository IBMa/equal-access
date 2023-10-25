/******************************************************************************
  Copyright:: 2022- IBM, Inc
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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let img_alt_redundant: Rule = {
    id: "img_alt_redundant",
    context: "dom:img[alt]",
    refactor: {
        "WCAG20_Img_LinkTextNotRedundant": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2",
            "Fail_3": "Fail_3"}
    },
    help: {
        "en-US": {
            "Pass_0": "img_alt_redundant.html",
            "Fail_1": "img_alt_redundant.html",
            "Fail_2": "img_alt_redundant.html",
            "Fail_3": "img_alt_redundant.html",
            "group": "img_alt_redundant.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Link text is repeated in an image 'alt' value within the same link",
            "Fail_2": "Link text of previous link is repeated in image 'alt' value of a link",
            "Fail_3": "Image 'alt' value within a link is repeated in link text of the link after",
            "group": "The text alternative for an image within a link should not repeat the link text or adjacent link text"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let aNode = RPTUtil.getAncestor(ruleContext, "a");
        //If not in an anchor, Out of Scope
        if (aNode == null) return null;

        let altText = ruleContext.getAttribute("alt").trim().toLowerCase();
        if (altText.length == 0) {
            // If alt text is empty, there's no text to be redundant - let a_text_purpose
            // trigger in that case.
            // So Out of Scope for this rule
            return null;
        }
        let innerText = aNode.innerText;
        let linkText = "";

        if (innerText != null) {
            linkText = innerText.trim().toLowerCase();
        }
        if (linkText.length > 0) {
            if (altText == linkText) {
                // Text in link
                return RuleFail("Fail_1");
            }
        } else {
            let passed = true;
            //alt is non-zero, but no link text - ensure adjacent link text isn't redundant
            let walk = new NodeWalker(aNode);
            while (passed && walk.prevNode()) {
                // Get the node and nodeName
                let node = walk.node;
                let nodeName = node.nodeName.toLowerCase();
                if ((nodeName == "#text" && node.nodeValue.length > 0) ||
                    (nodeName == "img" && RPTUtil.attributeNonEmpty(node, "alt"))) {
                    break;
                }
                // Comply with the Check Hidden Content Setting if the a element should be checked or not
                else if (nodeName === "a" && !RPTUtil.shouldNodeBeSkippedHidden(node)) {
                    // Text before image link
                    passed = ((node as HTMLElement).innerText || node.textContent || "").trim().toLowerCase() != altText;
                }
            }
            if (!passed) {
                return RuleFail("Fail_2");
            }
            walk = new NodeWalker(aNode, true);
            while (passed && walk.nextNode()) {
                // Get the node and nodeName
                let node = walk.node;
                let nodeName = node.nodeName.toLowerCase();

                if ((nodeName == "#text" && node.nodeValue.length > 0) ||
                    (nodeName == "img" && RPTUtil.attributeNonEmpty(node, "alt"))) {
                    break;
                }
                // Comply with the Check Hidden Content Setting if the a element should be checked or not
                else if (nodeName == "a" && !RPTUtil.shouldNodeBeSkippedHidden(node)) {
                    passed = (node as HTMLElement).innerText.trim().toLowerCase() != altText;
                }
            }
            if (!passed) {
                // Text after image link
                return RuleFail("Fail_3");
            } else {
                return RulePass("Pass_0");
            }
        }
    }
}