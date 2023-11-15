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

export let heading_markup_misuse: Rule = {
    id: "heading_markup_misuse",
    context: "dom:h1, dom:h2, dom:h3, dom:h4, dom:h5, dom:h6",
    dependencies: ["heading_content_exists"],
    refactor: {
        "RPT_Headers_FewWords": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "heading_markup_misuse.html",
            "Potential_1": "heading_markup_misuse.html",
            "group": "heading_markup_misuse.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that the heading element is a genuine heading",
            "group": "Heading elements must not be used for presentation"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            headingLengthThresh: {
                value: 20,
                type: "integer"
            }
        }
        const ruleContext = context["dom"].node as Element;
        let headingLengthThresh = validateParams.headingLengthThresh.value;
        let passed = RPTUtil.wordCount(RPTUtil.getInnerText(ruleContext)) <= headingLengthThresh;
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}