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

export let aria_region_labelled: Rule = {
    id: "aria_region_labelled",
    context: "aria:region",
    refactor: {
        "Rpt_Aria_RegionLabel_Implicit": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2"}
    },
    help: {
        "en-US": {
            "Pass_0": "aria_region_labelled.html",
            "Fail_1": "aria_region_labelled.html",
            "Fail_2": "aria_region_labelled.html",
            "group": "aria_region_labelled.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Element with a \"region\" role does not have an accessible name",
            "Fail_2": "The element with \"region\" role is not labelled with an 'aria-label' or 'aria-labelledby'",
            "group": "Each element with \"region\" role must have an accessible name that describes its purpose"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        
        let passed = RPTUtil.hasAriaLabel(ruleContext) || RPTUtil.attributeNonEmpty(ruleContext, "title");
        if (passed) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1");
        }
    }
}