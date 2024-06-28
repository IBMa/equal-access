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

import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { VisUtil } from "../../v2/dom/VisUtil";
import { DOMUtil } from "../../v2/dom/DOMUtil";

export let input_label_visible: Rule = {
    id: "input_label_visible",
    context: "aria:button,aria:checkbox,aria:combobox,aria:listbox,aria:menuitemcheckbox,aria:menuitemradio,aria:radio,aria:searchbox,aria:slider,aria:spinbutton,aria:switch,aria:textbox",
    dependencies: ["input_label_exists"],
    refactor: {
        "WCAG20_Input_VisibleLabel": {
            "Pass_0": "pass",
            "Potential_1": "potential_no_label",
            "potential_placeholder_only": "potential_placeholder_only"
        }
    },
    help: {
        "en-US": {
            "pass": "input_label_visible.html",
            "potential_placeholder_only": "input_label_visible.html",
            "potential_no_label": "input_label_visible.html",
            "group": "input_label_visible.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The input element has an associated visible label",
            "potential_placeholder_only": "The ‘placeholder’ is the only visible label",
            "potential_no_label": "The input element does not have an associated visible label",
            "group": "An input element must have an associated visible label"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["3.3.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();

        //ignore datalist element check since it will be part of a input element or hidden by default
        if (nodeName === 'datalist')
            return null;

        if (!VisUtil.isNodeVisible(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return null;
        
        // if a control is in a table cell, the col headers can act as visible label, which is checked in table heading rule
        if (RPTUtil.getAncestor(ruleContext, "table"))
            return null;

        // when in a combobox, only look at the input textbox.
        if (RPTUtil.getAncestorWithRole(ruleContext, "combobox") &&
            !(RPTUtil.hasRoleInSemantics(ruleContext, "textbox") || RPTUtil.hasRoleInSemantics(ruleContext, "searchbox") ||
                nodeName === "input" || (nodeName === "select" && RPTUtil.hasRoleInSemantics(ruleContext, "combobox")))) {
            return null;
        }
        // avoid diagnosing the popup list of a combobox.
        let rolesToCheck = ["listbox", "tree", "grid", "dialog"];
        for (let j = 0; j < rolesToCheck.length; j++) {
            if (RPTUtil.hasRoleInSemantics(ruleContext, rolesToCheck[j])) {
                let comboboxes = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "combobox", true, true);
                for (let k = 0; k < comboboxes.length; k++) {
                    let combobox = comboboxes[k];
                    let aria_owns = RPTUtil.getElementAttribute(combobox, "aria-owns");
                    if (aria_owns) {
                        let owns = RPTUtil.normalizeSpacing(aria_owns.trim()).split(" ");
                        for (let i = 0; i < owns.length; i++) {
                            let owned = FragmentUtil.getById(ruleContext, owns[i]);
                            if (owned === ruleContext) {
                                return null;
                            }
                        }
                    }
                }
            }
        }

        //let passed = false;
        // first check visible label for input or button
        if (nodeName === "input" || nodeName === "button") {
            if (RPTUtil.hasImplicitLabel(ruleContext))
                return RulePass("pass");
            
            let label = RPTUtil.getLabelForElement(ruleContext);
            if (label && RPTUtil.hasInnerContentHidden(label))
                return RulePass("pass");     
        }

        // buttons are not in scope for this success criteria (IBMa/equal-access#204) if it is not associated with data entry
        if (nodeName === "button" || (nodeName === "input" && ruleContext.hasAttribute("type") && ruleContext.getAttribute("type").toLowerCase() !== 'button')) {
            if (!RPTUtil.getAncestor(ruleContext, "form"))
                return null;
        }

        // check if an alternative tooltip exists that can be made visible through mouseover
        if (RPTUtil.attributeNonEmpty(ruleContext, "title"))
            return RulePass("pass"); 
        
        // check if there is a visible label pointed to by the aria-labelledby attribute.
        if (RPTUtil.attributeNonEmpty(ruleContext, "aria-labelledby")) {
            let theLabel = ruleContext.getAttribute("aria-labelledby");
            let labelValues = theLabel.split(/\s+/);
            for (let j = 0; j < labelValues.length; ++j) {
                let elementById = FragmentUtil.getById(ruleContext, labelValues[j]);
                if (elementById && !DOMUtil.sameNode(elementById, ruleContext) && VisUtil.isNodeVisible(elementById) && RPTUtil.hasInnerContentHidden(elementById)) {
                    return RulePass("pass"); 
                }
            }
        }

        if (nodeName === "optgroup" && RPTUtil.attributeNonEmpty(ruleContext, "label"))
            return RulePass("pass");
        
        if (nodeName == "option" && (RPTUtil.attributeNonEmpty(ruleContext, "label") || ruleContext.innerHTML.trim().length > 0))
            return RulePass("pass");
        
        // check if any visible text from the control. 
        // note that (1) the text doesn’t need to be associated with the control to form a relationship
        //  and (2) the text doesn't need to follow accessible name requirement (e.g. name from)
        if (RPTUtil.hasInnerContentHidden(ruleContext))
            return RulePass("pass");

        // Determine if this is referenced by a combobox. If so, the label belongs to the combobox
        let id = ruleContext.getAttribute("id");
        if (id && id.trim().length > 0) {
            if (ruleContext.ownerDocument.querySelector(`*[aria-controls='${id}'][role='combobox']`)) {
                return null;
            }
        }

        // check if a placeholder exists even though a placeholder text is not sufficient as a visible text
        if (RPTUtil.attributeNonEmpty(ruleContext, "placeholder"))
            return RulePotential("potential_placeholder_only");

        return RulePotential("potential_no_label");
    }
}