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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../util/VisUtil";

export let aria_descendant_valid: Rule = {
    id: "aria_descendant_valid",
    context: "dom:*",
    dependencies: ["aria_role_valid"],
    help: {
        "en-US": {
            "group": "aria_descendant_valid.html",
            "pass": "aria_descendant_valid.html",
            "potential_child_implicit_role": "aria_descendant_valid.html",
            "fail_child_explicit_role": "aria_descendant_valid.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Browsers ignore the explicit and implicit ARIA roles of the descendants of certain elements",
            "pass": "The element contains valid descendants",
            "potential_child_implicit_role": "The element with role \"{0}\" contains descendants with implicit roles \"{1}\" which are ignored by browsers",
            "fail_child_explicit_role": "The element with role \"{0}\" contains descendants with roles \"{1}\" which are ignored by browsers"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: Verify mapping
    act: ["307n5z"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        
        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip the check if the element doesn't require presentational children only
        if (!RPTUtil.containsPresentationalChildrenOnly(ruleContext))
            return;
        
        let roles = RPTUtil.getRoles(ruleContext, false);
        // if explicit role doesn't exist, get the implicit one
        if (!roles || roles.length === 0) 
            roles =  RPTUtil.getImplicitRole(ruleContext);
        
        //ignore if the element doesn't have any explicit or implicit role, shouldn't happen
        if (!roles || roles.length === 0) 
            return null;

        let tagName = ruleContext.tagName.toLowerCase();
        // get all the children from accessibility tree, 
        // including ones with aria-owns    
        let directATChildren = RPTUtil.getDirectATChildren(ruleContext);
        if (directATChildren && directATChildren.length > 0) {
            // the element with at least one non-presentational children
            let explicitRoles = new Array();
            let implicitRoles = new Array();
            for (let j=0; j < directATChildren.length; j++) {
                // ignore <img> and <svg>
                const tag = directATChildren[j].nodeName.toLowerCase();
                if (tag === 'img' || tag === 'svg') continue;
                
                // get explicit role if exists
                let childRoles = RPTUtil.getRoles(directATChildren[j], false);
                if (childRoles && childRoles.length > 0) {
                    explicitRoles.push(childRoles.join(", "));
                } else {
                    // get implicit role if exists
                    childRoles =  RPTUtil.getImplicitRole(directATChildren[j]);
                    if (childRoles && childRoles.length > 0)
                        implicitRoles.push(childRoles.join(", "));
                }
            } 
            
            if (explicitRoles.length > 0) {
                let retValues = [];
                for (let i=0; i < explicitRoles.length; i++) {
                    let retToken = new Array();
                    retToken.push(roles.join(", "));
                    retToken.push(explicitRoles[i]);
                    retValues.push(RuleFail("fail_child_explicit_role", retToken));
                } 
                return retValues;
            }

            if (implicitRoles.length > 0) {
                let retValues = [];
                for (let i=0; i < implicitRoles.length; i++) {
                    let retToken = new Array();
                    retToken.push(roles.join(", "));
                    retToken.push(implicitRoles[i]);
                    retValues.push(RulePotential("potential_child_implicit_role", retToken));
                } 
                return retValues;
            }

        } else
            return RulePass("pass");       
    }
}