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
import { DOMUtil } from "../../v2/dom/DOMUtil";
import { VisUtil } from "../../v2/dom/VisUtil";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";

export let table_headers_ref_valid: Rule = {
    id: "table_headers_ref_valid",
    context: "dom:td[headers], dom:th[headers]",
    help: {
        "en-US": {
            "Pass_0": "table_headers_ref_valid.html",
            "Fail_1": "table_headers_ref_valid.html",
            "Fail_2": "table_headers_ref_valid.html",
            "Fail_3": "table_headers_ref_valid.html",
            "Fail_4": "table_headers_ref_valid.html",
            "group": "table_headers_ref_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The 'headers' attribute value \"{0}\" does not reference a valid 'id' in this document",
            "Fail_2": "The 'headers' attribute value \"{0}\" refers to itself",
            "Fail_3": "The 'headers' attribute value \"{0}\" does not refer to a cell in the same table",
            "Fail_4": "The 'headers' attribute value \"{0}\" does not refer to a cell indicated with <th> or a role of \"columnheader\" or \"rowheader\"",
            "group": "The 'headers' attribute should refer to a valid cell in the same table"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: ["a25f45"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let parentTable = RPTUtil.getAncestor(ruleContext, "table");
        let parentRole = ARIAMapper.nodeToRole(parentTable);
        // If this is a layout table or a simple table the rule does not apply.
        if (parentTable == null || !VisUtil.isNodeVisible(parentTable) || !["table", "grid"].includes(parentRole))
            return null;

        let nodeName = ruleContext.nodeName.toLowerCase();
        let doc = ruleContext.ownerDocument;
        let value = ruleContext.getAttribute("headers");
        if (!value) return null;
        let ids = value.split(" ");
        let invalidHeaderValues = [];
        let sameNodeHeaderValues = [];
        let sameTableHeaderValues = [];
        let invalidElemHeaderValues = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            if (id.trim() === '') continue;
            const elem = doc.getElementById(id);
            if (!elem)
                invalidHeaderValues.push(id);
            else if (DOMUtil.sameNode(elem, ruleContext))
                sameNodeHeaderValues.push(id);
            else if (!DOMUtil.isInSameTable(elem, ruleContext))
                sameTableHeaderValues.push(id);
            else {
                let elemName = elem.nodeName.toLowerCase();
                if (elemName !== 'th') {
                    const roles = RPTUtil.getRoles(elem, true);
                    if (!roles.includes('columnheader') && !roles.includes('rowheader'))
                        invalidElemHeaderValues.push(id);
                }
            }
        }

        let results = [];
        if (invalidHeaderValues.length != 0)
            results.push(RuleFail("Fail_1", [invalidHeaderValues.toString()]));
        if (sameNodeHeaderValues.length != 0)
            results.push(RuleFail("Fail_2", [sameNodeHeaderValues.toString()]));
        if (sameTableHeaderValues.length != 0)
            results.push(RuleFail("Fail_3", [sameTableHeaderValues.toString()]));
        if (invalidElemHeaderValues.length != 0)
            results.push(RuleFail("Fail_4", [invalidElemHeaderValues.toString()]));

        if (results.length == 0) {
            return RulePass("Pass_0");
        } else {
            return results;
        }
    }
}