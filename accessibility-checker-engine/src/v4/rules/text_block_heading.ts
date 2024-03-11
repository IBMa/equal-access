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

import { Rule, RuleResult, RuleContext, RulePotential, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { DOMWalker } from "../../v2/dom/DOMWalker";

export let text_block_heading: Rule = {
    id: "text_block_heading",
    context: "dom:p, dom:div, dom:br",
    refactor: {
        "RPT_Block_ShouldBeHeading": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "pass": "text_block_heading.html",
            "potential_heading": "text_block_heading.html",
            "group": "text_block_heading.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Heading text uses a heading element or role",
            "potential_heading": "Confirm this text {0} is used as a heading and if so, modify to use a heading element or role”",
            "group": "Heading text should use a heading element or role"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            numWords: {
                value: 10,
                type: "integer"
            }
        }

        const ruleContext = context["dom"].node as Element;
        let numWords = validateParams.numWords.value;
        let wordsSeen = 0;
        let wordStr: string[] = [];
        let emphasizedText = false;
        let nw = new NodeWalker(ruleContext);
        let passed = false;
        while (!passed &&
            nw.nextNode() &&
            nw.node !== ruleContext &&
            nw.node !== DOMWalker.parentNode(ruleContext) &&
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
                            (nwName === "input" && nw.elem().hasAttribute("type") && nw.elem().getAttribute("type") == "image")
                        )
                    )
                    || (nwName === "#text" && nw.node.nodeValue.trim().length > 0)
                    // Give them the benefit of the doubt if there's a link
                    || (nwName === "a" && nw.elem().hasAttribute("href") && RPTUtil.attributeNonEmpty(nw.node, "href"));
            }
        }
        if (wordsSeen == 0) passed = true;

        if (passed) {
            return null;
        } else {
            return RulePotential("potential_heading", [wordStr.join(" ")]);
        }
    }
}