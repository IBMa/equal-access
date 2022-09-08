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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { getCache } from "../util/CacheUtil";

export let aria_attribute_deprecated: Rule = {
    id: "aria_attribute_deprecated",
    context: "dom:*",
    help: {
        "en-US": {
            "pass": "aria_attribute_deprecated.html",
            "fail_aria_role": "aria_attribute_deprecated.html",
            "fail_aria_attr": "aria_attribute_deprecated.html",
            "fail_role_attr": "aria_attribute_deprecated.html",
            "group": "aria_attribute_deprecated.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The ARIA roles and attribute are used per specification",
            "fail_aria_role": "The ARIA role \"{0}\" is deprecated in the ARIA specification",
            "fail_aria_attr": "The ARIA attributes \"{0}\" are deprecated in the ARIA specification",
            "fail_role_attr": "The ARIA attributes \"{0}\" are deprecated for the role \"{1}\" in the ARIA specification",
            "group": "No deprecated ARIA role or attribute should be used"
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
        if (getCache(ruleContext, "aria_semantics_role", "") === "Fail_1") return null;
         
        let domAttributes = ruleContext.attributes;
        let ariaAttrs = [];
        if (domAttributes) {
            for (let i = 0; i < domAttributes.length; i++) {
                let attrName = domAttributes[i].name; 
                if (attrName.substring(0, 5) === 'aria-') 
                    ariaAttrs.push(attrName);
            }
        }

        const roles = RPTUtil.getRoles(ruleContext, false);
        let ret = [];
        if (roles && roles.length > 0) {
            const globalDeprecatedRoles = ARIADefinitions.globalDeprecatedRoles;
            const globalDeprecatedAttributes = ARIADefinitions.globalDeprecatedProperties;
            for (let i = 0; i < roles.length; i++) {
                let passed = true;
                if (globalDeprecatedRoles.includes(roles[i])) {
                    ret.push(RuleFail('fail_aria_role', [roles[i]]));
                    passed = false;    
                }    
                const roleWithDeprecatedAttributes = ARIADefinitions.designPatterns[roles[i]];
                if (roleWithDeprecatedAttributes) {
                    const deprecatedAttriNames = roleWithDeprecatedAttributes['deprecatedProps'];
                    if (deprecatedAttriNames && deprecatedAttriNames.length > 0) {
                        for (let i = 0; i < ariaAttrs.length; i++) {
                            if (globalDeprecatedAttributes.includes(ariaAttrs[i])) {
                                ret.push(RuleFail('fail_aria_attr', [ariaAttrs[i]]));
                                passed = false; 
                            } else if (deprecatedAttriNames.includes(ariaAttrs[i])) {
                                ret.push(RuleFail('fail_role_attr', [ariaAttrs[i], roles[i]]));
                                passed = false; 
                            }    
                        }    
                    }
                }
                if (passed)
                    ret.push(RulePass("pass"));  
            }
        }
        if (ret.length > 0)
            return ret;
        return null;
    }
}