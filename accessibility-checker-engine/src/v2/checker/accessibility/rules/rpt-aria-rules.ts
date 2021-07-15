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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IEngine";
import { RPTUtil, NodeWalker } from "../util/legacy";
import { ARIADefinitions } from "../../../aria/ARIADefinitions";
import { FragmentUtil } from "../util/fragment";
import { ARIAMapper } from "../../../..";
import { DOMUtil } from "../../../dom/DOMUtil";

let a11yRulesAria: Rule[] = [{
    /**
     * Description: Triggers if a role is not a valid WAI-ARIA role
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_ValidRole",
    context: "dom:*[role]",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let roleStr = ruleContext.getAttribute("role").trim().toLowerCase();
        if (roleStr.length === 0) {
            return null;
        }
        if (ruleContext.hasAttribute("aria-hidden") && ruleContext.getAttribute("aria-hidden").toLowerCase() === "true") {
            return null;
        }

        let designPatterns = ARIADefinitions.designPatterns;
        let roles = roleStr.split(/\s+/);
        // now we have all role attributes
        let invalidRoles = [];
        for (const role of roles) {
            if (!(role.toLowerCase() in designPatterns)) {
                invalidRoles.push(role);
            }
        }
        //return new ValidationResult(passed, [ruleContext], 'role', '', [roles[i]]);
        if (invalidRoles.length === roles.length) {
            return RuleFail("Fail_2", [invalidRoles.join(",")]);
        } else if (invalidRoles.length > 0) {
            return RulePotential("Fail_1", [invalidRoles.join(",")]);
        } else {
            return RulePass("Pass_0");
        }
    }
},
{
    /**
     * Description: Triggers if an invalid WAI-ARIA property is found anywhere
     * 				(on an element with a role or on an element with no role).
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     *
     */
    id: "Rpt_Aria_ValidProperty",
    context: "dom:*",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let contextAttributes = ruleContext.attributes;
        // This gets all elements with attributes so we still have some
        // Out of Scope since not all attributes are aria 

        if (contextAttributes) {
            let propertyDataTypes = ARIADefinitions.propertyDataTypes;
            let failedProperties = "";
            let testedProperties = 0;
            for (let i = 0, length = contextAttributes.length; i < length; i++) {
                let attrName = contextAttributes[i].name;
                if (RPTUtil.isDefinedAriaAttribute(ruleContext, attrName)) {
                    testedProperties++;
                    // Now we just have aria attributes which can
                    // pass or fail based on whether there property is valid
                    let dataTypes = propertyDataTypes[attrName];
                    if (!dataTypes) { // if property is not in valid property list
                        // create failedProperties comma sep list
                        if (failedProperties.length == 0) {
                            failedProperties = attrName;
                        } else {
                            failedProperties = failedProperties + ", " + attrName;
                        }
                    }
                }
            }
            if (testedProperties == 0) {
                return null;
            } else if (failedProperties.length != 0) {
                //return new ValidationResult(false, [ruleContext], '', '', [failedProperties, ruleContext.tagName]);
                return RuleFail("Fail_1", [failedProperties, ruleContext.tagName]);
            } else {
                //return RulePass(1);
                return RulePass("Pass_0");
            }
        } else {
            return null;
        }
        // JCH - passing is based on all attributes not just aria attributes
        //       leading to OVER COUNTING so moved pass up
        //return RulePass(1);
    }
},
{
    /**
     * Description: Triggers if a role is given and a required property of the role is missing.
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_RequiredProperties",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let attrNameArr = new Array();
        let roleNameArr = new Array();
        let designPatterns = ARIADefinitions.designPatterns;
        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        let implicitRole = ARIAMapper.elemToImplicitRole(ruleContext);
        let hasAttribute = RPTUtil.hasAttribute;
        let testedRoles = 0;

        for (let j = 0, rolesLength = roles.length; j < rolesLength; ++j) {
            if (roles[j] === implicitRole) continue;
            if (designPatterns[roles[j]] && RPTUtil.getRoleRequiredProperties(roles[j], ruleContext) != null) {
                let requiredRoleProps = RPTUtil.getRoleRequiredProperties(roles[j], ruleContext);
                let roleMissingReqProp = false;
                testedRoles++;
                for (let i = 0, propertiesLength = requiredRoleProps.length; i < propertiesLength; i++) {
                    if (!hasAttribute(ruleContext, requiredRoleProps[i])) {
                        // If an aria-labelledby isn't present, an aria-label will meet the requirement.
                        if (requiredRoleProps[i] == "aria-labelledby") {
                            if ((!hasAttribute(ruleContext, "aria-label")) || (roles[i] != "radiogroup")) {
                                attrNameArr.push(requiredRoleProps[i]);
                                roleMissingReqProp = true;
                            }
                        } else if (requiredRoleProps[i] == "aria-valuenow") {
                            if ((!hasAttribute(ruleContext, "aria-valuetext")) || (roles[i] != "progressbar")) {
                                attrNameArr.push(requiredRoleProps[i]);
                                roleMissingReqProp = true;
                            }
                        } else if (requiredRoleProps[i] == "aria-controls" && roles[j] == "combobox") {
                            // Skip this check since aria-controls in the textbox of a combobox is already handled in rule HAAC_Combobox_Must_have_Text_Input
                        } else {
                            attrNameArr.push(requiredRoleProps[i]);
                            roleMissingReqProp = true;
                        }
                    }
                }
                if (roleMissingReqProp == true) {
                    roleNameArr.push(roles[j]);
                }
            }
        }
        let retToken = new Array();
        let passed = attrNameArr.length == 0; // only aria attributes so NO OUT OF SCOPE
        retToken.push(roleNameArr.join(", "));
        retToken.push(attrNameArr.join(", "));
        //return new ValidationResult(passed, [ruleContext], attrNameArr, '', passed == true ? [] : retToken);
        if (testedRoles === 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", retToken);
        } else {
            return RulePass("Pass_0");
        }
    }
},
{
    /**
     * Description: Triggers if a role is given and a property of the role is empty.
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_EmptyPropertyValue",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let attrNameArr = new Array();
        let designPatterns = ARIADefinitions.designPatterns;
        let hasAttribute = RPTUtil.hasAttribute;
        let testedProperties = 0;

        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        for (let j = 0; j < roles.length; ++j) {
            if (designPatterns[roles[j]] && RPTUtil.getRoleRequiredProperties(roles[j], ruleContext) != null) {
                let requiredRoleProps = RPTUtil.getRoleRequiredProperties(roles[j], ruleContext);
                for (let i = 0, length = requiredRoleProps.length; i < length; i++) {
                    let attribute = requiredRoleProps[i];
                    if (hasAttribute(ruleContext, attribute)) {
                        testedProperties++;
                        let nodeValue = RPTUtil.normalizeSpacing(ruleContext.getAttribute(requiredRoleProps[i]));
                        if (nodeValue.length == 0) attrNameArr.push(requiredRoleProps[i]);
                    } else if (requiredRoleProps[i] == "aria-labelledby") {
                        if ((roles[i] == "radiogroup") && (hasAttribute(ruleContext, "aria-label"))) {
                            testedProperties++;
                            let nodeValue = RPTUtil.normalizeSpacing(ruleContext.getAttribute("aria-label"));
                            if (nodeValue.length == 0) attrNameArr.push("aria-label");
                        }
                    } else if (requiredRoleProps[i] == "aria-valuenow") {
                        if ((roles[i] == "progressbar") && (hasAttribute(ruleContext, "aria-valuetext"))) {
                            testedProperties++;
                            let nodeValue = RPTUtil.normalizeSpacing(ruleContext.getAttribute("aria-valuetext"));
                            if (nodeValue.length == 0) attrNameArr.push("aria-valuetext");
                        }
                    }
                }
            }
            if (designPatterns[roles[j]]) {
                let tagProperty = RPTUtil.getElementAriaProperty(ruleContext);
                let permittedRoles = [];
                permittedRoles.push(roles[j]);
                let allowedAttributes = RPTUtil.getAllowedAriaAttributes(ruleContext, permittedRoles, tagProperty);
                for (let i = 0, length = allowedAttributes.length; i < length; i++) {
                    let attribute = allowedAttributes[i];
                    if (attribute == "aria-checked" || attribute == "aria-selected" ||
                        attribute == "aria-expanded" || attribute == "aria-orientation" ||
                        attribute == "aria-level") {
                        if (hasAttribute(ruleContext, attribute)) {
                            testedProperties++;
                            let nodeValue = RPTUtil.normalizeSpacing(ruleContext.getAttribute(attribute));
                            if (nodeValue.length == 0) {
                                attrNameArr.push(attribute);
                            }
                        }
                    }
                }
            }
        }
        let retMsg = new Array();
        let passed = attrNameArr.length == 0;
        retMsg.push(attrNameArr.join(", "));
        //return new ValidationResult(passed, [ruleContext], attrNameArr, '', retMsg);
        if (testedProperties == 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", retMsg);
        } else {
            return RulePass("Pass_0");
        }
    }
},
{
    /**
     * Description: Triggers if a WAI-ARIA property of type NMTOKEN, int, decimal and boolean has an invalid value.
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_ValidPropertyValue",
    context: "dom:*",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let valueArr = new Array();
        let attrNameArr = new Array();
        let dataTypeArr = new Array();
        let propertyDataTypes = ARIADefinitions.propertyDataTypes;
        let contextAttributes = ruleContext.attributes;
        let testedPropertyValues = 0;

        if (contextAttributes) {
            for (let i = 0, length = contextAttributes.length; i < length; i++) {
                let attrName = contextAttributes[i].name;
                if (RPTUtil.isDefinedAriaAttribute(ruleContext, attrName)) {
                    let dataTypes = propertyDataTypes[attrName];
                    let nodeValue = RPTUtil.normalizeSpacing(contextAttributes[i].nodeValue);
                    testedPropertyValues++;
                    if (dataTypes && dataTypes.values) {
                        if (dataTypes.values.indexOf(nodeValue) == -1) {
                            if (dataTypes.values.indexOf('undefined') != -1 && nodeValue.length == 0) {
                                //translate 'undefined' to mean ''
                            } else {
                                // aria-relevant is represented as a space delimited list of the following values: 
                                // additions, removals, text; or a single catch-all value all.
                                if (dataTypes.type === "http://www.w3.org/2001/XMLSchema#nmtokens") {
                                    let attrValues = contextAttributes[i].nodeValue.trim().split(" ");
                                    // if the value all is specified, it cannot have any other value
                                    if (attrValues.length > 1 && attrValues.includes("all")) {
                                        valueArr.push(contextAttributes[i].nodeValue.split(" "));
                                        attrNameArr.push(attrName);
                                        dataTypeArr.push(dataTypes.values.toString());
                                    } else {
                                        let hash = {};
                                        for (let j = 0; j < attrValues.length; j++) {
                                            // if the individual value is not in the list of allowed values
                                            if (attrValues[j] != "" && !dataTypes.values.includes(attrValues[j])) {
                                                if (!hash.hasOwnProperty(attrName)) {
                                                    hash[attrName] = true;
                                                    attrNameArr.push(attrName);
                                                }
                                                valueArr.push(attrValues[j]);
                                                dataTypeArr.push(dataTypes.values.toString());
                                            }
                                        }
                                    }
                                } else {
                                    valueArr.push(contextAttributes[i].nodeValue.split(" "));
                                    attrNameArr.push(attrName);
                                    dataTypeArr.push(dataTypes.values.toString());
                                }
                            }
                        }
                    } else if (dataTypes && dataTypes.type && dataTypes.type === "http://www.w3.org/2001/XMLSchema#int") {
                        let iVal = parseInt(nodeValue);
                        if (isNaN(iVal) || (""+iVal !== nodeValue)) {
                            valueArr.push(nodeValue);
                            attrNameArr.push(attrName);
                        }
                    } else if (dataTypes && dataTypes.type && dataTypes.type == "http://www.w3.org/2001/XMLSchema#decimal") {
                        let fVal = parseFloat(nodeValue);
                        if (isNaN(fVal)) {
                            valueArr.push(nodeValue);
                            attrNameArr.push(attrName);
                        }
                    } else if (dataTypes && dataTypes.type && (dataTypes.type == "http://www.w3.org/2001/XMLSchema#boolean")) {
                        let tmpV = nodeValue.trim().toLowerCase();
                        if (tmpV !== "true" && tmpV !== "false") {
                            valueArr.push(nodeValue);
                            attrNameArr.push(attrName);
                        }
                    } else if (dataTypes && dataTypes.type && (dataTypes.type == "http://www.w3.org/2001/XMLSchema#string")) {
                    } else {
                        testedPropertyValues--;
                    }
                }
            }
        }
        let retMsg = new Array();
        let passed = attrNameArr.length == 0;
        retMsg.push(valueArr.join(", "));
        retMsg.push(attrNameArr.join(", "));
        retMsg.push(ruleContext.nodeName.toLowerCase());
        // retMsg.push (dataTypeArr.join(", "));
        //return new ValidationResult(passed, [ruleContext], attrNameArr, '', retMsg);
        if (testedPropertyValues == 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", retMsg);
        } else {
            return RulePass("Pass_0");
        }
    }
},
{
    /**
     * Description: Triggers if an WAI-ARIA property id reference is invalid.  For example:
     * 				For a given id, triggers if an element doesn't exists that contains the id.
     * 				Triggers if there are multiple ids when only one is valid.
     * 				Triggers if there is an empty id value.
     *              Triggers if there is only a space in the id value.
     *              Triggers if the ID reference is a hidden element and the aria-* attribute
     *              does not support hidden element reference.
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_ValidIdRef",
    context: "dom:*",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let pass = true;
        let attrNameArr = new Array();
        let nonExistantIDs = new Array();
        let ownerDocument = FragmentUtil.getOwnerFragment(ruleContext);
        let contextAttributes = ruleContext.attributes;
        let idTokens = new Array();
        let testedReferences = 0;

        if (contextAttributes) {
            for (let i = 0, attrLength = contextAttributes.length; i < attrLength; i++) {
                pass = true;
                let attrName = contextAttributes[i].name;
                if (RPTUtil.isDefinedAriaAttribute(ruleContext, attrName)) {
                    let dataTypes = ARIADefinitions.propertyDataTypes[attrName];
                    if (dataTypes && dataTypes.type) {
                        let supportsOneIDRef = (dataTypes.type == "http://www.w3.org/2001/XMLSchema#idref") ? true : false;
                        //If the data type supports one or more id refs do error checking
                        if (supportsOneIDRef || (dataTypes.type == "http://www.w3.org/2001/XMLSchema#idrefs")) {
                            testedReferences++;
                            let nodeValueLength = RPTUtil.normalizeSpacing(contextAttributes[i].nodeValue).length;
                            let idArray = contextAttributes[i].nodeValue.split(" ");

                            // Check for an empty ID Ref
                            if (nodeValueLength < 1) {
                                pass = false;
                                idTokens.push("\"" + contextAttributes[i].nodeValue + "\"");
                            }
                            // check to see if too many IDRefs
                            else if (supportsOneIDRef) {
                                //If has too many IDRefs it is an error
                                if (nodeValueLength >= 1) {
                                    if (idArray.length > 1) {
                                        pass = false;
                                        // Need to capture all the IDRefs for idTokens
                                        for (let z = 0, length = idArray.length; z < length; ++z) {
                                            if (idArray[z] != "") {
                                                idTokens.push(idArray[z]);
                                            }
                                        }
                                    }
                                }
                            }
                            // check to see if id refs are invalid
                            if (pass && nodeValueLength >= 1) {
                                for (let j = 0, length = idArray.length; j < length; ++j) {
                                    if (idArray[j].length > 0) { // it is an empty string if spaces are one after the other
                                        // Get the element by Id
                                        let elementById = ownerDocument.getElementById(idArray[j]);

                                        // Pass if the element exists
                                        pass = elementById != null;

                                        // If the element exists and this is an aria attribute that doesn't support hidden ID reference
                                        // then perform a isNodeVisible check, in the case the node is not visible then we return
                                        // false and true otherwise.
                                        if (pass && !dataTypes.hiddenIDRefSupported) {
                                            pass = RPTUtil.isNodeVisible(elementById);
                                        }

                                        if (!pass) {
                                            if (idArray[j] != "") {
                                                idTokens.push(idArray[j]);
                                            }
                                        }
                                        // Only one of the id references need to be valid to mark the rule as passed.
                                        // Therefore if we find a single visible element then stop checking and mark as
                                        // passed.
                                        else {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!pass) attrNameArr.push(attrName);
                }
            }
        }
        let passed = attrNameArr.length == 0;
        let retToken1 = new Array();
        let retToken2 = new Array();
        let retToken3 = new Array();
        if (!passed) {

            retToken2.push(attrNameArr.join(", "));
            retToken3.push(ruleContext.nodeName.toLowerCase());
            if (idTokens.length > 0) {
                retToken1.push(idTokens.join(", "));
            }
        }

        //return new ValidationResult(passed, [ruleContext], attrNameArr, '', passed == true ? [] : [retToken1, retToken2, retToken3]);
        if (testedReferences == 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString(), retToken3.toString()]);
        } else {
            return RulePass("Pass_0");
        }
    }
},

{
    /**
     * Description: Triggers if a required child role is not found.
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value, g1080
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_RequiredChildren_Native_Host_Sematics",
    context: "dom:*[role]",		// according to Natalie and Charu, this rule only check for explicit role so we can use role instead of checking every element
    dependencies: ["Rpt_Aria_ValidRole"],
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let passed = false;
        let designPatterns = ARIADefinitions.designPatterns;
        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        let doc = ruleContext.ownerDocument;
        let roleNameArr = new Array();
        let requiredChildren = new Array();
        let nodeName = ruleContext.nodeName.toLowerCase();

        // Handle the case where the element is hidden by disabled html5 attribute or aria-disabled:
        //  1. In the case that this element has a disabled attribute and the element supports it, we mark this rule as passed.
        //  2. In the case that this element has a aria-disabled attribute then, we mark this rule as passed.
        // For both of the cases above we do not need to perform any further checks, as the element is disabled in some form or another.
        if (RPTUtil.isNodeDisabled(ruleContext)) {
            return RulePass("Pass_0");
        }

        for (let j = 0, length = roles.length; j < length; ++j) {

            if (roles[j] === "combobox") {
                //  For combobox, we have g1193 ... g1199 to check the values etc.
                //  We don't want to trigger 1152 again. So, we bypass it here.
                passed = true;
                continue;
            }

            if (designPatterns[roles[j]] && designPatterns[roles[j]].reqChildren != null) {
                requiredChildren = designPatterns[roles[j]].reqChildren;
                let roleMissingReqChild = false;
                for (let i = 0, requiredChildrenLength = requiredChildren.length; i < requiredChildrenLength; i++) {
                    passed = RPTUtil.getDescendantWithRoleHidden(ruleContext, requiredChildren[i], true, true) || RPTUtil.getAriaOwnsWithRoleHidden(ruleContext, requiredChildren[i], true);
                    if (!passed) {
                        // See if an html equivalent child meets the requirement (e.g., radiogroup contains html radio buttons)
                        let htmlEquiv = designPatterns[requiredChildren[i]].htmlEquiv;
                        if (htmlEquiv) {
                            let nw = new NodeWalker(ruleContext);
                            while (!passed && nw.nextNode() && nw.node != ruleContext) {
                                // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                                // or not.
                                //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                                //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                                //     add it to the roleToElems hash at all or even do any checking for it at all.
                                //
                                // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                                //       so on and so forth.
                                if (RPTUtil.shouldNodeBeSkippedHidden(nw.node)) {
                                    continue;
                                }

                                //Check if the element has explicit role specified. If so, honor the role
                                if (!RPTUtil.hasAnyRole(nw.node, false)) {
                                    passed = RPTUtil.isHtmlEquiv(nw.node, htmlEquiv);
                                }
                            }
                            if (passed) break; // break incrementing over required children. At least one required child was found.
                        }
                    } else break; // break incrementing over required children. At least one required child was found.
                }
            } else passed = true; // No required children for this role
            if (!passed) {
                roleNameArr.push(roles[j]);
            }
        }
        let retToken = new Array();
        retToken.push(roleNameArr.join(", "));
        retToken.push(requiredChildren.join(", "));
        return passed ? RulePass("Pass_0") : RulePotential("Potential_1", retToken);
    }
},
{
    /**
     * Description: Triggers if there is a valid role and the role is required to have a container but the container is missing.
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     *
     *TODO: Does this rule need to check for html equivalents like the Rpt_Aria_RequiredChildren rule does?
     * For now, don't check html equivalents until there are use cases found that will benefit from this check.
     *
     * The Xpath "contains" function is used because there could be multiple roles specified. Also, a search for menu where 
     * role="navigation menubar" will return a node.  So all parent roles must be tokenized and searched.
     */
    id: "Rpt_Aria_RequiredParent_Native_Host_Sematics",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    run: (context: RuleContext, options?: {}, hierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = true;
        let doc = ruleContext.ownerDocument;
        let designPatterns = ARIADefinitions.designPatterns;
        let roleNameArr = new Array();
        let containerRoles = new Array();
        let testedContainer = 0;

        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        let parentRoles = hierarchies["aria"].map(info => info.role);

        for (let j = 0, length = roles.length; j < length; ++j) {
            if (designPatterns[roles[j]] && designPatterns[roles[j]].container != null) {
                testedContainer++;
                passed = false;
                containerRoles = designPatterns[roles[j]].container;
                for (let i = 0, containersLength = containerRoles.length; !passed && i < containersLength; i++) {
                    passed = parentRoles.includes(containerRoles[i]);
                    if (passed) break;
                }
                if (passed == false) {
                    roleNameArr.push(roles[j]);
                }
            }
        }
        let retToken1 = new Array();
        retToken1.push(roleNameArr.join(", "));
        let retToken2 = new Array();
        retToken2.push(containerRoles.join(", "));
        //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [retToken1, retToken2]);
        if (testedContainer == 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
        } else {
            return RulePass("Pass_0");
        }
    }
},
{
    /**
     * Description: Triggers if content is not enclosed in a landmark role
     * Origin: CI162 Web checklist checkpoint 2.4a
     */
    id: "Rpt_Aria_OrphanedContent_Native_Host_Sematics",
    context: "dom:*",
    run: (context: RuleContext, options?: {}, hierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        let params = RPTUtil.getCache(context.dom.node.ownerDocument, "Rpt_Aria_OrphanedContent_Native_Host_Sematics", null);
        if (!params) {
            params = {
                landmarks: {
                    value: ["banner", "complementary", "contentinfo", "form", "main", "navigation", "region", "search"],
                    type: "array"
                },
                possibleOrphanedWidgets: {
                    value: ["button", "combobox", "checkbox", "grid", "heading", "link", "list",
                        "listbox", "menu", "menubar", "progressbar", "radio", "tablist", "textbox", "toolbar", "tree",
                        "treegrid"
                    ],
                    type: "array"
                },
                possibleOrphanedElements: {
                    value: ["p", "table", "input", "textarea", "select", "button", "a", "ol", "ul", "dl", "h1", "h2", "h3", "h4", "h5",
                        "h6", "embed", "object", "area"
                    ],
                    type: "array"
                },
                noLandmarkedRoles: {
                    // These roles don't require landmarks
                    value: ["alert", "alertdialog", "dialog", "tooltip"],
                    type: "array"
                },
                mapLandmarks: {},
                mapPossibleOrphanedWidgets: {},
                mapPossibleOrphanedElements: {},
                mapNoLandmarkedRoles: {}
            }
                    // Convert arrays to maps
            params.mapLandmarks = {};
            for (let i = 0; i < params.landmarks.value.length; ++i) {
                params.mapLandmarks[params.landmarks.value[i]] = true;
            }

            params.mapPossibleOrphanedWidgets = {}
            for (let i = 0; i < params.possibleOrphanedWidgets.value.length; ++i) {
                params.mapPossibleOrphanedWidgets[params.possibleOrphanedWidgets.value[i]] = true;
            }

            params.mapPossibleOrphanedElements = {}
            for (let i = 0; i < params.possibleOrphanedElements.value.length; ++i) {
                params.mapPossibleOrphanedElements[params.possibleOrphanedElements.value[i]] = true;
            }

            params.mapNoLandmarkedRoles = {}
            for (let i = 0; i < params.noLandmarkedRoles.value.length; ++i) {
                params.mapNoLandmarkedRoles[params.noLandmarkedRoles.value[i]] = true;
            }

            RPTUtil.setCache(context.dom.node.ownerDocument, "Rpt_Aria_OrphanedContent_Native_Host_Sematics", params);
        }
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (!RPTUtil.isNodeVisible(ruleContext) ||  // avoid diagnosing g1157 for non-visible nodes
            (RPTUtil.hiddenByDefaultElements != null &&
                RPTUtil.hiddenByDefaultElements != undefined &&
                RPTUtil.hiddenByDefaultElements.indexOf(nodeName) > -1)) {
            return RulePass("Pass_0");
        }

        let elemsWithoutContent = ["area", "input", "embed", "button", "textarea", "select"];
        if (!RPTUtil.hasInnerContentHidden(ruleContext) && //only trigger the rule on elements that have content
            elemsWithoutContent.indexOf(nodeName) === -1) { // a few elems wihout content should not be skipped
                return RulePass("Pass_0");
        }

        // Short circuit for layout tables
        if (nodeName == "table" && RPTUtil.isLayoutTable(ruleContext)) {
            return null;
        }

        // Check if it is a possible orphan
        let passed = true;
        let isPossibleOrphanedWidget = RPTUtil.hasRole(ruleContext, params.mapPossibleOrphanedWidgets, true);
        //exclude <link rel="stylesheet" href="xyz.css"> in the <head> and <body>(#608)
        //having link in the head could cause lot of violaions                    
        if (nodeName === 'link') {
            isPossibleOrphanedWidget = false;
        }

        let isPossibleOrphanedElement = nodeName in params.mapPossibleOrphanedElements;
        if (isPossibleOrphanedWidget || isPossibleOrphanedElement) {
            // See if ancestor has landmark roles or implicit land mark roles
            let parentRoles = hierarchies["aria"].map(info => info.role);
            passed = parentRoles.filter(role => role in params.mapLandmarks).length > 0
            if (!passed) {
                // Don't fail elements when a parent or sibling has failed - causes too many messages.
                let walkElement = DOMUtil.parentElement(ruleContext);
                while (!passed && walkElement != null) {
                    passed = RPTUtil.getCache(walkElement, "Rpt_Aria_OrphanedContent", false);
                    walkElement = DOMUtil.parentElement(walkElement);
                }
                walkElement = ruleContext.nextElementSibling;
                while (!passed && walkElement != null) {
                    passed = RPTUtil.getCache(walkElement, "Rpt_Aria_OrphanedContent", false);
                    walkElement = walkElement.nextElementSibling;
                }
                walkElement = ruleContext.previousElementSibling;
                while (!passed && walkElement != null) {
                    passed = RPTUtil.getCache(walkElement, "Rpt_Aria_OrphanedContent", false);
                    walkElement = walkElement.previousElementSibling;
                }
                if (!passed) {
                    RPTUtil.setCache(ruleContext, "Rpt_Aria_OrphanedContent", true);

                    // Don't trigger rule if element is a stand-alone widget
                    passed = RPTUtil.getCache(ruleContext, "Rpt_Aria_OrphanedContent_NoTrigger", false) ||
                        RPTUtil.hasRole(ruleContext, params.mapNoLandmarkedRoles, true) ||
                        RPTUtil.getAncestorWithRole(ruleContext, params.mapNoLandmarkedRoles, true);

                    if (passed) {
                        RPTUtil.setCache(ruleContext, "Rpt_Aria_OrphanedContent_NoTrigger", true);
                        return null;
                    }
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }

        //return new ValidationResult(passed, [ruleContext], '', '', []);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
},
//--------
// Keyboard Accessible
// --------
{
    /**
     * Description: Triggers if an element contains an aria-activedescendant and does not contain a tabindex attribue with a value greater than or equal to zero.
     *              Do not trigger if the element has disabled (if supported on element), or the element has aria-disabled set to true.
     * Origin:  WCAG 2.0 guideline 2.1.1 Keyboard, g1084
     * 			CI162 Web checklist checkpoint 2.1a
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_InvalidTabindexForActivedescendant",
    context: "dom:*[aria-activedescendant]",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = false;
        let nodeName = ruleContext.nodeName.toLowerCase();

        // Rule not supported on mobile
        if (ruleContext.hasAttribute("class") && ruleContext.getAttribute("class").substring(0, 3) == "mbl") {
            return null;
        }

        // Handle the case where the element is hidden by disabled html5 attribute or aria-disabled:
        //  1. In the case that this element has a disabled attribute and the element supports it, we mark this rule as passed.
        //  2. In the case that this element has a aria-disabled attribute then, we mark this rule as passed.
        // For both of the cases above we do not need to perform any further checks, as the element is disabled in some form or another.
        if (RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }

        // If the tabindex attribute is provided then verify that it is 0 or -1
        passed = RPTUtil.isTabbable(ruleContext) || RPTUtil.tabIndexLEZero(ruleContext);

        // Build array for node token
        let retToken1 = new Array();
        retToken1.push(nodeName);

        // Build array for id referenced by aria-activedescendant
        let retToken2 = new Array();
        retToken2.push(ruleContext.getAttribute("aria-activedescendant").split(" ").join(", "));

        //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [retToken1, retToken2]);
        if (!passed) {
            return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
        } else {
            return RulePass("Pass_0");
        }
    }
},
{
    /**
     * Description: Triggers if a non-form or non-anchor element has an event handler but is missing a role attribute.
     * Origin:  WCAG 2.0 guideline 4.1.2 Name, Role, Value
     * 			CI162 Web checklist checkpoint 4.1b
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics",
    context: "dom:*[onclick],dom:*[onblur], dom:*[ondblclick], dom:*[onfocus], dom:*[onkeydown]," +
        "dom:*[onkeypress], dom:*[onkeyup], dom:*[onmousedown], dom:*[onmouseup], dom:*[onmousemove], " +
        "dom:*[onmouseout], dom:*[onmouseover], dom:*[onresize], dom:*[onchange]",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // Don't trigger this for SVG element for now until a determination is made (by Rich)
        // to support SVG at a point when the SVG a11y spec is ready.
        if (RPTUtil.getAncestor(ruleContext, "svg")) {
            return null;
        }

        //this rule is passed if a element has attribut role 
        //also, passed of element has ny implicit roles. 
        if (RPTUtil.hasAnyRole(ruleContext, true)) {
            return RulePass("Pass_0");
        }

        //pass if this element is received focus by default
        if (RPTUtil.isfocusableByDefault(ruleContext)) {
            return RulePass("Pass_0");
        }

        //validate if this element has any of the given event handler's
        let retToken1 = new Array();
        retToken1.push(ruleContext.nodeName.toLowerCase());
        let eventArr = new Array();
        // From WCAG20_Script_UseW3CDomFunctions
        //let events = ["onblur", "onfocus", "onchange", "onclick", "oncontextmenu", "ondblclick", "onkeydown",
        //              "onkeypress", "onkeyup", "onload", "onmousedown", "onmouseup", "onmousemove", "onmouseout",
        //              "onmouseover", "onmousewheel", "onreset", "onpaste", "onresize", "onscroll",
        //              "onselect", "onsubmit", "onactivate", "ondeactivate", "onmouseenter", "onmouseleave"];
        let events = ["onblur", "onfocus", "onchange", "onclick", "ondblclick", "onkeydown",
            "onkeypress", "onkeyup", "onmousedown", "onmouseup", "onmousemove", "onmouseout",
            "onmouseover", "onresize"
        ];
        for (let i = 0; i < events.length; ++i) {
            if (ruleContext.hasAttribute(events[i]))
                eventArr.push(events[i]);
        }
        let retToken2 = new Array();
        retToken2.push(eventArr.join(", "));
        //return new ValidationResult(false, [ruleContext], '', '', [retToken1, retToken2]);
        return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
    }
},
{
    /**
     * Description: Look for container elements without an 'aria-activedescendant' that have required children.  At least one child must be focusable.
     * Note: Required children won't have multiple roles specified in the role attribute, but this assumption may not be correct.
     * Origin:  WCAG 2.0 guideline 2.1.1 Keyboard, g1086
     * 			CI162 Web checklist checkpoint 2.1a
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_MissingFocusableChild",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        // An ARIA list is not interactive
        if (RPTUtil.hasRole(ruleContext, { "list": true, "row": true, "rowgroup": true, "table": true })) {
            return null;
        }

        // Not a valid message for mobile because all elements are focusable in iOS when VoiceOver is enabled.
        if (ruleContext.hasAttribute("class") && ruleContext.getAttribute("class").substring(0, 3) == "mbl") {
            return null;
        }

        // Handle the case where the element is hidden by disabled html5 attribute or aria-disabled:
        //  1. In the case that this element has a disabled attribute and the element supports it, we mark this rule as passed.
        //  2. In the case that this element has a aria-disabled attribute then, we mark this rule as passed.
        // For both of the cases above we do not need to perform any further checks, as the element is disabled in some form or another.
        if (RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }

        // Determine if this is referenced by a combobox. If so, focus is controlled by the combobox
        let id = ruleContext.getAttribute("id");
        if (id && id.trim().length > 0) {
            if (ruleContext.ownerDocument.querySelector(`*[aria-controls='${id}'][role='combobox']`)) {
                return null;
            }
        }        

        let passed = true;
        let doc = ruleContext.ownerDocument;
        let hasAttribute = RPTUtil.hasAttribute;
        let roleNameArr = new Array();
        let nodeName = "";
        let inScope = false;

        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        for (let j = 0; j < roles.length; ++j) {
            if (ARIADefinitions.containers.includes(roles[j])) {
                let disabled = hasAttribute(ruleContext, 'aria-disabled') ? ruleContext.getAttribute("aria-disabled") : '';
                if (disabled != 'true' && !hasAttribute(ruleContext, 'aria-activedescendant') && !RPTUtil.isTabbable(ruleContext)) {
                    let reqChildren = ARIADefinitions.designPatterns[roles[j]].reqChildren;
                    if (reqChildren) {
                        inScope = true;
                        passed = false;
                        let xp = "descendant::*[";
                        for (let i = 0; i < reqChildren.length; i++) {
                            xp += "@role='" + reqChildren[i] + "' or ";
                        }
                        xp = xp.substring(0, xp.length - 4) + ']';
                        let xpathResult = doc.evaluate(xp, ruleContext, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                        let r: Element = xpathResult.iterateNext() as Element;
                        while (r && !passed) {
                            // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                            // or not.
                            //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                            //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                            //     add it to the roleToElems hash at all or even do any checking for it at all.
                            //
                            // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                            //       so on and so forth.
                            if (RPTUtil.shouldNodeBeSkippedHidden(r)) {
                                r = xpathResult.iterateNext() as Element;
                                continue;
                            }

                            passed = RPTUtil.tabIndexLEZero(r);
                            if (!passed) passed = RPTUtil.isfocusableByDefault(r);

                            // Required child is not focusable via tabindex.  See if there is a grandchild that is focusable by default or by tabindex.
                            if (!passed) {
                                let xp2 = "descendant::*";
                                let xpathResult2 = doc.evaluate(xp2, r, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                                let r2 = xpathResult2.iterateNext();
                                while (r2 && !passed) {
                                    // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                                    // or not.
                                    //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                                    //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                                    //     add it to the roleToElems hash at all or even do any checking for it at all.
                                    //
                                    // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                                    //       so on and so forth.
                                    if (RPTUtil.shouldNodeBeSkippedHidden(r2)) {
                                        r2 = xpathResult2.iterateNext();
                                        continue;
                                    }
                                    passed = RPTUtil.tabIndexLEZero(r2);
                                    if (!passed) passed = RPTUtil.isfocusableByDefault(r2);
                                    r2 = xpathResult2.iterateNext();
                                }
                            }

                            if (!passed) {
                                roleNameArr = r.getAttribute("role").trim().split(" ");
                                nodeName = r.nodeName.toLowerCase();
                            }
                            r = xpathResult.iterateNext() as Element;
                        }
                    }
                }
            }
        }

        // Variable Decleration
        let retToken1 = new Array();
        let retToken2 = new Array();

        // In the case the arrays/strings are empty, that means that there is no violation so we can reset it back to passed, the reason for this
        // is that we are setting passed=false while we perform a loop which causes violation to trigger even if there is no issues. Instead of
        // updating the whole rule to switch from using passed in that way simply do the check at this point.
        if (nodeName.length > 0 && roleNameArr.length > 0) {
            retToken1.push(nodeName);
            retToken2.push(roleNameArr.join(", "));
        } else {
            passed = true;
        }

        //return new ValidationResult(passed, [ruleContext], 'role', '', passed == true ? [] : [retToken1, retToken2]);
        if (!inScope) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
        } else {
            return RulePass("Pass_0");
        }
    }
},
{
    /**
     * Description: Find elements without aria-activedescendant that have roles with required children. 
     * Either the children or the parent must have keyboard event handlers.
     * Note: Required children won't have multiple roles specified in the role attribute, but this assumption may not be correct.
     * Origin:  WCAG 2.0 guideline 2.1.1 Keyboard, g1087
     * 			CI162 Web checklist checkpoint 2.1a
     *			Open Ajax Alliance Accessibility Working Group ruleset
     */
    id: "Rpt_Aria_MissingKeyboardHandler",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let passed = true;
        let savedPassed = passed;
        let doc = ruleContext.ownerDocument;
        let designPatterns = ARIADefinitions.designPatterns;
        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        let hasAttribute = RPTUtil.hasAttribute;
        // Composite user interface widget roles. They act as containers that manage other, contained widgets.
        let roleContainers = ["combobox", "grid", "listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"];
        let roleNameArr = new Array();

        for (let j = 0; j < roles.length; ++j) {
            let pattern = designPatterns[roles[j]];
            if (roleContainers.indexOf(roles[j]) >= 0) {
                let disabled = hasAttribute(ruleContext, 'aria-disabled') ? ruleContext.getAttribute("aria-disabled") : '';
                if (!disabled) {

                    // See if there is a keyboard event handler on the parent element.
                    passed = (ruleContext.hasAttribute("onkeydown") || ruleContext.hasAttribute("onkeypress"));

                    // No keyboard event handler found on parent.  See if keyboard event handlers are on required child elements.
                    if (!passed) {
                        if (!hasAttribute(ruleContext, 'aria-activedescendant')) {
                            let reqChildren = ARIADefinitions.designPatterns[roles[j]].reqChildren;
                            if (reqChildren) { /* SMF TODO menubar does not have any reqChildren */
                                for (let i = 0, requiredChildrenLength = reqChildren.length; i < requiredChildrenLength; i++) {
                                    let xp = "*[contains(@role,'" + reqChildren[i] + "')]";
                                    let xpathResult = doc.evaluate(xp, ruleContext, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                                    let r = xpathResult.iterateNext() as Element;
                                    while (r) {

                                        passed = (r.hasAttribute("onkeydown") || r.hasAttribute("onkeypress"));
                                        if (!passed) {

                                            // Child did not have a key handler.  See if any of the grandchildren do.
                                            let xp2 = "descendant::*";
                                            let xpathResult2 = doc.evaluate(xp2, r, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                                            let r2: Element = xpathResult2.iterateNext() as Element;
                                            while (r2 && !passed) {
                                                // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                                                // or not.
                                                //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                                                //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                                                //     add it to the roleToElems hash at all or even do any checking for it at all.
                                                //
                                                // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                                                //       so on and so forth.
                                                if (RPTUtil.shouldNodeBeSkippedHidden(r2)) {
                                                    r2 = xpathResult2.iterateNext() as Element;
                                                    continue;
                                                }

                                                passed = RPTUtil.tabIndexLEZero(r2) &&
                                                    (r2.hasAttribute("onkeydown") || r2.hasAttribute("onkeypress"));

                                                if (!passed) {

                                                    // No tabindex focusable element found with a key handler.  See if an element focusable by default has a handler.
                                                    if (RPTUtil.isfocusableByDefault(r2)) {
                                                        passed = (r2.hasAttribute("onkeydown") || r2.hasAttribute("onkeypress"));

                                                        // Is this an action link?
                                                        if (r2.nodeName.toLowerCase() == "a" && r2.hasAttribute("href")) {
                                                            let href = r2.getAttribute("href");

                                                            // Action link must start with "javascript:", must not contain a "void" and
                                                            // must have a function name following "javascript:" (i.e., href.length > 11)
                                                            passed = (href.startsWith("javascript:") && href.indexOf("void") == -1 && href.length > 11);
                                                        }
                                                    }
                                                }
                                                r2 = xpathResult2.iterateNext() as Element;
                                            }
                                        }
                                        if (!passed) {
                                            // All the required children (or any descendants of the required children) must have keypress/keydown
                                            // If not, it is a failure, no need to keep checking any more.
                                            break;
                                        }
                                        r = xpathResult.iterateNext() as Element;
                                    }
                                }
                            } else {
                                // The current element failed the keydown/keypress, and it does not have required children, such as menubar.
                                // Let's check its descendants.
                                let xp2 = "descendant::*";
                                let xpathResult2 = doc.evaluate(xp2, ruleContext, RPTUtil.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
                                let r2 = xpathResult2.iterateNext() as Element;
                                while (r2 && !passed) {
                                    // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                                    // or not.
                                    //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                                    //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                                    //     add it to the roleToElems hash at all or even do any checking for it at all.
                                    //
                                    // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                                    //       so on and so forth.
                                    if (RPTUtil.shouldNodeBeSkippedHidden(r2)) {
                                        r2 = xpathResult2.iterateNext() as Element;
                                        continue;
                                    }

                                    passed = RPTUtil.tabIndexLEZero(r2) &&
                                        (r2.hasAttribute("onkeydown") || r2.hasAttribute("onkeypress"));

                                    if (!passed) {

                                        // No tabindex focusable element found with a key handler.  See if an element focusable by default has a handler.
                                        if (RPTUtil.isfocusableByDefault(r2)) {
                                            passed = (r2.hasAttribute("onkeydown") || r2.hasAttribute("onkeypress"));

                                            // Is this an action link?
                                            if (r2.nodeName.toLowerCase() == "a" && r2.hasAttribute("href")) {
                                                let href = r2.getAttribute("href");

                                                // Action link must start with "javascript:", must not contain a "void" and
                                                // must have a function name following "javascript:" (i.e., href.length > 11)
                                                passed = (href.startsWith("javascript:") && href.indexOf("void") == -1 && href.length > 11);
                                            }
                                        }
                                    }
                                    r2 = xpathResult2.iterateNext() as Element;
                                }
                            }
                        } else {
                            // Attribute 'aria-activedescendant' is specified.
                            passed = true;
                        }
                    }
                }
            }
            if (!passed) {
                roleNameArr.push(roles[j]);
            }
            if (!passed && savedPassed) {
                savedPassed = passed;
            }
        }

        let retToken1 = new Array();
        retToken1.push(ruleContext.nodeName.toLowerCase());
        let retToken2 = new Array();
        retToken2.push(roleNameArr.join(", "));

        // Determine if this is referenced by a combobox. If so, leave it to the combobox rules to check
        let id = ruleContext.getAttribute("id");
        if (id && id.trim().length > 0) {
            if (ruleContext.ownerDocument.querySelector(`*[aria-controls='${id}'][role='combobox']`)) {
                return null;
            }
        }
        return savedPassed ? RulePass("Pass_0") : RulePotential("Potential_1", [retToken1.toString(), retToken2.toString()]);
    }
},
{
    /**
     * Description: Triggers if both HTML 5 attribute and the associated WAI-ARIA attribute are in an element
     * Origin:  HTML 5 - per Richard Schwerdtfeger's requirements. g1141
     */
    id: "HAAC_Aria_Or_HTML5_Attr",
    context: "dom:*[aria-required], dom:*[aria-autocomplete], dom:*[aria-readonly], dom:*[aria-disabled], dom:*[aria-placeholder]",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let passed = true;
        if (ruleContext.hasAttribute("required") && ruleContext.hasAttribute("aria-required") &&
            ruleContext.getAttribute("aria-required").trim().toLowerCase() == "false") {
            passed = false;
        }
        if (passed && ruleContext.hasAttribute("placeholder") && ruleContext.hasAttribute("aria-placeholder")) {
            passed = false;
        }
        if (passed && ruleContext.hasAttribute("aria-autocomplete")) {
            let ariaAutoCompleteAttr = ruleContext.getAttribute("aria-autocomplete").trim().toLowerCase();
            let myNode = ruleContext;
            let html5AutoCompleteAttr = null;

            // There is no need to do a consideration for hidden in this node walk if the ruleContext node is hidden then
            // this rule will not trigger as hidden takes inheritance from the parent nodes that this is walking up to.
            // In the case that we ever need to consider hidden for this case need to add if (RPTUtil.shouldNodeBeSkippedHidden(myNode)
            // and continue to the next node.
            while ((myNode != null) && (myNode.nodeName.toLowerCase() != 'html') && (!(myNode.hasAttribute("autocomplete")))) {
                myNode = DOMUtil.parentElement(myNode);
            }

            if ((myNode != null) && (myNode.hasAttribute("autocomplete"))) {
                html5AutoCompleteAttr = myNode.getAttribute("autocomplete").trim().toLowerCase();
            }

            // if HTML5 autocomplete attribute is specified and conflicting with aria tag
            if ((html5AutoCompleteAttr != null) &&
                (html5AutoCompleteAttr == "on" &&
                    ariaAutoCompleteAttr == "none")) {
                passed = false;
            }
        }
        if (passed && ruleContext.hasAttribute("readonly") && ruleContext.hasAttribute("aria-readonly") &&
            ruleContext.getAttribute("aria-readonly").trim().toLowerCase() == "false") {
            passed = false;
        }
        if (passed && ruleContext.hasAttribute("aria-disabled")) {
            // && ruleContext.getAttribute("aria-disabled").trim().toLowerCase() == "false"){
            let ariaDisabledAttr = ruleContext.getAttribute("aria-disabled").trim().toLowerCase();
            let myNode = ruleContext;
            let html5DisabledAttr: boolean | string = myNode.hasAttribute("disabled");

            // There is no need to do a consideration for hidden in this node walk if the ruleContext node is hidden then
            // this rule will not trigger as hidden takes inheritance from the parent nodes that this is walking up to.
            // In the case that we ever need to consider hidden for this case need to add if (RPTUtil.shouldNodeBeSkippedHidden(myNode)
            // and continue to the next node.
            while ((myNode != null) && (myNode.nodeName.toLowerCase() != 'html') && (!(myNode.hasAttribute("disabled")))) {
                myNode = DOMUtil.parentElement(myNode);
            }

            if ((myNode != null) && (myNode.hasAttribute("disabled"))) {
                html5DisabledAttr = myNode.getAttribute("disabled");
            }

            // if HTML5 disabled attribute is specified and conflicting with aria tag
            // Note RPT WebApp has a bug that inject disabled or DISABLED as the attribute value.
            if (((html5DisabledAttr == true || html5DisabledAttr == "" || html5DisabledAttr == "DISABLED" || html5DisabledAttr == "disabled") && myNode.nodeName.toLowerCase() != 'html') &&
                (ariaDisabledAttr == "false")) {
                passed = false;
            }
        }

        //return new ValidationResult(passed, [ruleContext], '', '', []);
        if (passed) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1");
        }
    }
},
{
    /**
     * Description: Triggers if role conflict with ARIA implicitSemantics restrictions
     * 
     * Note: Rpt_Aria_ValidRole checks if the role specified is defined by ARIA. This determines
     * if that role is valid given the context.
     * Native host semantics 1146
     */
    id: "aria_semantics_role",
    context: "dom:*", // checks for all elements, since role might not be specified but the attributes need to be checked.
    dependencies: ["Rpt_Aria_ValidProperty"],  //we can't use Rpt_Aria_ValidRole to validate the roles because the context is different
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let domRoles : string[] = [];
        if (ruleContext.getAttribute("role") !== null) {
            domRoles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/); // separated by one or more white spaces
        }
        let tagName = ruleContext.tagName.toLowerCase();
        // Roles allowed on this node
        let allowedRoles = [];

        // Failing roles
        let failRoleTokens = [];
        // Passing roles
        let passRoleTokens = [];

        let tagProperty = RPTUtil.getElementAriaProperty(ruleContext);
        allowedRoles = RPTUtil.getAllowedAriaRoles(ruleContext, tagProperty);


        // Testing restrictions for each role and adding the corresponding attributes to the allowed attribute list
        for (let i = 0; i < domRoles.length; i++) {
            if (allowedRoles.length === 0) {
                if (!failRoleTokens.includes(domRoles[i])) {
                    failRoleTokens.push(domRoles[i]);
                }
            } else if (!allowedRoles.includes("any")) { // any role is valid so no checking here. the validity of the aria role is checked by Rpt_Aria_ValidRole
                if (!allowedRoles.includes(domRoles[i])) {
                    if (!failRoleTokens.includes(domRoles[i])) {
                        failRoleTokens.push(domRoles[i]);
                    }
                } else if (!passRoleTokens.includes(domRoles[i])) {
                    passRoleTokens.push(domRoles[i])
                }
            } else if (allowedRoles.includes("any")) {
                if (passRoleTokens.indexOf(domRoles[i]) === -1) {
                    passRoleTokens.push(domRoles[i]);
                }
            }
        } // for loop
        if (failRoleTokens.includes("presentation") || failRoleTokens.includes("none") && RPTUtil.isTabbable(ruleContext)) {
            return RuleFail("Fail_2", [failRoleTokens.join(", "), tagName]);
        } else if (failRoleTokens.length > 0) {
            RPTUtil.setCache(ruleContext, "aria_semantics_role", "Fail_1");
            return RuleFail("Fail_1", [failRoleTokens.join(", "), tagName]);
        } else if (passRoleTokens.length > 0) {
            return RulePass("Pass_0", [passRoleTokens.join(", "), tagName]);
        } else {
            return null;
        }

        // below for listing all allowed role and attributes.  We can delete it if we are not using it next year (2018) #283
        //      return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [roleOrAttributeTokens, tagName, allowedRoleOrAttributeTokens]);
    }
},
{
    /**
     * Description: Triggers if role conflict with ARIA implicitSemantics restrictions
     * 
     * Note: Rpt_Aria_ValidRole checks if the role specified is defined by ARIA. This determines
     * if that role is valid given the context.
     * Native host semantics 1146
     */
    id: "aria_semantics_attribute",
    context: "dom:*", // checks for all elements, since role might not be specified but the attributes need to be checked.
    dependencies: [],  //we can't use Rpt_Aria_ValidRole to validate the roles because the context is different
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
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
},
{
    /**
     * Description: Triggers if ARIA error message is hidden or doesn't exist 
     * 				when aria-invalid is true.
     * Origin:  IBM Web checklist checkpoint 3.3.1
     *
     */
    id: "HAAC_Aria_ErrorMessage",
    context: "dom:*[aria-invalid=true]",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let aria_errMsgId = RPTUtil.getAriaAttribute(ruleContext, "aria-errormessage");

        // If aria-errormessage is not provided, then OUT_OF_SCOPE
        if (!aria_errMsgId) {
            return null;
        }

        let msg_ele = FragmentUtil.getById(ruleContext, aria_errMsgId);

        // POF0: Invalid id reference
        if (!msg_ele) {
            return RuleFail("Fail_1");
        }

        // POF1: Referenced element is not visible
        if (!RPTUtil.isNodeVisible(msg_ele)) {
            return RuleFail("Fail_2");
        }

        return RulePass("Pass_0");
    }
}

    //next rule
]
export { a11yRulesAria }