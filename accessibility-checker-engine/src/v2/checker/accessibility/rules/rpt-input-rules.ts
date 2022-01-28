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
import { DOMUtil } from "../../../dom/DOMUtil";
import { DOMWalker } from "../../../dom/DOMWalker";
import { FragmentUtil } from "../util/fragment";
import { RPTUtil, NodeWalker } from "../util/legacy";

let a11yRulesInput: Rule[] = [

    {
        /**
         * Description: Trigger if an input isn't labeled or titled
         * Origin: WCAG 2.0 Technique H44, H65, H91
         */
        id: "WCAG20_Input_ExplicitLabel",
        context: "aria:button,aria:checkbox,aria:combobox,aria:listbox,aria:menuitemcheckbox"
            +",aria:menuitemradio,aria:radio,aria:searchbox,aria:slider,aria:spinbutton"
            +",aria:switch,aria:textbox,aria:progressbar,dom:input[type=file],dom:output,dom:meter,dom:input[type=password]", 

        // the datalist element do not require any explicit or implicit label, might need to exclude it from the scope of the rules
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - NO OUT OF SCOPE hidden in context

            /* removed the  check role= presentation since according to latest native host semantics https://www.w3.org/TR/html-aria/#docconformance  table,  these two roles are not applicable to the elements are in the  scope of this role
            if (RPTUtil.hasRole(ruleContext, "presentation") || RPTUtil.hasRole(ruleContext, "none"))
                return RulePass(1);
            */

            if (ruleContext.getAttribute("aria-hidden")) {
                return null;
            }

            // Determine the input type
            let passed = true;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let type = "text";
            if (nodeName == "input" && ruleContext.hasAttribute("type")) {
                type = ruleContext.getAttribute("type").toLowerCase();
            } else if (nodeName === "button" || RPTUtil.hasRoleInSemantics(ruleContext, "button")) {
                type = "buttonelem";
            }
            if (nodeName == "input" && type == "") {
                type = "text";
            }
            if (type === "image") {
                // Handled by WCAG20_Input_ExplicitLabelImage
                return null;
            }

            let POF = -1;
            let textTypes = [
                "text", "file", "password",
                "checkbox", "radio",
                "search", "tel", "url", "email",  //HTML 5. Note: type = "hidden" doesn't require text
                "date", "number", "range", //HTML 5. type = "image" is checked in g10.
                "time", "color"
            ]
            let buttonTypes = [
                "button", "reset", "submit"
            ]
            let buttonTypesWithDefaults = ["reset", "submit"]; // 'submit' and 'reset' have visible defaults.
            if (textTypes.indexOf(type) !== -1) { // If type is in the list
                // Get only the non-hidden labels for element, in the case that an label is hidden then it is a violation
                // Note: label[for] does not work for ARIA-defined inputs
                let labelElem = ruleContext.hasAttribute("role") ? null : RPTUtil.getLabelForElementHidden(ruleContext, true);
                let hasLabelElemContent = false;
                if (labelElem) {
                    if (RPTUtil.hasInnerContentHidden(labelElem)) {
                        hasLabelElemContent = true;
                    } else if ((labelElem.getAttribute("aria-label") || "").trim().length > 0) {
                        hasLabelElemContent = true;
                    } else if (labelElem.hasAttribute("aria-labelledby")) {
                        let labelledByElem = FragmentUtil.getById(labelElem, labelElem.getAttribute('aria-labelledby'));
                        if (labelledByElem && RPTUtil.hasInnerContent(labelledByElem)) {
                            hasLabelElemContent = true;
                        }
                    }
                }
                passed = (!!labelElem && hasLabelElemContent) ||
                    (!labelElem && RPTUtil.attributeNonEmpty(ruleContext, "title") || RPTUtil.attributeNonEmpty(ruleContext, "placeholder")) ||
                    RPTUtil.getAriaLabel(ruleContext).trim().length > 0 || RPTUtil.hasImplicitLabel(ruleContext);
                if (!passed) POF = 2 + textTypes.indexOf(type);
            } else if (buttonTypes.indexOf(type) !== -1) { // If type is a button
                if (buttonTypesWithDefaults.indexOf(type) !== -1 && !ruleContext.hasAttribute("value")) {
                    // 'submit' and 'reset' have visible defaults so pass if there is no 'value' attribute
                    passed = true;
                } else {
                    passed = RPTUtil.attributeNonEmpty(ruleContext, "value") || RPTUtil.hasAriaLabel(ruleContext) || RPTUtil.attributeNonEmpty(ruleContext, "title");
                    if (!passed) POF = 2 + textTypes.length + buttonTypes.indexOf(type);
                }
            } else if (type == "buttonelem") {
                // If I am an image and I have alt text - accessibility-web-engine#269
                let bAlt = false;
                if (ruleContext.nodeName.toLowerCase() === "img" && ruleContext.hasAttribute("alt")) {
                    let alt = ruleContext.getAttribute("alt");
                    if (alt.trim().length === 0) {
                        bAlt = false;
                    } else {
                        bAlt = true;
                    }
                };
                passed = RPTUtil.hasInnerContentHidden(ruleContext) || RPTUtil.hasAriaLabel(ruleContext) || bAlt || RPTUtil.attributeNonEmpty(ruleContext, "title");

                if (!passed) POF = 2 + textTypes.length + buttonTypes.length + 1;
            }

            // Rpt_Aria_ValidIdRef determines if the aria-labelledby id points to a valid element
            if (!passed && (buttonTypes.indexOf(type) !== -1)) {
                if (ruleContext.hasAttribute("class") && ruleContext.getAttribute("class") == "dijitOffScreen" && DOMUtil.parentElement(ruleContext).hasAttribute("widgetid")) {
                    // Special handling for dijit buttons
                    let labelId = DOMUtil.parentElement(ruleContext).getAttribute("widgetid") + "_label";
                    let label = FragmentUtil.getById(ruleContext, labelId);
                    if (label != null) {
                        passed = RPTUtil.hasInnerContentHidden(label);
                        // This means I failed above also
                        if (!passed) POF = 2 + textTypes.length + buttonTypes.length + 4 + buttonTypes.indexOf(type);
                    }
                }
            }

            if (!passed && nodeName == "optgroup") {
                passed = RPTUtil.attributeNonEmpty(ruleContext, "label");
                if (!passed) POF = 2 + textTypes.length + buttonTypes.length + 2;
            }
            if (!passed && nodeName == "option") {
                // Is a non-empty value attribute also enough for an option element?
                passed = RPTUtil.attributeNonEmpty(ruleContext, "label") || ruleContext.innerHTML.trim().length > 0;
                if (!passed) POF = 2 + textTypes.length + buttonTypes.length + 3;
            }
            if (!passed) {
                // check aria role
                //TODO: consider other aria roles relevant, other than menuitemcheckbox
                passed = RPTUtil.hasRoleInSemantics(ruleContext, "menuitemcheckbox") && RPTUtil.getInnerText(ruleContext) && RPTUtil.getInnerText(ruleContext).trim().length > 0;
            }

            if (passed) {
                return RulePass("Pass_0");
            } else if (ruleContext.hasAttribute("role") && ruleContext.getAttribute("role").trim().length > 0) {
                return RuleFail("Fail_2", ruleContext.getAttribute("role").split(" "));
            } else {
                return RuleFail("Fail_1", [nodeName]);
            }
        }
    },
    {
        /**
         * Description: Trigger if an image input does not have alt.
         * Origin: WCAG 2.0 Technique H91
         */
        id: "WCAG20_Input_ExplicitLabelImage",
        context: "dom:input",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            // See https://www.w3.org/WAI/WCAG21/Techniques/failures/F65
            const ruleContext = context["dom"].node as Element;
            if (!ruleContext.hasAttribute("type") || ruleContext.getAttribute("type").toLowerCase() != "image") {
                return null;
            }
            if (RPTUtil.attributeNonEmpty(ruleContext, "alt")) {
                return RulePass("Pass_0");
            } else if (RPTUtil.hasAriaLabel(ruleContext)) {
                return RulePass("Pass_1");
            } else if (ruleContext.hasAttribute("title") && ruleContext.getAttribute("title").length > 0) {
                return RulePass("Pass_2");
            }
            return RuleFail("Fail");
        }
    },
    {
        /**
         * Description: Trigger if the label is supposed to be before the input, but is not.
         * Origin: WCAG 2.0 Technique H44
         */
        id: "WCAG20_Input_LabelBefore",
        context: "dom:input, dom:textarea, dom:select",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (ruleContext.nodeName.toLowerCase() == "input" && ruleContext.hasAttribute("type")) {
                let type = ruleContext.getAttribute("type").toLowerCase();
                if (type != "text" && type != "file" && type != "password") {
                    return null;
                }
            }

            // Get only the non-hidden labels for element
            let labelElem = RPTUtil.getLabelForElementHidden(ruleContext, true);

            if (labelElem == null || !RPTUtil.hasInnerContentHidden(labelElem)) {
                // Due to dependency, label must be done via title - this rule doesn't apply
                return null;
            }

            let value = RPTUtil.compareNodeOrder(labelElem, ruleContext);
            if (value == -2) {
                // input nested in label
                let passed = false;
                let walkNode = ruleContext.previousSibling;
                while (!passed && walkNode !== null) {
                    passed = ((walkNode.nodeName.toLowerCase() == "#text" && walkNode.nodeValue.trim().length > 0)
                        || (walkNode.nodeName.toLowerCase() == "span" && walkNode.textContent.trim().length > 0));
                    walkNode = walkNode.previousSibling;
                }
                if (!passed) {
                    // Input nested in label and text after input
                    return RuleFail("Fail_1");
                }
            } else {
                if (value != -1) {
                    // label is after input
                    return RuleFail("Fail_2");
                }
            }
            // Haven't returned yet, then I pass
            return RulePass("Pass_0");
        }
    },

    {
        /**
         * Description: Trigger if the label is supposed to be after the input, but is not.
         * Origin: WCAG 2.0 Technique H44
         */
        id: "WCAG20_Input_LabelAfter",
        context: "dom:input",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let type = "";
            if (ruleContext.hasAttribute("type"))
                type = ruleContext.getAttribute("type").toLowerCase();
            if (type != "checkbox" && type != "radio") {
                return null;
            }

            // Get only the non-hidden labels for element
            let labelElem = RPTUtil.getLabelForElementHidden(ruleContext, true);
            if (labelElem === null || !RPTUtil.hasInnerContentHidden(labelElem)) {
                // Due to dependency, label must be done via title - this rule doesn't apply
                return null;
            }
            let value = RPTUtil.compareNodeOrder(labelElem, ruleContext);
            let passed;
            if (value === -2) {
                // input nested in label
                passed = false;
                let walkNode = new NodeWalker(labelElem);
                walkNode.node = ruleContext;
                while (!passed && walkNode.nextNode()) {
                    passed = ((walkNode.node.nodeName.toLowerCase() === "#text" && walkNode.node.nodeValue.trim().length > 0)
                        || (walkNode.node.nodeName.toLowerCase() === "span" && walkNode.node.textContent.trim().length > 0));
                }
                if (!passed) {
                    // Input nested in label and text before input
                    return RuleFail("Fail_1");
                }
            } else {
                if (value != 1) {
                    // label is before input
                    return RuleFail("Fail_2");
                }
            }
            return RulePass("Pass_0");
        }
    },
    {
        /**
         * Description: Trigger if non-radio/chk inputs are not in a fieldset
         * Origin: WCAG 2.0 Technique H71
         */
        id: "WCAG20_Input_InFieldSet",
        context: "dom:input, dom:textarea, dom:select",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Don't trigger for other input types or if we're in a fieldset
            if (ruleContext.nodeName.toLowerCase() == "input" && ruleContext.hasAttribute("type")) {
                let type = ruleContext.getAttribute("type").toLowerCase();
                if (type != "text" && type != "file" && type != "password")
                    return RulePass("Pass_0");
            }
            if (RPTUtil.getAncestor(ruleContext, "fieldset") != null)
                return RulePass("Pass_0");

            // No fieldset - see if this input is all by itself - no need to group single inputs
            let parent = RPTUtil.getAncestor(ruleContext, ["form", "body"]);
            let checkTypes = ["input", "textarea", "select"];
            let passed = true;

            for (let i = 0; passed && i < checkTypes.length; ++i) {
                let controls = parent.getElementsByTagName(checkTypes[i]);
                for (let j = 0; passed && j < controls.length; ++j) {

                    // Check if the node should be skipped or not based on the Check Hidden Content setting and if the node isVisible or
                    // not.
                    if (RPTUtil.shouldNodeBeSkippedHidden(controls[j])) {
                        continue;
                    }

                    // Note that textareas and selects will be called type='text'
                    let type = controls[j].hasAttribute("type") ? controls[j].getAttribute("type").toLowerCase() : "text";
                    // Only fail if this is another control in the form and its type is another text-like input
                    passed = controls[j] == ruleContext || (type != "text" && type != "password" && type != "file");
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger if a radio/checkbox with same name is not grouped
         * (e.g., in a fieldset, with role = "group", etc.)
         * Origin: WCAG 2.0 Technique H71, H91
         *
         * Failures:
         * 0a. radio not in fieldset, group or radiogroup - AND I find another radio or check with the same 'name' attribute- AND I'm not in a table
         * 0b. checkbox not in fieldset or group - AND I find another radio or check with the same 'name' attribute - AND I'm not in a table
         * 1. radio or checkbox missing a name [IGNORE?]
         * 2. radio or checkbox has the same "name" attribute as another radio or checkbox in a separate fieldset, group or radiogroup
         * 3. am in table and some combination of the above
         */
        id: "WCAG20_Input_RadioChkInFieldSet",
        context: "dom:input",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (context["aria"].role === 'none' || context["aria"].role === 'presentation') return null;

            const getGroup = (e : Element) => {
                let retVal = RPTUtil.getAncestor(e, "fieldset")
                    || RPTUtil.getAncestorWithRole(e, "radiogroup")
                    || RPTUtil.getAncestorWithRole(e, "group")
                    || RPTUtil.getAncestorWithRole(e, "grid")
                    || RPTUtil.getAncestorWithRole(e, "table");
                if (!retVal) {
                    retVal = RPTUtil.getAncestor(e, "table");
                    if (retVal && !RPTUtil.isDataTable(retVal)) {
                        retVal = null;
                    }
                }
                return retVal;
            }

            // Only radio buttons and checkboxes are in scope
            let ctxType = ruleContext.hasAttribute("type") ? ruleContext.getAttribute("type").toLowerCase() : "text";
            if (ctxType !== "checkbox" && ctxType !== "radio") {
                return null;
            }

            // Determine which form we're in (if any) to determine our scope
            let ctxForm = RPTUtil.getAncestorWithRole(ruleContext, "form")
                || RPTUtil.getAncestor(ruleContext, "html")
                || ruleContext.ownerDocument.documentElement;

            // Get data about all of the visible checkboxes and radios in the scope of this form
            // and cache it for all of the other inputs in this scope
            let formCache = RPTUtil.getCache(ctxForm, "WCAG20_Input_RadioChkInFieldSet", null);
            if (!formCache) {
                formCache = {
                    checkboxByName: {},
                    radiosByName: {},
                    nameToGroup: {

                    },
                    numCheckboxes: 0,
                    numRadios: 0
                }
                // Get all of the checkboxes in the form or body (but not nested in something else and not hidden)
                // And get a mapping of these checkboxes to
                let cWalker = new DOMWalker(ctxForm, false, ctxForm);
                let checkboxQ = [];
                let radiosQ = [];
                while (cWalker.nextNode()) {
                    if (!cWalker.bEndTag
                        && cWalker.node.nodeType === 1
                        && cWalker.node.nodeName.toLowerCase() === "input"
                        && RPTUtil.isNodeVisible(cWalker.node))
                    {
                        let type = (cWalker.node as Element).getAttribute("type");
                        if (type === "checkbox") {
                            checkboxQ.push(cWalker.node);
                        } else if (type === "radio") {
                            radiosQ.push(cWalker.node);
                        }
                    }
                }
                // let checkboxQ = ctxForm.querySelectorAll("input[type=checkbox]");
                for (let idx=0; idx<checkboxQ.length; ++idx) {
                    const cb = checkboxQ[idx];
                    if ((RPTUtil.getAncestorWithRole(cb, "form")
                        || RPTUtil.getAncestor(ruleContext, "html")
                        || ruleContext.ownerDocument.documentElement) === ctxForm
                        && !RPTUtil.shouldNodeBeSkippedHidden(cb))
                    {
                        const name = cb.getAttribute("name") || "";
                        (formCache.checkboxByName[name] = formCache.checkboxByName[name] || []).push(cb);
                        formCache.nameToGroup[name] = formCache.nameToGroup[name] || getGroup(cb);
                        ++formCache.numCheckboxes;
                    }
                }
                // Get all of the radios in the form or body (but not nested in something else and not hidden)
                // let radiosQ = ctxForm.querySelectorAll("input[type=radio]");
                for (let idx=0; idx<radiosQ.length; ++idx) {
                    const r = radiosQ[idx];
                    const radCtx = (RPTUtil.getAncestorWithRole(r, "form")
                        || RPTUtil.getAncestor(ruleContext, "html")
                        || ruleContext.ownerDocument.documentElement);
                    if (radCtx === ctxForm
                        && !RPTUtil.shouldNodeBeSkippedHidden(r))
                    {
                        const name = r.getAttribute("name") || "";
                        (formCache.radiosByName[name] = formCache.radiosByName[name] || []).push(r);
                        formCache.nameToGroup[name] = formCache.nameToGroup[name] || getGroup(r);
                        ++formCache.numRadios;
                    }
                }
                RPTUtil.setCache(ctxForm, "WCAG20_Input_RadioChkInFieldSet", formCache);
            }

            ///////////// Calculated everything, now check the various cases

            const ctxName = ruleContext.getAttribute("name");
            const ctxGroup = getGroup(ruleContext);
            ctxType = ctxType === "radio" ? "Radio" : "Checkbox";

            if (!ctxName || ctxName === "") {
                // First process cases where the control is not named
                if (ctxType === "Radio") {
                    // Radios without names don't act like groups, so don't enforce grouping
                    if (ctxGroup === null) {
                        return RulePass("Pass_RadioNoName", [ctxType]);
                    } else {
                        return RulePass("Pass_Grouped", [ctxType]);
                    }
                } else {
                    // Must be an unnamed checkbox
                    if (ctxGroup === null) {
                        if ((formCache.checkboxByName[""] || []).length > 1) {
                            return RulePotential("Potential_UnnamedCheckbox", [ctxType]);
                        } else {
                            return RulePass("Pass_LoneNogroup", [ctxType]);
                        }
                    } else {
                        return RulePass("Pass_Grouped", [ctxType]);
                    }
                }
            } else {
                // Considering a named checkbox
                const numRadiosWithName = (formCache.radiosByName[ctxName] || []).length;
                const numCheckboxesWithName = (formCache.checkboxByName[ctxName] || []).length;
                // Capitalize the input type for messages
                if (numRadiosWithName > 0 && numCheckboxesWithName > 0) {
                    // We have a naming mismatch between different controls
                    return RuleFail("Fail_ControlNameMismatch", [ctxType, ctxType === "checkbox"?"radio":"checkbox", ctxName]);
                } else if (ctxType === "Radio" && (formCache.numRadios === 1 || numRadiosWithName === 1)
                        || ctxType === "Checkbox" && formCache.numCheckboxes === 1)
                {
                    // This is a lone control (either only control of this type on the page, or a radio button without any others by that name)
                    // We pass this control in all cases
                    if (ctxGroup === null) {
                        return RulePass("Pass_LoneNogroup", [ctxType]);
                    } else {
                        return RulePass("Pass_Grouped", [ctxType]);
                    }
                } else if (ctxType === "Checkbox" && formCache.numCheckboxes > 1 && numCheckboxesWithName === 1) {
                    // We have only one checkbox with this name, but there are other checkboxes in the form.
                    // If we're not grouped, ask them to examine it
                    if (ctxGroup === null) {
                        return RulePotential("Potential_LoneCheckbox", [ctxType]);
                    } else {
                        return RulePass("Pass_Grouped", [ctxType]);
                    }
                } else {
                    // We share a name with another similar control. Are we grouped together?
                    if (ctxGroup === null) {
                        if (formCache.nameToGroup[ctxName] !== null) {
                            // We're not grouped, but some control with the same name is in a group
                            return RuleFail("Fail_NotGroupedOtherGrouped", [ctxType, ctxName]);
                        } else {
                            // None of us are grouped
                            return RuleFail("Fail_NotGroupedOtherNotGrouped", [ctxType, ctxName])
                        }
                    } else if (formCache.nameToGroup[ctxName] !== ctxGroup) {
                        // We're not in the main group with the others
                        return RuleFail("Fail_NotSameGroup", [ctxType, ctxName]);
                    } else {
                        // We're all grouped up!
                        return RulePass("Pass_Grouped", [ctxType]);
                    }
                }
            }
        }
    },
    {
        /**
         * Description: Triggers if input has an onchange event handler
         * Origin: WCAG 2.0 Technique G13
         */
        id: "WCAG20_Input_HasOnchange",
        context: "dom:input, dom:textarea, dom:select",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (ruleContext.nodeName.toLowerCase() == "input" && ruleContext.hasAttribute("type")) {
                let type = ruleContext.getAttribute("type").toLowerCase();
                if (type != "text" && type != "file" && type != "password" && type != "checkbox" && type != "radio")
                    return RulePass("Pass_0");
            }

            let passed = !ruleContext.hasAttribute("onchange");
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Triggers if input has a HTML 5 required property: HAAC, G1124
         */
        id: "HAAC_Input_HasRequired",
        context: "dom:input, dom:textarea, dom:select",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = true;
            if (ruleContext.hasAttribute("required")) {
                passed = false;
            }

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Triggers if placeholder is used as a replacement of label
         *
         * Origin:  HTML 5 - per Richard Schwerdtfeger's requirements. g1145
         */
        id: "HAAC_Input_Placeholder",
        context: "dom:input[placeholder], dom:textarea[placeholder]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (ruleContext.hasAttribute("type")) {
                let type = ruleContext.getAttribute("type").toLowerCase();
                if (type == "hidden" || type == "button") {
                    return RulePass("Pass_0");
                }
            }

            if (ruleContext.hasAttribute("hidden")) {
                let hidden = ruleContext.getAttribute("hidden");
                if (hidden == "" || hidden.toLowerCase() == "hidden") { // when hidden is empty in the element, "" is returned, same as it has a value of "".
                    return RulePass("Pass_0");
                }
            }

            if (ruleContext.hasAttribute("aria-label")) {
                return RulePotential("Potential_1");
            }

            if (ruleContext.hasAttribute("aria-labelledby") && ruleContext.hasAttribute("id")) {
                let id = ruleContext.getAttribute("id").trim();
                let refIds = ruleContext.getAttribute("aria-labelledby").trim().split(/\s+/); // separated by one or more white spaces
                if (!refIds.includes(id)) {
                    return RulePass("Pass_0");
                } else {
                    return RulePotential("Potential_2");
                }
            }

            return RulePass("Pass_0");
        }
    },

    {
        /**
         * Description: Checks that the HTML autocomplete attribute has a correct value.
         * The rule applies to any HTML input, select and textarea element with a non-empty HTML autocomplete attribute except when one of the following is true:
         *  - The element is not visible on the page, not included in the accessibility tree, and not focusable
         *  - The element is an input element with a type property of hidden, button, submit or reset
         *  - The element has a disabled or aria-disabled="true" attribute
         *  - The element has tabindex="-1" and has a semantic role that is not a widget. (Disabled for now)

         * Origin: WCAG 2.1 Success Criterion 1.3.5 (Identify Input Purpose)
         */
        id: "WCAG21_Input_Autocomplete",
        context: "dom:input[autocomplete], dom:textarea[autocomplete], dom:select[autocomplete]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const cache = {
                "tokensOnOff": ["on", "off"],
                "tokenOptionalSection": "section-",
                "tokensOptionalPurpose": ["shipping", "billing"],
                "tokensMandatoryGroup1_password": ["new-password", "current-password"],
                "tokensMandatoryGroup1_multiline": ["street-address"],
                "tokensMandatoryGroup1_month": ["cc-exp"],
                "tokensMandatoryGroup1_numeric": ["cc-exp-month",
                    "cc-exp-year",
                    "transaction-amount",
                    "bday-day",
                    "bday-month",
                    "bday-year"],
                "tokensMandatoryGroup1_date": ["bday"],
                "tokensMandatoryGroup1_url": ["url", "photo"],
                "tokensMandatoryGroup1_text": ["name",
                    "honorific-prefix",
                    "given-name",
                    "additional-name",
                    "family-name",
                    "honorific-suffix",
                    "nickname",
                    "username",
                    "organization-title",
                    "organization",
                    "address-line1",
                    "address-line2",
                    "address-line3",
                    "address-level4",
                    "address-level3",
                    "address-level2",
                    "address-level1",
                    "country",
                    "country-name",
                    "postal-code",
                    "cc-name",
                    "cc-given-name",
                    "cc-additional-name",
                    "cc-family-name",
                    "cc-number",
                    "cc-csc",
                    "cc-type",
                    "transaction-currency",
                    "language",
                    "sex"],
                "tokensMandatoryGroup1_all": ["name",
                    "honorific-prefix",
                    "given-name",
                    "additional-name",
                    "family-name",
                    "honorific-suffix",
                    "nickname",
                    "username",
                    "new-password",
                    "current-password",
                    "organization-title",
                    "organization",
                    "street-address",
                    "address-line1",
                    "address-line2",
                    "address-line3",
                    "address-level4",
                    "address-level3",
                    "address-level2",
                    "address-level1",
                    "country",
                    "country-name",
                    "postal-code",
                    "cc-name",
                    "cc-given-name",
                    "cc-additional-name",
                    "cc-family-name",
                    "cc-number",
                    "cc-exp",
                    "cc-exp-month",
                    "cc-exp-year",
                    "cc-csc",
                    "cc-type",
                    "transaction-currency",
                    "transaction-amount",
                    "language",
                    "bday",
                    "bday-day",
                    "bday-month",
                    "bday-year",
                    "sex",
                    "url",
                    "photo"],
                "tokensOptionalGroup2": ["home",
                    "work",
                    "mobile",
                    "fax",
                    "pager"],

                "tokensMandatoryGroup2_tel": ["tel"],
                "tokensMandatoryGroup2_email": ["email"],
                "tokensMandatoryGroup2_url": ["impp"],
                "tokensMandatoryGroup2_text": ["tel-country-code",
                    "tel-national",
                    "tel-area-code",
                    "tel-local",
                    "tel-local-prefix",
                    "tel-local-suffix",
                    "tel-extension"],
                "tokensMandatoryGroup2_all": ["tel",
                    "tel-country-code",
                    "tel-national",
                    "tel-area-code",
                    "tel-local",
                    "tel-local-prefix",
                    "tel-local-suffix",
                    "tel-extension",
                    "email",
                    "impp"]
            }
            const ruleContext = context["dom"].node as Element;
            let foundMandatoryToken = false;
            let nodeName = ruleContext.nodeName.toLowerCase();
            if (!RPTUtil.isNodeVisible(ruleContext) ||
                RPTUtil.isNodeDisabled(ruleContext)) {
                return null;
            }

            let type = ruleContext.hasAttribute("type") ? ruleContext.getAttribute("type").trim().toLowerCase() : "text";

            let autocompleteAttr = ruleContext.getAttribute("autocomplete").trim().toLowerCase();

            let tokens = autocompleteAttr.split(/\s+/);

            if (tokens.length === 0 || autocompleteAttr.length === 0) {
                return null;
            }

            let tokensMandatoryGroup1 = [];
            let tokensMandatoryGroup2 = [];

            if (nodeName === "textarea" || nodeName === "select") {
                // accept all tokens
                tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_all;
                tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_all;
            } else if (nodeName === "input") {
                // handle the various 'input' types
                switch (type) {

                    // Disable check for input type=hidden for now based on scrum discussion
                    /*
                    case "hidden":
                        // accept all tokens
                        tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_all;
                        tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_all;
                        break;
                    */

                    case "text":
                    case "search":
                        tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_text.concat(cache.tokensMandatoryGroup1_password,
                            cache.tokensMandatoryGroup1_url,
                            cache.tokensMandatoryGroup1_numeric,
                            cache.tokensMandatoryGroup1_month,
                            cache.tokensMandatoryGroup1_date);
                        tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_all;
                        break;
                    case "password":
                        tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_password;
                        break;
                    case "url":
                        tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_url;
                        tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_url;
                        break;
                    case "email":
                        tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_email;
                        break;
                    case "tel":
                        tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_tel;
                        break;
                    case "number":
                        tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_numeric;
                        break;
                    case "month":
                        tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_month;
                        break;
                    case "date":
                        tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_date;
                        break;
                    default:
                        // unsupported type for this rule.
                        return null;
                }

            } else {
                // should never get here.
                return null;
            }

            // Disable check for input type=hidden for now based on scrum discussion
            let autofillMantle = /* (nodeName==="input" && type==="hidden") ? "anchor" : */ "expectation";

            if (autofillMantle === "expectation") {
                // check on|off for expectation mantle.
                if (tokens.includes("on") || tokens.includes("off")) {
                    // on|off should be the only token
                    if (tokens.length === 1) {
                        return RulePass(1);
                    } else {
                        return RuleFail(2);
                    }
                }
            }

            // check detail autofill tokens
            let currIndex = 0;

            // check optional 'section-*' tokens
            if (tokens[currIndex].startsWith(cache.tokenOptionalSection) &&
                tokens[currIndex].length > 8) {
                currIndex++; // consume token
            }

            // check optional 'shipping|billing' tokens
            if (tokens.length > currIndex &&
                cache.tokensOptionalPurpose.includes(tokens[currIndex])) {
                currIndex++; // consume  token
            }

            // check either mandatory group 1 or 2 tokens
            if (tokens.length > currIndex) {
                // check mandatory group 1
                if (tokensMandatoryGroup1.includes(tokens[currIndex])) {
                    foundMandatoryToken = true;
                    currIndex++;
                } else {
                    // check optional tokens for group 2
                    if (cache.tokensOptionalGroup2.includes(tokens[currIndex])) {
                        currIndex++;
                    }
                    // check mandatory group 2
                    if (tokensMandatoryGroup2.includes(tokens[currIndex])) {
                        foundMandatoryToken = true;
                        currIndex++;
                    }
                }
            }

            // Only pass if we have seen either of the mandatory groups and all tokens have been consumed
            if (foundMandatoryToken && tokens.length === currIndex) {
                return RulePass("Pass_0");
            } else {
                return RuleFail("Fail_1");
            }
        }
    },

    {
        /**
         * Description: Trigger if an input does not have a visible label
         * Origin: WCAG 2.0 Success Criterion 3.3.2
         */
        id: "WCAG20_Input_VisibleLabel",
        context: "aria:button,aria:checkbox,aria:combobox,aria:listbox,aria:menuitemcheckbox"
            +",aria:menuitemradio,aria:radio,aria:searchbox,aria:slider,aria:spinbutton"
            +",aria:switch,aria:textbox,aria:progressbar,dom:input[type=file],dom:output",
        dependencies: ["WCAG20_Input_ExplicitLabel"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();

            if (!RPTUtil.isNodeVisible(ruleContext) ||
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
                    if (elementById && RPTUtil.isNodeVisible(elementById) && RPTUtil.hasInnerContentHidden(elementById)) {
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

]
export { a11yRulesInput }
