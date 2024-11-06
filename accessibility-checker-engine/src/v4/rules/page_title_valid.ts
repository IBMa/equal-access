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

export const page_title_valid: Rule = {
    id: "page_title_valid",
    context: "dom:head dom:title",
    refactor: {
        "RPT_Title_Valid": {
            "Pass_0": "Pass_0",
            // "Fail_1": "Fail_1",
            "Potential_2": "Potential_2"}
    },
    help: {
        "en-US": {
            "Pass_0": "page_title_valid.html",
            // "Fail_1": "page_title_valid.html",
            "Potential_2": "page_title_valid.html",
            "group": "page_title_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            // "Fail_1": "Page <title> is empty",
            "Potential_2": "Verify that using the filename as the page <title> value is descriptive",
            "group": "Page <title> should be a descriptive title, rather than a filename"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let titleStr = CommonUtil.getInnerText(ruleContext).trim();

        // allow .com, .net and .org
        let titleStrLowercase = titleStr.toLowerCase();
        if (titleStrLowercase.includes(".com") || titleStrLowercase.includes(".net") || titleStrLowercase.includes(".org")) {
            return RulePass("Pass_0", [titleStr]);
        }

        if (titleStr.length === 0) {
            // This is covered by page_title_exists
            return null;//RuleFail("Fail_1");
        } else {
            let passed = !/^\S*\.[a-zA-Z]{1,4}(?!.)|^https?:\/\/\S*/i.test(titleStr);

            if (!passed) {
                return RulePotential("Potential_2");
            } else {
                return RulePass("Pass_0", [titleStr]);
            }
        }
    }
}