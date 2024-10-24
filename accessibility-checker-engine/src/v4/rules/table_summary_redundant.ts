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
import { CommonUtil } from "../util/CommonUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { DOMUtil } from "../../v2/dom/DOMUtil";

export const table_summary_redundant: Rule = {
    id: "table_summary_redundant",
    context: "dom:table",
    refactor: {
        "WCAG20_Table_CapSummRedundant": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "table_summary_redundant.html",
            "Fail_1": "table_summary_redundant.html",
            "group": "table_summary_redundant.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The table summary duplicates the caption",
            "group": "The table summary must not duplicate the caption"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let pofId;
        let passed = true;
        let sumStr;
        if (ruleContext.hasAttribute("summary")) {
            pofId = 0;
            sumStr = ruleContext.getAttribute("summary").trim().toLowerCase();
        } else if (ruleContext.hasAttribute("aria-describedby")) {
            pofId = 1;
            let summaryNodeIds = ruleContext.getAttribute("aria-describedby").split(" ");
            let summaryNodeConcat = "";
            for (let i = 0; i < summaryNodeIds.length; i++) {
                let summaryNodeId = summaryNodeIds[i];
                if (summaryNodeId) {
                    let summaryNode = FragmentUtil.getById(ruleContext, summaryNodeId);
                    if (summaryNode && !DOMUtil.sameNode(summaryNode,ruleContext)) {
                        summaryNodeConcat += " " + CommonUtil.getInnerText(summaryNode).trim().toLowerCase();
                    }
                }
            }
            sumStr = summaryNodeConcat;
        }
        if (!sumStr) {
            return null;
        } else {
            let capElems = ruleContext.getElementsByTagName("caption");
            if (capElems.length === 0) {
                return null;
            } else if (sumStr.length > 0) {
                let capStr = CommonUtil.getInnerText(capElems[0]).trim().toLowerCase();
                if (!sumStr.includes(capStr)) {
                    return RulePass("Pass_0");
                } else {
                    return RuleFail("Fail_1")
                }
            }
        }
    }
}