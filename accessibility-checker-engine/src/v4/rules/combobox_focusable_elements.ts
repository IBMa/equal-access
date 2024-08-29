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
import { NodeWalker, RPTUtil } from "../util/AriaUtil";
import { getCache } from "../util/CacheUtil";
import { VisUtil } from "../util/VisUtil";

export let combobox_focusable_elements: Rule = {
    id: "combobox_focusable_elements",
    context: "aria:combobox",
    dependencies: ["combobox_popup_reference"],
    help: {
        "en-US": {
            "Pass": "combobox_focusable_elements.html",
            "Fail_not_tabbable": "combobox_focusable_elements.html",
            "Fail_tabbable_child": "combobox_focusable_elements.html",
            "group": "combobox_focusable_elements.html"
        }
    },
    messages: {
        "en-US": {
            "Pass": "DOM focus is allowed only on the combobox element as required",
            "Fail_not_tabbable": "The combobox element does not allow DOM focus as required",
            "Fail_tabbable_child": "The popup of the combobox has DOM focus or has 'aria-activedescendant' defined, which is not allowed",
            "group": "Tabbable focus for the combobox must be allowed only on the text input, except when using a dialog popup"
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
        let cache = getCache(ruleContext.ownerDocument, "combobox", {});
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
        if (popupElement  && VisUtil.isNodeVisible(popupElement)) {
            // if popupElement itself has "aria-activedescendant"
            passed = !RPTUtil.isTabbable(popupElement) && !RPTUtil.getAriaAttribute(popupElement, "aria-activedescendant");;
            // if any child of popupElement has "aria-autocomplete"
            if (passed && popupElement.children && popupElement.children.length > 0) {
                let nw = new NodeWalker(popupElement);
                while (passed && nw.nextNode()) {
                    if (nw.node.nodeType === 1 && VisUtil.isNodeVisible(nw.node)) {
                        passed = !RPTUtil.isTabbable(nw.node) &&
                            !RPTUtil.getAriaAttribute(nw.node, "aria-activedescendant");
                        if (nw.bEndTag && nw.node === popupElement.lastElementChild) break;    
                    }
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
}