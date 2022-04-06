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

import { DOMUtil } from "../../v2/dom/DOMUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy, RulePotential } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let aria_role_overlaps: Rule = {
    id: "aria_role_overlaps",
    context: "dom:*",
    help: {
        "en-US": {
            "pass": "aria_role_overlaps.html",
            "potential_overlap": "aria_role_overlaps.html",
            "group": "aria_role_overlaps.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "potential_overlap": "The explicitly-assigned ARIA role '{0}' should not overlap with the implicit role of the element <{1}>",
            "group": "An explicitly-assigned ARIA role should not overlap with the implicit role of the element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        // dependency check: if the ARIA attribute is completely invalid, skip this check
        if (RPTUtil.getCache(ruleContext, "aria_semantics_role", "") === "Fail_1") return null;
         
        let elemName = ruleContext.tagName.toLowerCase();
        let domAttributes = ruleContext.attributes;
        let ariaRoles = RPTUtil.getRoles(ruleContext, false);
        if (!ariaRoles || ariaRoles.length ==0) return;

        let implicitRoles = RPTUtil.getImplicitRole(ruleContext);
        if (!implicitRoles || implicitRoles.length == 0)
             return RulePass("pass");

        let ret = [];
        for (let i = 0; i < ariaRoles.length; i++) {
            if (!implicitRoles.includes(ariaRoles[i]))  
                ret.push(RulePass("pass"));
            else     
                ret.push(RulePotential("potential_overlap", [ariaRoles[i], elemName]));
        }  
        if (ret.length > 0)  
            return ret;
        else
            return null;    
    }
}