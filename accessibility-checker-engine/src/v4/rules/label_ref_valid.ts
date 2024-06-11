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
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { VisUtil } from "../../v2/dom/VisUtil";

export let label_ref_valid: Rule = {
    id: "label_ref_valid",
    context: "dom:label[for]",
    refactor: {
        "WCAG20_Label_RefValid": {
            "Pass_0": "pass",
            "Fail_1": "fail_invalid"}
    },
    help: {
        "en-US": {
            "pass": "label_ref_valid.html",
            "fail_invalid": "label_ref_valid.html",
            "group": "label_ref_valid.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The 'for' attribute for a label referencea a unique non-empty 'id' attribute of an <input> element",
            "fail_invalid": "The value \"{0}\" of the 'for' attribute is not the 'id' of a valid <input> element",
            "group": "The 'for' attribute for a label must reference a non-empty, unique 'id' attribute of an <input> element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let id = ruleContext.getAttribute("for");
        let passed = false;
        let target = FragmentUtil.getById(ruleContext, id);
        if (target) {
            // ignore if both label and control are invisible
            if (!VisUtil.isNodeVisible(target) && !VisUtil.isNodeVisible(ruleContext))
                return null;
            
            passed = true;
            // handles null and undefined
            if (!target.hasAttribute("role")) {
                // Fail if we're pointing at something that is labelled by another mechanism
                let nodeName = target.nodeName.toLowerCase();
                passed = nodeName == "input" || nodeName == "select" || nodeName == "textarea"
                    || nodeName == "button" || nodeName == "datalist"
                    || nodeName == "optgroup" || nodeName == "option"
                    || nodeName == "keygen" || nodeName == "output"
                    || nodeName == "progress" || nodeName == "meter"
                    || nodeName == "fieldset" || nodeName == "legend";
                if (target.nodeName.toLowerCase() == "input" && target.hasAttribute("type")) {
                    let type = target.getAttribute("type").toLowerCase();
                    passed = type == "text" || type == "password" || type == "file" ||
                        type == "checkbox" || type == "radio" ||
                        type == "hidden" || type == "search" || type == "tel" || type == "url" || type == "email" ||  //HTML 5
                        type == "date" || type == "number" || type == "range" || type == "image" || //HTML 5
                        type == "time" || type == "color" ||  // HTML 5
                        type == "datetime-local" || type == "month" || type == "week"; //HTML5.1
                }
            }

            // Add one more check to make sure the target element is NOT hidden, in the case the target is hidden
            // flag a violation regardless of what the Check Hidden Content setting is.
            if (passed && !VisUtil.isNodeVisible(target)) {
                passed = false;
            }
        }
        let retToken: string[] = [];
        if (!passed) {
            retToken.push(id);
        }
        //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [retToken]);
        if (!passed) {
            return RuleFail("fail_invalid", retToken);
        } else {
            return RulePass("pass");
        }
    }
}