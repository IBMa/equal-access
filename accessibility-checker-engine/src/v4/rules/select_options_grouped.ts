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

import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { CommonUtil } from "../util/CommonUtil";

export const select_options_grouped: Rule = {
    id: "select_options_grouped",
    context: "dom:select",
    refactor: {
        "WCAG20_Select_HasOptGroup": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "select_options_grouped.html",
            "Potential_1": "select_options_grouped.html",
            "group": "select_options_grouped.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Group of related options may need <optgroup>",
            "group": "Groups of related options within a selection list should be grouped with <optgroup>"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            paramNumOptions: {
                value: 10,
                type: "integer"
            }
        }
        const ruleContext = context["dom"].node as Element;
        // Handle the cases where optgroup is hidden, which should trigger a violations
        // but in the case that Check hidden option is set then should not trigger a violation.
        let passed = CommonUtil.getChildByTagHidden(ruleContext, "optgroup", false, true).length > 0 ||
            CommonUtil.getChildByTagHidden(ruleContext, "option", false, true).length <=
            validateParams.paramNumOptions.value;
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}