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

let a11yRulesCombobox: Rule[] = [
    {
        /**
         * Description: Element with role='combobox' must contain single-line text input
         * Origin:  WAI-ARIA 1.1
         * 			https://www.w3.org/TR/wai-aria-1.1/#combobox
         */
        id: "HAAC_Combobox_Must_Have_Text_Input",
        context: "aria:combobox",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (!RPTUtil.isNodeVisible(ruleContext) || RPTUtil.isNodeDisabled(ruleContext)) {
                return null;
            }
            let tagName = ruleContext.tagName.toLowerCase();

            let pattern = ruleContext.nodeName.toLowerCase() === "input" ? "1.0" : "1.1";
            let expanded = RPTUtil.getAriaAttribute(ruleContext, "aria-expanded").trim().toLowerCase() === "true";
            let passed = true;
            let textEle = null;
            if (pattern === "1.0") {
                passed = RPTUtil.getAriaAttribute(ruleContext, "aria-multiline").trim().toLowerCase() === "false";
                textEle = ruleContext;
            } else {
                passed = false;
                // examine the children
                let nw = new NodeWalker(ruleContext);
                while (!passed && nw.nextNode() && nw.node != ruleContext && nw.node != ruleContext.nextSibling) {
                    if (nw.node.nodeType === 1 && RPTUtil.isNodeVisible(nw.node) && !RPTUtil.isNodeDisabled(nw.node)) {
                        passed = (RPTUtil.hasRoleInSemantics(nw.node, "textbox") ||
                            RPTUtil.hasRoleInSemantics(nw.node, "searchbox")) &&
                            RPTUtil.getAriaAttribute(nw.node, "aria-multiline").trim().toLowerCase() === "false";
                        textEle = nw.node;
                    }
                }
                // look for the "owns"
                if (!passed) {
                    let aria_owns = RPTUtil.getElementAttribute(ruleContext, "aria-owns");
                    if (aria_owns) {
                        let owns = RPTUtil.normalizeSpacing(aria_owns.trim()).split(" ");
                        for (let i = 0; !passed && i < owns.length; i++) {
                            let owned = ruleContext.ownerDocument.getElementById(owns[i]);
                            if (owned && RPTUtil.isNodeVisible(owned) && !RPTUtil.isNodeDisabled(owned)) {
                                passed = (RPTUtil.hasRoleInSemantics(owned, "textbox") ||
                                    RPTUtil.hasRoleInSemantics(owned, "searchbox")) &&
                                    RPTUtil.getAriaAttribute(owned, "aria-multiline").trim().toLowerCase() === "false";
                                textEle = owned;
                            }
                        }
                    }
                }
            }
            if (passed) {
                let key = context["dom"].rolePath;
                if (key) {
                    let cache = RPTUtil.getCache(ruleContext.ownerDocument, "HAAC_Combobox_Must_Have_Text_Input", {});
                    cache[key] = {
                        "inputText": textEle,
                        "pattern": pattern,
                        "expanded": expanded
                    };
                    RPTUtil.setCache(ruleContext.ownerDocument, "HAAC_Combobox_Must_Have_Text_Input", cache);
                }
            }

            // check 'explicit' role combobox and that it is not <select>. 
            // Run this check after the cache was saved since other rules may need it(g1196,1197)
            if (!RPTUtil.hasRole(ruleContext, "combobox", false) || tagName === "select") {
                return null;
            }

            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: For a 'combobox', only the textbox should receive DOM focus. 
         * Focus of the listbox should be managed via aria-activedescendant on the textbox.
         * If any element other than the textbox within the combobox or aria-owned element has a tabindex >= 0 or aria-activedescendant, FAIL
         * Origin:  WAI-ARIA 1.1
         * 			https://www.w3.org/TR/wai-aria-1.1/#combobox
         */
        id: "HAAC_Combobox_DOM_Focus",
        context: "aria:combobox",
        dependencies: ["HAAC_Combobox_Must_Have_Text_Input"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let tagName = ruleContext.tagName.toLowerCase();
            // check 'explicit' role combobox and that it is not <select>
            if (!RPTUtil.hasRole(ruleContext, "combobox", false) || tagName === "select") {
                return null;
            }

            let cache = RPTUtil.getCache(ruleContext.ownerDocument, "HAAC_Combobox_Must_Have_Text_Input", {});
            let cachedElem = cache[context["dom"].rolePath];
            if (!cachedElem) return null;
            let textInput = cachedElem.inputText;
            let pattern = cachedElem.pattern;
            let passed = true;

            if (pattern === "1.1") {
                //examine the container
                passed = !(RPTUtil.isTabbable(ruleContext) || RPTUtil.getAriaAttribute(ruleContext, "aria-activedescendant"));
            }

            // examine the children
            if (ruleContext.firstChild) {
                let nw = new NodeWalker(ruleContext);
                while (passed && nw.nextNode() && nw.node != ruleContext && nw.node != ruleContext.nextSibling) {
                    if (nw.node.nodeType === 1 && RPTUtil.isNodeVisible(nw.node)) {
                        if (nw.node !== textInput) {
                            passed = !RPTUtil.isTabbable(nw.node) &&
                                !RPTUtil.getAriaAttribute(nw.node, "aria-activedescendant");
                        }
                    }
                }
            }

            if (passed) {
                // examine the owned elements
                let ariaOwnsAttr = RPTUtil.getAriaAttribute(ruleContext, "aria-owns");
                if (ariaOwnsAttr) {
                    let ownedIds = RPTUtil.normalizeSpacing(ariaOwnsAttr.trim()).split(" ");

                    for (let j = 0; passed && j < ownedIds.length; j++) {
                        let child_list = ruleContext.ownerDocument.getElementById(ownedIds[j]);
                        if (child_list && RPTUtil.isNodeVisible(child_list) && child_list !== textInput) {
                            passed = !RPTUtil.isTabbable(child_list) &&
                                !RPTUtil.getAriaAttribute(child_list, "aria-activedescendant");
                        }
                        if (passed && child_list && child_list.firstChild) {
                            let nwl = new NodeWalker(child_list);
                            while (passed && nwl.nextNode() && nwl.node != child_list.nextSibling) {
                                if (nwl.node.nodeType === 1 && RPTUtil.isNodeVisible(nwl.node)) {
                                    if (nwl.node !== textInput) {
                                        passed = !RPTUtil.isTabbable(nwl.node) &&
                                            !RPTUtil.getAriaAttribute(nwl.node, "aria-activedescendant");
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: In a 'combobox', the 'aria-autocomplete' property should only be set on the text input. 
         * Look a the listbox and other elements (other than the textbox) and FAIL if autocomplete found.
         * Origin:  WAI-ARIA 1.1
         * 			https://www.w3.org/TR/wai-aria-1.1/#combobox
         */
        id: "HAAC_Combobox_Autocomplete",
        context: "aria:combobox",
        dependencies: ["HAAC_Combobox_Must_Have_Text_Input"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let tagName = ruleContext.tagName.toLowerCase();
            // check 'explicit' role combobox and that it is not <select>
            if (!RPTUtil.hasRole(ruleContext, "combobox", false) || tagName === "select") {
                return null;
            }

            let cache = RPTUtil.getCache(ruleContext.ownerDocument, "HAAC_Combobox_Must_Have_Text_Input", {});
            let cachedElem = cache[context["dom"].rolePath];
            if (!cachedElem) return null;
            let textInput = cachedElem.inputText;
            let pattern = cachedElem.pattern;
            let passed = true;

            if (pattern === "1.1") {
                //examine the container
                passed = !ruleContext.hasAttribute("aria-autocomplete");
            }

            // examine the children
            if (ruleContext.firstChild) {
                let nw = new NodeWalker(ruleContext);
                while (passed && nw.nextNode() && nw.node != ruleContext && nw.node != ruleContext.nextSibling) {
                    if (nw.node.nodeType === 1 && RPTUtil.isNodeVisible(nw.node)) {
                        if (nw.node !== textInput) {
                            passed = !nw.node.hasAttribute("aria-autocomplete");
                        }
                    }
                }
            }

            if (passed) {
                //examine the owned elements
                let ariaOwnsAttr = RPTUtil.getAriaAttribute(ruleContext, "aria-owns");
                if (ariaOwnsAttr) {
                    let ownedIds = RPTUtil.normalizeSpacing(ariaOwnsAttr.trim()).split(" ");
                    for (let j = 0; passed && j < ownedIds.length; j++) {
                        let child_list = ruleContext.ownerDocument.getElementById(ownedIds[j]);
                        if (child_list && RPTUtil.isNodeVisible(child_list) && child_list !== textInput) {
                            passed = !child_list.hasAttribute("aria-autocomplete");
                        }
                        if (passed && child_list && child_list.firstChild) {
                            let nwl = new NodeWalker(child_list);
                            while (passed && nwl.nextNode() && nwl.node != child_list.nextSibling) {
                                if (nwl.node.nodeType === 1 && RPTUtil.isNodeVisible(nwl.node)) {
                                    if (nwl.node !== textInput) {
                                        passed = !nwl.node.hasAttribute("aria-autocomplete");
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: "aria-autocomplete value 'inline' is not supported on combobox"
         * If aria-autocomplete is used, it should be an attribute of the text input and should not be 'inline'"
         * Origin:  WAI-ARIA 1.1
         * 			https://www.w3.org/TR/wai-aria-1.1/#combobox
         */
        id: "HAAC_Combobox_Autocomplete_Invalid",
        context: "aria:combobox",
        dependencies: ["HAAC_Combobox_Must_Have_Text_Input"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let tagName = ruleContext.tagName.toLowerCase();
            // check 'explicit' role combobox and that it is not <select>
            if (tagName === "select") {
                return null;
            }

            let cache = RPTUtil.getCache(ruleContext.ownerDocument, "HAAC_Combobox_Must_Have_Text_Input", {});
            let cachedElem = cache[context["dom"].rolePath];
            if (!cachedElem) return null;
            let textInput = cachedElem.inputText;
            let autocompleteAttr = RPTUtil.getAriaAttribute(textInput, "aria-autocomplete");
            let passed = true;
            if (autocompleteAttr && autocompleteAttr.trim().toLowerCase() === "inline") {
                passed = false;
            }

            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: when the combobox popup is visible, check that aria-owns/controls in the input text refers to a popup element.
         *  When the combobox popup is visible then:
         *      if old combobox pattern then the textbox element has 'aria-owns' set to a value that refers to a 'listbox'.
         *      if new combobox pattern then the textbox element has 'aria-controls' set to a value that refers to a combobox popup element.
         * Origin:  WAI-ARIA 1.1
         * 			https://www.w3.org/TR/wai-aria-1.1/#combobox
         */
        id: "HAAC_Combobox_Expanded",
        context: "aria:combobox",
        dependencies: ["HAAC_Combobox_Must_Have_Text_Input"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let tagName = ruleContext.tagName.toLowerCase();
            // check 'explicit' role combobox and that it is not <select>
            if (!RPTUtil.hasRole(ruleContext, "combobox", false) || tagName === "select") {
                return null;
            }

            let cache = RPTUtil.getCache(ruleContext.ownerDocument, "HAAC_Combobox_Must_Have_Text_Input", {});
            let cachedElem = cache[context["dom"].rolePath];
            if (!cachedElem) return null;
            let textInput = cachedElem.inputText;
            let pattern = cachedElem.pattern;
            let isExpanded = cachedElem.expanded;
            if (isExpanded) {
                let passed = false;
                if (pattern === "1.0") {
                    // old 1.0 combobox pattern
                    let aria_owns = RPTUtil.getElementAttribute(textInput, "aria-owns");
                    if (aria_owns) {
                        let owns = RPTUtil.normalizeSpacing(aria_owns.trim()).split(" ");
                        for (let i = 0; !passed && i < owns.length; i++) {
                            let owned = ruleContext.ownerDocument.getElementById(owns[i]);
                            if (owned) {
                                passed = RPTUtil.hasRoleInSemantics(owned, "listbox") && RPTUtil.isNodeVisible(owned);
                                if (passed) {
                                    cachedElem["popupRole"] = "listbox";
                                }
                            }
                        }
                    }
                } else {
                    // new 1.1 combobox pattern
                    let aria_controls = RPTUtil.getElementAttribute(textInput, "aria-controls");
                    if (aria_controls) {
                        let controls = RPTUtil.normalizeSpacing(aria_controls.trim()).split(" ");
                        for (let i = 0; !passed && i < controls.length; i++) {
                            let controlled = ruleContext.ownerDocument.getElementById(controls[i]);
                            if (controlled) {
                                let roles = ["listbox", "tree", "grid", "dialog"];
                                for (let j = 0; !passed && j < roles.length; j++) {
                                    if (RPTUtil.hasRoleInSemantics(controlled, roles[j]) && RPTUtil.isNodeVisible(controlled)) {
                                        // check that the list is a descendant of the combobox or is owned by the combobox
                                        if (RPTUtil.isDescendant(ruleContext, controlled)) {
                                            passed = true;
                                        } else {
                                            // check that the list is owned by the combobox
                                            var aria_owns = RPTUtil.getElementAttribute(ruleContext, "aria-owns");
                                            if (aria_owns) {
                                                var owns = RPTUtil.normalizeSpacing(aria_owns.trim()).split(" ");
                                                for (var k = 0; !passed && k < owns.length; k++) {
                                                    var owned = ruleContext.ownerDocument.getElementById(owns[k]);
                                                    if (owned === controlled) {
                                                        passed = true;
                                                    }
                                                }
                                            }
                                        }
                                        if (passed) {
                                            cachedElem["popupRole"] = roles[j];
                                        }

                                    }
                                }
                            }
                        }
                    }
                }
                if (!passed) {
                    return RuleFail("Fail_1");
                } else {
                    return RulePass("Pass_0");
                }
            } else {
                return null;
            }
        }
    },

    {
        /**
         * Description: For a 'combobox', 'aria-haspopup' must match the role of the combobox pop-up.
         * Origin:  WAI-ARIA 1.1
         * 			https://www.w3.org/TR/wai-aria-1.1/#combobox
         */
        id: "HAAC_Combobox_Popup",
        context: "aria:combobox",
        dependencies: ["HAAC_Combobox_Expanded"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let tagName = ruleContext.tagName.toLowerCase();
            // check 'explicit' role combobox and that it is not <select>
            if (!RPTUtil.hasRole(ruleContext, "combobox", false) || tagName === "select") {
                return null;
            }

            let cache = RPTUtil.getCache(ruleContext.ownerDocument, "HAAC_Combobox_Must_Have_Text_Input", {});
            let cachedElem = cache[context["dom"].rolePath];
            if (!cachedElem) return null;
            // let textInput = cachedElem.inputText;
            let pattern = cachedElem.pattern;
            let isExpanded = cachedElem.expanded;
            let popupRole = cachedElem.popupRole;

            let haspopupAttr = RPTUtil.getAriaAttribute(ruleContext, "aria-haspopup").trim().toLowerCase();

            if (isExpanded) {
                let passed = false;
                if (pattern === "1.0") {
                    // old 1.0 combobox pattern
                    passed = (haspopupAttr === "true" || haspopupAttr === popupRole);
                } else {
                    // new 1.1 combobox pattern
                    passed = haspopupAttr === popupRole;
                }
                if (!passed) {
                    return RuleFail("Fail_1");
                } else {
                    return RulePass("Pass_0");
                }
            } else {
                return null;
            }

        }
    },

    {
        /**
         * Description: Triggers if the element is a combobox
         * Origin:  WAI-ARIA 1.1
         * 			https://www.w3.org/TR/wai-aria-1.1/#combobox
         */
        id: "HAAC_Combobox_ARIA_11_Guideline",
        context: "dom:*[role], dom:input",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = true;
            if (RPTUtil.hasRoleInSemantics(ruleContext, "combobox") && RPTUtil.isNodeVisible(ruleContext)) {
                passed = false;
            }
            if (!passed) {
                return RuleManual("Manual_1");
            } else {
                return null;
            }
        }
    }

    // end of rules
]

export { a11yRulesCombobox }