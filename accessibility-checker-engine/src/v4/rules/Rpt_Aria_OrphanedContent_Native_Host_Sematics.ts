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
import { DOMUtil } from "../../v2/dom/DOMUtil";

export let Rpt_Aria_OrphanedContent_Native_Host_Sematics: Rule = {
    id: "Rpt_Aria_OrphanedContent_Native_Host_Sematics",
    context: "dom:*",
    help: {
        "en-US": {
            "Pass_0": "Rpt_Aria_OrphanedContent_Native_Host_Sematics.html",
            "Fail_1": "Rpt_Aria_OrphanedContent_Native_Host_Sematics.html",
            "group": "Rpt_Aria_OrphanedContent_Native_Host_Sematics.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Content is not within a landmark element",
            "group": "All content must reside within an element with a landmark role"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility"],
        "num": ["2.4.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    },
    {
        "id": ["WCAG_2_1", "WCAG_2_0"],
        "num": ["2.4.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        let params = RPTUtil.getCache(context.dom.node.ownerDocument, "Rpt_Aria_OrphanedContent_Native_Host_Sematics", null);
        if (!params) {
            params = {
                landmarks: {
                    value: ["banner", "complementary", "contentinfo", "form", "main", "navigation", "region", "search"],
                    type: "array"
                },
                possibleOrphanedWidgets: {
                    value: ["button", "combobox", "checkbox", "grid", "heading", "link", "list",
                        "listbox", "menu", "menubar", "progressbar", "radio", "tablist", "textbox", "toolbar", "tree",
                        "treegrid"
                    ],
                    type: "array"
                },
                possibleOrphanedElements: {
                    value: ["p", "table", "input", "textarea", "select", "button", "a", "ol", "ul", "dl", "h1", "h2", "h3", "h4", "h5",
                        "h6", "embed", "object", "area"
                    ],
                    type: "array"
                },
                noLandmarkedRoles: {
                    // These roles don't require landmarks
                    value: ["alert", "alertdialog", "dialog", "tooltip"],
                    type: "array"
                },
                mapLandmarks: {},
                mapPossibleOrphanedWidgets: {},
                mapPossibleOrphanedElements: {},
                mapNoLandmarkedRoles: {}
            }
            // Convert arrays to maps
            params.mapLandmarks = {};
            for (let i = 0; i < params.landmarks.value.length; ++i) {
                params.mapLandmarks[params.landmarks.value[i]] = true;
            }

            params.mapPossibleOrphanedWidgets = {}
            for (let i = 0; i < params.possibleOrphanedWidgets.value.length; ++i) {
                params.mapPossibleOrphanedWidgets[params.possibleOrphanedWidgets.value[i]] = true;
            }

            params.mapPossibleOrphanedElements = {}
            for (let i = 0; i < params.possibleOrphanedElements.value.length; ++i) {
                params.mapPossibleOrphanedElements[params.possibleOrphanedElements.value[i]] = true;
            }

            params.mapNoLandmarkedRoles = {}
            for (let i = 0; i < params.noLandmarkedRoles.value.length; ++i) {
                params.mapNoLandmarkedRoles[params.noLandmarkedRoles.value[i]] = true;
            }

            RPTUtil.setCache(context.dom.node.ownerDocument, "Rpt_Aria_OrphanedContent_Native_Host_Sematics", params);
        }
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (!RPTUtil.isNodeVisible(ruleContext) ||  // avoid diagnosing g1157 for non-visible nodes
            (RPTUtil.hiddenByDefaultElements != null &&
                RPTUtil.hiddenByDefaultElements != undefined &&
                RPTUtil.hiddenByDefaultElements.indexOf(nodeName) > -1)) {
            return RulePass("Pass_0");
        }

        let elemsWithoutContent = ["area", "input", "embed", "button", "textarea", "select"];
        if (!RPTUtil.hasInnerContentHidden(ruleContext) && //only trigger the rule on elements that have content
            elemsWithoutContent.indexOf(nodeName) === -1) { // a few elems wihout content should not be skipped
            return RulePass("Pass_0");
        }

        // Short circuit for layout tables
        if (nodeName == "table" && RPTUtil.isLayoutTable(ruleContext)) {
            return null;
        }

        // Check if it is a possible orphan
        let passed = true;
        let isPossibleOrphanedWidget = RPTUtil.hasRole(ruleContext, params.mapPossibleOrphanedWidgets, true);
        //exclude <link rel="stylesheet" href="xyz.css"> in the <head> and <body>(#608)
        //having link in the head could cause lot of violaions                    
        if (nodeName === 'link') {
            isPossibleOrphanedWidget = false;
        }

        let isPossibleOrphanedElement = nodeName in params.mapPossibleOrphanedElements;
        if (isPossibleOrphanedWidget || isPossibleOrphanedElement) {
            // See if ancestor has landmark roles or implicit land mark roles
            let parentRoles = contextHierarchies["aria"].map(info => info.role);
            passed = parentRoles.filter(role => role in params.mapLandmarks).length > 0
            if (!passed) {
                // Don't fail elements when a parent or sibling has failed - causes too many messages.
                let walkElement = DOMUtil.parentElement(ruleContext);
                while (!passed && walkElement != null) {
                    passed = RPTUtil.getCache(walkElement, "Rpt_Aria_OrphanedContent", false);
                    walkElement = DOMUtil.parentElement(walkElement);
                }
                walkElement = ruleContext.nextElementSibling;
                while (!passed && walkElement != null) {
                    passed = RPTUtil.getCache(walkElement, "Rpt_Aria_OrphanedContent", false);
                    walkElement = walkElement.nextElementSibling;
                }
                walkElement = ruleContext.previousElementSibling;
                while (!passed && walkElement != null) {
                    passed = RPTUtil.getCache(walkElement, "Rpt_Aria_OrphanedContent", false);
                    walkElement = walkElement.previousElementSibling;
                }
                if (!passed) {
                    RPTUtil.setCache(ruleContext, "Rpt_Aria_OrphanedContent", true);

                    // Don't trigger rule if element is a stand-alone widget
                    passed = RPTUtil.getCache(ruleContext, "Rpt_Aria_OrphanedContent_NoTrigger", false) ||
                        RPTUtil.hasRole(ruleContext, params.mapNoLandmarkedRoles, true) ||
                        RPTUtil.getAncestorWithRole(ruleContext, params.mapNoLandmarkedRoles, true);

                    if (passed) {
                        RPTUtil.setCache(ruleContext, "Rpt_Aria_OrphanedContent_NoTrigger", true);
                        return null;
                    }
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }

        //return new ValidationResult(passed, [ruleContext], '', '', []);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}