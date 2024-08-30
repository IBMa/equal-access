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
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { VisUtil } from "../util/VisUtil";
import { DOMUtil } from "../../v2/dom/DOMUtil";

export const input_label_visible: Rule = {
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
        "num": ["2.5.3", "3.3.2"], //map to both requirements in help
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

        if (!VisUtil.isNodeVisible(ruleContext) || CommonUtil.isNodeDisabled(ruleContext))
            return null;
        
        // if a control is in a table cell, the col headers can act as visible label, which is checked in table heading rule
        if (CommonUtil.getAncestor(ruleContext, "table"))
            return null;

        // when in a combobox, only look at the input textbox.
        if (AriaUtil.getAncestorWithRole(ruleContext, "combobox") &&
            !(AriaUtil.hasRoleInSemantics(ruleContext, "textbox") || AriaUtil.hasRoleInSemantics(ruleContext, "searchbox") ||
                nodeName === "input" || (nodeName === "select" && AriaUtil.hasRoleInSemantics(ruleContext, "combobox")))) {
            return null;
        }
        // avoid diagnosing the popup list of a combobox.
        let rolesToCheck = ["listbox", "tree", "grid", "dialog"];
        for (let j = 0; j < rolesToCheck.length; j++) {
            if (AriaUtil.hasRoleInSemantics(ruleContext, rolesToCheck[j])) {
                let comboboxes = CommonUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "combobox", true, true);
                for (let k = 0; k < comboboxes.length; k++) {
                    let combobox = comboboxes[k];
                    let aria_owns = CommonUtil.getElementAttribute(combobox, "aria-owns");
                    if (aria_owns) {
                        let owns = CommonUtil.normalizeSpacing(aria_owns.trim()).split(" ");
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

        // check visible label for input or button
        if (nodeName === 'input' || nodeName === 'button') {

            if (CommonUtil.hasImplicitLabel(ruleContext))
                return RulePass("pass");
            
            let label = CommonUtil.getLabelForElement(ruleContext);
            if (label && CommonUtil.hasInnerContentHidden(label))
                return RulePass("pass");  

            // special cases
            let type = ruleContext.getAttribute("type");
            if (nodeName === 'input' && type) {
                type = type.toLowerCase();
                //submit type of input has a visible label 'Submit' by default
                if (type === 'submit' || type === 'reset')
                    return RulePass("pass");
                //image type of input requires a non-empty alt text
                if (type === 'image' && CommonUtil.attributeNonEmpty(ruleContext, "alt"))
                    return RulePass("pass");
            }
        }

        // custom widget submission is not in scope for this success criteria (IBMa/equal-access#204) if it is not associated with data entry
        let role = AriaUtil.getResolvedRole(ruleContext);
        if (role && role === "button" && nodeName !== 'input' && nodeName !== 'button') {    
            // likely a custom widget, skip if not associated with data entry
            if (!CommonUtil.getAncestor(ruleContext, "form"))
                return null;    
        }

        // check if any visible text from the control. 
        // note that (1) the text doesn’t need to be associated with the control to form a relationship
        //  and (2) the text doesn't need to follow accessible name requirement (e.g. nameFrom)
        if (!CommonUtil.isInnerTextEmpty(ruleContext))
            return RulePass("pass");

        // check if an alternative tooltip exists that can be made visible through mouseover
        if (CommonUtil.attributeNonEmpty(ruleContext, "title"))
            return RulePass("pass"); 

        // check if any descendant with an alternative tooltip that can be made visible through mouseover
        // only consider img and svg, and other text content of the descendant is covered in the isInnerText above  
        let descendants = AriaUtil.getAllDescendantsWithRoles(ruleContext, ["img", "graphics-document", "graphics-object", "graphics-symbol"], false, true);
        if (descendants && descendants.length > 0) {
            for (let d=0; d < descendants.length; d++) {
                if (CommonUtil.attributeNonEmpty(descendants[d], "title") || CommonUtil.attributeNonEmpty(descendants[d], "alt"))
                    return RulePass("pass");
            } 
        }
        
        // check if there is a visible label pointed to by the aria-labelledby attribute.
        if (CommonUtil.attributeNonEmpty(ruleContext, "aria-labelledby")) {
            let theLabel = ruleContext.getAttribute("aria-labelledby");
            let labelValues = theLabel.split(/\s+/);
            for (let j = 0; j < labelValues.length; ++j) {
                let elementById = FragmentUtil.getById(ruleContext, labelValues[j]);
                if (elementById && !DOMUtil.sameNode(elementById, ruleContext) && VisUtil.isNodeVisible(elementById) && CommonUtil.hasInnerContentHidden(elementById)) {
                    return RulePass("pass"); 
                }
            }
        }

        if (nodeName === "optgroup" && CommonUtil.attributeNonEmpty(ruleContext, "label"))
            return RulePass("pass");
        
        if (nodeName == "option" && (CommonUtil.attributeNonEmpty(ruleContext, "label") || ruleContext.innerHTML.trim().length > 0))
            return RulePass("pass");
        
        // Determine if this is referenced by a combobox. If so, the label belongs to the combobox
        let id = ruleContext.getAttribute("id");
        if (id && id.trim().length > 0) {
            if (ruleContext.ownerDocument.querySelector(`*[aria-controls='${id}'][role='combobox']`)) {
                return null;
            }
        }

        // check if a placeholder exists even though a placeholder text is not sufficient as a visible text
        if (CommonUtil.attributeNonEmpty(ruleContext, "placeholder"))
            return RulePotential("potential_placeholder_only");

        return RulePotential("potential_no_label");
    }
}