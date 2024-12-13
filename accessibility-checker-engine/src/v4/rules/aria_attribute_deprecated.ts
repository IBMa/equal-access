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

import { Rule, RuleResult, RuleFail, RuleContext, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AriaUtil } from "../util/AriaUtil";

export const aria_attribute_deprecated: Rule = {
    id: "aria_attribute_deprecated",
    context: "dom:*",
    help: {
        "en-US": {
            // "pass": "aria_attribute_deprecated.html",
            "fail_aria_role": "aria_attribute_deprecated.html",
            "fail_aria_attr": "aria_attribute_deprecated.html",
            "fail_role_attr": "aria_attribute_deprecated.html",
            "group": "aria_attribute_deprecated.html"
        }
    },
    messages: {
        "en-US": {
            // "pass": "The ARIA roles and attribute are used per specification",
            "fail_aria_role": "The ARIA role \"{0}\" is deprecated in the ARIA specification",
            "fail_aria_attr": "The ARIA attributes \"{0}\" are deprecated in the ARIA specification",
            "fail_role_attr": "The ARIA attributes \"{0}\" are deprecated for the role \"{1}\" in the ARIA specification",
            "group": "No deprecated ARIA role or attribute should be used"
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
        
        let ret = [];
        const deprecatedRoles = AriaUtil.getDeprecatedAriaRoles(ruleContext);
        if (deprecatedRoles && deprecatedRoles.length > 0) {
            for (let i = 0; i < deprecatedRoles.length; i++)
                ret.push(RuleFail('fail_aria_role', [deprecatedRoles[i]]));     
        }

        const deprecatedAttributes = AriaUtil.getDeprecatedAriaAttributes(ruleContext);
        if (deprecatedAttributes && deprecatedAttributes.length > 0) {
            for (let i = 0; i < deprecatedAttributes.length; i++) {
                // "role":"any", "attribute":ariaAttrs[i]}
                if (deprecatedAttributes[i].role === 'any')
                    ret.push(RuleFail('fail_aria_attr', [deprecatedAttributes[i].attribute]));
                else
                    ret.push(RuleFail('fail_role_attr', [deprecatedAttributes[i].attribute, deprecatedAttributes[i].role]));
            }       
        }
        
        if (ret.length > 0)
            return ret;
        return null;
    }
}