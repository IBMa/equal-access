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
import { AccNameUtil } from "../util/AccNameUtil";
import { VisUtil } from "../util/VisUtil";

export const aria_application_labelled: Rule = {
    id: "aria_application_labelled",
    context: "aria:application",
    refactor: {
        "Rpt_Aria_ApplicationLandmarkLabel": {
            "Pass_0": "pass",
            "Fail_1": "fail_no_label"}
    },
    help: {
        "en-US": {
            "pass": "aria_application_labelled.html",
            "fail_no_label": "aria_application_labelled.html",
            "group": "aria_application_labelled.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The element with \"application\" role has a label that describes its purpose",
            "fail_no_label": "Element with \"application\" role does not have a label",
            "group": "Each element with \"application\" role must have a label that describes its purpose"
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
        
        const pair = AccNameUtil.computeAccessibleName(ruleContext);
        if (!pair) {
            return RuleFail("fail_no_label");
        } else {
            return RulePass("pass");
        }
    }
}