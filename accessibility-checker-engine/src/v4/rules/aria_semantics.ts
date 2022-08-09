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
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";

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
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let tagName = ruleContext.tagName.toLowerCase();
        // dependency check: if it's already failed, then skip
        if (["td", "th", "tr"].includes(tagName) && RPTUtil.getCache(ruleContext, "table_aria_descendants", "") === "explicit_role") 
            return null;
        
        let domRoles: string[] = [];
        if (ruleContext.getAttribute("role") !== null) {
            domRoles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/); // separated by one or more white spaces
        }

        // the invalid role case: handled by Rpt_Aria_ValidRole. Ignore to avoid duplicated report
        let designPatterns = ARIADefinitions.designPatterns;
        for (const role of domRoles) 
            if (!(role.toLowerCase() in designPatterns)) 
                return null;
        
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

// This rule is in the same file because there is a dependency that aria_semantics_role runs first,
// and the info is passed by cache, but there isn't a dependency in the Fail_2 scenario, so regular
// dependency cannot be used
export let aria_attribute_allowed: Rule = {
    id: "aria_attribute_allowed",
    context: "dom:*",
    // Partially depends on aria_semantics_role
    dependencies: [],
    help: {
        "en-US": {
            "group": "aria_attribute_allowed.html",
            "Pass_0": "aria_attribute_allowed.html",
            "Fail_1": "aria_attribute_allowed.html"
        }
    },
    messages: {
        "en-US": {
            "group": "ARIA attributes must be valid for the element and ARIA role to which they are assigned",
            "Pass_0": "Rule Passed",
            "Fail_1": "The ARIA attribute '{0}' is not valid for the element <{1}> with ARIA role '{2}'"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "5c01ea",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // The the ARIA role is completely invalid, skip this check
        if (RPTUtil.getCache(ruleContext, "aria_semantics_role", "") === "Fail_1") return null;
        let role = ARIAMapper.nodeToRole(ruleContext);
        if (!role) {
            role = "none";
        }
        let tagName = ruleContext.tagName.toLowerCase();

        // Failing attributes
        let failAttributeTokens = [];
        // Passing attributes
        let passAttributeTokens = [];

        let tagProperty = RPTUtil.getElementAriaProperty(ruleContext);
        // Attributes allowed on this node
        let allowedAttributes = RPTUtil.getAllowedAriaAttributes(ruleContext, [role], tagProperty);
        
        // input type="password" has no role but it can take an aria-required. This is the only case like this.
        // So we add it in the code instead of adding new mechanism to the aria-definition.js
        // covered in aria definition
        /**if (ruleContext.nodeName.toLowerCase() === "input" && RPTUtil.attributeNonEmpty(ruleContext, "type") && ruleContext.getAttribute("type").trim().toLowerCase() === "password") {
            allowedAttributes.push("aria-required");
        }*/

        let domAttributes = ruleContext.attributes;
        
        if (domAttributes) {
            for (let i = 0; i < domAttributes.length; i++) {
                let attrName = domAttributes[i].name.trim().toLowerCase(); 
                let isAria = attrName.substring(0, 5) === 'aria-';
                if (isAria) {
                    if (!allowedAttributes.includes(attrName)) {
                        //valid attributes can be none also which is covered here
                        !failAttributeTokens.includes(attrName) ? failAttributeTokens.push(attrName) : false;
                    } else {
                        !passAttributeTokens.includes(attrName) ? passAttributeTokens.push(attrName) : false;
                    }
                }
            }
        }
        
        //		if(!passed){
        //			  if(roleTokens.length !== 0){ // Rule failure is present
        //		   			allowedRoleTokens = allowedRoleTokens.concat(allowedRoles); // This can be concatenating empty list
        //			  }
        //
        //	    	  if(attributeTokens.length !== 0){ // Attribute failure is present
        //	    		  allowedAttributeTokens = allowedAttributeTokens.concat(allowedAttributes);
        //	    	  }
        //
        //	    }

        //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [roleOrAttributeTokens, tagName]);
        if (failAttributeTokens.length > 0) {
            RPTUtil.setCache(ruleContext, "aria_attribute_allowed", "Fail_1");
            return RuleFail("Fail_1", [failAttributeTokens.join(", "), tagName, role]);
        } else if (passAttributeTokens.length > 0) {
            return RulePass("Pass_0", [passAttributeTokens.join(", "), tagName, role]);
        } else {
            return null;
        }

        // below for listing all allowed role and attributes.  We can delete it if we are not using it next year (2018) #283
        //      return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [roleOrAttributeTokens, tagName, allowedRoleOrAttributeTokens]);
    }
}