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
import { NodeWalker, RPTUtil } from "../util/AriaUtil";
import { VisUtil } from "../util/VisUtil";

export let list_markup_review: Rule = {
    id: "list_markup_review",
    context: "dom:*",
    refactor: {
        "RPT_List_UseMarkup": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "pass": "list_markup_review.html",
            "potential_list": "list_markup_review.html",
            "group": "list_markup_review.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Proper HTML elements are used to create a list",
            "potential_list": "Verify this is a list and if so, modify to use proper HTML elements for the list",
            "group": "Proper HTML elements should be used to create a list"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        // Extract the nodeName of the context node
        let nodeName = ruleContext.nodeName.toLowerCase();

        //skip the check if the element is hidden or disabled
        if (RPTUtil.isNodeDisabled(ruleContext) || VisUtil.hiddenByDefaultElements.includes(nodeName))
            return null;

        // Don't trigger if we're not in the body or if we're in a script
        if (RPTUtil.getAncestor(ruleContext, ["body"]) === null) 
            return null;

        // ignore script, label and their child elements
        if (RPTUtil.getAncestor(ruleContext, ["script", 'label']) !== null)
            return null;

        // ignore all widgets and their children, and certain structure roles
        let roles = RPTUtil.getRolesWithTypes(ruleContext, ["widget"]);
        // add some structure roles
        RPTUtil.concatUniqueArrayItemList(["caption", "code", "columnheader",  "figure", "list", "listitem", "math", "meter", "columnheader", "rowheader"], roles);
        if (RPTUtil.getAncestorWithRoles(ruleContext, roles) !== null) 
            return null;

        let passed = true;
        let walkNode = ruleContext.firstChild as Node;
        while (passed && walkNode) {
            // Comply to the Check Hidden Content setting will be done by default as this rule triggers on each element
            // and for each element it only checks that single elements text nodes and nothing else. So all inner elements will be
            // covered on their own. Currently for this rule by default Check Hidden Content will work, as we are doing
            // a node walk only on siblings so it would not get text nodes from other siblings at all.
            // In the case in the future something changes, just need to add && !RPTUtil.shouldNodeBeSkippedHidden(walkNode) to the below
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

        if (passed) return null;
        if (!passed) return RulePotential("potential_list");

    }
}