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
import { VisUtil } from "../../v2/dom/VisUtil";

export let WCAG20_Img_HasAlt: Rule = {
    id: "WCAG20_Img_HasAlt",
    context: "dom:img",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Img_HasAlt.html",
            "Fail_1": "WCAG20_Img_HasAlt.html",
            "Fail_2": "WCAG20_Img_HasAlt.html",
            "Fail_3": "WCAG20_Img_HasAlt.html",
            "group": "WCAG20_Img_HasAlt.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Image 'alt' attribute value consists only of whitespace",
            "Fail_2": "Image does not have an 'alt' attribute short text alternative",
            "Fail_3": "Image does not have an 'alt' attribute and 'title' attribute value consists only of whitespace",
            "group": "Images must have an 'alt' attribute with a short text alternative if they convey meaning, or 'alt=\"\" if decorative"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "23a2a8",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // If not visible to the screen reader, ignore
        if (!VisUtil.isNodeVisible(ruleContext) || ruleContext.getAttribute("aria-hidden") === "true") {
            return null;
        }
        // Images with different roles should be handled by other ARIA rules
        if (ruleContext.hasAttribute("role")) {
            let role = ruleContext.getAttribute("role");
            if (role === "presentation" || role === "none") {
                if (RPTUtil.isTabbable(ruleContext)) {
                    // Ignore the role
                } else {
                    return RulePass("Pass_0");
                }
            } else {
                return null;
            }
        }
        // JCH - NO OUT OF SCOPE hidden in context
        if (ruleContext.hasAttribute("alt")) {
            let alt = ruleContext.getAttribute("alt");
            if (alt.trim().length === 0 && alt.length !== 0) {
                // Alt, but it's whitespace (alt=" ")
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        } else if (ruleContext.hasAttribute("title")) {
            let title = ruleContext.getAttribute("title");
            if (title.length === 0) {
                // Same as no alt
                return RuleFail("Fail_2");
            } else if (title.trim().length === 0) {
                // title = " "
                return RuleFail("Fail_3");
            } else {
                return RulePass("Pass_0");
            }
        } else {
            return RuleFail("Fail_2");
        }
    }
}