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

export let WCAG20_Input_ExplicitLabelImage: Rule = {
    id: "WCAG20_Input_ExplicitLabelImage",
    context: "dom:input",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Input_ExplicitLabelImage.html",
            "Pass_1": "WCAG20_Input_ExplicitLabelImage.html",
            "Pass_2": "WCAG20_Input_ExplicitLabelImage.html",
            "Fail": "WCAG20_Input_ExplicitLabelImage.html",
            "group": "WCAG20_Input_ExplicitLabelImage.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Image button provides alternative text using the 'alt' attribute",
            "Pass_1": "Image button provides alternative text using a ARIA label",
            "Pass_2": "Image button provides alternative text using the 'title' attribute",
            "Fail": "The <input> element of type \"image\" has no text alternative",
            "group": "The <input> element of type \"image\" should have a text alternative"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "59796f",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
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
}