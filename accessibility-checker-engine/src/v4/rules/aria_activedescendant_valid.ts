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
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { VisUtil } from "../util/VisUtil";
import { DOMUtil } from "../../v2/dom/DOMUtil";

export let aria_activedescendant_valid: Rule = {
    id: "aria_activedescendant_valid",
    context: "dom:*[aria-activedescendant]",
    refactor: {
        "HAAC_ActiveDescendantCheck": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2",
            "Fail_3": "Fail_3",
            "Fail_4": "Fail_4"}
    },
    help: {
        "en-US": {
            "Pass_0": "aria_activedescendant_valid.html",
            "Fail_1": "aria_activedescendant_valid.html",
            "Fail_2": "aria_activedescendant_valid.html",
            "Fail_3": "aria_activedescendant_valid.html",
            "Fail_4": "aria_activedescendant_valid.html",
            "group": "aria_activedescendant_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The 'aria-activedescendant' property is empty",
            "Fail_2": "The 'aria-activedescendant' property references a hidden node",
            "Fail_3": "Element is not a combobox, and the referenced active-descendant element is not a valid descendant",
            "Fail_4": "Element is a combobox, and the referenced active-descendant element is not controlled by this component",
            "group": "The 'aria-activedescendant' property must reference the 'id' of a non-empty, non-hidden active child element"
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
        // combobox active descendants handled by 'combobox_active_descendant'
        if (AriaUtil.hasRoleInSemantics(ruleContext, "combobox")) {
            return null;
        }

        let descendant_id = AriaUtil.getAriaAttribute(ruleContext, "aria-activedescendant");
        // POF1: The attribute is empty
        if (!descendant_id || descendant_id.trim() === "") {
            return RuleFail("Fail_1");
        }

        let descendant = FragmentUtil.getById(ruleContext, descendant_id.trim());
        if (!descendant || DOMUtil.sameNode(descendant_id, ruleContext)) {
            // The referenced element doesn't exist. We let 1077 to trigger the error
            return null;
        }

        if (!VisUtil.isNodeVisible(descendant)) {
            // POF2: aria-activedescendant references a hidden node
            return RuleFail("Fail_2");
        }

        // 1. The value of aria-activedescendant refers to an element that is either a descendant of 
        // the element with DOM focus
        if (ruleContext.contains(descendant)) {
            return RulePass("Pass_0");
        }

        let pofId = 2;

        // or is a logical descendant as indicated by the aria-owns attribute.
        if (ruleContext.hasAttribute("aria-owns")) {
            let owned_ids = CommonUtil.normalizeSpacing(ruleContext.getAttribute("aria-owns").trim()).split(" ");
            for (let i = 0; i < owned_ids.length; i++) {
                let owned_ele = FragmentUtil.getById(ruleContext, owned_ids[i]);
                if (owned_ele && !DOMUtil.sameNode(owned_ele, ruleContext) && owned_ele.contains(descendant)) {
                    return RulePass("Pass_0");
                }
            }
        }

        // 2. The element with DOM focus is a textbox with aria-controls referring to an element that 
        //  supports aria-activedescendant, and the value of aria-activedescendant specified for the 
        //  textbox refers to either a descendant of the element controlled by the textbox or is a logical 
        //  descendant of that controlled element as indicated by the aria-owns attribute.
        //
        if (AriaUtil.hasRoleInSemantics(ruleContext, "textbox") && ruleContext.hasAttribute("aria-controls")) {
            pofId = 3;
            let controlled_ids = CommonUtil.normalizeSpacing(ruleContext.getAttribute("aria-controls").trim()).split(" ");
            for (let i = 0; i < controlled_ids.length; i++) {
                let controlled_ele = FragmentUtil.getById(ruleContext, controlled_ids[i]);
                if (controlled_ele && !DOMUtil.sameNode(controlled_ele, ruleContext) && controlled_ele.contains(descendant)) {
                    return RulePass("Pass_0");
                }
                if (controlled_ele.hasAttribute("aria-owns")) {
                    let owns_ids = CommonUtil.normalizeSpacing(controlled_ele.getAttribute("aria-owns").trim()).split(" ");
                    for (let j = 0; j < owns_ids.length; j++) {
                        let owned_ele = FragmentUtil.getById(ruleContext, owns_ids[j]);
                        if (owned_ele && !DOMUtil.sameNode(owned_ele, ruleContext) && owned_ele.contains(descendant)) {
                            return RulePass("Pass_0");
                        }
                    }
                }
            }
        }

        // POF3: I'm not a combobox, and the referenced active-descendant is not a descendant and not owned by the element 
        // that referenced it.
        if (pofId == 3) {
            return RuleFail("Fail_3");
        }
        return null;
    }
}