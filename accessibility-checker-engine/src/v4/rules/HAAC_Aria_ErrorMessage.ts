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

export let HAAC_Aria_ErrorMessage: Rule = {
    id: "HAAC_Aria_ErrorMessage",
    context: "dom:*[aria-invalid=true]",
    help: {
        "en-US": {
            "Pass_0": "HAAC_Aria_ErrorMessage.html",
            "Fail_1": "HAAC_Aria_ErrorMessage.html",
            "Fail_2": "HAAC_Aria_ErrorMessage.html",
            "group": "HAAC_Aria_ErrorMessage.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Custom error message has invalid reference 'id' value",
            "Fail_2": "Custom error message is not visible",
            "group": "A custom error message must reference a valid 'id' value and when triggered the message must be appropriately exposed"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["3.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let aria_errMsgId = RPTUtil.getAriaAttribute(ruleContext, "aria-errormessage");

        // If aria-errormessage is not provided, then OUT_OF_SCOPE
        if (!aria_errMsgId) {
            return null;
        }

        let msg_ele = FragmentUtil.getById(ruleContext, aria_errMsgId);

        // POF0: Invalid id reference
        if (!msg_ele) {
            return RuleFail("Fail_1");
        }

        // POF1: Referenced element is not visible
        if (!RPTUtil.isNodeVisible(msg_ele)) {
            return RuleFail("Fail_2");
        }

        return RulePass("Pass_0");
    }
}