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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../../../api/IRule";
import { RPTUtil } from "../../../../v2/checker/accessibility/util/legacy";
import { ARIADefinitions } from "../../../../v2/aria/ARIADefinitions";

export let Rpt_Aria_MissingKeyboardHandler: Rule = {
    id: "Rpt_Aria_MissingKeyboardHandler",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    help: {
        "en-US": {
            "Pass_0": "Rpt_Aria_MissingKeyboardHandler.html",
            "Potential_1": "Rpt_Aria_MissingKeyboardHandler.html",
            "group": "Rpt_Aria_MissingKeyboardHandler.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify the <{0}> element with \"{1}\" role has keyboard access",
            "group": "Interactive WAI_ARIA UI components must provide keyboard access"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let passed = true;
        let savedPassed = passed;
        let doc = ruleContext.ownerDocument;
        let designPatterns = ARIADefinitions.designPatterns;
        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        let hasAttribute = RPTUtil.hasAttribute;
        // Composite user interface widget roles. They act as containers that manage other, contained widgets.
        let roleContainers = ["combobox", "grid", "listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"];
        let roleNameArr = new Array();

        for (let j = 0; j < roles.length; ++j) {
            let pattern = designPatterns[roles[j]];
            if (roleContainers.indexOf(roles[j]) >= 0) {
                let disabled = hasAttribute(ruleContext, 'aria-disabled') ? ruleContext.getAttribute("aria-disabled") : '';
                if (!disabled) {

                    // See if there is a keyboard event handler on the parent element.
                    passed = (ruleContext.hasAttribute("onkeydown") || ruleContext.hasAttribute("onkeypress"));

                    // No keyboard event handler found on parent.  See if keyboard event handlers are on required child elements.
                    if (!passed) {
                        if (!hasAttribute(ruleContext, 'aria-activedescendant')) {
                            let reqChildren = ARIADefinitions.designPatterns[roles[j]].reqChildren;
                            if (reqChildren) { /* SMF TODO menubar does not have any reqChildren */
                                for (let i = 0, requiredChildrenLength = reqChildren.length; i < requiredChildrenLength; i++) {
                                    let xp = "*[contains(@role,'" + reqChildren[i] + "')]";
                                    let xpathResult = doc.evaluate(xp, ruleContext, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                                    let r = xpathResult.iterateNext() as Element;
                                    while (r) {

                                        passed = (r.hasAttribute("onkeydown") || r.hasAttribute("onkeypress"));
                                        if (!passed) {

                                            // Child did not have a key handler.  See if any of the grandchildren do.
                                            let xp2 = "descendant::*";
                                            let xpathResult2 = doc.evaluate(xp2, r, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                                            let r2: Element = xpathResult2.iterateNext() as Element;
                                            while (r2 && !passed) {
                                                // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                                                // or not.
                                                //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                                                //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                                                //     add it to the roleToElems hash at all or even do any checking for it at all.
                                                //
                                                // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                                                //       so on and so forth.
                                                if (RPTUtil.shouldNodeBeSkippedHidden(r2)) {
                                                    r2 = xpathResult2.iterateNext() as Element;
                                                    continue;
                                                }

                                                passed = RPTUtil.tabIndexLEZero(r2) &&
                                                    (r2.hasAttribute("onkeydown") || r2.hasAttribute("onkeypress"));

                                                if (!passed) {

                                                    // No tabindex focusable element found with a key handler.  See if an element focusable by default has a handler.
                                                    if (RPTUtil.isfocusableByDefault(r2)) {
                                                        passed = (r2.hasAttribute("onkeydown") || r2.hasAttribute("onkeypress"));

                                                        // Is this an action link?
                                                        if (r2.nodeName.toLowerCase() == "a" && r2.hasAttribute("href")) {
                                                            let href = r2.getAttribute("href");

                                                            // Action link must start with "javascript:", must not contain a "void" and
                                                            // must have a function name following "javascript:" (i.e., href.length > 11)
                                                            passed = (href.startsWith("javascript:") && href.indexOf("void") == -1 && href.length > 11);
                                                        }
                                                    }
                                                }
                                                r2 = xpathResult2.iterateNext() as Element;
                                            }
                                        }
                                        if (!passed) {
                                            // All the required children (or any descendants of the required children) must have keypress/keydown
                                            // If not, it is a failure, no need to keep checking any more.
                                            break;
                                        }
                                        r = xpathResult.iterateNext() as Element;
                                    }
                                }
                            } else {
                                // The current element failed the keydown/keypress, and it does not have required children, such as menubar.
                                // Let's check its descendants.
                                let xp2 = "descendant::*";
                                let xpathResult2 = doc.evaluate(xp2, ruleContext, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                                let r2 = xpathResult2.iterateNext() as Element;
                                while (r2 && !passed) {
                                    // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                                    // or not.
                                    //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                                    //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                                    //     add it to the roleToElems hash at all or even do any checking for it at all.
                                    //
                                    // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                                    //       so on and so forth.
                                    if (RPTUtil.shouldNodeBeSkippedHidden(r2)) {
                                        r2 = xpathResult2.iterateNext() as Element;
                                        continue;
                                    }

                                    passed = RPTUtil.tabIndexLEZero(r2) &&
                                        (r2.hasAttribute("onkeydown") || r2.hasAttribute("onkeypress"));

                                    if (!passed) {

                                        // No tabindex focusable element found with a key handler.  See if an element focusable by default has a handler.
                                        if (RPTUtil.isfocusableByDefault(r2)) {
                                            passed = (r2.hasAttribute("onkeydown") || r2.hasAttribute("onkeypress"));

                                            // Is this an action link?
                                            if (r2.nodeName.toLowerCase() == "a" && r2.hasAttribute("href")) {
                                                let href = r2.getAttribute("href");

                                                // Action link must start with "javascript:", must not contain a "void" and
                                                // must have a function name following "javascript:" (i.e., href.length > 11)
                                                passed = (href.startsWith("javascript:") && href.indexOf("void") == -1 && href.length > 11);
                                            }
                                        }
                                    }
                                    r2 = xpathResult2.iterateNext() as Element;
                                }
                            }
                        } else {
                            // Attribute 'aria-activedescendant' is specified.
                            passed = true;
                        }
                    }
                }
            }
            if (!passed) {
                roleNameArr.push(roles[j]);
            }
            if (!passed && savedPassed) {
                savedPassed = passed;
            }
        }

        let retToken1 = new Array();
        retToken1.push(ruleContext.nodeName.toLowerCase());
        let retToken2 = new Array();
        retToken2.push(roleNameArr.join(", "));

        // Determine if this is referenced by a combobox. If so, leave it to the combobox rules to check
        let id = ruleContext.getAttribute("id");
        if (id && id.trim().length > 0) {
            if (ruleContext.ownerDocument.querySelector(`*[aria-controls='${id}'][role='combobox']`)) {
                return null;
            }
        }
        return savedPassed ? RulePass("Pass_0") : RulePotential("Potential_1", [retToken1.toString(), retToken2.toString()]);
    }
}