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
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { DOMUtil } from "../../v2/dom/DOMUtil";

export const label_content_exists: Rule = {
    id: "label_content_exists",
    context: "dom:label",
    refactor: {
        "Valerie_Label_HasContent": {
            "Pass_Regular": "Pass_Regular",
            "Pass_AriaLabel": "Pass_AriaLabel",
            "Pass_LabelledBy": "Pass_LabelledBy",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "Pass_Regular": "label_content_exists.html",
            "Pass_AriaLabel": "label_content_exists.html",
            "Pass_LabelledBy": "label_content_exists.html",
            "Fail_1": "label_content_exists.html",
            "group": "label_content_exists.html"
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
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (CommonUtil.hasInnerContentHidden(ruleContext)) {
            return RulePass("Pass_Regular");

        } else if ((ruleContext.getAttribute("aria-label") || "").trim().length > 0) {
            return RulePass("Pass_AriaLabel");
        } else if (ruleContext.hasAttribute("aria-labelledby")) {
            let labelElem = FragmentUtil.getById(ruleContext, ruleContext.getAttribute('aria-labelledby'));
            if (labelElem && !DOMUtil.sameNode(labelElem, ruleContext) && CommonUtil.hasInnerContent(labelElem)) {
                return RulePass("Pass_LabelledBy");
            }
        }
        return RuleFail("Fail_1");
    }
}