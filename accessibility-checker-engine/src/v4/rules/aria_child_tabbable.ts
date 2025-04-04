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

import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { VisUtil } from "../util/VisUtil";

export const aria_child_tabbable: Rule = {
    id: "aria_child_tabbable",
    context: "dom:*[role]",
    dependencies: ["aria_role_allowed"],
    refactor: {
        "Rpt_Aria_MissingFocusableChild": {
            "pass": "pass",
            "fail_missing_child": "fail_missing_child"}
    },
    help: {
        "en-US": {
            "pass": "aria_child_tabbable.html",
            "fail_missing_child": "aria_child_tabbable.html",
            "group": "aria_child_tabbable.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "fail_missing_child": "None of the descendent elements with \"{1}\" role is tabbable",
            "group": "UI component must have at least one tabbable descendant for keyboard access"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;

        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || CommonUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip the check if the element requires presentational children only
        if (AriaUtil.containsPresentationalChildrenOnly(ruleContext) || AriaUtil.shouldBePresentationalChild(ruleContext))
            return;

        // An ARIA list is not interactive
        if (AriaUtil.hasRole(ruleContext, { "list": true, "row": true, "rowgroup": true, "table": true, "grid": true })) {
            return null;
        }

        // Not a valid message for mobile because all elements are focusable in iOS when VoiceOver is enabled.
        if (ruleContext.hasAttribute("class") && ruleContext.getAttribute("class").substring(0, 3) == "mbl") {
            return null;
        }

        //ignore datalist element check since it will be part of a input element or hidden by default
        if (ruleContext.nodeName.toLowerCase() === 'datalist')
            return null;

        // ignore if the element's navigation is controlled by another element, such as combobox
        if (AriaUtil.isNavigationOwnedOrControlled(ruleContext))
            return null;  

        let role = AriaUtil.getResolvedRole(ruleContext);
        let passed = true;
        let doc = ruleContext.ownerDocument;
        let hasAttribute = CommonUtil.hasAttribute;
        let roleNameArr = new Array();
        let nodeName = "";
        let inScope = false;

        if (ARIADefinitions.containers.includes(role)) {
            let disabled = hasAttribute(ruleContext, 'aria-disabled') ? ruleContext.getAttribute("aria-disabled") : '';
            if (disabled != 'true' && !hasAttribute(ruleContext, 'aria-activedescendant') && !CommonUtil.isTabbable(ruleContext)) {
                let reqChildren = ARIADefinitions.designPatterns[role].reqChildren;
                if (reqChildren) {
                    inScope = true;
                    passed = false;
                    let xp = "descendant::*[";
                    for (let i = 0; i < reqChildren.length; i++) {
                        xp += "@role='" + reqChildren[i] + "' or ";
                    }
                    xp = xp.substring(0, xp.length - 4) + ']';
                    let xpathResult = doc.evaluate(xp, ruleContext, CommonUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
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
                        if (CommonUtil.shouldNodeBeSkippedHidden(r)) {
                            r = xpathResult.iterateNext() as Element;
                            continue;
                        }

                        passed = CommonUtil.isTabbable(r);
                        
                        // Required child is not focusable via tabindex. See if there is a grandchild that is focusable by default or by tabindex.
                        if (!passed) {
                            let xp2 = "descendant::*";
                            let xpathResult2 = doc.evaluate(xp2, r, CommonUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
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
                                if (CommonUtil.shouldNodeBeSkippedHidden(r2)) {
                                    r2 = xpathResult2.iterateNext();
                                    continue;
                                }
                                passed = CommonUtil.isTabbable(r);
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
            return RuleFail("fail_missing_child", [retToken1.toString(), retToken2.toString()]);
        } else {
            return RulePass("pass");
        }
    }
}