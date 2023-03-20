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

import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";

/* 
 * check if any explicit role specified for the element is a valid ARIA role
 * return: null if no explicit role is defined, 
 *         true if the role(s) are defined in ARIA
 *         false if any role is not defined in ARIA
*/
export function isRoleDefined(ruleContext: Element) {
    let roles = RPTUtil.getRoles(ruleContext, false);
    if (!roles) return null;
    
    let designPatterns = ARIADefinitions.designPatterns;
    for (const role of roles) 
        if (!(role.toLowerCase() in designPatterns)) 
            return false;

    return true;
}

/* 
 * this method assume the given explicit roles are valid, if no explicit role, it will check the implicit role
 * return: null if any explicit role is invalid, 
 *         a list of invalid attributes
 *         empty list if all attributes are valid, or no aria attributes are specified
 */
export function isAttributeAllowed(ruleContext: Element): string[] {
    let roles = RPTUtil.getRoles(ruleContext, false);

    // the invalid role case: handled by Rpt_Aria_ValidRole. Ignore to avoid duplicated report
    // for mutiple roles, skip if any role is invalid
    let designPatterns = ARIADefinitions.designPatterns;
    for (const role of roles) 
        if (!(role.toLowerCase() in designPatterns)) 
            return null;

    let attr = [];        
    let type = "";
    if (!roles || roles.length == 0)
        roles =  RPTUtil.getImplicitRole(ruleContext);
    

    if (!roles || roles.length == 0) {

    }

    let tagName = ruleContext.tagName.toLowerCase();

    // Failing attributes
    let failAttributeTokens = [];
    // Passing attributes
    let passAttributeTokens = [];

    let tagProperty = RPTUtil.getElementAriaProperty(ruleContext);
    // Attributes allowed on this node
    let allowedAttributes = RPTUtil.getAllowedAriaAttributes(ruleContext, roles, tagProperty);
    
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
}
