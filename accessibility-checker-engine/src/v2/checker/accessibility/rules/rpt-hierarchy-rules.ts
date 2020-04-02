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
import { RPTUtil } from "../util/legacy";

let a11yRulesHier: Rule[] = [{
    /**
     * Description: Triggers if list widget using group role and has children that are not listitem role
     * Origin:  WAI-ARIA 1.1
     */
    id: "HAAC_List_Group_ListItem",
    context: "aria:group",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let parent = ruleContext.parentElement;
        if (!RPTUtil.hasRoleInSemantics(parent, "list")) {
            return null;
        }

        let passed = true;
        let children = ruleContext.children;
        for (let i = 0; passed && i < children.length; i++) {
            passed = RPTUtil.hasRoleInSemantics(children[i], "listitem");
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
     * Description: Triggers if the aria-activedescendant is not a descendant by nature, by aria-owns or aria-controls.
     * Origin:  WAI-ARIA 1.1
     *          https://www.w3.org/TR/wai-aria-1.1/#aria-activedescendant
     */
    id: "HAAC_ActiveDescendantCheck",
    context: "dom:*[aria-activedescendant]",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let descendant_id = RPTUtil.getAriaAttribute(ruleContext, "aria-activedescendant");
        // POF1: The attribute is empty
        if (!descendant_id || descendant_id.trim() === "") {
            return RuleFail("Fail_1");
        }

        let descendant = ruleContext.ownerDocument.getElementById(descendant_id.trim());
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
                let owned_ele = ruleContext.ownerDocument.getElementById(owned_ids[i]);
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
                let controlled_ele = ruleContext.ownerDocument.getElementById(controlled_ids[i]);
                if (controlled_ele.contains(descendant)) {
                    return RulePass("Pass_0");
                }
                if (controlled_ele.hasAttribute("aria-owns")) {
                    let owns_ids = RPTUtil.normalizeSpacing(controlled_ele.getAttribute("aria-owns").trim()).split(" ");
                    for (let j = 0; j < owns_ids.length; j++) {
                        let owned_ele = ruleContext.ownerDocument.getElementById(owns_ids[j]);
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
        // POF4: I'm a combobox, and the referenced active-descendant is not controlled by this widget
        return RuleFail("Fail_4");
        
    }
}
]

export { a11yRulesHier }