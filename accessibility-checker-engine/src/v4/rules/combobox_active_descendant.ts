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
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { CacheUtil } from "../util/CacheUtil";
import { VisUtil } from "../util/VisUtil";

export const combobox_active_descendant: Rule = {
    id: "combobox_active_descendant",
    context: "aria:combobox",
    dependencies: ["combobox_popup_reference"],
    help: {
        "en-US": {
            "Pass": "combobox_active_descendant.html",
            "Fail_missing": "combobox_active_descendant.html",
            "Fail_not_in_popup": "combobox_active_descendant.html",
            "Fail_active_role_invalid": "combobox_active_descendant.html",
            "Fail_active_not_selected": "combobox_active_descendant.html",
            "group": "combobox_active_descendant.html"
        }
    },
    messages: {
        "en-US": {
            "Pass": "'aria-activedescendant' is used appropriately for this combobox",
            "Fail_missing": "The element referenced by 'aria-activedescendant' \"{0}\" does not exist",
            "Fail_not_in_popup": "The element referenced by 'aria-activedescendant' \"{0}\" does not exist within the popup referenced by 'id' \"{1}\"",
            "Fail_active_role_invalid": "The 'aria-activedescendant' \"{0}\" references an element with the roles \"{1}\", which does not have a valid ARIA role of 'option', 'gridcell', 'row', or 'treeitem'",
            "Fail_active_not_selected": "The 'aria-activedescendant' \"{0}\" references an element that does not have 'aria-selected' set to true",
            "group": "'aria-activedescendant' must be used to define focus within the combobox popup, except when using a dialog popup"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let cache = CacheUtil.getCache(ruleContext.ownerDocument, "combobox", {});
        let cachedElem = cache[context["dom"].rolePath];
        if (!cachedElem) return null;
        const { popupElement, popupId } = cachedElem;
        // If this isn't defined, the combobox is probably collapsed. A reference error is
        // detected in combobox_popup_reference
        if (!popupElement) return null;

        // This rule only applies if the activedescendant is specified
        let activeId = ruleContext.getAttribute("aria-activedescendant");
        if (!activeId || activeId.trim().length === 0) {
            return null;
        }

        let activeElem = FragmentUtil.getById(ruleContext, activeId);
        if (!activeElem) {
            return RuleFail("Fail_missing", [activeId]);
        }

        let found = false;

        // examine the children
        if (popupElement) {
            let nw = new NodeWalker(popupElement);
            while (!found && nw.nextNode() && nw.node != popupElement && nw.node != popupElement.nextSibling) {
                if (nw.node.nodeType === 1 && VisUtil.isNodeVisible(nw.node)) {
                    found = nw.elem().getAttribute("id") === activeId;
                }
            }
        }

        let retVal = [];

        if (!found) {
            retVal.push(RulePass("Fail_not_in_popup", [activeId, popupId]));
        }

        let activeRoles = AriaUtil.getRoles(activeElem, true);
        let validRoles = ["option", "gridcell", "row", "treeitem"].filter((validRole) => activeRoles.includes(validRole));
        if (validRoles.length === 0) {
            retVal.push(RuleFail("Fail_active_role_invalid", [activeId, activeRoles.join(",")]));
        }

        if (activeElem.getAttribute("aria-selected") !== "true") {
            retVal.push(RuleFail("Fail_active_not_selected", [activeId]));
        }

        if (retVal.length === 0) {
            return RulePass("Pass");
        } else {
            return retVal;
        }
    }
}