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
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { getCache, setCache } from "../util/CacheUtil";
import { VisUtil } from "../../v2/dom/VisUtil";

export let input_checkboxes_grouped: Rule = {
    id: "input_checkboxes_grouped",
    context: "dom:input",
    refactor: {
        "WCAG20_Input_RadioChkInFieldSet": {
            "Pass_LoneNogroup": "Pass_LoneNogroup",
            "Pass_Grouped": "Pass_Grouped",
            "Pass_RadioNoName": "Pass_RadioNoName",
            "Fail_ControlNameMismatch": "Fail_ControlNameMismatch",
            "Fail_NotGroupedOtherGrouped": "Fail_NotGroupedOtherGrouped",
            "Fail_NotGroupedOtherNotGrouped": "Fail_NotGroupedOtherNotGrouped",
            "Fail_NotSameGroup": "Fail_NotSameGroup",
            "Potential_LoneCheckbox": "Potential_LoneCheckbox",
            "Potential_UnnamedCheckbox": "Potential_UnnamedCheckbox"
        }
    },
    help: {
        "en-US": {
            "group": "input_checkboxes_grouped.html",
            "Pass_LoneNogroup": "input_checkboxes_grouped.html",
            "Pass_Grouped": "input_checkboxes_grouped.html",
            "Pass_RadioNoName": "input_checkboxes_grouped.html",
            "Fail_ControlNameMismatch": "input_checkboxes_grouped.html",
            "Fail_NotGroupedOtherGrouped": "input_checkboxes_grouped.html",
            "Fail_NotGroupedOtherNotGrouped": "input_checkboxes_grouped.html",
            "Fail_NotSameGroup": "input_checkboxes_grouped.html",
            "Potential_LoneCheckbox": "input_checkboxes_grouped.html",
            "Potential_UnnamedCheckbox": "input_checkboxes_grouped.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Related sets of radio buttons or checkboxes should be programmatically grouped",
            "Pass_LoneNogroup": "{0} grouping not required for a control of this type",
            "Pass_Grouped": "{0} input is grouped with other related controls with the same name",
            "Pass_RadioNoName": "Radio input is not grouped, but passes because it has no name to group with other radio inputs",
            "Fail_ControlNameMismatch": "{0} input found that has the same name, \"{2}\" as a {1} input",
            "Fail_NotGroupedOtherGrouped": "{0} input is not in the group with another {0} with the name \"{1}\"",
            "Fail_NotGroupedOtherNotGrouped": "{0} input and others with the name \"{1}\" are not grouped together",
            "Fail_NotSameGroup": "{0} input is in a different group than another {0} with the name \"{1}\"",
            "Potential_LoneCheckbox": "Verify that this ungrouped checkbox input is not related to other checkboxes",
            "Potential_UnnamedCheckbox": "Verify that this un-named, ungrouped checkbox input is not related to other checkboxes"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (context["aria"].role === 'none' || context["aria"].role === 'presentation') return null;

        const getGroup = (e: Element) => {
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
        let formCache = getCache(ctxForm, "input_checkboxes_grouped", null);
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
                    && VisUtil.isNodeVisible(cWalker.node)) {
                    let type = (cWalker.node as Element).getAttribute("type");
                    if (type === "checkbox") {
                        checkboxQ.push(cWalker.node);
                    } else if (type === "radio") {
                        radiosQ.push(cWalker.node);
                    }
                }
            }
            // let checkboxQ = ctxForm.querySelectorAll("input[type=checkbox]");
            for (let idx = 0; idx < checkboxQ.length; ++idx) {
                const cb = checkboxQ[idx];
                if ((RPTUtil.getAncestorWithRole(cb, "form")
                    || RPTUtil.getAncestor(ruleContext, "html")
                    || ruleContext.ownerDocument.documentElement) === ctxForm
                    && !RPTUtil.shouldNodeBeSkippedHidden(cb)) {
                    const name = cb.getAttribute("name") || "";
                    (formCache.checkboxByName[name] = formCache.checkboxByName[name] || []).push(cb);
                    formCache.nameToGroup[name] = formCache.nameToGroup[name] || getGroup(cb);
                    ++formCache.numCheckboxes;
                }
            }
            // Get all of the radios in the form or body (but not nested in something else and not hidden)
            // let radiosQ = ctxForm.querySelectorAll("input[type=radio]");
            for (let idx = 0; idx < radiosQ.length; ++idx) {
                const r = radiosQ[idx];
                const radCtx = (RPTUtil.getAncestorWithRole(r, "form")
                    || RPTUtil.getAncestor(ruleContext, "html")
                    || ruleContext.ownerDocument.documentElement);
                if (radCtx === ctxForm
                    && !RPTUtil.shouldNodeBeSkippedHidden(r)) {
                    const name = r.getAttribute("name") || "";
                    (formCache.radiosByName[name] = formCache.radiosByName[name] || []).push(r);
                    formCache.nameToGroup[name] = formCache.nameToGroup[name] || getGroup(r);
                    ++formCache.numRadios;
                }
            }
            setCache(ctxForm, "input_checkboxes_grouped", formCache);
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
                return RuleFail("Fail_ControlNameMismatch", [ctxType, ctxType === "checkbox" ? "radio" : "checkbox", ctxName]);
            } else if (ctxType === "Radio" && (formCache.numRadios === 1 || numRadiosWithName === 1)
                || ctxType === "Checkbox" && formCache.numCheckboxes === 1) {
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
}