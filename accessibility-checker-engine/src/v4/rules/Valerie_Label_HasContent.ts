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
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";

export let Valerie_Label_HasContent: Rule = {
    id: "Valerie_Label_HasContent",
    context: "dom:label",
    help: {
        "en-US": {
            "Pass_Regular": "Valerie_Label_HasContent.html",
            "Pass_AriaLabel": "Valerie_Label_HasContent.html",
            "Pass_LabelledBy": "Valerie_Label_HasContent.html",
            "Fail_1": "Valerie_Label_HasContent.html",
            "group": "Valerie_Label_HasContent.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_Regular": "<label> element has accessible name with inner content",
            "Pass_AriaLabel": "<label> element has accessible name via 'aria-label'",
            "Pass_LabelledBy": "<label> element has accessible name via 'aria-labelledby'",
            "Fail_1": "The <label> element does not have descriptive text that identifies the expected input",
            "group": "A <label> element must have non-empty descriptive text that identifies the purpose of the interactive component"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (RPTUtil.hasInnerContentHidden(ruleContext)) {
            return RulePass("Pass_Regular");
        } else if ((ruleContext.getAttribute("aria-label") || "").trim().length > 0) {
            return RulePass("Pass_AriaLabel");
        } else if (ruleContext.hasAttribute("aria-labelledby")) {
            let labelElem = FragmentUtil.getById(ruleContext, ruleContext.getAttribute('aria-labelledby'));
            if (labelElem && RPTUtil.hasInnerContent(labelElem)) {
                return RulePass("Pass_LabelledBy");
            }
        }
        return RuleFail("Fail_1");
    }
}