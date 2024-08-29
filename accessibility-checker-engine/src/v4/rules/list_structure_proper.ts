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
import { RPTUtil } from "../util/AriaUtil";

export let list_structure_proper: Rule = {
    id: "list_structure_proper",
    context: "dom:dl, dom:ul, dom:ol, dom:dir, dom:menu, dom:li, dom:dd, dom:dt",
    refactor: {
        "RPT_List_Misuse": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "list_structure_proper.html",
            "Potential_1": "list_structure_proper.html",
            "group": "list_structure_proper.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "List element is missing or improperly structured",
            "group": "List elements should only be used for lists of related items"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
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
                // pass. In the case that there are other elements, such as img we will still trigger a violation.
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
                // pass. In the case that there are other elements, such as img we will still trigger a violation.
                passed = (passed && liFound) || (passed && presentationalFound);
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}