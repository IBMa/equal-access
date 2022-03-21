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

export let WCAG20_Img_PresentationImgHasNonNullAlt: Rule = {
    id: "WCAG20_Img_PresentationImgHasNonNullAlt",
    context: "dom:img[alt]",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Img_PresentationImgHasNonNullAlt.html",
            "Fail_1": "WCAG20_Img_PresentationImgHasNonNullAlt.html",
            "group": "WCAG20_Img_PresentationImgHasNonNullAlt.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Image designated as decorative has non-null 'alt' attribute",
            "group": "Image designated as decorative must have 'alt=\"\""
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (RPTUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let passed = true;
        if (RPTUtil.hasRole(ruleContext, "presentation") || RPTUtil.hasRole(ruleContext, "none")) {
            passed = ruleContext.getAttribute("alt").length == 0;
        }
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}