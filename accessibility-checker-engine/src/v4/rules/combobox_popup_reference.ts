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
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { CacheUtil } from "../util/CacheUtil";
import { VisUtil } from "../util/VisUtil";

export const combobox_popup_reference: Rule = {
    id: "combobox_popup_reference",
    context: "aria:combobox",
    dependencies: ["combobox_design_valid"],
    help: {
        "en-US": {
            "group": "combobox_popup_reference.html",
            "Pass_1.0_expanded": "combobox_popup_reference.html",
            "Pass_1.0_collapsed": "combobox_popup_reference.html",
            "Pass_1.2_expanded": "combobox_popup_reference.html",
            "Pass_1.2_collapsed": "combobox_popup_reference.html",
            "Fail_1.0_missing_owns": "combobox_popup_reference.html",
            "Fail_1.2_missing_controls": "combobox_popup_reference.html",
            "Fail_1.0_popup_reference_missing": "combobox_popup_reference.html",
            "Fail_1.2_popup_reference_missing": "combobox_popup_reference.html",
            "Fail_combobox_expanded_hidden": "combobox_popup_reference.html",
            "Fail_combobox_collapsed_visible": "combobox_popup_reference.html"
        }
    },
    messages: {
        "en-US": {
            "group": "The 'aria-controls' (for ARIA 1.2) or the 'aria-owns' (for ARIA 1.0) attribute of the expanded combobox must reference a valid popup 'id' value",
            "Pass_1.0_expanded": "The combobox popup referenced by 'aria-owns' (ARIA 1.0) exists and is visible",
            "Pass_1.0_collapsed": "The combobox popup in its collapsed state does not reference any visible popup as required",
            "Pass_1.2_expanded": "The combobox popup referenced by 'aria-controls' (ARIA 1.2) exists and is visible",
            "Pass_1.2_collapsed": "The combobox popup in its collapsed state does not reference any visible popup as required",
            "Fail_1.0_missing_owns": "The 'aria-owns' attribute of the expanded combobox is missing",
            "Fail_1.2_missing_controls": "The 'aria-controls' attribute of the expanded combobox is missing",
            "Fail_1.0_popup_reference_missing": "The 'aria-owns' attribute \"{0}\" of the expanded combobox does not reference a valid popup 'id' value",
            "Fail_1.2_popup_reference_missing": "The 'aria-controls' attribute \"{0}\" of the expanded combobox does not reference a valid popup 'id' value",
            "Fail_combobox_expanded_hidden": "The combobox 'aria-expanded' attribute is true, but the combobox popup is not visible",
            "Fail_combobox_collapsed_visible": "The combobox 'aria-expanded' attribute is false, but the combobox popup is visible"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [{
        "4e8ab6": {
            "Pass_1.0_expanded": "fail",
            "Pass_1.0_collapsed": "fail",
            "Pass_1.2_expanded": "pass",
            "Pass_1.2_collapsed": "pass",
            "Fail_1.0_missing_owns": "inapplicable",
            "Fail_1.2_missing_controls": "fail",
            "Fail_1.0_popup_reference_missing": "inapplicable",
            "Fail_1.2_popup_reference_missing": "fail",
            "Fail_combobox_expanded_hidden": "inapplicable",
            "Fail_combobox_collapsed_visible": "inapplicable"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        const cache = CacheUtil.getCache(ruleContext.ownerDocument, "combobox", {});
        if (!cache) return null;
        const cacheKey = context["dom"].rolePath;
        const cachedElem = cache[cacheKey];
        if (!cachedElem) return null;
        const { pattern, expanded } = cachedElem;

        let popupId;
        let popupElement;
        if (pattern === "1.0") {
            if (!ruleContext.hasAttribute("aria-owns")) {
                // If the combobox isn't expanded, this attribute isn't required
                return !expanded ? null : RuleFail("Fail_1.0_missing_owns");
            }
            popupId = ruleContext.getAttribute("aria-owns");
            popupElement = FragmentUtil.getById(ruleContext, popupId);
            if (!popupElement) {
                // If the combobox isn't expanded, this attribute isn't required
                return !expanded ? null : RuleFail("Fail_1.0_popup_reference_missing", [popupId]);
            }
        } else if (pattern === "1.2") {
            if (!ruleContext.hasAttribute("aria-controls")) {
                // If the combobox isn't expanded, this attribute isn't required
                return !expanded ? null : RuleFail("Fail_1.2_missing_controls");
            }
            popupId = ruleContext.getAttribute("aria-controls");
            popupElement = FragmentUtil.getById(ruleContext, popupId);
            if (!popupElement) {
                // If the combobox isn't expanded, this attribute isn't required
                return !expanded ? null : RuleFail("Fail_1.2_popup_reference_missing", [popupId]);
            }
        } else {
            return null;
        }

        // We have an element, stick it in the cache and then check its role
        cachedElem.popupId = popupId;
        cachedElem.popupElement = popupElement;


        if (expanded && !VisUtil.isNodeVisible(popupElement)) {
            return RuleFail("Fail_combobox_expanded_hidden");
        } else if (!expanded && VisUtil.isNodeVisible(popupElement)) {
            return RuleFail("Fail_combobox_collapsed_visible");
        }

        if (pattern === "1.0") {
            if (expanded) {
                return RulePass("Pass_1.0_expanded");
            } else {
                return RulePass("Pass_1.0_collapsed");
            }
        } else {
            if (expanded) {
                return RulePass("Pass_1.2_expanded");
            } else {
                return RulePass("Pass_1.2_collapsed");
            }
        }
    }
}