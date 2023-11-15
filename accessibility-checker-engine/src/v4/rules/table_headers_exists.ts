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

export let table_headers_exists: Rule = {
    id: "table_headers_exists",
    context: "dom:table",
    refactor: {
        "RPT_Table_DataHeadingsAria": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "table_headers_exists.html",
            "Fail_1": "table_headers_exists.html",
            "group": "table_headers_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Table has no headers identified",
            "group": "Data table must identify headers"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLTableElement;
        // If this is a layout table or there are no rows, the rule does not apply.
        let rows = ruleContext.rows;
        if (!RPTUtil.isDataTable(ruleContext) || rows === null || rows.length === 0)
            return null;

        let passed = RPTUtil.tableHeaderExists(ruleContext);
        if (passed === null)
            return;
            
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}