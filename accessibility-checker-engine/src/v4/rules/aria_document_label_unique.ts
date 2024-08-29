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
import { CacheUtil } from "../util/CacheUtil";

export let aria_document_label_unique: Rule = {
    id: "aria_document_label_unique",
    context: "aria:document",
    refactor: {
        "Rpt_Aria_MultipleDocumentRoles": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "aria_document_label_unique.html",
            "Fail_1": "aria_document_label_unique.html",
            "group": "aria_document_label_unique.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Multiple elements with \"document\" roles do not have unique labels",
            "group": "Each element with \"document\" role must have a unique label that describes its purpose"
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
        // Consider the Check Hidden Content setting that is set by the rules
        // Also, consider Implicit role checking.
        let landmarks = CommonUtil.getElementsByRoleHidden(
            ruleContext.ownerDocument,
            "document",
            true,
            true
        );
        if (landmarks.length === 0 || landmarks.length === 1) {
            return null;
        }

        let dupes = CacheUtil.getCache(
            ruleContext.ownerDocument,
            "aria_document_label_unique",
            null
        );
        if (!dupes) {
            dupes = AriaUtil.findAriaLabelDupes(landmarks);
            CacheUtil.setCache(
                ruleContext.ownerDocument,
                "aria_document_label_unique",
                dupes
            );
        }
        let myLabel = AriaUtil.getAriaLabel(ruleContext);
        let passed =
            myLabel === "" || !(myLabel in dupes) || dupes[myLabel] <= 1;

        // return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
        if (!passed) {
            return RuleFail("Fail_1", [myLabel]);
        } else {
            return RulePass("Pass_0");
        }
    }
}