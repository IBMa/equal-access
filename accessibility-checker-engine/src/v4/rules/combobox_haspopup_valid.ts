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
import { CacheUtil } from "../util/CacheUtil";

export const combobox_haspopup_valid: Rule = {
    id: "combobox_haspopup_valid",
    context: "aria:combobox",
    dependencies: ["combobox_popup_reference"],
    refactor: {
        "combobox_haspopup": {
            "Pass": "Pass",
            "Fail_popup_role_invalid": "Fail_popup_role_invalid",
            "Fail_combobox_popup_role_mismatch": "Fail_combobox_popup_role_mismatch"}
    },
    help: {
        "en-US": {
            "Pass": "combobox_haspopup_valid.html",
            "Fail_popup_role_invalid": "combobox_haspopup_valid.html",
            "Fail_combobox_popup_role_mismatch": "combobox_haspopup_valid.html",
            "group": "combobox_haspopup_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass": "The 'aria-controls' (ARIA 1.2) or 'aria-owns' (ARIA 1.0) appropriately references a valid popup 'id' value",
            "Fail_popup_role_invalid": "The 'role' value \"{0}\" of the popup element \"{1}\" should be one of \"listbox\", \"grid\", \"tree\" or \"dialog\"",
            "Fail_combobox_popup_role_mismatch": "The value of the combobox 'aria-haspopup' attribute \"{0}\" does not match the 'role' value of the popup element \"{1}\"",
            "group": "The combobox attribute 'aria-haspopup' value must be appropriate for the role of the element referenced by 'aria-controls' (ARIA 1.2) or 'aria-owns' (ARIA 1.0)"
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
        const cache = CacheUtil.getCache(ruleContext.ownerDocument, "combobox", {});
        if (!cache) return null;
        const cacheKey = context["dom"].rolePath;
        const cachedElem = cache[cacheKey];
        if (!cachedElem) return null;
        const { popupElement, popupId } = cachedElem;
        // If this isn't defined, the combobox is probably collapsed. A reference error is
        // detected in combobox_popup_reference
        if (!popupElement) return null;
        // Check that popup role is listbox, grid, tree, or dialog and that it matches the combobox
        let popupRoles = AriaUtil.getRoles(popupElement, true);
        let validRoles = ["listbox", "grid", "tree", "dialog"].filter((validRole) => popupRoles.includes(validRole));
        if (validRoles.length === 0) {
            return RuleFail("Fail_popup_role_invalid", [popupRoles.join(","), popupId]);
        } else {
            let popupRole = validRoles[0];
            let haspopupVal = ruleContext.getAttribute("aria-haspopup") || "listbox";
            // Popup role must match aria-haspopup unless popupRole is listbox, then aria-haspopup should not be defined                
            if (haspopupVal !== popupRole) {
                if (popupRole !== "listbox" || ruleContext.hasAttribute("aria-haspopup")) {
                    return RuleFail("Fail_combobox_popup_role_mismatch", [haspopupVal, popupRole]);
                }
            }
        }
        return RulePass("Pass");
    }
}