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

let a11yRulesList: Rule[] = [

    {
        id: "RPT_List_Misuse",
        context: "dom:dl, dom:ul, dom:ol, dom:dir, dom:menu, dom:li, dom:dd, dom:dt",
        run: (context: RuleContext, options?: {}) : RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
            let passed;
            let nodeName = ruleContext.nodeName.toLowerCase();

            // Get all the childrens of the ruleContext
            let children = ruleContext.children

            if (nodeName == "dl") {
                let first = "";
                let last = "";
                let walkChildren = ruleContext.firstChild as Node;
                passed = true;
                let presentationalFound = false;

                // If there are no childrens set as passed, since dl elements can have
                // zero or more of: one or more dt elements, followed by one or more dd elements
                if (!ruleContext.children || ruleContext.children.length == 0) {
                    passed = true;
                } else {
                    while (passed && walkChildren != null) {
                        if (walkChildren.nodeType == 1) {
                            let nodeName = walkChildren.nodeName.toLowerCase();

                            // While walking through the elements under dl, if we find a 
                            // presentational element we move to the next element as presentational
                            // elements are allowed under list elements as they are only for
                            // formatting text nodes.
                            if (RPTUtil.isPresentationalElement(walkChildren)) {
                                presentationalFound = true;
                                walkChildren = walkChildren.nextSibling;
                                continue;
                            }

                            // Only set to pass if we find dd or dt element, in the case of
                            // an element that is not supported we will catch it here. i.e. img 
                            // element
                            passed = nodeName == "dd" || nodeName == "dt";

                            // Set the first and last node depending on which is found first and last
                            if (first == "") first = nodeName;
                            last = nodeName;
                        }
                        walkChildren = walkChildren.nextSibling;
                    }
                    // In the case that we have found dt and dd elements under dl we pass right away.
                    // In the case that there is no dt or dd element, but bunch of presentational elements we mark this as a
                    // pass. In the case that there are other elements such as img we will still trigger a violation.
                    passed = (passed && first == "dt" && last == "dd") || (passed && presentationalFound);
                }
            } else if (nodeName == "li") {
                passed = RPTUtil.getAncestor(ruleContext, ["ul", "ol", "dir", "menu"]) != null;
            } else if (nodeName == "dd" || nodeName == "dt") {
                passed = RPTUtil.getAncestor(ruleContext, "dl") != null;
            } else {
                let walkChildren = ruleContext.firstChild as Node;
                // Zero or more li elements are permitted inside of <ol>, <ul> or <menu> elements now as per the html5 spec. This handles the case
                // when there are zero elements under the <ol>, <ul> or <menu>.
                if ((nodeName == "ul" || nodeName == "ol" || nodeName == "menu") && (!ruleContext.children || ruleContext.children.length == 0)) {
                    passed = true;
                } else {
                    let liFound = false;
                    let presentationalFound = false;
                    passed = true;
                    while (passed && walkChildren != null) {
                        // While walking through the list elements, if we find a 
                        // presentational element we skip checking as presentational
                        // elements are allowed under list elements as they are only for
                        // formatting text.
                        if (RPTUtil.isPresentationalElement(walkChildren)) {
                            presentationalFound = true;
                            walkChildren = walkChildren.nextSibling;
                            continue;
                        }

                        // Pass if the node type is anything but 1, or in the case that it is a li element. For any other node 
                        // it will be caught here that element is not allowed under list node.
                        // Furthermore in the case that there is a template element with the parent being ul/ol don't flag a violation
                        passed = walkChildren.nodeType != 1 || walkChildren.nodeName.toLowerCase() == "li" || (walkChildren.nodeName.toLowerCase() == "template" && (nodeName == "ul" || nodeName == "ol"));

                        // Set li found to true if the current element (nodeType=1) is an li element
                        liFound = liFound || (walkChildren.nodeType == 1 && walkChildren.nodeName.toLowerCase() == "li");
                        walkChildren = walkChildren.nextSibling;
                    }
                    // In the case that it has passed and also li element is found under list node, we pass right away.
                    // In the case that there is no li element, but bunch of presentational elements we mark this as a
                    // pass. In the case that there are other elements such as img we will still trigger a violation.
                    passed = (passed && liFound) || (passed && presentationalFound);
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        id: "RPT_List_UseMarkup",
        context: "dom:*",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
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

]
export { a11yRulesList }