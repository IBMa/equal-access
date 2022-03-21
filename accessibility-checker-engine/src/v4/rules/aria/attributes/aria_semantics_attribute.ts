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
import { ARIAMapper } from "../../../../v2/aria/ARIAMapper";

export let aria_semantics_attribute: Rule = {
    id: "aria_semantics_attribute",
    context: "dom:*",
    dependencies: [],
    help: {
        "en-US": {
            "group": "aria_semantics_attribute.html",
            "Pass_0": "aria_semantics_attribute.html",
            "Fail_1": "aria_semantics_attribute.html"
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
        if (ruleContext.nodeName.toLowerCase() === "input" && RPTUtil.attributeNonEmpty(ruleContext, "type") && ruleContext.getAttribute("type").trim().toLowerCase() === "password") {
            allowedAttributes.push("aria-required");
        }

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