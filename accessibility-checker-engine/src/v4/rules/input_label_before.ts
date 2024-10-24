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
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";

export const input_label_before: Rule = {
    id: "input_label_before",
    context: "dom:input, dom:textarea, dom:select",
    refactor: {
        "WCAG20_Input_LabelBefore": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2"}
    },
    help: {
        "en-US": {
            "Pass_0": "input_label_before.html",
            "Fail_1": "input_label_before.html",
            "Fail_2": "input_label_before.html",
            "group": "input_label_before.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Text input is nested in label such that input precedes the label text",
            "Fail_2": "Label text is located after its associated text input or <select> element",
            "group": "Text inputs and <select> elements must have a label before the input control"
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
        if (ruleContext.nodeName.toLowerCase() == "input" && ruleContext.hasAttribute("type")) {
            let type = ruleContext.getAttribute("type").toLowerCase();
            if (type != "text" && type != "file" && type != "password") {
                return null;
            }
        }

        // Get only the non-hidden labels for element
        let labelElem = CommonUtil.getLabelForElementHidden(ruleContext, true);
        
        if (labelElem == null || !CommonUtil.hasInnerContentHidden(labelElem)) {
            // Due to dependency, label must be done via title - this rule doesn't apply
            return null;
        }

        let value = CommonUtil.compareNodeOrder(labelElem, ruleContext);
        if (value === -2) {
            // ignore if no label or the content for the label is only from the nested input control 
            let text = CommonUtil.getInnerText(ruleContext);
            if (text && text.trim().length > 0 && CommonUtil.getInnerText(ruleContext).trim() === text.trim()) {
                // Due to dependency, label must be done via title - this rule doesn't apply
                return null;
            }

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
}