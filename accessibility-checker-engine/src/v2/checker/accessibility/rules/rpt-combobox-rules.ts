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

function patternDetect(elem: Element) : String {
    // check 'explicit' role combobox and that it is not <select>. 
    if (elem.tagName.toLowerCase() === "select" && elem.getAttribute("role") !== "combobox") {
        return "implicit";
    } else if (elem.nodeName.toLowerCase() === "input" 
        && (!elem.hasAttribute("type") || elem.getAttribute("type") === "text")
        && elem.hasAttribute("aria-owns") && !elem.hasAttribute("aria-controls")) 
    {
        // Looks like this is an ARIA 1.0 pattern, which the ARIA 1.2 spec says to continue to allow
        return "1.0";
    } else if (elem.nodeName.toLowerCase() !== "input" 
        && elem.hasAttribute("aria-owns") && !elem.hasAttribute("aria-controls")) 
    {
        // Looks like this is an ARIA 1.1 pattern, which the ARIA 1.2 spec says is now invalid
        return "1.1";
    }
    // Assume they're trying to do the latest, 1.2 pattern
    return "1.2";
}

let a11yRulesCombobox: Rule[] = [
    /**
     * Description: This rule fails if a 1.1 pattern is detected,
     * but more importantly identifies elements important for 1.0
     * and 1.2 specific checking
     * 
     * ARIA 1.2 introdues a non-editable combobox, but also allows a 1.0 combobox
     * Origin:  WAI-ARIA 1.2
     *          https://www.w3.org/TR/wai-aria-1.2/#combobox
     */
    {
        id: "combobox_version",
        context: "aria:combobox",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (!RPTUtil.isNodeVisible(ruleContext) || RPTUtil.isNodeDisabled(ruleContext)) {
                return null;
            }
            let pattern = patternDetect(ruleContext);

            // We don't assess native select elements here
            if (pattern === "implicit") {
                return null;
            }

            let tagName = ruleContext.tagName.toLowerCase();
            let expanded = RPTUtil.getAriaAttribute(ruleContext, "aria-expanded").trim().toLowerCase() === "true";
            let editable = tagName === "input" && (!ruleContext.hasAttribute("type") || ruleContext.getAttribute("type").toLowerCase() === "text");

            let key = context["dom"].rolePath;
            if (key) {
                let cache = RPTUtil.getCache(ruleContext.ownerDocument, "combobox", {});
                cache[key] = {
                    "inputElement": editable ? ruleContext : null,
                    "pattern": pattern,
                    "expanded": expanded
                };
                RPTUtil.setCache(ruleContext.ownerDocument, "combobox", cache);
            } else {
                // No xpath?
                return null;
            }
            
            if (pattern === "1.0") {
                return RulePass("Pass_1.0");
            } else if (pattern === "1.1") {
                return RuleFail("Fail_1.1");
            } else if (pattern === "1.2") {
                return RulePass("Pass_1.2");
            }
        }
    },
    /**
     * Description: This rule fails if the popup of the combobox cannot be detected
     *
     * Note: combobox requires the id, and it must reference an appropriate element
     * The popup might be empty, but it has to exist in the DOM
     * 
     * Origin:  WAI-ARIA 1.2
     *          https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-6
     */
    {
        id: "combobox_popup_reference",
        context: "aria:combobox",
        dependencies: ["combobox_version"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            const cache = RPTUtil.getCache(ruleContext.ownerDocument, "combobox", {});
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
                popupElement = ruleContext.ownerDocument.getElementById(popupId);
                if (!popupElement) {
                    // If the combobox isn't expanded, this attribute isn't required
                    return !expanded ? null : RuleFail("Fail_1.0_popup_reference_missing", [popupId]);
                }
            } else if (pattern === "1.2") {
                if (!ruleContext.hasAttribute("aria-controls")) {
                    // If the combobox isn't expanded, this attribute isn't required
                    return !expanded ? null: RuleFail("Fail_1.2_missing_controls");
                }
                popupId = ruleContext.getAttribute("aria-controls");
                popupElement = ruleContext.ownerDocument.getElementById(popupId);
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


            if (expanded && !RPTUtil.isNodeVisible(popupElement)) {
                return RuleFail("Fail_combobox_expanded_hidden");
            } else if (!expanded && RPTUtil.isNodeVisible(popupElement)) {
                return RuleFail("Fail_combobox_collapsed_visible");
            }

            return RulePass(expanded ? "Pass_expanded" : "Pass_collapsed");
        }
    },
    {
        /**
         * Origin:  WAI-ARIA 1.2
         *          https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-6
         */
        id: "combobox_haspopup",
        context: "aria:combobox",
        dependencies: ["combobox_popup_reference"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            const cache = RPTUtil.getCache(ruleContext.ownerDocument, "combobox", {});
            const cacheKey = context["dom"].rolePath;
            const cachedElem = cache[cacheKey];
            if (!cachedElem) return null;
            const { popupElement, popupId } = cachedElem;
            // If this isn't defined, the combobox is probably collapsed. A reference error is
            // detected in combobox_popup_reference
            if (!popupElement) return null;
            // Check that popup role is listbox, grid, tree, or dialog and that it matches the combobox
            let popupRoles = RPTUtil.getRoles(popupElement, true);
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
    },
    {
        /**
         * Description: For a 'combobox', only the textbox should receive DOM focus. 
         * Focus of the listbox should be managed via aria-activedescendant on the textbox.
         * If any element other than the textbox within the combobox or aria-owned element has a tabindex >= 0 or aria-activedescendant, FAIL
         * Origin:  WAI-ARIA 1.2
         *          https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-6
         */
        id: "combobox_focusable_elements",
        context: "aria:combobox",
        dependencies: ["combobox_popup_reference"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let cache = RPTUtil.getCache(ruleContext.ownerDocument, "combobox", {});
            let cachedElem = cache[context["dom"].rolePath];
            if (!cachedElem) return null;
            const { popupElement, expanded } = cachedElem;
            // If this isn't defined, the combobox is probably collapsed. A reference error is
            // detected in combobox_popup_reference
            if (!popupElement) return null;

            const popupRole = RPTUtil.getRoles(popupElement, true)[0];

            let retVal = []
            if (!RPTUtil.isTabbable(ruleContext)) {
                retVal.push(RuleFail("Fail_not_tabbable"));
            }

            // Only makes sense to check the popup when expanded
            // this does not apply to dialogs, return pass since the main element was focusable above
            if (expanded === false || popupRole === "dialog") {
                return RulePass("Pass");
            }

            let passed = true;

            // examine the children
            if (popupElement) {
                let nw = new NodeWalker(popupElement);
                while (passed && nw.nextNode() && nw.node != popupElement && nw.node != popupElement.nextSibling) {
                    if (nw.node.nodeType === 1 && RPTUtil.isNodeVisible(nw.node)) {
                        passed = !RPTUtil.isTabbable(nw.node) &&
                            !RPTUtil.getAriaAttribute(nw.node, "aria-activedescendant");
                    }
                }
            }

            if (!passed) {
                retVal.push(RuleFail("Fail_tabbable_child"));
            }
            
            if (retVal.length === 0) {
                return RulePass("Pass");
            } else {
                return retVal;
            }
        }
    },
    {
        /**
         * Description: For a 'combobox', only the textbox should receive DOM focus. 
         * Focus of the listbox should be managed via aria-activedescendant on the textbox.
         * If any element other than the textbox within the combobox or aria-owned element has a tabindex >= 0 or aria-activedescendant, FAIL
         * Origin:  WAI-ARIA 1.2
         *          https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-6
         */
        id: "combobox_active_descendant",
        context: "aria:combobox",
        dependencies: ["combobox_popup_reference"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let cache = RPTUtil.getCache(ruleContext.ownerDocument, "combobox", {});
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

            let activeElem = ruleContext.ownerDocument.getElementById(activeId);
            if (!activeElem) {
                return RuleFail("Fail_missing", [activeId]);
            }

            let found = false;

            // examine the children
            if (popupElement) {
                let nw = new NodeWalker(popupElement);
                while (!found && nw.nextNode() && nw.node != popupElement && nw.node != popupElement.nextSibling) {
                    if (nw.node.nodeType === 1 && RPTUtil.isNodeVisible(nw.node)) {
                        found = nw.node.getAttribute("id") === activeId;
                    }
                }
            }

            let retVal = [];

            if (!found) {
                retVal.push(RulePass("Fail_not_in_popup", [activeId, popupId]));
            }

            let activeRoles = RPTUtil.getRoles(activeElem, true);
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
    },
    {
        /**
         * Description: In a 'combobox', the 'aria-autocomplete' property should only be set on the text input. 
         * Look a the listbox and other elements (other than the textbox) and FAIL if autocomplete found.
         * Origin:  WAI-ARIA 1.2
         * 			https://www.w3.org/TR/wai-aria-1.2/#combobox
         */
        id: "combobox_autocomplete",
        context: "aria:combobox",
        dependencies: ["combobox_popup_reference"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let cache = RPTUtil.getCache(ruleContext.ownerDocument, "combobox", {});
            let cachedElem = cache[context["dom"].rolePath];
            if (!cachedElem) return null;
            const { popupId, popupElement } = cachedElem;

            let retVal = [];
            if (ruleContext.getAttribute("aria-autocomplete") === "inline") {
                retVal.push(RuleFail("Fail_inline"));
            }

            let passed = true;

            // examine the children
            if (popupElement) {
                let nw = new NodeWalker(popupElement);
                while (passed && nw.nextNode() && nw.node != popupElement && nw.node != popupElement.nextSibling) {
                    if (nw.node.nodeType === 1 && RPTUtil.isNodeVisible(nw.node)) {
                        passed = !nw.node.hasAttribute("aria-autocomplete");
                    }
                }
            }

            if (!passed) {
                retVal.push(RuleFail("Fail_1", [popupId]));
            }

            if (retVal.length > 0) {
                return retVal;
            } else {
                return RulePass("Pass");
            }
        }
    }
    // end of rules
]

export { a11yRulesCombobox }