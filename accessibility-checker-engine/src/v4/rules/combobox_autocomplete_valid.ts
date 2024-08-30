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
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { CacheUtil } from "../util/CacheUtil";
import { VisUtil } from "../util/VisUtil";

export const combobox_autocomplete_valid: Rule = {
    id: "combobox_autocomplete_valid",
    context: "aria:combobox",
    dependencies: ["combobox_popup_reference"],
    refactor: {
        "combobox_autocomplete": {
            "Pass": "Pass",
            "Fail_1": "Fail_1",
            "Fail_inline": "Fail_inline"}
    },
    help: {
        "en-US": {
            "Pass": "combobox_autocomplete_valid.html",
            "Fail_1": "combobox_autocomplete_valid.html",
            "Fail_inline": "combobox_autocomplete_valid.html",
            "group": "combobox_autocomplete_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass": "The combobox does not use 'aria-autocomplete' value '\"inline\"' nor does it have 'aria-autocomplete' defined within the popup",
            "Fail_1": "The combobox has the 'aria-autocomplete' attribute incorrectly set on an element within the popup referenced by \"{0}\"",
            "Fail_inline": "The combobox does not support an 'aria-autocomplete' attribute value set to '\"inline\"' ",
            "group": "A combobox that supports autocompletion behavior must have the 'aria-autocomplete' attribute only on its text input element with a valid value; a value of '\"inline\"' is not supported"
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
        const { popupId, popupElement } = cachedElem;
        let retVal = [];
        if (ruleContext.getAttribute("aria-autocomplete") === "inline") {
            retVal.push(RuleFail("Fail_inline"));
        }

        let passed = true; 
        // examine the children
        if (popupElement && VisUtil.isNodeVisible(popupElement)) {
            // if popupElement itself has "aria-autocomplete"
            passed = !popupElement.hasAttribute("aria-autocomplete");
            // if any child of popupElement has "aria-autocomplete"
            if (passed && popupElement.children && popupElement.children.length > 0) {
                //let nw = new NodeWalker(popupElement);
                let nw = new DOMWalker(popupElement);
                while (passed && nw.nextNode()) {
                    if (nw.node.nodeType === 1 && VisUtil.isNodeVisible(nw.node)) {
                        passed = !nw.elem().hasAttribute("aria-autocomplete");
                        if (nw.bEndTag && nw.node === popupElement.lastElementChild) break;
                    }
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