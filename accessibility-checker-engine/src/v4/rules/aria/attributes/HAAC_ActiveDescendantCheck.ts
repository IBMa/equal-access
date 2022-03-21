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
import { FragmentUtil } from "../../../../v2/checker/accessibility/util/fragment";

export let HAAC_ActiveDescendantCheck: Rule = {
    id: "HAAC_ActiveDescendantCheck",
    context: "dom:*[aria-activedescendant]",
    help: {
        "en-US": {
            "Pass_0": "HAAC_ActiveDescendantCheck.html",
            "Fail_1": "HAAC_ActiveDescendantCheck.html",
            "Fail_2": "HAAC_ActiveDescendantCheck.html",
            "Fail_3": "HAAC_ActiveDescendantCheck.html",
            "Fail_4": "HAAC_ActiveDescendantCheck.html",
            "group": "HAAC_ActiveDescendantCheck.html"
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
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"], 
        "num": ["4.1.2"], 
        "level": eRulePolicy.VIOLATION, 
        "toolkitLevel": eToolkitLevel.LEVEL_ONE 
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // combobox active descendants handled by 'combobox_active_descendant'
        if (RPTUtil.hasRoleInSemantics(ruleContext, "combobox")) {
            return null;
        }

        let descendant_id = RPTUtil.getAriaAttribute(ruleContext, "aria-activedescendant");
        // POF1: The attribute is empty
        if (!descendant_id || descendant_id.trim() === "") {
            return RuleFail("Fail_1");
        }

        let descendant = FragmentUtil.getById(ruleContext, descendant_id.trim());
        if (!descendant) {
            // The referenced element doesn't exist. We let 1077 to trigger the error
            return null;
        }

        if (!RPTUtil.isNodeVisible(descendant)) {
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
            let owned_ids = RPTUtil.normalizeSpacing(ruleContext.getAttribute("aria-owns").trim()).split(" ");
            for (let i = 0; i < owned_ids.length; i++) {
                let owned_ele = FragmentUtil.getById(ruleContext, owned_ids[i]);
                if (owned_ele.contains(descendant)) {
                    return RulePass("Pass_0");
                }
            }
        }

        // 2. The element with DOM focus is a textbox with aria-controls referring to an element that 
        //  supports aria-activedescendant, and the value of aria-activedescendant specified for the 
        //  textbox refers to either a descendant of the element controlled by the textbox or is a logical 
        //  descendant of that controlled element as indicated by the aria-owns attribute.
        //
        if (RPTUtil.hasRoleInSemantics(ruleContext, "textbox") && ruleContext.hasAttribute("aria-controls")) {
            pofId = 3;
            let controlled_ids = RPTUtil.normalizeSpacing(ruleContext.getAttribute("aria-controls").trim()).split(" ");
            for (let i = 0; i < controlled_ids.length; i++) {
                let controlled_ele = FragmentUtil.getById(ruleContext, controlled_ids[i]);
                if (controlled_ele.contains(descendant)) {
                    return RulePass("Pass_0");
                }
                if (controlled_ele.hasAttribute("aria-owns")) {
                    let owns_ids = RPTUtil.normalizeSpacing(controlled_ele.getAttribute("aria-owns").trim()).split(" ");
                    for (let j = 0; j < owns_ids.length; j++) {
                        let owned_ele = FragmentUtil.getById(ruleContext, owns_ids[j]);
                        if (owned_ele.contains(descendant)) {
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