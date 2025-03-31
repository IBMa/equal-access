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
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { DOMUtil } from "../../v2/dom/DOMUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { CacheUtil } from "../util/CacheUtil";
import { AccNameUtil } from "../util/AccNameUtil";
import { VisUtil } from "../util/VisUtil";
import { CommonUtil } from "../util/CommonUtil";
import { AriaUtil } from "../util/AriaUtil";

export const aria_landmark_name_unique: Rule = {
    id: "aria_landmark_name_unique",
    context: "aria:complementary, aria:banner, aria:contentinfo, aria:main, aria:navigation, aria:region, aria:search, aria:form",
    refactor: {
        "landmark_name_unique": {
            "Pass_0": "Pass_0",
            "Fail_0": "Fail_0"}
    },
    help: {
        "en-US": {
            "Pass_0": "aria_landmark_name_unique.html",
            "Fail_0": "aria_landmark_name_unique.html",
            "group": "aria_landmark_name_unique.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Multiple elements with \"{0}\" landmarks within the same parent region are distinguished by unique 'aria-label' or 'aria-labelledby'",
            "Fail_0": "Multiple elements with \"{0}\" landmarks within the same parent region are not distinguished from one another because they have the same \"{1}\" label",
            "group": "Each landmark should have a unique 'aria-labelledby' or 'aria-label' or be nested in a different parent region"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next"],
        "num": ["2.4.1"], //remapped to 2.4.1 to be consistent with all landmark region rules
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    },
    {
        "id": ["WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        // TODO do I need to fiter out bad contentinfo nodes: The footer element is not a contentinfo landmark when it is a descendant of the following HTML5 sectioning elements: https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/landmarks/HTML5.html
        const ruleContext = context["dom"].node as Element;
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        
        // Checking if this landmark is inside a dialog element. If it is we are going to skip checking it. 
        /**var copyOfRuleContext = ruleContext;
        var parnetNodesOfRuleContext = [];
        while (copyOfRuleContext) {
            parnetNodesOfRuleContext.unshift(copyOfRuleContext);
            copyOfRuleContext = copyOfRuleContext.parentElement;
        }
        parnetNodesOfRuleContext.forEach(elem => {
            if (elem !== null) {
                if (elem.tagName == "DIALOG" || elem.getAttribute('role') == "dialog") {
                    return null // Skipping checking landmarks that happen to be inside dialog elements
                }
            }
        })
        */
        if (CommonUtil.getAncestor(ruleContext, ["DIALOG"]) !== null || AriaUtil.getAncestorWithRole(ruleContext, "dialog", true) !== null)
            return null;

        // Begining formCache work
        let ownerDocument = FragmentUtil.getOwnerFragment(ruleContext);
        let formCache : {
            navigationNodes: any[],
            navigationNodesComputedLabels: string[],
            navigationNodesParents: any[],
            navigationNodesMatchFound: string[]
        } = CacheUtil.getCache(
            ruleContext.ownerDocument,
            "aria_landmark_name_unique",
            null
        );
        if (!formCache) {
            // console.log("---------ENTERING FORM CACHE")
            formCache = {
                navigationNodes: [],
                navigationNodesComputedLabels: [],
                navigationNodesParents: [],
                navigationNodesMatchFound: []
            };
            let navigationNodesTemp = ownerDocument.querySelectorAll(
                'aside,[role="complementary"], footer,[role="contentinfo"], header,[role="banner"], main,[role="main"], nav,[role="navigation"], form,[role="form"], section,[role="region"],[role="search"]'
            );
            let navigationNodes = Array.from(navigationNodesTemp);
            let navigationNodesParents = [];
            let navigationNodesMatchFound : string[] = [];

            // This block of code filters out any nav elements that are under a dialog. As those are not ones we want to test against as we consider dialogs are separate locations from the rest of the main page.
            let navigationNodesWithoutDialogs = [];
            for (let i = 0; i < navigationNodes.length; i++) {
                /**let a = navigationNodes[i];
                
                let dialogNodeFoundFlag = false;
                while (a) {
                    a = a.parentElement;
                    if (a !== null) {
                        if (a.tagName == "DIALOG" || a.getAttribute('role') == "dialog") {
                            dialogNodeFoundFlag = true;
                        }
                    }
                }
                if (!dialogNodeFoundFlag) {
                    navigationNodesWithoutDialogs.push(navigationNodes[i])
                }*/

                // ignore node that is AT hidden or in a dialog
                if (VisUtil.isNodeHiddenFromAT(navigationNodes[i]) || CommonUtil.getAncestor(navigationNodes[i], ["DIALOG"]) !== null || AriaUtil.getAncestorWithRole(navigationNodes[i], "dialog", true) !== null) 
                    continue;
                navigationNodesWithoutDialogs.push(navigationNodes[i]);
                    
            }
            navigationNodes = navigationNodesWithoutDialogs;


            for (let i = 0; i < navigationNodes.length; i++) {
                // Loop over all the landmark nodes
                let els = [];
                let a = navigationNodes[i].parentElement;
                while (a) {
                    els.push(a);
                    a = a.parentElement;
                }

                for (let j = 0; j < els.length; j++) {
                    // Loop over all the parents of the landmark nodes
                    // Find nearest landmark parent based on the tagName or the role attribute
                    let tagNameTrigger = [
                        "ASIDE",
                        "FOOTER",
                        "FORM",
                        "HEADER",
                        "MAIN",
                        "NAV",
                        "SECTION",
                    ].includes(els[j].tagName);
                    let roleNameTrigger = false;
                    if (els[j].hasAttribute("role")) {
                        roleNameTrigger = [
                            "complementary",
                            "contentinfo",
                            "form",
                            "banner",
                            "main",
                            "navigation",
                            "region",
                            "search",
                        ].includes(els[j].getAttribute("role")); // TODO we are not covering the case where a elemenent with multiple roles. e.g., role = "form banner". This is a improvment we might want to add in the future.
                    }
                    if (tagNameTrigger || roleNameTrigger) {
                        // Nearest parent-landmark found
                        navigationNodesParents.push(els[j]);
                        break;
                    }
                    if (j === els.length - 1) {
                        // This node is at the head of the file so it does not have a parent
                        navigationNodesParents.push(null);
                        break;
                    }
                }
            }

            let navigationNodesComputedLabels = [];
            for (let i = 0; i < navigationNodes.length; i++) {
                const pair = AccNameUtil.computeAccessibleName(navigationNodes[i]);
                // Loop over all the landmark nodes
                navigationNodesComputedLabels.push(
                    /**ARIAMapper.computeName(navigationNodes[i])*/
                    pair && pair.name && pair.name.trim().length > 0 ? pair.name.trim() : ""
                );
            }
            for (let i = 0; i < navigationNodesParents.length; i++) {
                // Loop over all the parents of the landmark nodes to find duplicates
                let matchFound = false;
                let pass_0_flag = false;
                for (let j = 0; j < navigationNodesParents.length; j++) {
                    if (j === i) {
                        // We do not want to compare against ourselfs
                        continue;
                    }

                    // This if statement focus on the case where the parent landmark is null
                    if (
                        navigationNodesParents[i] === null &&
                        navigationNodesParents[j] === null
                    ) {
                        // We are looking at two root nodes, so we should compare them.
                        if (
                            ARIAMapper.nodeToRole(navigationNodes[i]) ===
                            ARIAMapper.nodeToRole(navigationNodes[j])
                        ) {
                            // Both nodes have the same role AND
                            if (
                                navigationNodesComputedLabels[i] ===
                                navigationNodesComputedLabels[j]
                            ) {
                                // both have the same (computed) aria-label/aria-labelledby
                                // if (navigationNodesComputedLabels[i] === "") {
                                navigationNodesMatchFound.push("Fail_0"); // Fail 0
                                matchFound = true;
                                break;
                                // }
                            } else {
                                // Same parents && same node roles BUT different computed aria-label/aria-labelledby
                                // We have at least a Pass_0. But we need to check all nodes to see if another one fails. So set a flag.
                                pass_0_flag = true;
                            }
                        } else {
                            // Same parents but different node roles // Not applicable
                        }
                    } else if (
                        navigationNodesParents[i] === null ||
                        navigationNodesParents[j] === null
                    ) {
                        // We are looking at a single root node
                        continue;
                    }

                    // This if statement focus on the case where the parent landmark is NOT null
                    if (
                        DOMUtil.sameNode(
                            navigationNodesParents[i],
                            navigationNodesParents[j]
                        )
                    ) {
                        // We have the same parent-landmark AND
                        if (
                            ARIAMapper.nodeToRole(navigationNodes[i]) ===
                            ARIAMapper.nodeToRole(navigationNodes[j])
                        ) {
                            // Both nodes have the same role AND
                            if (
                                navigationNodesComputedLabels[i] ===
                                navigationNodesComputedLabels[j]
                            ) {
                                // both have the same (computed) aria-label/aria-labelledby
                                // if (navigationNodesComputedLabels[i] === "") {
                                navigationNodesMatchFound.push("Fail_0"); // Fail 0
                                matchFound = true;
                                break;
                                // }
                            } else {
                                // Same parents && same node roles BUT different computed aria-label/aria-labelledby
                                // We have at least a Pass_0. But we need to check all nodes to see if another one fails. So set a flag.
                                pass_0_flag = true;
                            }
                        } else {
                            // Same parents but different node roles // Not applicable
                        }
                    } else {
                        // Different parents // Not applicable
                    }
                }
                if (!matchFound) {
                    if (pass_0_flag) {
                        navigationNodesMatchFound.push("Pass_0");
                    } else {
                        navigationNodesMatchFound.push("null"); // This is not the keyword null on purpose. It is a spaceholder in the array so indexes match up.
                    }
                }
            }
            formCache.navigationNodesComputedLabels =
                navigationNodesComputedLabels;
            formCache.navigationNodes = navigationNodes;
            formCache.navigationNodesParents = navigationNodesParents;
            formCache.navigationNodesMatchFound = navigationNodesMatchFound;
            CacheUtil.setCache(
                ruleContext.ownerDocument,
                "aria_landmark_name_unique",
                formCache
            );

            // TODO Add validation that all 3 arrays are the same length
            // console.log("-------------End formCache")
        } // End formCache

        let indexToCheck = -1;
        for (let i = 0; i < formCache.navigationNodes.length; i++) {
            if (ruleContext.isSameNode(formCache.navigationNodes[i])) {
                indexToCheck = i;
            }
        }
        if (indexToCheck === -1) {
            return null;
        }
        if (formCache.navigationNodesMatchFound[indexToCheck] === "Pass_0") {
            return RulePass("Pass_0",
                [
                    ARIAMapper.nodeToRole(
                        formCache.navigationNodes[indexToCheck]
                    ),
                ]
            );
        } else if (formCache.navigationNodesMatchFound[indexToCheck] === "Fail_0") {
            return RuleFail("Fail_0",
                [
                    ARIAMapper.nodeToRole(
                        formCache.navigationNodes[indexToCheck]
                    ),
                    formCache.navigationNodesComputedLabels[indexToCheck],
                ]
            );
        } else {
            return null;
        }
    }
}