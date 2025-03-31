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
import { VisUtil } from "../util/VisUtil";

export const aria_banner_label_unique: Rule = {
    id: "aria_banner_label_unique",
    context: "aria:banner",
    refactor: {
        "Rpt_Aria_MultipleBannerLandmarks_Implicit": {
            "Pass_0": "pass",
            "Fail_1": "fail_label_not_unique"}
    },
    help: {
        "en-US": {
            "pass": "aria_banner_label_unique.html",
            "fail_label_not_unique": "aria_banner_label_unique.html",
            "group": "aria_banner_label_unique.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The element with \"banner\" role has a unique label that describes its purpose",
            "fail_label_not_unique": "Multiple elements with \"banner\" role do not have unique labels",
            "group": "Each element with \"banner\" role must have a unique label that describes its purpose"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;

        /**
        // Consider the Check Hidden Content setting that is set by the rules
        // Also, consider Implicit role checking.
        let landmarks = CommonUtil.getElementsByRoleHidden(
            ruleContext.ownerDocument,
            "banner",
            true,
            true
        );
        if (landmarks.length === 0 || landmarks.length === 1) {
            return null;
        }

        let dupes = CacheUtil.getCache(
            ruleContext.ownerDocument,
            "aria_banner_label_unique",
            null
        );
        if (!dupes) {
            dupes = AriaUtil.findAriaLabelDupes(landmarks);
            CacheUtil.setCache(
                ruleContext.ownerDocument,
                "aria_banner_label_unique",
                dupes
            );
        }
        let myLabel = AriaUtil.getAriaLabel(ruleContext);
        let passed =
            myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);

        //return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
        */

        const dupped = AriaUtil.isLandmarkNameUnique(ruleContext, "banner", true);    
        if (dupped == null) return null;
        
        if (dupped) {
            return RuleFail("fail_label_not_unique");
        } else {
            return RulePass("pass");
        }
    }
}