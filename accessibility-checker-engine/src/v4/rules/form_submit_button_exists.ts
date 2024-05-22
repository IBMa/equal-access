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

export let form_submit_button_exists: Rule = {
    id: "form_submit_button_exists",
    context: "dom:form",
    refactor: {
        "WCAG20_Form_HasSubmit": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "form_submit_button_exists.html",
            "Potential_1": "form_submit_button_exists.html",
            "group": "form_submit_button_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify the <form> element has a submit button or an image button",
            "group": "A <form> element should have a submit button or an image button"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["3.2.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = false;
        if (ruleContext.firstChild) {
            // submit buttons are usually at the bottom - walk backwards
            let nw = new NodeWalker(ruleContext, true);
            while (!passed && nw.prevNode() && nw.node != ruleContext) {
                if (!nw.bEndTag) {
                    let nodeName = nw.node.nodeName.toLowerCase();
                    if (nodeName === "input") {
                        let type = nw.elem().getAttribute("type");
                        if (type) {
                            type = type.toLowerCase();
                        }
                        passed = type === "submit" || type === "image";
                    } else if (nodeName === "button") {
                        passed = nw.elem().hasAttribute("type") && nw.elem().getAttribute("type").toLowerCase() === "submit";
                    } else if (nw.node.nodeType === 1) {
                        passed = RPTUtil.hasRole(nw.node, "button");
                    }
                }
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}