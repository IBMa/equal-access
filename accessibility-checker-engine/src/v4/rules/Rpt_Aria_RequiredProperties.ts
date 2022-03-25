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

import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let Rpt_Aria_RequiredProperties: Rule = {
    id: "Rpt_Aria_RequiredProperties",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    help: {
        "en-US": {
            "group": `Rpt_Aria_RequiredProperties.html`,
            "Pass_0": `Rpt_Aria_RequiredProperties.html`,
            "Fail_1": `Rpt_Aria_RequiredProperties.html`
        }
    },
    messages: {
        "en-US": {
            "group": "When using a ARIA role on an element, the required attributes for that role must be defined",
            "Pass_0": "Rule Passed",
            "Fail_1": "An element with ARIA role '{0}' does not have the required ARIA attribute(s): '{1}'"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: "4.1.2", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: "4e8ab6",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let attrNameArr = new Array();
        let roleNameArr = new Array();
        let designPatterns = ARIADefinitions.designPatterns;
        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        let implicitRole = ARIAMapper.elemToImplicitRole(ruleContext);
        let hasAttribute = RPTUtil.hasAttribute;
        let testedRoles = 0;

        for (let j = 0, rolesLength = roles.length; j < rolesLength; ++j) {
            if (roles[j] === implicitRole) continue;
            if (designPatterns[roles[j]] && RPTUtil.getRoleRequiredProperties(roles[j], ruleContext) != null) {
                let requiredRoleProps = RPTUtil.getRoleRequiredProperties(roles[j], ruleContext);
                let roleMissingReqProp = false;
                testedRoles++;
                for (let i = 0, propertiesLength = requiredRoleProps.length; i < propertiesLength; i++) {
                    if (!hasAttribute(ruleContext, requiredRoleProps[i])) {
                        // If an aria-labelledby isn't present, an aria-label will meet the requirement.
                        if (requiredRoleProps[i] == "aria-labelledby") {
                            if ((!hasAttribute(ruleContext, "aria-label")) || (roles[i] != "radiogroup")) {
                                attrNameArr.push(requiredRoleProps[i]);
                                roleMissingReqProp = true;
                            }
                        } else if (requiredRoleProps[i] == "aria-valuenow") {
                            if ((!hasAttribute(ruleContext, "aria-valuetext")) || (roles[i] != "progressbar")) {
                                attrNameArr.push(requiredRoleProps[i]);
                                roleMissingReqProp = true;
                            }
                        } else if (requiredRoleProps[i] == "aria-controls" && roles[j] == "combobox") {
                            // Skip this check since aria-controls in the textbox of a combobox is already handled in rule HAAC_Combobox_Must_have_Text_Input
                        } else {
                            attrNameArr.push(requiredRoleProps[i]);
                            roleMissingReqProp = true;
                        }
                    }
                }
                if (roleMissingReqProp == true) {
                    roleNameArr.push(roles[j]);
                }
            }
        }
        let retToken = new Array();
        let passed = attrNameArr.length == 0; // only aria attributes so NO OUT OF SCOPE
        retToken.push(roleNameArr.join(", "));
        retToken.push(attrNameArr.join(", "));
        //return new ValidationResult(passed, [ruleContext], attrNameArr, '', passed == true ? [] : retToken);
        if (testedRoles === 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", retToken);
        } else {
            return RulePass("Pass_0");
        }
    }
}
