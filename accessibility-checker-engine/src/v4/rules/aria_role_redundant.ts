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
import { AriaUtil } from "../util/AriaUtil";
import { TableUtil } from "../util/TableUtil";

export const aria_role_redundant: Rule = {
    id: "aria_role_redundant",
    context: "dom:*[role]",
    help: {
        "en-US": {
            "pass": "aria_role_redundant.html",
            "fail_redundant": "aria_role_redundant.html",
            "group": "aria_role_redundant.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "An explicitly-assigned ARIA role is not redundant with the implicit role of the element",
            "fail_redundant": "The explicitly-assigned ARIA role \"{0}\" is redundant with the implicit role of the element <{1}>",
            "group": "An explicitly-assigned ARIA role should not be redundant with the implicit role of the element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next"],
        "num": ["ARIA"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let elemName = ruleContext.tagName.toLowerCase();
        
        let ariaRoles = AriaUtil.getRoles(ruleContext, false);
        if (!ariaRoles || ariaRoles.length === 0) return;

        // the invalid role case: handled by Rpt_Aria_ValidRole. Ignore to avoid duplicated report
        let role_defined = AriaUtil.areRolesDefined(ariaRoles);
        if (!role_defined)
            return null;

        // dependency check: if it's already failed in the parent relation, then skip this check
        if (["td", "th", "tr"].includes(elemName)) {
            let parentRole = TableUtil.isTableDescendant(contextHierarchies);
            if (parentRole !== null && parentRole.length > 0)
                return null;
        }

        let implicitRoles = AriaUtil.getImplicitRole(ruleContext);
        if (!implicitRoles || implicitRoles.length === 0)
             return RulePass("pass");

        let ret = [];
        for (let i = 0; i < ariaRoles.length; i++) {
            if (!implicitRoles.includes(ariaRoles[i]))  
                ret.push(RulePass("pass"));
            else     
                ret.push(RuleFail("fail_redundant", [ariaRoles[i], elemName]));
        }  
        if (ret.length > 0)  
            return ret;
        return null;    
    }
}