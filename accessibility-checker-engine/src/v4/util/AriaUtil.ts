/******************************************************************************
     Copyright:: 2020- IBM, Inc

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

import { CacheUtil } from "./CacheUtil";
import { ARIADefinitions, IDocumentConformanceRequirement } from "../../v2/aria/ARIADefinitions";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { VisUtil } from "./VisUtil";
import { CommonUtil } from "./CommonUtil";
import { AccNameUtil } from "./AccNameUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { DOMUtil } from "../../v2/dom/DOMUtil";

export class AriaUtil {

    // This list contains a list of elements tags which have display: none by default, since we have rules triggering
    public static navLinkKeywords = ['start', 'next', 'prev', 'previous', 'contents', 'index']

    // This list contains a list of rule ids for the rules that have to check for hidden content regardless of the Check Hidden
    // Content Setting. This means that when the engine is actually determine which elements to mass to the rules, it will always
    // pass theses rules no matter what the Check Hidden Content Setting is.
    public static rulesThatHaveToCheckHidden = ['RPT_Elem_UniqueId']

    public static isDefinedAriaAttributeAtIndex(ele, index) {
        let attrName = ele.attributes[index].name;
        return AriaUtil.isDefinedAriaAttribute(ele, attrName);
    }

    // https://www.w3.org/TR/wai-aria-1.1/#introstates
    public static ariaAttributeRoleDefaults = {
        "alert": {
            "aria-live": "assertive",
            "aria-atomic": "true"
        },
        "combobox": {
            "aria-haspopup": "listbox"
        },
        "listbox": {
            "aria-orientation": "vertical"
        },
        "log": {
            "aria-live": "polite"
        },
        "menu": {
            "aria-orientation": "vertical"
        },
        "menubar": {
            "aria-orientation": "horizontal"
        },
        "meter": {
            "aria-valuemin": "0",
            "aria-valuemax": "100"
        },
        "option": {
            "aria-selected": "false"
        },
        "progressbar": {
            "aria-valuemin": "0",
            "aria-valuemax": "100"
        },
        "scrollbar": {
            "aria-orientation": "vertical",
            "aria-valuemin": "0",
            "aria-valuemax": "100"
        },
        "separator": {
            "aria-orientation": "horizontal",
            "aria-valuemin": "0",
            "aria-valuemax": "100"
        },
        "slider": {
            "aria-orientation": "horizontal",
            "aria-valuemin": "0",
            "aria-valuemax": "100"
        },
        "spinbutton": {
            // Not sure how to encode min/max (or now in 1.2 - "has no value")
            //"aria-valuenow": "0" TODO: at risk: maybe delete after ARIA 1.2 reaches proposed rec
            // Probably just delete spinbutton from this list completely and let user agents handle "defaults"
        },
        "status": {
            "aria-live": "polite",
            "aria-atomic": "true"
        },
        "tab": {
            "aria-selected": "false"
        },
        "tablist": {
            "aria-orientation": "horizontal"
        },
        "toolbar": {
            "aria-orientation": "horizontal"
        },
        "tree": {
            "aria-orientation": "vertical"
        }
    }

    // https://www.w3.org/TR/wai-aria-1.1/#aria-atomic
    public static ariaAttributeGlobalDefaults = {
        "aria-atomic": "false",
        "aria-autocomplete": "none",
        "aria-busy": "false",
        "aria-checked": undefined,
        "aria-current": "false",
        "aria-disabled": "false",
        "aria-dropeffect": "none",
        "aria-expanded": undefined,
        "aria-grabbed": undefined,
        "aria-haspopup": "false",
        "aria-hidden": undefined,
        "aria-invalid": "false",
        "aria-live": "off",
        "aria-modal": "false",
        "aria-multiline": "false",
        "aria-multiselectable": "false",
        "aria-orientation": undefined,
        "aria-pressed": undefined,
        "aria-readonly": "false",
        //"aria-relevant": "additions text", TODO: are multiple values supported?
        "aria-required": "false",
        "aria-selected": undefined,
        "aria-sort": "none"
    }

    // https://www.w3.org/TR/html-aam-1.0/#html-attribute-state-and-property-mappings
    public static ariaAttributeImplicitMappings = {
        "aria-autocomplete": {
            "form": function (e) {
                return "off" === e.getAttribute("autocomplete") ? "none" : "both";
            },
            "input": function (e) {
                return "off" === e.getAttribute("autocomplete") ? "none" : "both";
            },
            "select": function (e) {
                return "off" === e.getAttribute("autocomplete") ? "none" : "both";
            },
            "textarea": function (e) {
                return "off" === e.getAttribute("autocomplete") ? "none" : "both";
            }
        },
        "aria-checked": {
            "input": function (e) {
                if (e.hasAttribute("indeterminate")) return "mixed";
                return "" + e.hasAttribute("checked");
            },
            "menuitem": function (e) {
                if (e.hasAttribute("indeterminate")) return "mixed";
                return "" + e.hasAttribute("checked");
            },
            "*": function (e) {
                if (e.hasAttribute("indeterminate")) return "mixed";
            },
        },
        "aria-disabled": {
            "button": function (e) {
                return e.hasAttribute("disabled") ? "true" : "false"
            },
            "fieldset": function (e) {
                return e.hasAttribute("disabled") ? "true" : "false"
            },
            "input": function (e) {
                return e.hasAttribute("disabled") ? "true" : "false"
            },
            "optgroup": function (e) {
                return e.hasAttribute("disabled") ? "true" : "false"
            },
            "option": function (e) {
                return e.hasAttribute("disabled") ? "true" : "false"
            },
            "select": function (e) {
                return e.hasAttribute("disabled") ? "true" : "false"
            },
            "textarea": function (e) {
                return e.hasAttribute("disabled") ? "true" : "false"
            }
        },
        "aria-expanded": {
            "details": function (e) {
                return e.getAttribute("open")
            },
            "dialog": function (e) {
                return e.getAttribute("open")
            }
        },
        "aria-multiselectable": {
            "select": function (e) {
                if (e.hasAttribute("multiple")) return "true";
                return;
            }
        },
        "aria-placeholder": {
            "input": function (e) {
                return e.getAttribute("placeholder")
            },
            "textarea": function (e) {
                return e.getAttribute("placeholder")
            }
        },
        "aria-required": {
            "input": function (e) {
                return e.getAttribute("required")
            },
            "select": function (e) {
                return e.getAttribute("required")
            },
            "textarea": function (e) {
                return e.getAttribute("required")
            }
        }
    }

    /**
     * this method returns user-defined aria attribute name from dom
     * @param ele  element
     * @returns user defined aria attributes
     */
    public static getUserDefinedAriaAttributes(elem) {
        let ariaAttributes = [];
        let domAttributes = elem.attributes;
        if (domAttributes) {
            for (let i = 0; i < domAttributes.length; i++) {
                let attrName = domAttributes[i].name.trim().toLowerCase();
                let isAria = attrName.substring(0, 5) === 'aria-';
                if (isAria)
                    ariaAttributes.push(attrName);
            }
        }
        return ariaAttributes;
    }

    /**
     * this method returns user-defined html attribute name from dom
     * @param ele  element
     * @returns user defined html attributes
     */
    public static getUserDefinedHtmlAttributes(elem) {
        let htmlAttributes = [];
        let domAttributes = elem.attributes;
        if (domAttributes) {
            for (let i = 0; i < domAttributes.length; i++) {
                let attrName = domAttributes[i].name.trim().toLowerCase();
                let isAria = attrName.substring(0, 5) === 'aria-';
                if (!isAria)
                    htmlAttributes.push(attrName);
            }
        }
        return htmlAttributes;
    }

    /**
     * this method returns user-defined aria attribute name-value pair from dom
     * @param ele  element
     * @returns user defined aria attributes
     */
    public static getUserDefinedAriaAttributeNameValuePairs(elem) {
        let ariaAttributes = [];
        let domAttributes = elem.attributes;
        if (domAttributes) {
            for (let i = 0; i < domAttributes.length; i++) {
                let attrName = domAttributes[i].name.trim().toLowerCase();
                let attrValue = elem.getAttribute(attrName);
                if (attrValue === '') attrValue = null;
                let isAria = attrName.substring(0, 5) === 'aria-';
                if (isAria)
                    ariaAttributes.push({ name: attrName, value: attrValue });
            }
        }
        return ariaAttributes;
    }

    /**
     * this method returns user-defined html attribute name-value pair from dom
     * @param ele  element
     * @returns user defined html attributes
     */
    public static getUserDefinedHtmlAttributeNameValuePairs(elem) {
        let htmlAttributes = [];
        let domAttributes = elem.attributes;
        if (domAttributes) {
            for (let i = 0; i < domAttributes.length; i++) {
                let attrName = domAttributes[i].name.trim().toLowerCase();
                let attrValue = elem.getAttribute(attrName);
                if (attrValue === '') attrValue = null;
                let isAria = attrName.substring(0, 5) === 'aria-';
                if (!isAria)
                    htmlAttributes.push({ name: attrName, value: attrValue });
            }
        }
        return htmlAttributes;
    }

    /**
     * This method handles implicit aria definitions, for example, an input with checked is equivalent to aria-checked="true"
     */
    public static getAriaAttribute(ele, attributeName) {
        // If the attribute is defined, it takes precedence
        let retVal = ele.getAttribute(attributeName);

        if (ele.hasAttribute(attributeName) && retVal.trim() === "") { //"" is treated as false, so we need return it before the below check
            return retVal;
        }
        // Then determine implicit values from other attributes
        if (!retVal) {
            let tag = ele.nodeName.toLowerCase();
            if (attributeName in AriaUtil.ariaAttributeImplicitMappings) {
                if (tag in AriaUtil.ariaAttributeImplicitMappings[attributeName]) {
                    retVal = AriaUtil.ariaAttributeImplicitMappings[attributeName][tag];
                    if (typeof (retVal) === "function") {
                        retVal = retVal(ele);
                    }
                } else if ("*" in AriaUtil.ariaAttributeImplicitMappings[attributeName]) {
                    retVal = AriaUtil.ariaAttributeImplicitMappings[attributeName]["*"];
                    if (typeof (retVal) === "function") {
                        retVal = retVal(ele);
                    }
                }
            }
        }

        // Check role-based defaults
        if (!retVal) {
            let role = ARIAMapper.nodeToRole(ele);
            if (role in AriaUtil.ariaAttributeRoleDefaults && attributeName in AriaUtil.ariaAttributeRoleDefaults[role]) {
                retVal = AriaUtil.ariaAttributeRoleDefaults[role][attributeName];
                if (typeof (retVal) === "function") {
                    retVal = retVal(ele);
                }
            }
        }

        // Still not defined? Check global defaults
        if (!retVal && attributeName in AriaUtil.ariaAttributeGlobalDefaults) {
            retVal = AriaUtil.ariaAttributeGlobalDefaults[attributeName];
        }
        return retVal;
    }

    public static isDefinedAriaAttribute(ele, attrName) {
        let isDefinedAriaAttribute = false;
        if (attrName.substring(0, 5) === 'aria-') {
            // User agents SHOULD treat state and property attributes with a value of "" the same as they treat an absent attribute.
            isDefinedAriaAttribute = ele.hasAttribute && ele.hasAttribute(attrName) && ele.getAttribute(attrName).length > 0;
        }
        return isDefinedAriaAttribute;
    }

    /**
     * WAI-ARIA’s role attribute may have a list of values, but only the first valid and supported WAI-ARIA role is used
     * https://www.w3.org/TR/wai-aria-implementation/#mapping_role_table
     * This function is responsible for retrieving the resoled role for an element.
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return string - resolved role for the element:
     *       explicit role: resoled from the list of values
     *       implicit role: if not explicitely specified, or none of the specified role values is allowed for the element
     *       null: if none of the specified role values is allowed for the element, neither implicit role exists
     *       
     * @memberOf AriaUtil
     */
    public static getResolvedRole(elem: Element, considerImplicitRoles: boolean = true): string {
        if (!elem) return null;
        let role = CacheUtil.getCache(elem, "RPTUTIL_ELEMENT_RESOLVED_ROLE", null);
        if (role === null) {
            const roles = AriaUtil.getUserDefinedRoles(elem); 
            let tagProperty = AriaUtil.getElementAriaProperty(elem);
            let allowedRoles = AriaUtil.getAllowedAriaRoles(elem, tagProperty);
            let containsGeneric = false;
            if (roles && roles.length > 0 && allowedRoles && allowedRoles.length > 0) {
                for (let i = 0; i < roles.length; i++) {
                    if (allowedRoles.includes("any") || allowedRoles.includes(roles[i])) {
                        if (allowedRoles.includes("any") && roles[i] === 'generic') {
                            containsGeneric = true;
                            continue;
                        }
                        
                        role = roles[i];
                        if (role === "presentation" || role === "none") {
                            // If element is focusable, then presentation roles are to be ignored
                            if (CommonUtil.isFocusable(elem)) {
                                //reset rule to null
                                role = null;
                                continue;
                            }
                        }
                        break;
                    }
                }
                if (containsGeneric) role = 'generic';
            }
            
            if (role === null && considerImplicitRoles) {
                const implicitRole = AriaUtil.getImplicitRole(elem);
                role = implicitRole && implicitRole.length > 0 ? implicitRole[0] : undefined;
            }
            CacheUtil.setCache(elem, "RPTUTIL_ELEMENT_RESOLVED_ROLE", role);
        }
        return role !== undefined ? role : null;
    }

    /**
     * This function is responsible for retrieving user defined element's roles from dom.
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return {List} roles - list of user defined roles in the element role attribute.
     *
     * @memberOf AriaUtil
     */
    public static getUserDefinedRoles(ele: Element): string[] {
        return AriaUtil.getRoles(ele, false);
    }

    /**
     * This function is responsible for retrieving element's roles.
     * This function also finds implicit roles.
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} roles - list of attribute roles and implicit roles.
     *
     * @memberOf AriaUtil
     */
    public static getRoles(ele: Element, considerImplicitRoles: boolean): string[] {
        let roles: string[] = [];
        if (ele && ele.hasAttribute && ele.hasAttribute("role")) {
            let attrRoles = CommonUtil.normalizeSpacing(ele.getAttribute("role").trim()).split(" ");
            for (let i = 0; i < attrRoles.length; ++i) {
                roles.push(attrRoles[i]);
            }
        }

        //check if implicit roles exist.
        //Note: element can have multiple implicit roles
        if (considerImplicitRoles) {
            let implicitRole = AriaUtil.getImplicitRole(ele);
            if (implicitRole !== null && implicitRole.length > 0) {
                //add implicit roles to the attributes roles.
                CommonUtil.concatUniqueArrayItemList(implicitRole, roles);
            }
        }
        return roles;
    }

    /**
     * Returns the implicit role of the elemement
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return the implicit role or [] if doesn't exist
     *
     * @memberOf AriaUtil
     */
    public static getImplicitRole(ele): string[] {
        if (!ele || ele.nodeType !== 1) return null;
        let implicitRoles: string[] = CacheUtil.getCache(ele, "AriaUtil_ImplicitRole", null);
        if (!implicitRoles) {
            let tagProperty = AriaUtil.getElementAriaProperty(ele);
            // check if there are any implicit roles for this element.
            if (tagProperty && tagProperty.implicitRole) {
                if (tagProperty.implicitRole.includes("generic")) {
                    // the 'generic' role is only allowed if a valid aria attribute exists.
                    let domAriaAttributes = AriaUtil.getUserDefinedAriaAttributes(ele);
                    if (domAriaAttributes.length === 0) {
                        CacheUtil.setCache(ele, "AriaUtil_ImplicitRole", []);
                        return [];
                    }
                    let roleAttributes = [];
                    let pattern = ARIADefinitions.designPatterns['generic'];
                    if (pattern.reqProps && pattern.reqProps.length > 0)
                        CommonUtil.concatUniqueArrayItemList(pattern.reqProps, roleAttributes);

                    if (tagProperty.globalAriaAttributesValid)
                        CommonUtil.concatUniqueArrayItemList(ARIADefinitions.globalProperties, roleAttributes);

                    if (pattern.deprecatedProps && pattern.deprecatedProps.length > 0)
                        CommonUtil.reduceArrayItemList(pattern.deprecatedProps, roleAttributes);

                    // remove 'generic' role if roleAttributes doesn't contain any of domAriaAttributes 
                    if (roleAttributes.length > 0 && !roleAttributes.some(attr => domAriaAttributes.includes(attr))) {
                        let implicit = CommonUtil.reduceArrayItemList(['generic'], tagProperty.implicitRole);
                        CacheUtil.setCache(ele, "AriaUtil_ImplicitRole", implicit);
                        return implicit;
                    }
                }
                CacheUtil.setCache(ele, "AriaUtil_ImplicitRole", tagProperty.implicitRole);
                return tagProperty.implicitRole;
            }
            CacheUtil.setCache(ele, "AriaUtil_ImplicitRole", []);
            return [];
        }
        return implicitRoles;
    }

    /**
     * Returns the required properties of the role
     * @parm {string} role - the role
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return {List} properties - list of properties that are required by the role
     *
     * @memberOf AriaUtil
     */
    public static getRoleRequiredProperties(role, ele) {
        if (role === null) {
            return null;
        }

        if (ARIADefinitions.designPatterns[role]) {
            let requiredAttributes = ARIADefinitions.designPatterns[role].reqProps;
            // handle special case of separator
            if (role.toLowerCase() === "separator" && ele && CommonUtil.isFocusable(ele)) {
                requiredAttributes = CommonUtil.concatUniqueArrayItemList(["aria-valuenow"], requiredAttributes || []);
            }
            return requiredAttributes;
        } else {
            return null;
        }
    }

    /**
     * This function is responsible for finding if a element has given role.
     * This function aslo finds if element has given roles as implicit role.
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {list or string} roles - List or single role for which to find if element has these roles.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} retVal - true or false based on if th element has the specified role.
     *
     * @memberOf AriaUtil
     *
     * Consider to use hasRoleInSemantics() instead.
     */
    public static hasRole(ele, role, considerImplicitRoles?) {  //Consider to use hasRoleInSemantics() instead.
        let retVal = false;
        if (ele && ele.hasAttribute && ele.hasAttribute("role")) {
            if (typeof (role) != typeof ("")) {
                let roles = ele.getAttribute("role").trim().split(" ");
                for (let i = 0; !retVal && i < roles.length; ++i) {
                    retVal = roles[i] in role;
                }
            } else {
                let roles = ele.getAttribute("role").trim().split(" ");
                for (let i = 0; !retVal && i < roles.length; ++i) {
                    retVal = roles[i] === role;
                }
            }
        }
        //if none of the the attribute roles matched with given role
        //check if implicit roles matches.
        //Note: element can have multiple implicit roles
        if (!retVal && considerImplicitRoles) {
            let wRoles = [];
            //check if there are any implicit roles for this element.
            let implicitRole = AriaUtil.getImplicitRole(ele);
            if (implicitRole !== null && implicitRole.length > 0) {
                CommonUtil.concatUniqueArrayItemList(implicitRole, wRoles);
                //if role is array loop thru and see if any  of the implicit role present in the array
                if (typeof (role) != typeof ("")) {
                    for (let i = 0; !retVal && i < wRoles.length; ++i) {
                        retVal = wRoles[i] in role;
                    }
                } else {
                    for (let i = 0; !retVal && i < wRoles.length; ++i) {
                        retVal = wRoles[i] === role;
                    }
                }
            }
        }
        return retVal;
    }

    /**
     * Checks if the element has the role, including the implied role if role is not explicitly specified.
     *
     * This function is replacing the hasRole function
     *
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {list or string} roles - List or single role for which to find if element has these roles.
     *
     * @return {List} retVal - true or false based on if the element has the specified role.
     *
     * @memberOf AriaUtil
     */
    public static hasRoleInSemantics(ele, role) {
        let retVal = false;
        let roleSpecified = false;
        if (ele && ele.hasAttribute && ele.hasAttribute("role")) {
            if (typeof (role) != typeof ("")) {
                let roles = ele.getAttribute("role").trim().toLowerCase().split(/\s+/);
                for (let i = 0; !retVal && i < roles.length; ++i) {
                    roleSpecified = true;
                    retVal = roles[i] in role;
                }
            } else {
                let roles = ele.getAttribute("role").trim().toLowerCase().split(/\s+/);
                for (let i = 0; !retVal && i < roles.length; ++i) {
                    roleSpecified = true;
                    retVal = roles[i] === role;
                }
            }
        }

        if (roleSpecified) {
            return retVal;
        }

        //check if implicit roles matches.
        //Note: element can have multiple implicit roles
        //check if there are any implicit roles for this element.
        let impRoles = AriaUtil.getImplicitRole(ele);
        if (impRoles !== null && impRoles.length > 0) {
            //if role is array loop thru and see if any  of the implicit role present in the array
            if (typeof (role) != typeof ("")) {
                for (let i = 0; !retVal && i < impRoles.length; ++i) {
                    retVal = impRoles[i] in role;
                }
            } else {
                for (let i = 0; !retVal && i < impRoles.length; ++i) {
                    retVal = impRoles[i] === role;
                }
            }
        }
        return retVal;
    }

    /**
     * This function is responsible for finding if a element has given role.
     * This function also checks if element has given roles as implicit roles.
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {bool} retVal - true or false based on if the element has the specified role.
     *
     * @memberOf AriaUtil
     */
    public static hasAnyRole(ele, considerImplicitRoles) {
        let retVal = false;
        if (ele && ele.hasAttribute && ele.hasAttribute("role")) {
            retVal = true;
        }

        //check if implicit roles exist.
        //Note: element can have multiple implicit roles
        if (!retVal && considerImplicitRoles) {
            //check if there are any implicit roles for this element.
            let impRoles = AriaUtil.getImplicitRole(ele);
            if (impRoles !== null && impRoles.length > 0)
                retVal = true;
        }
        return retVal;
    }

    public static isPresentationalElement(node) {
        // Elements extracted from https://developer.mozilla.org/en/docs/Web/HTML/Element#Inline_text_semantics,
        // http://dev.w3.org/html5/html-author/#text-level-semantics and https://wiki.whatwg.org/wiki/Presentational_elements_and_attributes
        let presentationalElements = ["abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
            "em", "i", "kbd", "mark", "q", "rp", "rt", "rtc", "ruby", "s",
            "samp", "small", "span", "strong", "sub", "sup", "time", "u",
            "var", "wbr", "a", "progress", "meter", "basefont", "big", "center",
            "strike", "tt", "font", "blink", "h1", "h2", "h3", "h4", "h5", "h6",
            "hr", "blockquote", "p"
        ];
        return CommonUtil.valInArray(node.nodeName.toLowerCase(), presentationalElements);
    }

    /**
     * return the ancestor of the given element and role.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {string} role - The role to search for on an element under the provided element
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} walkNode - A parent node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
     */
    public static getAncestorWithRole(element, roleName, considerImplicitRoles?) {
        let walkNode = DOMWalker.parentNode(element);
        while (walkNode !== null) {
            if (considerImplicitRoles) {
                if (AriaUtil.hasRoleInSemantics(walkNode, roleName)) {
                    break;
                }
            } else {
                if (AriaUtil.hasRole(walkNode, roleName, false)) {
                    break;
                }
            }
            walkNode = DOMWalker.parentNode(walkNode);
        }
        return walkNode;
    }

    /**
     * return the ancestor of the given element and roles.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {array} roles - the role names to search for
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} walkNode - A parent node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
     */
    public static getAncestorWithRoles(element, roleNames) {
        if (!element || !roleNames || !roleNames.length || roleNames.length === 0) return null;
        let walkNode = element;
        while (walkNode !== null) {
            let role = AriaUtil.getResolvedRole(walkNode);
            if (role !== null && roleNames.includes(role))
                return walkNode;
            walkNode = DOMWalker.parentNode(walkNode);
        }
        return null;
    }

    /**
     * return the roles with given role type.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {array} roleTyples - role types, such as 'widget', 'structure' etc.
     *
     * @return {array} roles - A parent node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
     */
    public static getRolesWithTypes(element, types: string[]) {
        if (!element || !types || !types.length || types.length === 0) return null;

        let roles = CacheUtil.getCache(element.ownerDocument, "roles_with_given_types", null);
        if (!roles || roles.length === 0) {
            roles = [];
            Object.entries(ARIADefinitions.designPatterns).forEach(([key, value]) => {
                if (types.includes(value.roleType))
                    roles.push(key);
            });
            CacheUtil.setCache(element.ownerDocument, "roles_with_given_types", roles);
        }
        return roles;
    }

    /**
     * return the roles with given role type.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {array} roleTyples - role types, such as 'widget', 'structure' etc.
     *
     * @return {array} roles - A parent node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
     */
    public static isWidget(element) {
        if (!element) return false;

        const widget = CacheUtil.getCache(element.ownerDocument, "is_element_widget", null);
        if (widget === null) {
            let ret = false;
            const role = AriaUtil.getResolvedRole(element); 
            if (role && ARIADefinitions.designPatterns[role] && ARIADefinitions.designPatterns[role].roleType === 'widget')
                ret = true;
            
            CacheUtil.setCache(element.ownerDocument, "is_element_widget", ret);
            return ret;
        }
        return widget;
    }

    /**
     * return if the element is owned or controlled by another element.
     * an element can be owned or controlled by another element through aria-owns or aria-controls
     *   when the DOM hierarchy cannot be used to represent the relationship.
     * aria-owns attribute is used to define contextual relationship with a owning parent 
     * aria-controls attribute is used to associate an element with the controlling element.
     *  example elements with roles: combobox, scrollbar, tab, button, listbox, menu, menubar, radiogroup, tree, treegrid
     * 
     * when an element is owned or controlled by another element, its navigation is controlled by the parent 
     *  through aria-activedescendants attribute
     * 
     * Note navigation with roving tabindex is in native focus navigation, not considered here   
     * 
     * @parm {element} element - The element to inspect
     * @return {boolean} 
     *
     * @memberOf AriaUtil
     */
    public static isNavigationOwnedOrControlled(element) {
        if (!element) return false;
        
        let role = AriaUtil.getResolvedRole(element);
        if (!role) return false;
        
        let id = element.getAttribute("id");
        if (!id || id.trim().length === 0) return false;

        const elem = element.ownerDocument.querySelector(`*[aria-controls~='${id}'][aria-activedescendant], *[aria-owns~='${id}'][aria-activedescendant]`);
        if (!elem) return false;

        const containers = ['combobox', 'scrollbar', 'button', 'tab', 'listbox', 'menu', 'menubar', 'radiogroup', 'tree', 'treegrid'];
        if (containers.includes(role) && CommonUtil.isTabbable(elem))
            return true;
        
        return false;
    }

    /**
     * This function is responsible for finding a node which matches the role and is a sibling of the
     * provided element.
     *
     * This function by default will not consider Check Hidden Setting at all.
     *
     * Note: This is a wrapper function to: AriaUtil.getSiblingWithRoleHidden
     *
     * @parm {element} element - The element to start the node walk on to find sibling node
     * @parm {string} role - The role to search for on an element under the provided element
     *
     * @return {node} walkNode - A sibling node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
     */
    public static getSiblingWithRole(element, role) {
        return AriaUtil.getSiblingWithRoleHidden(element, role, false);
    }

    /**
     * This function is responsible for finding a node which matches the role and is a sibling of the
     * provided element.
     *
     * This function also considers implicit roles for the elements.
     *
     * This function will also consider elements that are hidden based on the if the Check
     * Hidden Content settings should be considered or not.
     *
     * @parm {element} element - The element to start the node walk on to find sibling node
     * @parm {string} role - The role to search for on an element under the provided element
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicit - true or false based on if Implicit roles should be considered.
     *
     * @return {node} walkNode - A sibling node of the element passed in, which has the provided role
     *
     * @memberOf AriaUtil
     */
    public static getSiblingWithRoleHidden(element, role, considerHiddenSetting, considerImplicitRole?) {

        // Variable Declaration
        let walkNode = null;
        let hasRole = false;

        // Only perform the check if element and role are both provided
        if (element && role) {
            // Fetch the next sibling element
            walkNode = element.nextSibling;

            // Keep looping over the next siblings to find element which matches
            // the provided role.
            while (walkNode !== null && !hasRole) {

                // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                // or not.
                //  1. If considerHiddenSetting option is set to true then we perform the check to consider the
                //     Check Hidden Content that is provided.
                //  2. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                //     add it to the roleToElems hash at all or even do any checking for it at all.
                //
                // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                //       so on and so forth.
                if (considerHiddenSetting && CommonUtil.shouldNodeBeSkippedHidden(walkNode)) {
                    // Move on to the next node
                    walkNode = walkNode.nextSibling;

                    continue;
                }

                // Check if this node has the role that we need to check exists
                if (considerImplicitRole) {
                    hasRole = AriaUtil.hasRoleInSemantics(walkNode, role);
                } else {
                    hasRole = AriaUtil.hasRole(walkNode, role, false);
                }

                // Move on to the next node
                walkNode = walkNode.nextSibling;
            }

            // If we still have not found a node that matches the role, start a reverse look up
            if (!walkNode) {
                // Fetch the previous Sibling of this element
                walkNode = element.previousSibling;

                // Keep looping over all the previous siblings to search for an element which
                // matches the provided role.
                while (walkNode !== null && !hasRole) {

                    // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                    // or not.
                    //  1. If considerHiddenSetting option is set to true then we perform the check to consider the
                    //     Check Hidden Content that is provided.
                    //  2. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                    //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                    //     add it to the roleToElems hash at all or even do any checking for it at all.
                    //
                    // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                    //       so on and so forth.
                    if (considerHiddenSetting && CommonUtil.shouldNodeBeSkippedHidden(walkNode)) {
                        // Move on to the next node
                        walkNode = walkNode.previousSibling;

                        continue;
                    }

                    // Check if this node has the role that we need to check exists
                    hasRole = AriaUtil.hasRole(walkNode, role, considerImplicitRole);

                    // Move on to the next node
                    walkNode = walkNode.previousSibling;
                }
            }
        }

        return walkNode;
    }

    /**
     * This function is responsible for getting a descendant element with the specified role, under
     * the element that was provided.
     *
     * Note by default this function will not consider the Check Hidden Content Setting.
     *
     * Note: This is a wrapper function to: AriaUtil.getDescendantWithRoleHidden
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     *
     * @return {node} - The descendant element that matches the role specified (only one)
     *
     * @memberOf AriaUtil
     */
    public static getDescendantWithRole(element, roleName) {
        return AriaUtil.getDescendantWithRoleHidden(element, roleName, false);
    }

    /**
     * This function is responsible for getting a descendant element with the specified role, under
     * the element that was provided. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} - The descendant element that matches the role specified (only one)
     *
     * @memberOf AriaUtil
     */
    public static getDescendantWithRoleHidden(element, roleName, considerHiddenSetting, considerImplicitRoles?) {
        // Variable Decleration
        let descendant = null;
        //let nw = new NodeWalker(element);
        let nw = new DOMWalker(element);
        // Loop over all the childrens of the element provided and check if the rolename provided exists
        while (nw.nextNode() && nw.node != element && nw.node != element.nextSibling) {

            // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
            // or not.
            //  1. If considerHiddenSetting option is set to true then we perform the check to consider the
            //     Check Hidden Content that is provided.
            //  2. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
            //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
            //     add it to the roleToElems hash at all or even do any checking for it at all.
            //
            // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
            //       so on and so forth.
            if (considerHiddenSetting && CommonUtil.shouldNodeBeSkippedHidden(nw.node)) {
                continue;
            }

            // Check if this node has the role specified, if it does then set this as the descendant and stop checking the rest of the
            // nodes.
            // Check if this node has the implicit roles, if it does then set this as the descendant and stop checking the rest of the
            // nodes.
            if (considerImplicitRoles ? AriaUtil.hasRoleInSemantics(nw.node, roleName) : AriaUtil.hasRole(nw.node, roleName, false)) {
                descendant = nw.node;
                break;
            }
        }

        return descendant;
    }

    /**
     * This function is responsible for getting All descendant elements with the specified roles, under
     * the element that was provided. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string[]} roleNames - The roles to look for on the descendant's elements
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node[]} - all descendant elements that match the roles specified
     *
     * @memberOf AriaUtil
     */
    public static getAllDescendantsWithRoles(element, roleNames: string[], considerHiddenSetting, considerImplicitRoles) {
        if (!roleNames || roleNames.length === 0) return;
        // Variable Decleration
        let descendants = [];

        roleNames.forEach(roleName => {
            let kids = AriaUtil.getAllDescendantsWithRoleHidden(element, roleName, considerHiddenSetting, considerImplicitRoles);
            if (kids && kids.length > 0)
                descendants = descendants.concat(kids);
        });
        return descendants;
    }

    /**
     * This function is responsible for getting All descendant elements with the specified role, under
     * the element that was provided. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node[]} - The descendant elements that match the role specified
     *
     * @memberOf AriaUtil
     */
    public static getAllDescendantsWithRoleHidden(element, roleName: string, considerHiddenSetting, considerImplicitRoles) {
        // Variable Decleration
        let descendants = [];
        //let nw = new NodeWalker(element);
        let nw = new DOMWalker(element);
        // Loop over all the childrens of the element provided and check if the rolename provided exists
        while (nw.nextNode() && nw.node != element && nw.node != element.nextSibling) {
            if (nw.bEndTag) {
                continue;
            }
            // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
            // or not.
            //  1. If considerHiddenSetting option is set to true then we perform the check to consider the
            //     Check Hidden Content that is provided.
            //  2. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
            //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
            //     add it to the roleToElems hash at all or even do any checking for it at all.
            //
            // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
            //       so on and so forth.
            if (considerHiddenSetting && CommonUtil.shouldNodeBeSkippedHidden(nw.node)) {
                continue;
            }

            // Check if this node has the role specified, if it does then set this as the descendant and stop checking the rest of the
            // nodes.
            // Check if this node has the implicit roles, if it does then set this as the descendant and stop checking the rest of the
            // nodes.
            if (AriaUtil.hasRole(nw.node, roleName, considerImplicitRoles)) {
                descendants.push(nw.node);
            }
        }

        return descendants;
    }

    /**
     * This function is responsible for getting All direct children in AT tree with a role (exclude none and presentation)
     *
     * @parm {element} element - parent element for which we will be checking children for
     * @return {node} - The direct child elements in AT tree that has a role
     *
     * @memberOf AriaUtil
     */
    public static getDirectATChildren(element) {
        let requiredChildRoles = AriaUtil.getRequiredChildRoles(element, true);
        let direct: Array<HTMLElement> = [];
        AriaUtil.retrieveDirectATChildren(element, requiredChildRoles, direct);
        return direct;
    }

    /**
     * This function is responsible for recursively any child path till either no child or a child with a role is found (exclude none and presentation)
     *
     * @parm {element} element - parent element for which we will be checking children for
     * @return {node} - The direct child elements in AT tree
     *
     * @memberOf AriaUtil
     */
    public static retrieveDirectATChildren(element, requiredChildRoles, direct: Array<HTMLElement>) {
        let children: HTMLElement[] = [];
        if (element.children !== null && element.children.length > 0) {
            for (let i = 0; i < element.children.length; i++) {
                children.push(element.children[i]);
            }
        }
        // if the element contains "aria-own" attribute, then the aria-owned children need to be included too
        let owned = element.getAttribute("aria-owns");
        if (owned) {
            let doc = element.ownerDocument;
            if (doc) {
                let ownedIds = owned.split(" ");
                for (let i = 0; i < ownedIds.length; i++) {
                    let ownedElem = doc.getElementById(ownedIds[i]);
                    if (ownedElem) {
                        children.push(ownedElem);
                    }
                }
            }
        }
        if (children.length > 0) {
            for (let i = 0; i < children.length; i++) {
                //ignore hidden and invisible child
                if (VisUtil.isNodeHiddenFromAT(children[i]) || !VisUtil.isNodeVisible(children[i])) continue;
                let roles = AriaUtil.getRoles(children[i], false);
                if (roles === null || roles.length === 0) {
                    roles = AriaUtil.getImplicitRole(children[i]);
                }

                if (roles && roles !== null && roles.length > 0) {
                    //remove 'none' and 'presentation'
                    roles = roles.filter(function (role) {
                        return role !== "none" && role !== "presentation";
                    })

                    // a 'group' role is allowed but not required for some elements so remove it if exists
                    if (roles.includes("group") && requiredChildRoles && requiredChildRoles.includes('group')) {
                        roles = roles.filter(function (role) {
                            return role !== 'group';
                        })
                    }
                }
                if (roles && roles !== null && roles.length > 0) {
                    direct.push(children[i]);
                } else {
                    // recursive until get a return value, 
                    AriaUtil.retrieveDirectATChildren(children[i], requiredChildRoles, direct);
                }
            }
            return null;
        } else
            return null;
    }

    /**
     * this function returns null or required child roles for a given element with one more roles,
     * return null if the role is 'none' or 'presentation'
     * @param element 
     * @param includeImplicit include implicit roles if no role is explicitly provided
     * @returns 
     */
    public static getRequiredChildRoles(element, includeImplicit: boolean): string[] {
        let roles = AriaUtil.getRoles(element, false);
        // if explicit role doesn't exist, get the implicit one
        if ((!roles || roles.length === 0) && includeImplicit) {
            roles = AriaUtil.getImplicitRole(element);
        }

        /**  
         * ignore if the element doesn't have any explicit or implicit role
        */
        if (!roles || roles.length === 0) {
            return null;
        }

        /**  
         * ignore if the element contains none or presentation role
        */
        let presentationRoles = ["none", "presentation"];
        const found = roles.some(r => presentationRoles.includes(r));
        if (found) return null;

        let designPatterns = ARIADefinitions.designPatterns;
        let requiredChildRoles: string[] = new Array();
        for (let j = 0; j < roles.length; ++j) {
            if (designPatterns[roles[j]] && designPatterns[roles[j]].reqChildren !== null) {
                requiredChildRoles = CommonUtil.concatUniqueArrayItemList(designPatterns[roles[j]].reqChildren, requiredChildRoles);
            }
        }
        return requiredChildRoles;
    }

    /**
     * This function is responsible for getting an element referenced by aria-owns and has the
     * role that was specified.
     *
     * Note by default this function will not consider the Check Hidden Content Setting.
     *
     * Note: This is a wrapper function to: AriaUtil.getAriaOwnsWithRoleHidden
     *
     * @parm {element} element - Element to check for aria-owns
     * @parm {string} roleName - The role to look for on the aria-owns element
     *
     * @return {node} - The element that is referenced by aria-owns and has role specified.
     *
     * @memberOf AriaUtil
     */
    public static getAriaOwnsWithRole(element, roleName) {
        return AriaUtil.getAriaOwnsWithRoleHidden(element, roleName, false);
    }

    /**
     * This function is responsible for getting an element referenced by aria-owns and has the
     * role that was specified. This function aslo finds elements with implicit roles.
     *
     * @parm {element} element - Element to check for aria-owns
     * @parm {string} roleName - The role to look for on the aria-owns element
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {node} - The element that is referenced by aria-owns and has role specified.
     *
     * @memberOf AriaUtil
     */
    public static getAriaOwnsWithRoleHidden(element, roleName, considerHiddenSetting, considerImplicitRoles?) {
        // Variable Decleration
        let referencedElement = null;
        let referencedElemHasRole = false;

        // In the case aria-owns is not on the element just break out of this function with null
        if (CommonUtil.attributeNonEmpty(element, "aria-owns")) {

            // Get the reference ID
            let referenceID = element.getAttribute("aria-owns");

            // Get the element for the reference ID
            referencedElement = FragmentUtil.getById(element, referenceID);
            //ignore if the aria-owns point to the element itself
            if (DOMUtil.sameNode(element, referencedElement))
                return null;

            // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
            // or not.
            //  1. If considerHiddenSetting option is set to true then we perform the check to consider the
            //     Check Hidden Content that is provided.
            //  2. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
            //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
            //     add it to the roleToElems hash at all or even do any checking for it at all.
            if (considerHiddenSetting && referencedElement != null && CommonUtil.shouldNodeBeSkippedHidden(referencedElement)) {
                referencedElemHasRole = null;
            } else {
                referencedElemHasRole = AriaUtil.hasRole(referencedElement, roleName, considerImplicitRoles);
            }
        }
        return referencedElemHasRole ? referencedElement : null;
    }

    // Return true if the element has an ARIA label
    public static hasAriaLabel(element) {

        // Rpt_Aria_ValidIdRef determines if the aria-labelledby id points to a valid element
        return CommonUtil.attributeNonEmpty(element, "aria-label") || CommonUtil.attributeNonEmpty(element, "aria-labelledby");
    }

    // Given an array of elements, return true if the elements have unique ARIA labels
    public static hasUniqueAriaLabelsLocally(elements, isGlobal) {
        if (elements.length === 0) return false;
        let doc = elements[0].ownerDocument;
        let hasDuplicateLabels = false;
        let uniqueAriaLabels = null;

        if (isGlobal) {
            uniqueAriaLabels = CacheUtil.getCache(doc, "AriaUtil_HAS_UNIQUE_ARIA_LABELS", null);
        }
        if (uniqueAriaLabels === null) {
            uniqueAriaLabels = {};
        }

        for (let i = 0; !hasDuplicateLabels && i < elements.length; ++i) {

            if (elements[i].hasAttribute) {

                if (elements[i].hasAttribute("aria-label")) {

                    let ariaLabel = CommonUtil.normalizeSpacing(elements[i].getAttribute("aria-label")).toLowerCase();
                    hasDuplicateLabels = ariaLabel in uniqueAriaLabels;
                    uniqueAriaLabels[ariaLabel] = true;

                } else if (elements[i].hasAttribute("aria-labelledby")) {

                    let labelID = elements[i].getAttribute("aria-labelledby");
                    let labelNode = FragmentUtil.getById(elements[i], labelID);
                    let label = labelNode && !DOMUtil.sameNode(labelNode, elements[i]) ? CommonUtil.getInnerText(labelNode) : "";
                    let normalizedLabel = CommonUtil.normalizeSpacing(label).toLowerCase();
                    hasDuplicateLabels = normalizedLabel in uniqueAriaLabels;
                    uniqueAriaLabels[normalizedLabel] = true;

                } else {
                    // Has no label at all
                    hasDuplicateLabels = true;
                }
            }
        }
        if (isGlobal) {
            CacheUtil.setCache(doc, "AriaUtil_HAS_UNIQUE_ARIA_LABELS", uniqueAriaLabels);
        }
        return !hasDuplicateLabels;
    }

    public static getAriaLabel(ele) {
        if (ele.hasAttribute) {
            if (ele.hasAttribute("aria-labelledby")) {
                let labelIDs = ele.getAttribute("aria-labelledby").trim().split(" ");
                let normalizedLabel = "";
                for (let j = 0, length = labelIDs.length; j < length; ++j) {
                    let labelID = labelIDs[j];
                    let labelNode = FragmentUtil.getById(ele, labelID);
                    let label = labelNode && !DOMUtil.sameNode(labelNode, ele) ? CommonUtil.getInnerText(labelNode) : "";
                    normalizedLabel += CommonUtil.normalizeSpacing(label).toLowerCase();
                }
                return normalizedLabel.trim();
            } else if (ele.hasAttribute("aria-label")) {
                return CommonUtil.normalizeSpacing(ele.getAttribute("aria-label")).toLowerCase().trim();
            }
        }
        return "";
    }

    public static getAriaDescription(ele) {
        if (!ele) return "";
        let normalizedLabel = "";
        let desc = ele.getAttribute("aria-labelledby");
        if (desc && desc.trim().length > 0) {
            let labelIDs = desc.trim().split(" ");
            for (let j = 0, length = labelIDs.length; j < length; ++j) {
                let labelID = labelIDs[j];
                let labelNode = FragmentUtil.getById(ele, labelID);
                let label = labelNode && !DOMUtil.sameNode(labelNode, ele) ? CommonUtil.getInnerText(labelNode) : "";
                if (label && label.trim().length > 0)
                    normalizedLabel += CommonUtil.normalizeSpacing(label).toLowerCase();
            }
            if (normalizedLabel.trim().length > 0)
                return normalizedLabel.trim();
        }

        desc = ele.getAttribute("aria-description");
        if (desc && desc.trim().length > 0)
            return desc.trim().toLowerCase();
        
        return "";
    }

    public static findAriaLabelDupes(elements) {
        let dupeMap = {}
        elements.forEach(function (ele) {
            dupeMap[AriaUtil.getAriaLabel(ele)] = (dupeMap[AriaUtil.getAriaLabel(ele)] || 0) + 1;
        })
        return dupeMap;
    }

    // Given an array of elements, return true if the elements have unique ARIA labels globally
    public static hasUniqueAriaLabels(elements) {
        return AriaUtil.hasUniqueAriaLabelsLocally(elements, true);
    }

    // Given an array of elements, return true if the elements have unique ARIA labels
    public static hasDuplicateAriaLabelsLocally(elements, isGlobal) {
        if (elements.length === 0) return false;
        let doc = elements[0].ownerDocument;

        let hasDuplicateLabels = false;
        let uniqueAriaLabels: { [key: string]: boolean } = null;
        let duplicateLabelNameArray = new Array();

        if (isGlobal) {
            uniqueAriaLabels = CacheUtil.getCache(doc, "AriaUtil_HAS_UNIQUE_ARIA_LABELS", null);
        }
        if (uniqueAriaLabels === null) {
            uniqueAriaLabels = {};
        }

        for (let i = 0; i < elements.length; ++i) {

            if (elements[i].hasAttribute) {

                if (elements[i].hasAttribute("aria-label")) {

                    let ariaLabel = CommonUtil.normalizeSpacing(elements[i].getAttribute("aria-label")).toLowerCase();
                    hasDuplicateLabels = ariaLabel in uniqueAriaLabels;
                    uniqueAriaLabels[ariaLabel] = true;
                    if (!(ariaLabel in duplicateLabelNameArray)) {
                        duplicateLabelNameArray[ariaLabel] = new Array();
                    }
                    duplicateLabelNameArray[ariaLabel].push(elements[i].nodeName.toLowerCase());

                } else if (elements[i].hasAttribute("aria-labelledby")) {

                    let labelIDs = elements[i].getAttribute("aria-labelledby").trim().split(" ");
                    let normalizedLabel = "";
                    for (let j = 0, length = labelIDs.length; j < length; ++j) {
                        let labelID = labelIDs[j];
                        let labelNode = FragmentUtil.getById(elements[i], labelID);
                        let label = labelNode && !DOMUtil.sameNode(labelNode, elements[i]) ? CommonUtil.getInnerText(labelNode) : "";
                        normalizedLabel += CommonUtil.normalizeSpacing(label).toLowerCase();
                    }
                    hasDuplicateLabels = normalizedLabel in uniqueAriaLabels;
                    uniqueAriaLabels[normalizedLabel] = true;
                    if (!(normalizedLabel in duplicateLabelNameArray)) {
                        duplicateLabelNameArray[normalizedLabel] = new Array();
                    }
                    duplicateLabelNameArray[normalizedLabel].push(elements[i].nodeName.toLowerCase());
                }
            }
        }
        if (isGlobal) {
            CacheUtil.setCache(doc, "AriaUtil_HAS_UNIQUE_ARIA_LABELS", uniqueAriaLabels);
        }
        return duplicateLabelNameArray;
    }

    // Given an array of elements, return true if the elements have unique ARIA labels globally
    public static hasDuplicateAriaLabels(elements) {
        return AriaUtil.hasDuplicateAriaLabelsLocally(elements, true);
    }

    // Given an array of elements, return true if the elements have unique aria-labelledby attributes
    public static hasUniqueAriaLabelledby(elements) {

        let hasDuplicateLabels = false;
        let labelRefs = {};

        for (let i = 0; !hasDuplicateLabels && i < elements.length; ++i) {

            if (elements[i].hasAttribute && elements[i].hasAttribute("aria-labelledby") && !CommonUtil.isIdReferToSelf(elements[i], elements[i].getAttribute("aria-labelledby"))) {
                let labelRef = CommonUtil.normalizeSpacing(elements[i].getAttribute("aria-labelledby"));
                hasDuplicateLabels = labelRef in labelRefs;
                labelRefs[labelRef] = true;
            } else {
                hasDuplicateLabels = true;
            }
        }
        return !hasDuplicateLabels;
    }

    /**
     * this function is responsible for resolving ARIA requirements for an HTML element per ARIA in HTML
     * @param ruleContext the HTML element to be examined
     * @returns 
     */
    public static getElementAriaProperty(ruleContext) {
        let tagProperty: IDocumentConformanceRequirement = CacheUtil.getCache(ruleContext, "AriaUtil_ElementAriaProperty", null);
        if (!tagProperty) {
            let tagName = null;
            let name = null;

            if (ruleContext.tagName) {
                tagName = ruleContext.tagName.toLowerCase();
            } else if (ruleContext.nodeName) {
                tagName = ruleContext.nodeName.toLowerCase();
            }

            // check if the tagProperty exists in the documentConformanceRequirement hash.
            tagProperty = ARIADefinitions.documentConformanceRequirement[tagName];

            // The tag needs to check some special attributes
            if (tagProperty === null || tagProperty === undefined) {
                let specialTagProperties = ARIADefinitions.documentConformanceRequirementSpecialTags[tagName];
                switch (tagName) { // special cases
                    case "a":
                        CommonUtil.attributeNonEmpty(ruleContext, "href") ? tagProperty = specialTagProperties["with-href"] : tagProperty = specialTagProperties["without-href"];
                        break;
                    case "area":
                        CommonUtil.attributeNonEmpty(ruleContext, "href") ? tagProperty = specialTagProperties["with-href"] : tagProperty = specialTagProperties["without-href"];
                        break;
                    case "figure": {
                        let fcs = CommonUtil.getChildByTag(ruleContext, "figcaption");
                        fcs !== null && fcs.length > 0 ? tagProperty = specialTagProperties["child-figcaption"] : tagProperty = specialTagProperties["no-child-figcaption"];
                        break;
                    }
                    case "footer":
                    case "header":
                        if (AriaUtil.getAncestorWithRole(ruleContext, "article", true) !== null || AriaUtil.getAncestorWithRole(ruleContext, "complementary", true) !== null
                            || AriaUtil.getAncestorWithRole(ruleContext, "navigation", true) !== null || AriaUtil.getAncestorWithRole(ruleContext, "region", true) !== null
                            || CommonUtil.getAncestor(ruleContext, ["article", "aside", "main", "nav", "section"]) !== null)
                            tagProperty = specialTagProperties["des-section-article-aside-main-nav"];
                        else
                            tagProperty = specialTagProperties["other"];
                        break;
                    case "img":
                        let alt = ruleContext.hasAttribute("alt") ? ruleContext.getAttribute("alt") : null;
                        let title = ruleContext.hasAttribute("title") ? ruleContext.getAttribute("title") : null;
                        if (AriaUtil.getAriaLabel(ruleContext).trim().length !== 0 || (alt !== null && alt.length > 0) || (title !== null && title.length > 0)) {
                            // If the img has non-empty alt (alt="some text" or alt="  ") or an accessible name is provided
                            tagProperty = specialTagProperties["img-with-accname"];
                        } else {
                            if (alt !== null) {
                                // If the img has an empty alt (alt="") 
                                tagProperty = specialTagProperties["img-without-accname-empty-alt"];
                            } else {
                                // If the img lacks an alt attribute 
                                tagProperty = specialTagProperties["img-without-accname-no-alt"];
                            }
                        }
                        break;
                    case "input":
                        if (CommonUtil.attributeNonEmpty(ruleContext, "type")) {
                            let type = ruleContext.getAttribute("type").trim().toLowerCase();
                            tagProperty = specialTagProperties[type];
                            if (tagProperty === null || tagProperty === undefined) {
                                switch (type) {
                                    case "checkbox":
                                        CommonUtil.attributeNonEmpty(ruleContext, "aria-pressed") ? tagProperty = specialTagProperties["checkbox-with-aria-pressed"] : tagProperty = specialTagProperties["checkbox-without-aria-pressed"];
                                        break;
                                    case "email":
                                        CommonUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["email-with-list"] : tagProperty = specialTagProperties["email-no-list"];
                                        break;
                                    case "search":
                                        CommonUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["search-with-list"] : tagProperty = specialTagProperties["search-no-list"];
                                        break;
                                    case "tel":
                                        CommonUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["tel-with-list"] : tagProperty = specialTagProperties["tel-no-list"];
                                        break;
                                    case "text":
                                        CommonUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["text-with-list"] : tagProperty = specialTagProperties["text-no-list"];
                                        break;
                                    case "url":
                                        CommonUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["url-with-list"] : tagProperty = specialTagProperties["url-no-list"];
                                        break;
                                    default:
                                        // default
                                        CommonUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["default-with-list"] : tagProperty = specialTagProperties["default-no-list"];
                                        break;
                                }
                            }
                        } else {
                            // default type is the same as type=text
                            CommonUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["text-with-list"] : tagProperty = specialTagProperties["text-no-list"];
                        }
                        break;
                    case "li":
                        specialTagProperties = ARIADefinitions.documentConformanceRequirementSpecialTags["li"];
                        if (ruleContext.parentElement && AriaUtil.hasRoleInSemantics(ruleContext.parentElement, "list"))
                            tagProperty = specialTagProperties["child-of-list-role"];
                        else
                            tagProperty = specialTagProperties["no-child-of-list-role"];
                        break;
                    case "section":
                        //name = ARIAMapper.computeName(ruleContext);
                        //if (name && name.trim().length > 0) {
                        const label = AriaUtil.getAriaLabel(ruleContext);
                        if ((label && label.trim().length > 0) || CommonUtil.attributeNonEmpty(ruleContext, "title")) {
                            tagProperty = specialTagProperties["with-name"];
                        } else {
                            tagProperty = specialTagProperties["without-name"];
                        }
                        break;
                    case "select":
                        specialTagProperties = ARIADefinitions.documentConformanceRequirementSpecialTags["select"];
                        if (ruleContext.hasAttribute("multiple") ||
                            CommonUtil.attributeNonEmpty(ruleContext, "size") && ruleContext.getAttribute("size") > 1)
                            tagProperty = specialTagProperties["multiple-attr-size-gt1"];
                        else
                            tagProperty = specialTagProperties["no-multiple-attr-size-gt1"];
                        break;
                    case "summary":
                        specialTagProperties = ARIADefinitions.documentConformanceRequirementSpecialTags["summary"];
                        if (ruleContext.parentElement && ruleContext.parentElement.nodeName.toLowerCase() === 'details'
                            && DOMUtil.sameNode([...ruleContext.parentElement.children].filter(elem => elem.nodeName.toLowerCase() === 'summary')[0], ruleContext))
                            tagProperty = specialTagProperties["first-summary-of-detail"];
                        else
                            tagProperty = specialTagProperties["no-first-summary-of-detail"];
                        break;
                    case "tbody":
                    case "td":
                    case "tr":
                        if (AriaUtil.getAncestorWithRole(ruleContext, "table", true) !== null) {
                            tagProperty = specialTagProperties["des-table"];
                        } else {
                            AriaUtil.getAncestorWithRole(ruleContext, "grid", true) || AriaUtil.getAncestorWithRole(ruleContext, "treegrid", true) ? tagProperty = specialTagProperties["des-grid"] : tagProperty = specialTagProperties["des-other"];
                        }
                        break;
                    case "th":
                        if (AriaUtil.getAncestorWithRole(ruleContext, "table", true) !== null || AriaUtil.getAncestorWithRole(ruleContext, "grid", true) !== null || AriaUtil.getAncestorWithRole(ruleContext, "treegrid", true) !== null) {
                            const scope = CommonUtil.getScopeForTh(ruleContext);
                            if (scope === 'column') tagProperty = specialTagProperties["des-table-grid-treegrid-column-scope"];
                            else tagProperty = specialTagProperties["des-table-grid-treegrid-row-scope"];
                        } else {
                            tagProperty = specialTagProperties["des-other"];
                        }
                        break;
                    case "div":
                        let prt = ruleContext.parentElement;
                        prt !== null && prt.nodeName.toLowerCase() === 'dl' ? tagProperty = specialTagProperties["child-dl"] : tagProperty = specialTagProperties["no-child-dl"];
                        break;
                    default:
                        tagProperty = ARIADefinitions.documentConformanceRequirementSpecialTags["default"] as IDocumentConformanceRequirement;
                } //switch
            }
        }
        CacheUtil.setCache(ruleContext, "AriaUtil_ElementAriaProperty", tagProperty);
        return tagProperty || null;
    }

    public static getAllowedAriaRoles(ruleContext, properties: IDocumentConformanceRequirement) {
        let allowedRoles: string[] = CacheUtil.getCache(ruleContext, "AriaUtil_AllowedAriaRoles", null);
        if (!allowedRoles) {
            allowedRoles = [];
            let tagProperty: IDocumentConformanceRequirement = null;
            if (properties !== null && properties !== undefined) {
                tagProperty = properties;
            } else {
                tagProperty = AriaUtil.getElementAriaProperty(ruleContext);
            }

            if (tagProperty !== null && tagProperty !== undefined) {
                if (tagProperty.implicitRole !== null) {
                    CommonUtil.concatUniqueArrayItemList(tagProperty.implicitRole, allowedRoles);
                }
                if (tagProperty.validRoles !== null) {
                    CommonUtil.concatUniqueArrayItemList(tagProperty.validRoles, allowedRoles);
                }
                let implicitRoles = AriaUtil.getImplicitRole(ruleContext);
                if (implicitRoles && implicitRoles.length > 0) {
                    CommonUtil.concatUniqueArrayItemList(tagProperty.validRoles, allowedRoles);
                }
            }
            CacheUtil.setCache(ruleContext, "AriaUtil_AllowedAriaRoles", allowedRoles);
        }
        return allowedRoles;
    }

    public static getAllowedAriaAttributes(ruleContext, roles, properties) {
        let allowedAttributes: string[] = CacheUtil.getCache(ruleContext, "AriaUtil_AllowedAriaAttributes", null);
        if (!allowedAttributes) {
            allowedAttributes = [];
            let permittedRoles = [...roles];
            let tagName = ruleContext.tagName.toLowerCase();

            let prohibitedAttributes = [];
            // Element with a disabled attribute  https://www.w3.org/TR/html5/disabled-elements.html
            if (ARIADefinitions.elementsAllowedDisabled.indexOf(tagName) > -1) {
                // Use the aria-disabled attribute on any element that is allowed the disabled attribute in HTML5.
                allowedAttributes = CommonUtil.concatUniqueArrayItem("aria-disabled", allowedAttributes);
            }
            // Element with a required attribute http://www.the-art-of-web.com/html/html5-form-validation/
            if (ARIADefinitions.elementsAllowedRequired.indexOf(tagName) > -1) {
                // Use the aria-required attribute on any element that is allowed the required attribute in HTML5.
                allowedAttributes = CommonUtil.concatUniqueArrayItem("aria-required", allowedAttributes);
            }

            if (ARIADefinitions.elementsAllowedReadOnly.indexOf(tagName) > -1) {
                // Use the aria-readonly attribute on any element that is allowed the readonly attribute in HTML5.
                allowedAttributes = CommonUtil.concatUniqueArrayItem("aria-readonly", allowedAttributes);
            }

            let tagProperty = null;
            if (properties != null && properties !== undefined)
                tagProperty = properties;
            else
                tagProperty = AriaUtil.getElementAriaProperty(ruleContext);

            if (tagProperty !== null && tagProperty !== undefined) {
                // add the implicit role allowed attributes to the allowed role list if there is no specified role
                // ignore if the element doesn't allow the attributes from the implicit roles
                if (tagProperty.implicitRole !== null &&
                    (permittedRoles === null || permittedRoles === undefined || permittedRoles.length === 0)
                    && tagProperty.allowAttributesFromImplicitRole === undefined) {
                    for (let i = 0; i < tagProperty.implicitRole.length; i++) {
                        let roleProperty = ARIADefinitions.designPatterns[tagProperty.implicitRole[i]];
                        if (roleProperty !== null && roleProperty !== undefined) {
                            let properties = roleProperty.props;
                            CommonUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                            properties = AriaUtil.getRoleRequiredProperties(tagProperty.implicitRole[i], ruleContext);
                            CommonUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                            let prohibitedProps = roleProperty.prohibitedProps;
                            if (prohibitedProps && prohibitedProps.length > 0)
                                CommonUtil.concatUniqueArrayItemList(prohibitedProps, prohibitedAttributes);

                            // special case of separator
                            if (tagProperty.implicitRole[i] === "separator" && CommonUtil.isFocusable(ruleContext)) {
                                CommonUtil.concatUniqueArrayItemList(["aria-disabled", "aria-valuenow", "aria-valuemax", "aria-valuemin", "aria-valuetext"], allowedAttributes);
                            }
                        }
                    }
                }
                // Adding the global properties to the valid attribute list
                if (tagProperty.globalAriaAttributesValid) {
                    let properties = ARIADefinitions.globalProperties; // global properties
                    CommonUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                }
            }
            // adding the other role to the allowed roles for the attributes
            if (tagProperty && tagProperty.otherRolesForAttributes && tagProperty.otherRolesForAttributes.length > 0)
                CommonUtil.concatUniqueArrayItemList(tagProperty.otherRolesForAttributes, permittedRoles);
            // adding the specified role properties to the allowed attribute list
            for (let i = 0; permittedRoles !== null && i < permittedRoles.length; i++) {
                let roleProperties = ARIADefinitions.designPatterns[permittedRoles[i]];
                if (roleProperties !== null && roleProperties !== undefined) {
                    // ignore the properties if the element doesn't allow attributes from the implicit role
                    if (!tagProperty || tagProperty.implicitRole === null || !tagProperty.implicitRole.includes(permittedRoles[i]) || (tagProperty.implicitRole.includes(permittedRoles[i]) && tagProperty.allowAttributesFromImplicitRole === undefined)) {
                        let properties = roleProperties.props; // allowed properties
                        CommonUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                        properties = AriaUtil.getRoleRequiredProperties(permittedRoles[i], ruleContext); // required properties
                        CommonUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                    }
                    let prohibitedProps = roleProperties.prohibitedProps;
                    if (prohibitedProps && prohibitedProps.length > 0)
                        CommonUtil.concatUniqueArrayItemList(prohibitedProps, prohibitedAttributes);
                    // special case for separator
                    if (permittedRoles[i] === "separator" && CommonUtil.isFocusable(ruleContext)) {
                        CommonUtil.concatUniqueArrayItemList(["aria-disabled", "aria-valuemax", "aria-valuemin", "aria-valuetext"], allowedAttributes);
                    }
                }
            }

            // ignore aria-level, aria-setsize or aria-posinset if "row" is not in treegrid
            if (permittedRoles.includes("row") && AriaUtil.getAncestorWithRole(ruleContext, "treegrid", true) == null) {
                let index = -1;
                if ((index = allowedAttributes.indexOf("aria-level")) > -1)
                    allowedAttributes.splice(index, 1);

                if ((index = allowedAttributes.indexOf("aria-setsize")) > -1)
                    allowedAttributes.splice(index, 1);

                if ((index = allowedAttributes.indexOf("aria-posinset")) > -1)
                    allowedAttributes.splice(index, 1);

            }

            // add the other allowed attributes for the element
            if (tagProperty && tagProperty.otherAllowedAriaAttributes && tagProperty.otherAllowedAriaAttributes.length > 0) {
                // check attribute-value pair if exists
                let allowed = [];
                for (let p = 0; p < tagProperty.otherAllowedAriaAttributes.length; p++) {
                    const attr = tagProperty.otherAllowedAriaAttributes[p];
                    if (attr.includes("=")) {
                        const pair = attr.split("=");
                        if (ruleContext.getAttribute(pair[0]) === pair[1])
                            allowed.push(pair[0]);
                    } else
                        allowed.push(attr);
                }
                if (allowed.length > 0)
                    CommonUtil.concatUniqueArrayItemList(allowed, allowedAttributes);
            }
            // add the other prohibitted attributes for the element
            if (tagProperty && tagProperty.otherDisallowedAriaAttributes && tagProperty.otherDisallowedAriaAttributes.length > 0) {
                // check attribute-value pair if exists
                let disallowed = [];
                for (let p = 0; p < tagProperty.otherDisallowedAriaAttributes.length; p++) {
                    const attr = tagProperty.otherDisallowedAriaAttributes[p];
                    if (attr.includes("=")) {
                        const pair = attr.split("=");
                        if (ruleContext.getAttribute(pair[0]) === pair[1])
                            disallowed.push(pair[0]);
                    } else
                        disallowed.push(attr);
                }
                if (disallowed.length > 0)
                    CommonUtil.concatUniqueArrayItemList(disallowed, prohibitedAttributes);
            }
            //exclude the prohibitedAttributes from the allowedAttributes
            allowedAttributes = CommonUtil.reduceArrayItemList(prohibitedAttributes, allowedAttributes);

            //exclude aria attribute for elements without implicit role and with 'Naming Prohibited'
            if ((!roles || roles.length === 0) && tagProperty.implicitRole === null && tagProperty.prohibitedAriaAttributesWhenNoImplicitRole)
                allowedAttributes = CommonUtil.reduceArrayItemList(tagProperty.prohibitedAriaAttributesWhenNoImplicitRole, allowedAttributes);

            CacheUtil.setCache(ruleContext, "AriaUtil_AllowedAriaAttributes", allowedAttributes);
        }
        return allowedAttributes;
    }
    /**
     * 
     * @param ariaAttr 
     * @param htmlAttrs 
     * @type: conflict or overlapping
     * @returns htmlAttrName, 'Pass' or null
     *         htmlAttrName that conflicts with the ariaAttr, 
     *         'Pass' with no conflict with the ariaAttr, 
     *         or null where ariaAttr won't cause conflict
     */
    public static getConflictOrOverlappingHtmlAttribute(ariaAttr, htmlAttrs, type): any[] | null {
        let exist = ARIADefinitions.relatedAriaHtmlAttributes[ariaAttr['name']];
        if (exist) {
            if (!ariaAttr || ariaAttr.length == 0 || !htmlAttrs || htmlAttrs.length == 0) return [];

            let examinedHtmlAtrNames = [];
            let concernTypes = null;
            if (type === 'conflict') {
                if (!exist.conflict || Object.keys(exist.conflict).length === 0) return null;
                concernTypes = exist.conflict;
            } else if (type === 'overlapping') {
                if (!exist.overlapping || Object.keys(exist.overlapping).length === 0) return null;
                concernTypes = exist.overlapping;
            } else
                return null;

            let applicable = false;
            let fail = false;
            for (let k = 0; k < concernTypes.length; k++) {
                let concernAriaValue = concernTypes[k].ariaAttributeValue;
                let concernHtmlNames = concernTypes[k].htmlAttributeNames;
                let concernHtmlValues = concernTypes[k].htmlAttributeValues;

                for (let i = 0; i < htmlAttrs.length; i++) {
                    let index = concernHtmlNames.indexOf(htmlAttrs[i]['name']);
                    if (index !== -1) {
                        applicable = true;
                        let htmlValuesInConcern = (concernHtmlValues === null || concernHtmlValues[index] === null) ? null : concernHtmlValues[index].split(",");

                        if (concernAriaValue === null) {
                            if (htmlValuesInConcern === null) {
                                examinedHtmlAtrNames.push({ result: 'Failed', 'attr': htmlAttrs[i]['name'] });
                                fail = true;
                            } else if (htmlValuesInConcern.includes(htmlAttrs[i]['value'])) {
                                examinedHtmlAtrNames.push({ result: 'Failed', 'attr': htmlAttrs[i]['name'] });
                                fail = true;
                            }
                        } else if (htmlValuesInConcern === null) {
                            if (concernAriaValue === ariaAttr['value']) {
                                examinedHtmlAtrNames.push({ result: 'Failed', 'attr': htmlAttrs[i]['name'] });
                                fail = true;
                            }
                        } else if (concernAriaValue === 'VALUE' && htmlValuesInConcern.includes('VALUE') && htmlValuesInConcern[0] !== ariaAttr['value']) {
                            examinedHtmlAtrNames.push({ result: 'Failed', 'attr': htmlAttrs[i]['name'] });
                            fail = true;
                        } else if (concernAriaValue === ariaAttr['value'] && htmlValuesInConcern.includes(htmlAttrs[i]['value'])) {
                            examinedHtmlAtrNames.push({ result: 'Failed', 'attr': htmlAttrs[i]['name'] });
                            fail = true;
                        }
                    }
                }
            }

            if (applicable && !fail)
                examinedHtmlAtrNames.push({ result: 'Pass', 'attr': '' });

            return examinedHtmlAtrNames;
        } else
            return null;
    }

    public static containsPresentationalChildrenOnly(elem: HTMLElement): boolean {
        let roles = AriaUtil.getRoles(elem, false);
        // if explicit role doesn't exist, get the implicit one
        if (!roles || roles.length === 0)
            roles = AriaUtil.getImplicitRole(elem);

        //ignore if the element doesn't have any explicit or implicit role, shouldn't happen
        if (!roles || roles.length === 0)
            return false;

        for (let i = 0; roles !== null && i < roles.length; i++) {
            let roleProperties = ARIADefinitions.designPatterns[roles[i]];
            if (roleProperties !== null && roleProperties !== undefined) {
                let presentional = roleProperties.presentationalChildren;
                if (presentional === true)
                    return true;
            }
        }
        return false;
    }

    public static shouldBePresentationalChild(element: HTMLElement): boolean {
        let walkNode: Element = DOMWalker.parentElement(element);
        while (walkNode) {
            if (AriaUtil.containsPresentationalChildrenOnly(walkNode as HTMLElement)) return true;

            //aria-own case: if the element is referred by an aria-won
            walkNode = ARIAMapper.getAriaOwnedBy(walkNode as HTMLElement) || DOMWalker.parentElement(walkNode);
        }
        return false;
    }

    /* 
 * check if any explicit role specified for the element is a valid ARIA role
 * return: null if no explicit role is defined, 
 *         true if the role(s) are defined in ARIA
 *         false if any role is not defined in ARIA
*/
    public static areRolesDefined(roles: string[]) {
        if (!roles || roles.length === 0) return null;

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
    public static getInvalidRoles(ruleContext: Element) {
        let domRoles: string[] = AriaUtil.getUserDefinedRoles(ruleContext);

        if (!domRoles || domRoles.length === 0)
            return null;

        // check the 'generic' role first
        if (domRoles && domRoles.includes('generic'))
            return ["generic"];

        // Failing roles
        let failRoleTokens = [];
        // Passing roles
        let passRoleTokens = [];

        let tagProperty = AriaUtil.getElementAriaProperty(ruleContext);
        let allowedRoles = AriaUtil.getAllowedAriaRoles(ruleContext, tagProperty);
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
    public static getRolesUndefinedByAria(element: Element) {
        if (!element) return null;

        const roles = AriaUtil.getRoles(element, false);
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
    public static getInvalidAriaAttributes(ruleContext: Element): string[] {
        let roles = AriaUtil.getUserDefinedRoles(ruleContext);

        // the invalid role case: handled by Rpt_Aria_ValidRole. Ignore to avoid duplicated report
        // for mutiple roles, skip if any role is invalid
        let defined = AriaUtil.areRolesDefined(roles);
        if (defined !== null && !defined)
            return null;

        let attrs = [];
        if (!roles || roles.length == 0)
            roles = AriaUtil.getImplicitRole(ruleContext);

        let aria_attrs: string[] = AriaUtil.getUserDefinedAriaAttributes(ruleContext);

        let tagProperty = AriaUtil.getElementAriaProperty(ruleContext);
        // Attributes allowed on this node
        let allowedAttributes = AriaUtil.getAllowedAriaAttributes(ruleContext, roles, tagProperty);

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
    public static getConflictAriaAndHtmlAttributes(elem: Element) {

        let ariaAttrs = AriaUtil.getUserDefinedAriaAttributeNameValuePairs(elem);
        let htmlAttrs = AriaUtil.getUserDefinedHtmlAttributeNameValuePairs(elem);

        let ret = [];
        if (ariaAttrs && ariaAttrs.length > 0 && htmlAttrs && htmlAttrs.length > 0) {
            for (let i = 0; i < ariaAttrs.length; i++) {
                const examinedHtmlAtrNames = AriaUtil.getConflictOrOverlappingHtmlAttribute(ariaAttrs[i], htmlAttrs, 'conflict');
                if (examinedHtmlAtrNames === null) continue;
                examinedHtmlAtrNames.forEach(item => {
                    if (item['result'] === 'Failed') //failed
                        ret.push({ 'ariaAttr': ariaAttrs[i]['name'], 'htmlAttr': item['attr'] });
                });
            }
        }
        return ret;
    }

    /* 
     * get deprecated Aria roles
     * return: a list of deprecated Aria roles
    */
    public static getDeprecatedAriaRoles(element: Element) {
        if (!element) return null;

        const roles = AriaUtil.getRoles(element, false);
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
    public static getDeprecatedAriaAttributes(element: Element) {
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
        if (ariaAttrs.length === 0) return [];

        let ret = [];
        const globalDeprecatedAttributes = ARIADefinitions.globalDeprecatedProperties;
        for (let i = 0; i < ariaAttrs.length; i++) {
            if (globalDeprecatedAttributes.includes(ariaAttrs[i]))
                ret.push({ "role": "any", "attribute": ariaAttrs[i] });
        }
        const roles = AriaUtil.getRoles(element, false);
        if (roles && roles.length > 0) {
            for (let i = 0; i < roles.length; i++) {
                const roleWithDeprecatedAttributes = ARIADefinitions.designPatterns[roles[i]];
                if (roleWithDeprecatedAttributes) {
                    const deprecatedAttriNames = roleWithDeprecatedAttributes['deprecatedProps'];
                    if (deprecatedAttriNames && deprecatedAttriNames.length > 0) {
                        for (let j = 0; j < ariaAttrs.length; j++) {
                            if (deprecatedAttriNames.includes(ariaAttrs[j]))
                                ret.push({ "role": roles[i], "attribute": ariaAttrs[j] });
                        }
                    }
                }
            }
        }
        return ret;
    }

    public static isNodeInGrid(node) {
        return AriaUtil.getAncestorWithRole(node, "grid") != null;
    }
}