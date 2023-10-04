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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { DOMUtil } from "../../v2/dom/DOMUtil";

export let aria_widget_labelled: Rule = {
    id: "aria_widget_labelled",
    context: "dom:*",
    refactor: {
        "Rpt_Aria_WidgetLabels_Implicit": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "group": "aria_widget_labelled.html",
            "Pass_0": "aria_widget_labelled.html",
            "Fail_1": "aria_widget_labelled.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Interactive component must have a programmatically associated name",
            "Pass_0": "Rule Passed",
            "Fail_1": "Interactive component with ARIA role '{0}' does not have a programmatically associated name"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "m6b1q3",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        /* removed the role check role= presentation and role=none since these 2 roles are not in the list of widget type roles */
        if (
            (ruleContext.hasAttribute("type") &&
                ruleContext.getAttribute("type") === "hidden") ||
            (RPTUtil.getAncestorWithRole(ruleContext, "combobox") &&
                !(
                    RPTUtil.hasRoleInSemantics(ruleContext, "textbox") ||
                    RPTUtil.hasRoleInSemantics(ruleContext, "searchbox")
                ))
        ) {
            // we need to diagnose that a combobox input textbox has a label(github issue #1104)
            return null;
        }

        let elemRole = ARIAMapper.nodeToRole(ruleContext);
        let tagName = ruleContext.nodeName.toLowerCase();

        // Handled by input_label_exists
        let skipRoles = [
            "button",
            "checkbox",
            "combobox",
            "listbox",
            "menuitemcheckbox",
            "menuitemradio",
            "radio",
            "searchbox",
            "slider",
            "spinbutton",
            "switch",
            "textbox",
            "progressbar",
            "link",
        ];
        if (skipRoles.includes(elemRole)) return null;
        if (
            tagName === "output" ||
            (tagName === "input" &&
                ruleContext.getAttribute("type") === "file")
        ) {
        }
        if (!ruleContext.hasAttribute("role")) {
            // Form/input elements are checked by G41, we skip them from this rule. Github issue 449
            let skipElements = [
                "input",
                "textarea",
                "select",
                "button",
                "datalist",
                "optgroup",
                "option",
                "keygen",
                "output",
                "progress",
                "meter",
            ];
            if (
                skipElements.indexOf(ruleContext.nodeName.toLowerCase()) !=
                -1
            ) {
                return null;
            }
        }

        // avoid diagnosing the popup list of a combobox.
        let rolesToCheck = ["listbox", "tree", "grid", "dialog"];
        for (let j = 0; j < rolesToCheck.length; j++) {
            if (RPTUtil.hasRoleInSemantics(ruleContext, rolesToCheck[j])) {
                let comboboxes = RPTUtil.getElementsByRoleHidden(
                    ruleContext.ownerDocument,
                    "combobox",
                    true,
                    true
                );
                for (let k = 0; k < comboboxes.length; k++) {
                    let combobox = comboboxes[k];
                    let aria_owns = RPTUtil.getElementAttribute(
                        combobox,
                        "aria-owns"
                    );
                    if (aria_owns) {
                        let owns = RPTUtil.normalizeSpacing(
                            aria_owns.trim()
                        ).split(" ");
                        for (let i = 0; i < owns.length; i++) {
                            let owned = FragmentUtil.getById(
                                ruleContext,
                                owns[i]
                            );
                            if (owned === ruleContext) {
                                return null;
                            }
                        }
                    }
                }
            }
        }

        let passed = true;
        let prohibited = false;
        let designPatterns = ARIADefinitions.designPatterns;
        //get attribute roles as well as implicit roles.
        let roles = RPTUtil.getRoles(ruleContext, true);
        let numWidgetsTested = 0;
        let interactiveRoleTypes = ["widget", "liveRegion", "window"];
        for (let i = 0, length = roles.length; passed && i < length; ++i) {
            let pattern = designPatterns[roles[i]];

            if (
                pattern &&
                pattern.nameRequired &&
                pattern.roleType &&
                interactiveRoleTypes.includes(pattern.roleType)
            ) {
                ++numWidgetsTested;

                // All widgets may have an author supplied accessible name.
                // Title is legal, but don't advertise its use in documentation.
                // Encourage use of aria-label, aria-labelledby or html label element.
                passed =
                    RPTUtil.hasAriaLabel(ruleContext) ||
                    RPTUtil.attributeNonEmpty(ruleContext, "title") ||
                    RPTUtil.getLabelForElementHidden(ruleContext, true);

                if (
                    !passed &&
                    pattern.nameFrom &&
                    pattern.nameFrom.indexOf("contents") >= 0
                ) {
                    // See if widget's accessible name is supplied by element's inner text
                    // nameFrom: ["author", "contents"]
                    passed = RPTUtil.hasInnerContentOrAlt(ruleContext);
                }

                if (!passed) {
                    // check if it has implicit label, like <label><input ....>abc </label>
                    passed = RPTUtil.hasImplicitLabel(ruleContext);
                }

                if (
                    !passed &&
                    ruleContext.tagName.toLowerCase() === "img" &&
                    !ruleContext.hasAttribute("role") &&
                    ruleContext.hasAttribute("alt")
                ) {
                    passed =
                        DOMUtil.cleanWhitespace(
                            ruleContext.getAttribute("alt")
                        ).trim().length > 0;
                }

                if (pattern.nameFrom.indexOf("prohibited") >= 0) {
                    prohibited = true;
                }
            }
        }

        if (numWidgetsTested === 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", [elemRole]);
        } else {
            //TODO
            //                if (prohibited) {
            //                    return RuleFail("Fail_2");
            //                } else {
            return RulePass("Pass_0");
            //                }
        }
    }
}