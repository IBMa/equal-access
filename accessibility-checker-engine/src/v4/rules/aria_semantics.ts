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

export const aria_role_valid: Rule = {
    id: "aria_role_valid",
    context: "dom:*",
    dependencies: ["aria_attribute_allowed"],
    refactor: {
        "aria_semantics_role": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2"
        }
    },
    help: {
        "en-US": {
            "Pass_0": "aria_role_valid.html",
            "Fail_1": "aria_role_valid.html",
            "Fail_2": "aria_role_valid.html",
            "group": "aria_role_valid.html"
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
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let tagName = ruleContext.tagName.toLowerCase();
        // only chek element (1) and fragment nodes (11)
        if (ruleContext.nodeType !== 1 /* Node.ELEMENT_NODE */)
            return null;

        //skip the rule
        // the invalid role case: handled by aria_role_allowed. Ignore to avoid duplicated report
        const undefinedRoles = AriaUtil.getRolesUndefinedByAria(ruleContext);
        if (undefinedRoles && undefinedRoles.length > 0) return null;
        const deprecatedRoles = AriaUtil.getDeprecatedAriaRoles(ruleContext);
        if (deprecatedRoles && deprecatedRoles.length > 0) return null;
        const deprecatedAttributes = AriaUtil.getDeprecatedAriaAttributes(ruleContext);
        if (deprecatedAttributes && deprecatedAttributes.length > 0) return null;

        // dependency check: if it's already failed, then skip
        if (["td", "th", "tr"].includes(tagName)) {
            let parentRole = CommonUtil.isTableDescendant(contextHierarchies);
            if (parentRole !== null && parentRole.length > 0)
                return null;
        }

        let domRoles: string[] = AriaUtil.getUserDefinedRoles(ruleContext);
        if (!domRoles || domRoles.length ===0)
            return null;

        // check the 'generic' role first
        if (domRoles.includes('generic'))
            return RuleFail("Fail_1", ["generic", tagName]);
        
        let invalidRoles = AriaUtil.getInvalidRoles(ruleContext);
        if (invalidRoles === null || invalidRoles.length ===0)
            return RulePass("Pass_0", [domRoles.join(", "), tagName]);

        if (invalidRoles.includes("presentation") || invalidRoles.includes("none") && CommonUtil.isTabbable(ruleContext))
            return RuleFail("Fail_2", [invalidRoles.join(", "), tagName]);
        
        if (invalidRoles.length > 0)
            return RuleFail("Fail_1", [invalidRoles.join(", "), tagName]);
        
        if (domRoles.length > 0)
            return RulePass("Pass_0", [domRoles.join(", "), tagName]);
        
        return null;
    }
}

// This rule is in the same file because there is a dependency that aria_role_valid runs first,
// and the info is passed by cache, but there isn't a dependency in the Fail_2 scenario, so regular
// dependency cannot be used
export const aria_attribute_valid: Rule = {
    id: "aria_attribute_valid",
    context: "dom:*",
    // The the ARIA role is completely invalid, skip this check
    dependencies: ["aria_attribute_deprecated", "aria_role_valid"],
    refactor: {
        "aria_attribute_allowed": {
            "Pass": "Pass",
            "Fail_invalid_role_attr": "Fail_invalid_role_attr",
            "Fail_invalid_implicit_role_attr": "Fail_invalid_implicit_role_attr"
        }
    },
    help: {
        "en-US": {
            "group": "aria_attribute_valid.html",
            "Pass": "aria_attribute_valid.html",
            "Fail_invalid_role_attr": "aria_attribute_valid.html",
            "Fail_invalid_implicit_role_attr": "aria_attribute_valid.html"
        }
    },
    messages: {
        "en-US": {
            "group": "ARIA attributes should be valid for the element and ARIA role to which they are assigned",
            "Pass": "ARIA attributes are valid for the element and ARIA role",
            "Fail_invalid_role_attr": "The ARIA attributes \"{0}\" are not valid for the element <{1}> with ARIA role \"{2}\"",
            "Fail_invalid_implicit_role_attr": "The ARIA attributes \"{0}\" are not valid for the element <{1}> with implicit ARIA role \"{2}\""
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["ARIA"], //removed mapping to 4.1.2 from here and help
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: ["5c01ea", { "46ca7f": { "Pass": "pass", "Fail_invalid_role_attr": "fail", "Fail_invalid_implicit_role_attr": "fail"}}],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // only chek element (1)
        if (ruleContext.nodeType !== 1 /* Node.ELEMENT_NODE */)
            return null;

        // ignore if no aria attribute
        let ariaAttributes:string[] = AriaUtil.getUserDefinedAriaAttributes(ruleContext);
        if (ariaAttributes === null || ariaAttributes.length === 0)
            return null;
    
        let roles: string[] = AriaUtil.getUserDefinedRoles(ruleContext);
        let explicit = true;
        if (roles && roles.length > 0) {
            // the invalid role case: handled by Rpt_Aria_ValidRole. Ignore to avoid duplicated report
            if (!AriaUtil.areRolesDefined(roles))
                return null;
        } else {
            //no explicit role defined
            roles =  AriaUtil.getImplicitRole(ruleContext);
            explicit = false;
        }
        
        let tagName = ruleContext.tagName.toLowerCase();
        let failedAttributes = AriaUtil.getInvalidAriaAttributes(ruleContext);
        if (!failedAttributes || failedAttributes.length === 0)
            return RulePass("Pass", [ariaAttributes.join(", "), tagName, roles.join(", ")]);

        if (roles.length > 0) {
            if (explicit)
                return RuleFail("Fail_invalid_role_attr", [failedAttributes.join(", "), tagName, roles.join(", ")]);
            else
                return RuleFail("Fail_invalid_implicit_role_attr", [failedAttributes.join(", "), tagName, roles.join(", ")]);
        }
        
        return RuleFail("Fail_invalid_role_attr", [failedAttributes.join(", "), tagName, "none"]);
    }
}