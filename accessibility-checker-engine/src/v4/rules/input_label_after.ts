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
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let input_label_after: Rule = {
    id: "input_label_after",
    context: "dom:input",
    refactor: {
        "WCAG20_Input_LabelAfter": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2"}
    },
    help: {
        "en-US": {
            "Pass_0": "input_label_after.html",
            "Fail_1": "input_label_after.html",
            "Fail_2": "input_label_after.html",
            "group": "input_label_after.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Checkbox or radio button is nested in label, so label is not after the input control",
            "Fail_2": "Label text is located before its associated checkbox or radio button element",
            "group": "Checkboxes and radio buttons must have a label after the input control"
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
}