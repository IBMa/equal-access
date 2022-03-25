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

export let WCAG20_Table_CapSummRedundant: Rule = {
    id: "WCAG20_Table_CapSummRedundant",
    context: "dom:table",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Table_CapSummRedundant.html",
            "Fail_1": "WCAG20_Table_CapSummRedundant.html",
            "group": "WCAG20_Table_CapSummRedundant.html"
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
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
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
                    if (summaryNode) {
                        summaryNodeConcat += " " + RPTUtil.getInnerText(summaryNode).trim().toLowerCase();
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
                let capStr = RPTUtil.getInnerText(capElems[0]).trim().toLowerCase();
                if (!sumStr.includes(capStr)) {
                    return RulePass("Pass_0");
                } else {
                    return RuleFail("Fail_1")
                }
            }
        }
    }
}