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
import { getDefinedStyles } from "../util/CSSUtil";

export let element_tabbable_role_invalid: Rule = {
    id: "element_tabbable_role_invalid",
    context:"dom:*",
    help: {
        "en-US": {
            "pass": "element_tabbable_role_invalid.html",
            "fail_invalid_role": "element_tabbable_role_invalid.html",
            "group": "element_tabbable_role_invalid.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The tabbable element has a widget role",
            "fail_invalid_role": "The tabbable element's role '{0}' is not a widget role",
            "group": "A tabbable element must have a widget role"
        }
    },
    rulesets: [{
            "id": ["IBM_Accessibility"],
            "num": ["2.4.3"],
            "level": eRulePolicy.VIOLATION,
            "toolkitLevel": eToolkitLevel.LEVEL_ONE
        },
        {
            "id": ["WCAG_2_1", "WCAG_2_0"],
            "num": ["2.4.3"],
            "level": eRulePolicy.RECOMMENDATION,
            "toolkitLevel": eToolkitLevel.LEVEL_ONE
        }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        console.log(ruleContext.nodeName +", " + JSON.stringify(ruleContext));
        // dependency check: if the the multi-tab rule triggered, skip this check
        if (RPTUtil.getCache(ruleContext, "IBMA_Focus_MultiTab", "") === "Potential_1") return null;
        
        if (!RPTUtil.isTabbable(ruleContext)) return null;

        let roles = RPTUtil.getRoles(ruleContext, true);
        
        // pass if one of the roles is a widget type
        roles.forEach(role => { console.log("role=" + role);
            if (ARIADefinitions.designPatterns[role].roleType && ARIADefinitions.designPatterns[role].roleType === 'widget')
                 return RulePass("pass");
        });
        
        // ignore elements with CSS overflow: scroll or auto
        let styles = getDefinedStyles(ruleContext);
        console.log("styles=" + JSON.stringify(styles));
        if (styles['overflow-x'] === 'scroll' || styles['overflow-y'] === 'scroll' 
            || styles['overflow-x'] === 'auto' || styles['overflow-y'] === 'auto')
            return RulePass("pass");
            
        return RuleFail("fail_invalid_role", [roles.length === 0 ? 'none' : roles.join(', ')]);
    }
}