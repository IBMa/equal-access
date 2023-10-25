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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { VisUtil } from "../../v2/dom/VisUtil";
import { DOMUtil } from "../../v2/dom/DOMUtil";

export let input_label_visible: Rule = {
    id: "input_label_visible",
    context: "aria:button,aria:checkbox,aria:combobox,aria:listbox,aria:menuitemcheckbox,aria:menuitemradio,aria:radio,aria:searchbox,aria:slider,aria:spinbutton,aria:switch,aria:textbox,aria:progressbar,dom:input[type=file],dom:output",
    dependencies: ["input_label_exists"],
    refactor: {
        "WCAG20_Input_VisibleLabel": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "input_label_visible.html",
            "Potential_1": "input_label_visible.html",
            "group": "input_label_visible.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "The input element does not have an associated visible label",
            "group": "An input element must have an associated visible label"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
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

        if (!VisUtil.isNodeVisible(ruleContext) ||
            RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }

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

        // Determine the input type
        let passed = true;

        let type = "text";
        if (nodeName == "input" && ruleContext.hasAttribute("type")) {
            type = ruleContext.getAttribute("type").toLowerCase();
        } else if (nodeName === "button" || RPTUtil.hasRoleInSemantics(ruleContext, "button")) {
            type = "buttonelem";
        }
        if (nodeName == "input" && type == "") {
            type = "text";
        }

        let textTypes = ["text", "file", "password",
            "checkbox", "radio",
            "search", "tel", "url", "email",
            "date", "number", "range",
            "time", "color",
            "month", "week", "datetime-local"];
        let buttonTypes = ["button", "reset", "submit"];
        let buttonTypesWithDefaults = ["reset", "submit"]; // 'submit' and 'reset' have visible defaults.
        if (textTypes.indexOf(type) !== -1) { // If type is in the list
            // Get only the non-hidden labels for element, in the case that an label is hidden then it is a violation
            let labelElem = RPTUtil.getLabelForElementHidden(ruleContext, true);
            passed = (labelElem != null && RPTUtil.hasInnerContentHidden(labelElem)) ||
                RPTUtil.hasImplicitLabel(ruleContext) ||
                type === "file"; // input type=file has a visible default.
        } else if (buttonTypes.indexOf(type) !== -1 || type == "buttonelem") {
            // Buttons are not in scope for this success criteria (IBMa/equal-access#204)
            return null;
        }

        // check if there is a visible label pointed to by the aria-labelledby attribute.
        if (!passed && RPTUtil.attributeNonEmpty(ruleContext, "aria-labelledby")) {
            let theLabel = ruleContext.getAttribute("aria-labelledby");
            let labelValues = theLabel.split(/\s+/);
            for (let j = 0; j < labelValues.length; ++j) {
                let elementById = FragmentUtil.getById(ruleContext, labelValues[j]);
                if (elementById && !DOMUtil.sameNode(elementById, ruleContext) && VisUtil.isNodeVisible(elementById) && RPTUtil.hasInnerContentHidden(elementById)) {
                    passed = true;
                    break;
                }
            }
        }

        if (!passed && nodeName == "optgroup") {
            passed = RPTUtil.attributeNonEmpty(ruleContext, "label");
        }
        if (!passed && nodeName == "option") {
            passed = RPTUtil.attributeNonEmpty(ruleContext, "label") || ruleContext.innerHTML.trim().length > 0;
        }

        // One last check for roles that support name from content
        if (!passed) {
            // list from https://www.w3.org/TR/wai-aria-1.1/#namefromcontent
            let rolesWithNameFromContent = ["button", "cell", "checkbox", "columnheader", "gridcell", "heading", "link",
                "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "row",
                "rowgroup", "rowheader", "switch", "tab", "tooltip",/*"tree",*/"treeitem"];
            //get attribute roles as well as implicit roles.
            let roles = RPTUtil.getRoles(ruleContext, true);
            for (let i = 0; i < roles.length; i++) {
                if (rolesWithNameFromContent.indexOf(roles[i]) !== -1) {
                    passed = RPTUtil.hasInnerContentHidden(ruleContext);
                    break;
                }
            }
        }

        // Determine if this is referenced by a combobox. If so, the label belongs to the combobox
        let id = ruleContext.getAttribute("id");
        if (id && id.trim().length > 0) {
            if (ruleContext.ownerDocument.querySelector(`*[aria-controls='${id}'][role='combobox']`)) {
                return null;
            }
        }

        if (passed) {
            return RulePass("Pass_0");
        } else {
            return RulePotential("Potential_1");
        }
    }
}