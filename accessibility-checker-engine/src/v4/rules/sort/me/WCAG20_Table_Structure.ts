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

export let WCAG20_Table_Structure: Rule = {
    id: "WCAG20_Table_Structure",
    context: "dom:table",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Table_Structure.html",
            "Fail_1": "WCAG20_Table_Structure.html",
            "group": "WCAG20_Table_Structure.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The <{0}> element with \"presentation\" role or \"none\" role has structural element(s) and/or attribute(s) '{1}'",
            "group": "Table elements with 'role=\"presentation\" or 'role=\"none\" should not have structural elements or attributes"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (RPTUtil.isNodeHiddenFromAT(ruleContext)) return null;
        // JCH - OUT OF SCOPE hidden in context
        if (RPTUtil.isDataTable(ruleContext)) return null;
        if (RPTUtil.isNodeInGrid(ruleContext)) return null;

        let errorNodes = [];
        if (RPTUtil.attributeNonEmpty(ruleContext, "summary"))
            errorNodes.push(ruleContext);

        let captionElems = ruleContext.getElementsByTagName("caption");
        for (let i = 0; i < captionElems.length; ++i) {
            if (RPTUtil.getAncestor(captionElems[i], "table") == ruleContext) {

                // Check if the node should be skipped or not based on the Check Hidden Content setting and if the node isVisible or
                // not.
                if (RPTUtil.shouldNodeBeSkippedHidden(captionElems[i])) {
                    continue;
                }

                // Add the node to the errorNodes
                errorNodes.push(captionElems[i]);

                // Since we are not actually making use of theses errorNodes even though they are passed along with
                // ValidationResult, we do not need to keep looping over and getting every single violating node under
                // the rule context. This can be a future enhancenment where we actually make use of the error nodes that
                // are passed along. Adding this break to speed up performance at this point.
                break; // There is no point to keep adding the error nodes, stop after finding the first one
            }
        }

        let thNodes = ruleContext.getElementsByTagName("th");
        for (let i = 0; i < thNodes.length; ++i) {
            if (RPTUtil.getAncestor(thNodes[i], "table") == ruleContext) {

                // Check if the node should be skipped or not based on the Check Hidden Content setting and if the node isVisible or
                // not.
                if (RPTUtil.shouldNodeBeSkippedHidden(thNodes[i])) {
                    continue;
                }

                // Add the node to the errorNodes
                errorNodes.push(thNodes[i]);

                // Since we are not actually making use of theses errorNodes even though they are passed along with
                // ValidationResult, we do not need to keep looping over and getting every single violating node under
                // the rule context. This can be a future enhancenment where we actually make use of the error nodes that
                // are passed along. Adding this break to speed up performance at this point.
                break; // There is no point to keep adding the error nodes, stop after finding the first one
            }
        }
        let tdNodes = ruleContext.getElementsByTagName("td");
        for (let i = 0; i < tdNodes.length; ++i) {
            if ((tdNodes[i].hasAttribute("scope") || tdNodes[i].hasAttribute("headers")) &&
                RPTUtil.getAncestor(tdNodes[i], "table") == ruleContext) {

                // Check if the node should be skipped or not based on the Check Hidden Content setting and if the node isVisible or
                // not.
                if (RPTUtil.shouldNodeBeSkippedHidden(tdNodes[i])) {
                    continue;
                }

                // Add the node to the errorNodes
                errorNodes.push(tdNodes[i]);

                // Since we are not actually making use of theses errorNodes even though they are passed along with
                // ValidationResult, we do not need to keep looping over and getting every single violating node under
                // the rule context. This can be a future enhancenment where we actually make use of the error nodes that
                // are passed along. Adding this break to speed up performance at this point.
                break; // There is no point to keep adding the error nodes, stop after finding the first one
            }
        }

        // Get the node name for the rule context element in this case it will always be table
        let currentElementToken = ruleContext.nodeName.toLowerCase();

        // Construct a new array which will contan only the element tag for the violation elements
        let structuralElementTokens = new Array();

        // Construct a seen hash that will keep trask of all the elements that were already added to the token array, to make sure
        // we do not duplicate any of the elements. Duplicate element tags in the token message looks bad and confusing.
        let seen = {};

        // Loop through all the violating structural elements and extract the element tag to be used as a token
        for (let i = 0; i < errorNodes.length; i++) {
            // Get the node name (tag name) for the violating structural element
            let nodeName = errorNodes[i].nodeName.toLowerCase();

            // Only need to add the violating element once
            if (!seen.hasOwnProperty(nodeName)) {
                // Since we are adding the token as elements and attributes we need to handle
                // the summary attribute on the ruleContext (table). We only add summary once, same as
                // for elements to avoid duplication in the message. (Summary should not duplicate, but just in case)
                if (nodeName == "table" && !seen.hasOwnProperty["summary"]) {
                    // Mark this as a new attribute
                    seen["summary"] = true;

                    // Since this is a new violating element add it to the structural element tokens array
                    structuralElementTokens.push("summary");
                } else {
                    // Mark this as a new element
                    seen[nodeName] = true;

                    // Since this is a new violating element add it to the structural element tokens array
                    structuralElementTokens.push(nodeName);
                }
            }
        }

        // We need to take the array of structural elements and join them with a comma and a space to make grammatical correct in
        // the message.
        let structuralElementTokensStr = structuralElementTokens.join(", ");

        //return new ValidationResult(errorNodes.length == 0, errorNodes, '', '', [currentElementToken, structuralElementTokens]);
        if (errorNodes.length == 0) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1", [currentElementToken, structuralElementTokensStr]);
        }
    }
}