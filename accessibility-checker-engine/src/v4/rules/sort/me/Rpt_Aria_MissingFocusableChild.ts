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

export let Rpt_Aria_MissingFocusableChild: Rule = {
    id: "Rpt_Aria_MissingFocusableChild",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    help: {
        "en-US": {
            "Pass_0": "Rpt_Aria_MissingFocusableChild.html",
            "Fail_1": "Rpt_Aria_MissingFocusableChild.html",
            "group": "Rpt_Aria_MissingFocusableChild.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The descendent <{0}> element with \"{1}\" role has no focusable child element",
            "group": "UI component must have at least one focusable child element for keyboard access"
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

        // An ARIA list is not interactive
        if (RPTUtil.hasRole(ruleContext, { "list": true, "row": true, "rowgroup": true, "table": true })) {
            return null;
        }

        // Not a valid message for mobile because all elements are focusable in iOS when VoiceOver is enabled.
        if (ruleContext.hasAttribute("class") && ruleContext.getAttribute("class").substring(0, 3) == "mbl") {
            return null;
        }

        // Handle the case where the element is hidden by disabled html5 attribute or aria-disabled:
        //  1. In the case that this element has a disabled attribute and the element supports it, we mark this rule as passed.
        //  2. In the case that this element has a aria-disabled attribute then, we mark this rule as passed.
        // For both of the cases above we do not need to perform any further checks, as the element is disabled in some form or another.
        if (RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }

        // Determine if this is referenced by a combobox. If so, focus is controlled by the combobox
        let id = ruleContext.getAttribute("id");
        if (id && id.trim().length > 0) {
            if (ruleContext.ownerDocument.querySelector(`*[aria-controls='${id}'][role='combobox']`)) {
                return null;
            }
        }

        let passed = true;
        let doc = ruleContext.ownerDocument;
        let hasAttribute = RPTUtil.hasAttribute;
        let roleNameArr = new Array();
        let nodeName = "";
        let inScope = false;

        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        for (let j = 0; j < roles.length; ++j) {
            if (ARIADefinitions.containers.includes(roles[j])) {
                let disabled = hasAttribute(ruleContext, 'aria-disabled') ? ruleContext.getAttribute("aria-disabled") : '';
                if (disabled != 'true' && !hasAttribute(ruleContext, 'aria-activedescendant') && !RPTUtil.isTabbable(ruleContext)) {
                    let reqChildren = ARIADefinitions.designPatterns[roles[j]].reqChildren;
                    if (reqChildren) {
                        inScope = true;
                        passed = false;
                        let xp = "descendant::*[";
                        for (let i = 0; i < reqChildren.length; i++) {
                            xp += "@role='" + reqChildren[i] + "' or ";
                        }
                        xp = xp.substring(0, xp.length - 4) + ']';
                        let xpathResult = doc.evaluate(xp, ruleContext, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                        let r: Element = xpathResult.iterateNext() as Element;
                        while (r && !passed) {
                            // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                            // or not.
                            //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                            //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                            //     add it to the roleToElems hash at all or even do any checking for it at all.
                            //
                            // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                            //       so on and so forth.
                            if (RPTUtil.shouldNodeBeSkippedHidden(r)) {
                                r = xpathResult.iterateNext() as Element;
                                continue;
                            }

                            passed = RPTUtil.tabIndexLEZero(r);
                            if (!passed) passed = RPTUtil.isfocusableByDefault(r);

                            // Required child is not focusable via tabindex.  See if there is a grandchild that is focusable by default or by tabindex.
                            if (!passed) {
                                let xp2 = "descendant::*";
                                let xpathResult2 = doc.evaluate(xp2, r, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                                let r2 = xpathResult2.iterateNext();
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
                                        r2 = xpathResult2.iterateNext();
                                        continue;
                                    }
                                    passed = RPTUtil.tabIndexLEZero(r2);
                                    if (!passed) passed = RPTUtil.isfocusableByDefault(r2);
                                    r2 = xpathResult2.iterateNext();
                                }
                            }

                            if (!passed) {
                                roleNameArr = r.getAttribute("role").trim().split(" ");
                                nodeName = r.nodeName.toLowerCase();
                            }
                            r = xpathResult.iterateNext() as Element;
                        }
                    }
                }
            }
        }

        // Variable Decleration
        let retToken1 = new Array();
        let retToken2 = new Array();

        // In the case the arrays/strings are empty, that means that there is no violation so we can reset it back to passed, the reason for this
        // is that we are setting passed=false while we perform a loop which causes violation to trigger even if there is no issues. Instead of
        // updating the whole rule to switch from using passed in that way simply do the check at this point.
        if (nodeName.length > 0 && roleNameArr.length > 0) {
            retToken1.push(nodeName);
            retToken2.push(roleNameArr.join(", "));
        } else {
            passed = true;
        }

        //return new ValidationResult(passed, [ruleContext], 'role', '', passed == true ? [] : [retToken1, retToken2]);
        if (!inScope) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
        } else {
            return RulePass("Pass_0");
        }
    }
}