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

export let imagebutton_alt_exists: Rule = {
    id: "imagebutton_alt_exists",
    context: "dom:input",
    refactor: {
        "WCAG20_Input_ExplicitLabelImage": {
            "Pass_0": "Pass_0",
            "Pass_1": "Pass_1",
            "Pass_2": "Pass_2",
            "Fail": "Fail"}
    },
    help: {
        "en-US": {
            "Pass_0": "imagebutton_alt_exists.html",
            "Pass_1": "imagebutton_alt_exists.html",
            "Pass_2": "imagebutton_alt_exists.html",
            "Fail": "imagebutton_alt_exists.html",
            "group": "imagebutton_alt_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Image button provides alternative text using the 'alt' attribute",
            "Pass_1": "Image button provides alternative text using an ARIA label",
            "Pass_2": "Image button provides alternative text using the 'title' attribute",
            "Fail": "The <input> element of type \"image\" has no text alternative",
            "group": "The <input> element of type \"image\" should have a text alternative"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
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