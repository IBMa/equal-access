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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AriaUtil } from "../util/AriaUtil";

export const aria_role_allowed: Rule = {
    id: "aria_role_allowed",
    context: "dom:*[role]",
    refactor: {
        "Rpt_Aria_ValidRole": {
            "Pass_0": "Pass_0",
            "Fail_2": "Fail_2",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "group": `aria_role_allowed.html`,
            "Pass_0": `aria_role_allowed.html`,
            "Fail_2": `aria_role_allowed.html`,
            "Potential_1": `aria_role_allowed.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Elements must have a valid 'role' per ARIA specification",
            "Pass_0": "Rule Passed",
            "Fail_2": "The role '{0}' defined on the element is not valid per ARIA specification",
            "Potential_1": "Some of the roles, '{0}', defined on the element are not valid per ARIA specification"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "4.1.2", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: Recheck
    act: "674b10",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let roleStr = ruleContext.getAttribute("role").trim().toLowerCase();
        if (roleStr.length === 0) {
            return null;
        }
        if (ruleContext.hasAttribute("aria-hidden") && ruleContext.getAttribute("aria-hidden").toLowerCase() === "true") {
            return null;
        }

        let invalidRoles = AriaUtil.getRolesUndefinedByAria(ruleContext);

        if (!invalidRoles || invalidRoles.length === 0)
            return RulePass("Pass_0");
        else {
            let roles = roleStr.split(/\s+/);
            if (invalidRoles.length === roles.length) {
                return RuleFail("Fail_2", [invalidRoles.join(",")]);
            } else if (invalidRoles.length > 0) {
                return RulePotential("Potential_1", [invalidRoles.join(",")]);
            }
        }
    }
}
    