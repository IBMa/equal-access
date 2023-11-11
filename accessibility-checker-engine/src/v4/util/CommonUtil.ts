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

import {RuleContextHierarchy } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";

/* 
 * check if any explicit role specified for the element is a valid ARIA role
 * return: null if no explicit role is defined, 
 *         true if the role(s) are defined in ARIA
 *         false if any role is not defined in ARIA
*/
export function areRolesDefined(roles: string[]) {
    if (!roles || roles.length ===0) return null;
    
    let designPatterns = ARIADefinitions.designPatterns;
    for (const role of roles) 
        if (!(role.toLowerCase() in designPatterns)) 
            return false;

    return true;
}

/* 
 * check if any explicit role specified for the element is a valid ARIA role
 * return: null if no explicit role is defined, 
 *         true if the role(s) are defined in ARIA
 *         false if any role is not defined in ARIA
*/
export function getInvalidRoles(ruleContext: Element) {
    let domRoles: string[] = RPTUtil.getUserDefinedRoles(ruleContext);
    
    if (!domRoles || domRoles.length === 0)
        return null;

    // check the 'generic' role first
    if (domRoles && domRoles.includes('generic'))
        return ["generic"];
    
    // Failing roles
    let failRoleTokens = [];
    // Passing roles
    let passRoleTokens = [];

    let tagProperty = RPTUtil.getElementAriaProperty(ruleContext);
    let allowedRoles = RPTUtil.getAllowedAriaRoles(ruleContext, tagProperty);
    if (!allowedRoles || allowedRoles.length === 0)
        return domRoles;
    
    let invalidRoles = [];

    if (allowedRoles.includes('any'))
        return [];
    
    for (let i = 0; i < domRoles.length; i++)
        if (!allowedRoles.includes(domRoles[i]) && !invalidRoles.includes(domRoles[i]))
            invalidRoles.push(domRoles[i]);

    return invalidRoles;        
}

/* 
 * check if any explicit role specified for the element is not defined in ARIA
 * return: list of specified roles not defined in ARIA
*/
export function getRolesUndefinedByAria(element: Element) {
    if (!element) return null;

    const roles = RPTUtil.getRoles(element, false);
    let undefinedRoles = [];
    if (roles && roles.length > 0) {
        let designPatterns = ARIADefinitions.designPatterns;
        for (let i = 0; i < roles.length; i++) {
            if (!(roles[i] in designPatterns)) {
                undefinedRoles.push(roles[i]);
            }
        }
    }    
    return undefinedRoles;        
}

/* 
 * this method first checks explicit roles, if no explicit role, it will check the implicit role
 * return: null if any explicit role is invalid, 
 *         a list of invalid attributes
 *         empty list if all attributes are valid, or no aria attributes are specified
 */
export function getInvalidAriaAttributes(ruleContext: Element): string[] {
    let roles = RPTUtil.getUserDefinedRoles(ruleContext);
    
    // the invalid role case: handled by Rpt_Aria_ValidRole. Ignore to avoid duplicated report
    // for mutiple roles, skip if any role is invalid
    let defined = areRolesDefined(roles);
    if (defined !==null && !defined) 
        return null;
    
    let attrs = [];
    if (!roles || roles.length == 0)
        roles =  RPTUtil.getImplicitRole(ruleContext);
    
    let aria_attrs: string[] = RPTUtil.getUserDefinedAriaAttributes(ruleContext);  
    
    let tagProperty = RPTUtil.getElementAriaProperty(ruleContext);
    // Attributes allowed on this node
    let allowedAttributes = RPTUtil.getAllowedAriaAttributes(ruleContext, roles, tagProperty);
    
    if (aria_attrs) {
        for (let i = 0; i < aria_attrs.length; i++) {
            let attrName = aria_attrs[i].trim().toLowerCase(); 
            if (!allowedAttributes.includes(attrName) && !attrs.includes(attrName))
                attrs.push(attrName);
        }
    }
    return attrs;
}

/* 
 * get conflict Aria and Html attributes
 * return: a list of Aria and Html attribute pairs that are conflict
*/
export function getConflictAriaAndHtmlAttributes(elem: Element) {
    
    let ariaAttrs = RPTUtil.getUserDefinedAriaAttributeNameValuePairs(elem);
    let htmlAttrs = RPTUtil.getUserDefinedHtmlAttributeNameValuePairs(elem);
    
    let ret = [];
    if (ariaAttrs && ariaAttrs.length > 0 && htmlAttrs && htmlAttrs.length > 0) {
        for (let i = 0; i < ariaAttrs.length; i++) {
            const examinedHtmlAtrNames = RPTUtil.getConflictOrOverlappingHtmlAttribute(ariaAttrs[i], htmlAttrs, 'conflict');
            if (examinedHtmlAtrNames === null) continue;
            examinedHtmlAtrNames.forEach(item => {
                if (item['result'] === 'Failed') //failed
                    ret.push({'ariaAttr': ariaAttrs[i]['name'], 'htmlAttr': item['attr']});
            });    
        }
    }
    return ret;
}

/* 
 * get conflict Aria and Html attributes
 * return: a list of Aria and Html attribute pairs that are conflict
*/
export function isTableDescendant(contextHierarchies?: RuleContextHierarchy) {
    if (!contextHierarchies) return null;
    
    return contextHierarchies["aria"].filter(hier => ["table", "grid", "treegrid"].includes(hier.role));
}

/* 
 * get deprecated Aria roles
 * return: a list of deprecated Aria roles
*/
export function getDeprecatedAriaRoles(element: Element) {
    if (!element) return null;

    const roles = RPTUtil.getRoles(element, false);
    let ret = [];
    if (roles && roles.length > 0) {
        const globalDeprecatedRoles = ARIADefinitions.globalDeprecatedRoles;
        for (let i = 0; i < roles.length; i++) {
            if (globalDeprecatedRoles.includes(roles[i]))
                ret.push(roles[i]);
        }
    }
    return ret;
}

/* 
 * get deprecated Aria role-attributes
 * return: a list of deprecated Aria role-attributes paris
 *         for global the role is marked as 'any'
*/
export function getDeprecatedAriaAttributes(element: Element) {
    if (!element) return null;

    let domAttributes = element.attributes;
    let ariaAttrs = [];
    if (domAttributes) {
        for (let i = 0; i < domAttributes.length; i++) {
            let attrName = domAttributes[i].name; 
            if (attrName.substring(0, 5) === 'aria-') 
                ariaAttrs.push(attrName);
        }
    }
    if (ariaAttrs.length ===0) return [];

    let ret = [];
    const globalDeprecatedAttributes = ARIADefinitions.globalDeprecatedProperties;
    for (let i = 0; i < ariaAttrs.length; i++) {
        if (globalDeprecatedAttributes.includes(ariaAttrs[i]))
            ret.push({"role":"any", "attribute":ariaAttrs[i]});
    }
    const roles = RPTUtil.getRoles(element, false);
    if (roles && roles.length > 0) {
        for (let i = 0; i < roles.length; i++) {
            const roleWithDeprecatedAttributes = ARIADefinitions.designPatterns[roles[i]];
            if (roleWithDeprecatedAttributes) {
                const deprecatedAttriNames = roleWithDeprecatedAttributes['deprecatedProps'];
                if (deprecatedAttriNames && deprecatedAttriNames.length > 0) {
                    for (let j = 0; j < ariaAttrs.length; j++) {
                        if (deprecatedAttriNames.includes(ariaAttrs[j]))
                            ret.push({ "role":roles[i],  "attribute": ariaAttrs[j]} );
                    }    
                }
            }
        }
    }
    return ret; 
}
