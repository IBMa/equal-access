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
import { getCache, setCache } from "../util/CacheUtil";

export let aria_region_label_unique: Rule = {
    id: "aria_region_label_unique",
    context: "aria:region",
    refactor: {
        "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "aria_region_label_unique.html",
            "Fail_1": "aria_region_label_unique.html",
            "group": "aria_region_label_unique.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Multiple elements with \"region\" role do not have unique labels",
            "group": "Each element with a \"region\" role must have a unique label"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.4.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // Per https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/landmarks/HTML5.html
        // form element should only be considered if it has an aria label or title
        if (
            ruleContext.getAttribute("role") === "region" ||
            ruleContext.hasAttribute("aria-label") ||
            (ruleContext.hasAttribute("aria-labelledby") && !RPTUtil.isIdReferToSelf(ruleContext, ruleContext.getAttribute("aria-labelledby"))) ||
            ruleContext.hasAttribute("title")
        ) {
            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking.
            let landmarks = RPTUtil.getElementsByRoleHidden(
                ruleContext.ownerDocument,
                "region",
                true,
                true
            );
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = getCache(
                ruleContext.ownerDocument,
                "aria_region_label_unique",
                null
            );
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                setCache(
                    ruleContext.ownerDocument,
                    "aria_region_label_unique",
                    dupes
                );
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed =
                myLabel !== "" &&
                (!(myLabel in dupes) || dupes[myLabel] <= 1);
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        } else {
            return null;
        }
    }
}