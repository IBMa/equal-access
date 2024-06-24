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

export let aria_img_labelled: Rule = {
    id: "aria_img_labelled",
    context: "aria:img",
    refactor: {
        "HAAC_Aria_ImgAlt": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2",
            "Fail_3": "Fail_3"
        }
    },
    help: {
        "en-US": {
            "group": "aria_img_labelled.html",
            "Pass_0": "aria_img_labelled.html",
            "Fail_1": "aria_img_labelled.html",
            "Fail_2": "aria_img_labelled.html",
            "Fail_3": "aria_img_labelled.html"
        }
    },
    messages: {
        "en-US": {
            "group": "An element with \"img\" role must have a non-empty label",
            "Pass_0": "Rule Passed",
            "Fail_1": "Element with \"img\" role has no label",
            "Fail_2": "Element with \"img\" role has no label or an empty label",
            "Fail_3": "Element with \"img\" role missing non-empty 'aria-label' or 'aria-labelledby'"
        }
    },
    rulesets: [],
    act: ["23a2a8", {
        "7d6734": {
            "Pass_0": "pass",
            "Fail_1": "inapplicable",
            "Fail_2": "fail",
            "Fail_3": "inapplicable"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        if (!ruleContext.hasAttribute("role")) {
            // If no role, this is implicit, and covered by WCAG20_Img_HasAlt
            return null;
        }
        /* removed the role check role= presentation since if an element has role=img, then there needs to be a check for alt attribute regardless of the presecne of role=presentation
        if (RPTUtil.hasRole(ruleContext, "presentation") || RPTUtil.hasRole(ruleContext, "none")){
                return RulePass(1);
        }*/

        /* JCH - Points of failure
         *    0. Missing alt attr with value
         *    1. Missing aria-label or aria-labelledby
         *    2. Missing title attr with value
         */
        
        // If role === img, you must use an aria label
        //check attributes aria-label and aria-labelledby for other tags (e.g., <div>, <span>, etc)
        let passed = RPTUtil.getAriaLabel(ruleContext).length > 0;

        if (!passed && ruleContext.nodeName.toLowerCase() === "svg") {
            let svgTitle = ruleContext.querySelector("title");
            passed = svgTitle && RPTUtil.hasInnerContent(svgTitle);
        }

        if (!passed) {
            //check title attribute
            passed = RPTUtil.attributeNonEmpty(ruleContext, "title");
            // We should guide people to use alt or label - this is just a secondary approach to silence the rule.
            // So, we should keep the POF from above.
            // if (!passed) POF = "Fail_3";
        }
        //return new ValidationResult(passed, [ruleContext], 'role', '', []);
        if (passed) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_2")
        }
    }
}
