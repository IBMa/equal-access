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
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";

export const img_alt_null: Rule = {
    id: "img_alt_null",
    context: "dom:img[alt]",
    refactor: {
        "WCAG20_Img_TitleEmptyWhenAltNull": {
            "Pass_0": "pass",
            "Fail_1": "fail_decorative"}
    },
    help: {
        "en-US": {
            "pass": "img_alt_null.html",
            "fail_decorative": "img_alt_null.html",
            "potential_aria_override": "img_alt_null.html",
            "group": "img_alt_null.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Neither 'aria' nor 'title' attributes are used for the decorative image",
            "fail_decorative": "The image 'alt' attribute is empty, but the 'title' attribute is not empty",
            "potential_aria_override": "The image 'alt' attribute is empty, but the 'aria' label is not empty and overrides the 'alt' attribute",
            "group": "When the intent is to mark an image as decorative with an empty 'alt' attribute, the 'aria' or 'title' attributes should not be used"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [{"46ca7f": {"potential_aria_override": "fail"}}],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        if (ruleContext.getAttribute("alt").trim().length > 0) {
            return null;
        }
        // We have a title, but alt is empty
        if (RPTUtil.getAriaLabel(ruleContext).length > 0) {
            return RulePotential("potential_aria_override");
        } else if (RPTUtil.attributeNonEmpty(ruleContext, "title")) {
            return RuleFail("fail_decorative");
        } else {
            return RulePass("pass");
        }
    }
}