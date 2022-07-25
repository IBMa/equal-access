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
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import {inspect} from 'util';

export let Rpt_Aria_RequiredChildren_Native_Host_Sematics: Rule = {
    id: "Rpt_Aria_RequiredChildren_Native_Host_Sematics",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    help: {
        "en-US": {
            "group": "Rpt_Aria_RequiredChildren_Native_Host_Sematics.html",
            "Pass_0": "Rpt_Aria_RequiredChildren_Native_Host_Sematics.html",
            "Potential_1": "Rpt_Aria_RequiredChildren_Native_Host_Sematics.html",
        }
    },
    messages: {
        "en-US": {
            "group": "An element with a ARIA role must contain required children",
            "Pass_0": "Rule Passed",
            "Potential_1": "The element with role \"{0}\" does not contain or own at least one child element with each of the following roles: \"{1}\""
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: Verify mapping
    act: ["bc4a75"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        //skip the check if the element is hidden
        if (RPTUtil.isNodeHiddenFromAT(ruleContext))
            return;
        
        // Handle the case where the element is hidden by disabled html5 attribute or aria-disabled:
        //  1. In the case that this element has a disabled attribute and the element supports it, we mark this rule as passed.
        //  2. In the case that this element has a aria-disabled attribute then, we mark this rule as passed.
        // For both of the cases above we do not need to perform any further checks, as the element is disabled in some form or another.
        if (RPTUtil.isNodeDisabled(ruleContext)) {
            return RulePass("Pass_0");
        }

        let passed = false;
        let designPatterns = ARIADefinitions.designPatterns;
        let roles = RPTUtil.getRoles(ruleContext, true);
        let directATChildren = RPTUtil.getDirectATChildren(ruleContext);
        let requiredChildren = new Array();
        let violateElemRoles = {};
        
        let withOne = false;
        for (let j = 0, length = roles.length; j < length; ++j) {
            if (roles[j] === "combobox") {
                //  For combobox, we have g1193 ... g1199 to check the values etc.
                //  We don't want to trigger 1152 again. So, we bypass it here.
                passed = true;
                continue;
            }

            if (designPatterns[roles[j]] && designPatterns[roles[j]].reqChildren != null) {
                requiredChildren.push(designPatterns[roles[j]].reqChildren);
                for (let i = 0, requiredChildrenLength = requiredChildren.length; i < requiredChildrenLength; i++) {
                    passed = RPTUtil.getDescendantWithRoleHidden(ruleContext, requiredChildren[i], true, true) || RPTUtil.getAriaOwnsWithRoleHidden(ruleContext, requiredChildren[i], true);
                    for (let j=0; j < directATChildren.length; j++) {
                        let roles = RPTUtil.getRoles(directATChildren[j], true);
                        if (roles !== null && roles.includes(requiredChildren[i])) {
                            withOne = true;
                        } else {
                            violateElemRoles[directATChildren[j].nodeName.toLowerCase()] = roles.join(", "); 
                        }    
                    }    
                }
            } 
        }
        if (!withOne) {
            let retToken = new Array();
            retToken.push(roles.join(", "));
            retToken.push(requiredChildren.join(", "));
            return RuleFail("Fail_no_child", retToken);
        } 
        for (let violateElem in violateElemRoles) {
            let retToken = new Array();
            retToken.push(violateElem);
            retToken.push(violateElemRoles[violateElem]);
            retToken.push(roles.join(", "));
            retToken.push(roles.join(", "));
            return RuleFail("Fail_no_child", retToken);
        } 
    }
}