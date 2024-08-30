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
import { CommonUtil } from "../util/CommonUtil";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { VisUtil } from "../util/VisUtil";

export const aria_attribute_exists: Rule = {
    id: "aria_attribute_exists",
    context: "dom:*[role]",
    dependencies: ["aria_role_allowed"],
    refactor: {
        "Rpt_Aria_EmptyPropertyValue": {
            "pass": "pass",
            "fail_empty_attribute": "fail_empty_attribute"
        }
    },
    help: {
        "en-US": {
            "pass": "aria_attribute_exists.html",
            "fail_empty_attribute": "aria_attribute_exists.html",
            "group": "aria_attribute_exists.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "fail_empty_attribute": "The element attribute(s): '{0}' value is empty",
            "group": "When specifying a required ARIA attribute, the value must not be empty"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: ["6a7281"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        //skip the check if the element is hidden
        if (VisUtil.isNodeHiddenFromAT(ruleContext))
            return;

        let attrNameArr = new Array();
        let designPatterns = ARIADefinitions.designPatterns;
        let hasAttribute = CommonUtil.hasAttribute;
        let testedProperties = 0;

        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        for (let j = 0; j < roles.length; ++j) {
            if (designPatterns[roles[j]] && AriaUtil.getRoleRequiredProperties(roles[j], ruleContext) != null) {
                let requiredRoleProps = AriaUtil.getRoleRequiredProperties(roles[j], ruleContext);
                for (let i = 0, length = requiredRoleProps.length; i < length; i++) {
                    let attribute = requiredRoleProps[i];
                    if (hasAttribute(ruleContext, attribute)) {
                        testedProperties++;
                        let nodeValue = CommonUtil.normalizeSpacing(ruleContext.getAttribute(requiredRoleProps[i]));
                        if (nodeValue.length == 0) attrNameArr.push(requiredRoleProps[i]);
                    } else if (requiredRoleProps[i] == "aria-labelledby") {
                        if ((roles[i] == "radiogroup") && (hasAttribute(ruleContext, "aria-label"))) {
                            testedProperties++;
                            let nodeValue = CommonUtil.normalizeSpacing(ruleContext.getAttribute("aria-label"));
                            if (nodeValue.length == 0) attrNameArr.push("aria-label");
                        }
                    } else if (requiredRoleProps[i] == "aria-valuenow") {
                        if ((roles[i] == "progressbar") && (hasAttribute(ruleContext, "aria-valuetext"))) {
                            testedProperties++;
                            let nodeValue = CommonUtil.normalizeSpacing(ruleContext.getAttribute("aria-valuetext"));
                            if (nodeValue.length == 0) attrNameArr.push("aria-valuetext");
                        }
                    }
                }
            }
            if (designPatterns[roles[j]]) {
                let tagProperty = AriaUtil.getElementAriaProperty(ruleContext);
                let permittedRoles = [];
                permittedRoles.push(roles[j]);
                let allowedAttributes = AriaUtil.getAllowedAriaAttributes(ruleContext, permittedRoles, tagProperty);
                for (let i = 0, length = allowedAttributes.length; i < length; i++) {
                    let attribute = allowedAttributes[i];
                    if (attribute == "aria-checked" || attribute == "aria-selected" ||
                        attribute == "aria-expanded" || attribute == "aria-orientation" ||
                        attribute == "aria-level") {
                        if (hasAttribute(ruleContext, attribute)) {
                            testedProperties++;
                            let nodeValue = CommonUtil.normalizeSpacing(ruleContext.getAttribute(attribute));
                            if (nodeValue.length == 0 && !attrNameArr.includes(attribute)) {
                                attrNameArr.push(attribute);
                            }
                        }
                    }
                }
            }
        }
        let retMsg = new Array();
        let passed = attrNameArr.length == 0;
        retMsg.push(attrNameArr.join(", "));
        //return new ValidationResult(passed, [ruleContext], attrNameArr, '', retMsg);
        if (testedProperties == 0) {
            return null;
        } else if (!passed) {
            return RuleFail("fail_empty_attribute", retMsg);
        } else {
            return RulePass("pass");
        }
    }
}