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

export let RPT_List_UseMarkup: Rule = {
    id: "RPT_List_UseMarkup",
    context: "dom:*",
    help: {
        "en-US": {
            "Pass_0": "RPT_List_UseMarkup.html",
            "Potential_1": "RPT_List_UseMarkup.html",
            "group": "RPT_List_UseMarkup.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify whether this is a list that should use HTML list elements",
            "group": "Use proper HTML list elements to create lists"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = true;
        let walkNode = ruleContext.firstChild as Node;
        while (passed && walkNode) {
            // Comply to the Check Hidden Content setting will be done by default as this rule triggers on each element
            // and for each element it only checks that single elements text nodes and nothing else. So all inner elements will be
            // covered on their own. Currently for this rule by default Check Hidden Content will work, as we are doing
            // a node walk only on siblings so it would not get text nodes from other siblings at all.
            // In the case in the future something chnges, just need to add && !RPTUtil.shouldNodeBeSkippedHidden(walkNode) to the below
            // if.
            if (walkNode.nodeName == "#text") {
                let txtVal = walkNode.nodeValue;
                let failure = /^[ \t\r\n]*[( ]*[1-9]*[\*\-).][ \t][A-Z,a-z]+/.test(txtVal);
                passed = !failure;
                if (!passed) {
                    // Ensure that there's some sort of block level element before this
                    // Avoid failures due to things like <i>Some sentence</i>. New sentence.
                    let nw = new NodeWalker(walkNode);
                    while (!passed && nw.prevNode()) {
                        let nodeName = nw.node.nodeName.toLowerCase();
                        if (["blockquote", "center", "dir", "div", "form", "h1",
                            "h2", "h3", "h4", "h5", "h6", "hr", "br", "menu", "p",
                            "pre"].includes(nodeName)) {
                            break;
                        }
                        if (nodeName == "#text") {
                            let txt = nw.node.nodeValue;
                            passed = txt.length > 0 && ![" ", "\t", "\n"].includes(txt.charAt(txt.length - 1));
                        }
                    }
                }
            }
            walkNode = walkNode.nextSibling;
        }

        if (!passed) {
            // Don't trigger if we're not in the body or if we're in a script
            let checkAncestor = RPTUtil.getAncestor(ruleContext, ["body", "script"]);
            passed = checkAncestor == null || checkAncestor.nodeName.toLowerCase() != "body";
        }

        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}