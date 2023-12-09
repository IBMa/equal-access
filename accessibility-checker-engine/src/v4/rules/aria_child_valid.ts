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
import { VisUtil } from "../../v2/dom/VisUtil";

export let aria_child_valid: Rule = {
    id: "aria_child_valid",
    //context: "dom:*[role]",
    //dependencies: ["Rpt_Aria_ValidRole"],
    context: "dom:*",
    dependencies: ["aria_role_valid", "aria_descendant_valid"],
    help: {
        "en-US": {
            "group": "aria_child_valid.html",
            "Pass": "aria_child_valid.html",
            "Fail_no_child": "aria_child_valid.html",
            "Fail_invalid_child": "aria_child_valid.html"
        }
    },
    messages: {
        "en-US": {
            "group": "An element with an ARIA role must own a required child",
            "Pass": "An element with an ARIA role owns a required child",
            "Fail_no_child": "The element with role \"{0}\" does not own any child element with any of the following role(s): \"{1}\"",
            "Fail_invalid_child": "The element with role \"{0}\" owns the child element with the role \"{1}\" that is not one of the allowed role(s): \"{2}\""
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: Verify mapping
    act: ["bc4a75"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        
        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip the check if the element requires presentational children only
        if (RPTUtil.containsPresentationalChildrenOnly(ruleContext))
            return;
        
        let roles = RPTUtil.getRoles(ruleContext, false);
        // if explicit role doesn't exist, get the implicit one
        if (!roles || roles.length === 0) 
            roles =  RPTUtil.getImplicitRole(ruleContext);
        
        //ignore if the element doesn't have any explicit or implicit role, shouldn't happen
        if (!roles || roles.length === 0) 
            return null;
        
        // ignore if the element contains none or presentation role
        let presentationRoles = ["none", "presentation"];
        const found = roles.some(r=> presentationRoles.includes(r));
        if (found) return null;

        //  For combobox, we have g1193 ... g1199 to check the values etc.
        //  We don't want to trigger 1152 again. So, we bypass it here.
        if (roles.includes("combobox"))
            return null;
        
        let requiredChildRoles = RPTUtil.getRequiredChildRoles(ruleContext, true);
        // a 'group' role is allowed but not required for some elements so remove it if exists
        if (requiredChildRoles.includes('group')) {
            let index = requiredChildRoles.indexOf('group');
            if (index > -1)
                requiredChildRoles.splice(index, 1);
        }
        
        /**  
         * ignore if a role doesn't require a child with any specific role
         * the reverse might be not true - parent will be checked in Rpt_Aria_RequiredParent_Native_Host_Sematics rule
        */
         if (requiredChildRoles.length == 0)
            return null;

        // get all the children from accessibility tree, 
        // including ones with aria-owns    
        let directATChildren = RPTUtil.getDirectATChildren(ruleContext);
        
        if (!directATChildren || directATChildren.length == 0) {
            // the element with at least one required role dosen't contain any accessible child
            /**
             * When a widget is missing required owned elements due to script execution or loading, 
             * authors MUST mark a containing element with 'aria-busy' equal to true. 
             */
             let busy = ruleContext.getAttribute("aria-busy");
             if (!busy || busy !== 'true') {
                 let retToken = new Array();
                 retToken.push(roles.join(", "));
                 retToken.push(requiredChildRoles.join(", "));
                 return RuleFail("Fail_no_child", retToken);
             } 
             // it's 'busy' loading, ignore it 
             return null;
        }
        
        let violateElemRoles = new Array();
        for (let j=0; j < directATChildren.length; j++) {
            let childRoles = RPTUtil.getRoles(directATChildren[j], false);
            // if explicit role doesn't exist, get the implicit one
            if (!childRoles || childRoles.length == 0) 
                childRoles =  RPTUtil.getImplicitRole(directATChildren[j]);
            
            if (childRoles && childRoles.length > 0) {
                /**
                 * when multiple roles are specified as required owned elements for a role, at least one instance of one required owned element is expected. 
                 * the specification does not require an instance of each of the listed owned roles.
                 * therefore, the requirement is met if it has any one of the required roles.   
                 */    
                const found = childRoles.some(r=> requiredChildRoles.includes(r));
                if (!found) 
                    violateElemRoles.push(childRoles.join(", ")); 
            } else {
                // ignore the element since it's not semantic, shouldn't happen 
            }     
        } 
        
        if (violateElemRoles.length > 0) {
            let retValues = [];
            for (let i=0; i < violateElemRoles.length; i++) {
                let retToken = new Array();
                retToken.push(roles.join(", "));
                retToken.push(violateElemRoles[i]);
                retToken.push(requiredChildRoles.join(", "));
                retValues.push(RuleFail("Fail_invalid_child", retToken));
            } 
            return retValues;
        }
        return RulePass("Pass");
    }
}