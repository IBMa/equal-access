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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../../../api/IRule";
import { RPTUtil } from "../../../../v2/checker/accessibility/util/legacy";
import { ARIADefinitions } from "../../../../v2/aria/ARIADefinitions";

export let aria_semantics_role: Rule = {
    id: "aria_semantics_role",
    context: "dom:*",
    dependencies: ["Rpt_Aria_ValidProperty"],
    help: {
        "en-US": {
            "Pass_0": "aria_semantics_role.html",
            "Fail_1": "aria_semantics_role.html",
            "Fail_2": "aria_semantics_role.html",
            "group": "aria_semantics_role.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The ARIA role '{0}' is not valid for the element <{1}>",
            "Fail_2": "The ARIA role '{0}' is not valid for the element <{1}> and may be ignored by the browser since the element is focusable",
            "group": "ARIA roles must be valid for the element to which they are assigned"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: {},
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let domRoles : string[] = [];
        if (ruleContext.getAttribute("role") !== null) {
            domRoles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/); // separated by one or more white spaces
        }

        // the invalid role case: handled by Rpt_Aria_ValidRole. Ignore to avoid duplicated report
        let designPatterns = ARIADefinitions.designPatterns;
        for (const role of domRoles) 
            if (!(role.toLowerCase() in designPatterns)) 
                return null;
        
        let tagName = ruleContext.tagName.toLowerCase();
        // Roles allowed on this node
        let allowedRoles = [];

        // Failing roles
        let failRoleTokens = [];
        // Passing roles
        let passRoleTokens = [];

        let tagProperty = RPTUtil.getElementAriaProperty(ruleContext);
        allowedRoles = RPTUtil.getAllowedAriaRoles(ruleContext, tagProperty);


        // Testing restrictions for each role and adding the corresponding attributes to the allowed attribute list
        for (let i = 0; i < domRoles.length; i++) {
            if (allowedRoles.length === 0) {
                if (!failRoleTokens.includes(domRoles[i])) {
                    failRoleTokens.push(domRoles[i]);
                }
            } else if (!allowedRoles.includes("any")) { // any role is valid so no checking here. the validity of the aria role is checked by Rpt_Aria_ValidRole
                if (!allowedRoles.includes(domRoles[i])) {
                    if (!failRoleTokens.includes(domRoles[i])) {
                        failRoleTokens.push(domRoles[i]);
                    }
                } else if (!passRoleTokens.includes(domRoles[i])) {
                    passRoleTokens.push(domRoles[i])
                }
            } else if (allowedRoles.includes("any")) {
                if (passRoleTokens.indexOf(domRoles[i]) === -1) {
                    passRoleTokens.push(domRoles[i]);
                }
            }
        } // for loop
        if (failRoleTokens.includes("presentation") || failRoleTokens.includes("none") && RPTUtil.isTabbable(ruleContext)) {
            return RuleFail("Fail_2", [failRoleTokens.join(", "), tagName]);
        } else if (failRoleTokens.length > 0) {
            RPTUtil.setCache(ruleContext, "aria_semantics_role", "Fail_1");
            return RuleFail("Fail_1", [failRoleTokens.join(", "), tagName]);
        } else if (passRoleTokens.length > 0) {
            return RulePass("Pass_0", [passRoleTokens.join(", "), tagName]);
        } else {
            return null;
        }

        // below for listing all allowed role and attributes.  We can delete it if we are not using it next year (2018) #283
        //      return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [roleOrAttributeTokens, tagName, allowedRoleOrAttributeTokens]);
    }
}