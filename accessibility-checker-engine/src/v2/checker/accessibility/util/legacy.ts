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

import { getCache, setCache } from "../../../../v4/util/CacheUtil";
import { ARIADefinitions, IDocumentConformanceRequirement } from "../../../aria/ARIADefinitions";
import { ARIAMapper } from "../../../aria/ARIAMapper";
import { DOMWalker } from "../../../dom/DOMWalker";
import { VisUtil } from "../../../dom/VisUtil";
import { FragmentUtil } from "./fragment";
import { getDefinedStyles, getComputedStyle } from "../../../../v4/util/CSSUtil";
import { DOMUtil } from "../../../dom/DOMUtil";
import { DOMMapper } from "../../../dom/DOMMapper";

export class RPTUtil {


    // This list contains a list of elements tags which have display: none by default, since we have rules triggering
    public static navLinkKeywords = ['start', 'next', 'prev', 'previous', 'contents', 'index']

    // This list contains a list of rule ids for the rules that have to check for hidden content regardless of the Check Hidden
    // Content Setting. This means that when the engine is actually determine which elements to mass to the rules, it will always
    // pass theses rules no matter what the Check Hidden Content Setting is.
    public static rulesThatHaveToCheckHidden = ['RPT_Elem_UniqueId']

    public static isDefinedAriaAttributeAtIndex(ele, index) {
        let attrName = ele.attributes[index].name;
        return RPTUtil.isDefinedAriaAttribute(ele, attrName);
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
                    ariaAttributes.push({name: attrName, value: attrValue});
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
                    htmlAttributes.push({name: attrName, value: attrValue});
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
            if (attributeName in RPTUtil.ariaAttributeImplicitMappings) {
                if (tag in RPTUtil.ariaAttributeImplicitMappings[attributeName]) {
                    retVal = RPTUtil.ariaAttributeImplicitMappings[attributeName][tag];
                    if (typeof (retVal) === "function") {
                        retVal = retVal(ele);
                    }
                } else if ("*" in RPTUtil.ariaAttributeImplicitMappings[attributeName]) {
                    retVal = RPTUtil.ariaAttributeImplicitMappings[attributeName]["*"];
                    if (typeof (retVal) === "function") {
                        retVal = retVal(ele);
                    }
                }
            }
        }

        // Check role-based defaults
        if (!retVal) {
            let role = ARIAMapper.nodeToRole(ele);
            if (role in RPTUtil.ariaAttributeRoleDefaults && attributeName in RPTUtil.ariaAttributeRoleDefaults[role]) {
                retVal = RPTUtil.ariaAttributeRoleDefaults[role][attributeName];
                if (typeof (retVal) === "function") {
                    retVal = retVal(ele);
                }
            }
        }

        // Still not defined? Check global defaults
        if (!retVal && attributeName in RPTUtil.ariaAttributeGlobalDefaults) {
            retVal = RPTUtil.ariaAttributeGlobalDefaults[attributeName];
        }
        return retVal;
    }

    public static tabTagMap = {
        "button": function (element): boolean {
            return !element.hasAttribute("disabled");
        },
        "iframe": true,
        "input": function (element): boolean {
            return element.getAttribute("type") !== "hidden" && !element.hasAttribute("disabled");
        },
        "select": function (element): boolean {
            return !element.hasAttribute("disabled");
        },
        "textarea": true,
        "div": function (element) {
            return element.hasAttribute("contenteditable");
        },
        "a": function (element) {
            // xlink:href?? see svg
            return element.hasAttribute("href");
        },
        "area": function (element) {
            return element.hasAttribute("href");
        },
        "audio": function (element) {
            return element.hasAttribute("controls");
        },
        "video": function (element) {
            return element.hasAttribute("controls");
        },
        "summary": function (element) {
            // first summary child of a details element is automatically focusable 
            return element.parentElement && element.parentElement.nodeName.toLowerCase() === 'details' 
                   && DOMUtil.sameNode([...element.parentElement.children].filter(elem=>elem.nodeName.toLowerCase() === 'summary')[0], element);
        },
        "details": function (element) {
            //details element without a direct summary child is automatically focusable
            return element.children && [...element.children].filter(elem=>elem.nodeName.toLowerCase() === 'summary').length === 0;
        }
    }

    public static wordCount(str) : number {
        str = str.trim();
        if (str.length === 0) return 0;
        return str.split(/\s+/g).length;
    }

    /**
     * Note that this only detects if the element itself is in the tab order.
     * However, this element may delegate focus to another element via aria-activedescendant.
     * Also, focus varies by browser... sticking to things that are focusable on Chrome and Firefox.
     */
    public static isTabbable(element) {
        // Using https://allyjs.io/data-tables/focusable.html
        // Handle the explicit cases first
        if (!VisUtil.isNodeVisible(element)) return false;
        if (element.hasAttribute("tabindex")) {
            return parseInt(element.getAttribute("tabindex")) >= 0;
        }
        // Explicit cases handled - now the implicit
        let nodeName = element.nodeName.toLowerCase();
        if (nodeName in RPTUtil.tabTagMap) {
            let retVal = RPTUtil.tabTagMap[nodeName];
            if (typeof (retVal) === "function") {
                retVal = retVal(element);
            }
            return retVal;
        } else {
            return false;
        }
    }

    /**
     * a target is en element that accept a pointer action (click or touch)
     * 
     */
    public static isTarget(element) {
        if (!element) return false;
        
        if (element.hasAttribute("tabindex") || RPTUtil.isTabbable(element)) return true;
        
        const roles = RPTUtil.getRoles(element, true); 
        if (!roles && roles.length === 0)
            return false;

        let tagProperty = RPTUtil.getElementAriaProperty(element);
        let allowedRoles = RPTUtil.getAllowedAriaRoles(element, tagProperty);
        if (!allowedRoles || allowedRoles.length === 0)
            return false;
    
        let parent = element.parentElement;
        // datalist, fieldset, optgroup, etc. may be just used for grouping purpose, so go up to the parent
        while (parent && roles.some(role => role === 'group'))
            parent = parent.parentElement;
         
        if (parent && (parent.hasAttribute("tabindex") || RPTUtil.isTabbable(parent))) {
            const target_roles =["listitem", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "treeitem"];
            if (allowedRoles.includes('any') || roles.some(role => target_roles.includes(role)))
                return true;
        }
        return false;
    }

    /**
     * a target is en element that accept a pointer action (click or touch)
     * a target is a browser default if it's a native widget (no user defined role) without user style  
     */
    public static isTargetBrowserDefault(element) {
        if (!element) return false;
        
        // user defained widget
        const roles = RPTUtil.getRoles(element, false); 
        if (roles && roles.length > 0)
            return false;

        // no user style to space control size, including use of font    
        const styles = getDefinedStyles(element);
        if (styles['line-height'] || styles['height'] || styles['width'] || styles['min-height'] || styles['min-width'] 
           || styles['font-size'] || styles['margin-top'] || styles['margin-bottom'] || styles['margin-left'] || styles['margin-right']) 
            return false;
            
        return true;
    }

    /**
     * an "inline" CSS display property tells the element to fit itself on the same line. An 'inline' element's width and height are ignored. 
     * some element has default inline property, such as <span>, <a>
     * most formatting elements inherent inline property, such as <em>, <strong>, <i>, <small> 
     * other inline elements: <abbr> <acronym> <b> <bdo> <big> <br> <cite> <code> <dfn> <em> <i> <input> <kbd> <label> 
     * <map> <object> <output> <q> <samp> <script> <select> <small> <span> <strong> <sub> <sup> <textarea> <time> <tt> <var>
     * an "inline-block" element still place element in the same line without breaking the line, but the element's width and height are applied.
     * inline-block elements: img, button, select, meter, progress, marguee, also in Chrome: textarea, input 
     * A block-level element always starts on a new line, and the browsers automatically add some space (a margin) before and after the element.
     * block-level elements: <address> <article> <aside> <blockquote> <canvas> <dd> <div> <dl> <dt> <fieldset> <figcaption> <figure> <footer> <form>
     * <h1>-<h6> <header> <hr> <li> <main> <nav> <noscript> <ol> <p> <pre> <section> <table> <tfoot> <ul> <video>
     * 
     * return: if it's inline element and { inline: true | false, text: true | false, violation: null | {node} } 
     */
    public static getInlineStatus(element) {
        if (!element) return null;
        
        const style =  getComputedStyle(element);
        if (!style) return null;

        let status = { "inline": false, "text": false, "violation": null }; 
        const udisplay = style.getPropertyValue("display");  
        // inline element only
        if (udisplay !== 'inline')
            return status;

        status.inline = true;    
        const parent = element.parentElement;
        if (parent) {
            const mapper : DOMMapper = new DOMMapper();
            const bounds = mapper.getUnadjustedBounds(element);
            const style = getComputedStyle(parent);
            const display = style.getPropertyValue("display");    
            // an inline element is inside a block. note <body> is a block element too
            if (display === 'block' || display === 'inline-block') {
                let containText = false;
                // one or more inline elements with text in the same line: <target>, text<target>, <target>text, <inline>+text<target>, <target><inline>+text, text<target><inline>+
                let walkNode = element.nextSibling;
                let last = true;
                while (walkNode) {
                    // note browsers insert Text nodes to represent whitespaces.
                    if (!containText && walkNode.nodeType === Node.TEXT_NODE && walkNode.nodeValue && walkNode.nodeValue.trim().length > 0) {
                        containText = true;
                    } else if (walkNode.nodeType === Node.ELEMENT_NODE) {
                        // special case: <br> is styled 'inline' by default, but change the line
                        if (status.violation === null && walkNode.nodeName.toLowerCase() !== 'br') {
                            const cStyle = getComputedStyle(walkNode);
                            const cDisplay = cStyle.getPropertyValue("display");
                            if (cDisplay === 'inline')  { 
                                last = false;
                                if (RPTUtil.isTarget(walkNode) && bounds.width < 24) {
                                    // check if the horizontal spacing is sufficient
                                    const bnds = mapper.getUnadjustedBounds(walkNode);
                                    if (Math.round(bounds.width/2) + bnds.left - (bounds.left + bounds.width) < 24)
                                        status.violation = walkNode.nodeName.toLowerCase();
                                }
                            } else
                                break;
                        }   
                    }
                    walkNode = walkNode.nextSibling;    
                }
                
                walkNode = element.previousSibling;
                let first = true;
                let checked = false;
                while (walkNode) {
                    // note browsers insert Text nodes to represent whitespaces.
                    if (!containText && walkNode.nodeType === Node.TEXT_NODE && walkNode.nodeValue && walkNode.nodeValue.trim().length > 0) {
                        containText = true;
                    } else if (walkNode.nodeType === Node.ELEMENT_NODE) {
                        // special case: <br> is styled 'inline' by default, but change the line
                        if (!checked && walkNode.nodeName.toLowerCase() !== 'br') {
                            const cStyle = getComputedStyle(walkNode);
                            const cDisplay = cStyle.getPropertyValue("display");    
                            if (cDisplay === 'inline')  {
                                first = false;
                                checked = true;
                                if (RPTUtil.isTarget(walkNode) && bounds.width < 24) {
                                    // check if the horizontal spacing is sufficient
                                    const bnds = mapper.getUnadjustedBounds(walkNode);
                                    if (Math.round(bounds.width/2) + bounds.left - (bnds.left + bnds.width)  < 24) {
                                        status.violation = status.violation === null ? walkNode.nodeName.toLowerCase() : status.violation + ", " + walkNode.nodeName.toLowerCase();
                                    }    
                                }
                            } else
                                break;
                        }    
                    }
                    walkNode = walkNode.previousSibling;    
                }
                
                // one or more inline elements are in the same line with text 
                if (containText)
                    status.text = true;
                
                return status;
            } else {
                //parent is inline element
                if (!RPTUtil.isInnerTextOnlyEmpty(parent))
                    status.text = true;
            }
        }
        // all other cases    
        return status;
    }

    public static tabIndexLEZero(elem) {
        if (RPTUtil.hasAttribute(elem, "tabindex")) {
            if (elem.getAttribute("tabindex").match(/^-?\d+$/)) {
                let tabindexValue = parseInt(elem.getAttribute("tabindex"));
                return tabindexValue === 0 || tabindexValue === -1;
            }
        }
        return false;
    }

    /**
     * get number of tabbable children
     * @param element 
     */
    public static getTabbableChildren(element) {
        let count = 0;
        // If node has children, look for tab stops in the children
        if (element.firstChild || element.nodeName.toUpperCase() === "IFRAME") {
            let nw = new NodeWalker(element);
            while (nw.nextNode() && nw.node != element) {
                if (nw.node.nodeType == 1 && !nw.bEndTag && RPTUtil.isTabbable(nw.node)) {
                    ++count;
                }
            }
        }
        return count;
    }

    //TODO: function does not handle equivalents for roles: row, link, header, button
    // But it may not have to. Bug reports have been about radio buttons and checkboxes.
    public static isHtmlEquiv(node, htmlEquiv) {
        let retVal = false;
        if (node) {
            let nodeName = node.nodeName.toLowerCase();
            if (nodeName === "input") {
                let type = node.getAttribute("type").toLowerCase();
                if (type) {
                    if (htmlEquiv.indexOf("checkbox") != -1) {
                        retVal = type === "checkbox";
                    } else if (htmlEquiv.indexOf("radio") != -1) {
                        retVal = type === "radio";
                    }
                }
            }
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

    public static normalizeSpacing(s) {
        return s.trim().replace(/\s+/g, ' ');
    };

    public static nonExistantIDs(node, targetids) {
        let returnnotfoundids = '';
        if (RPTUtil.normalizeSpacing(targetids).length < 1) return returnnotfoundids;

        let targetArray = targetids.split(" ");
        let doc = node.ownerDocument;
        for (let i = 0; i < targetArray.length; i++) {
            let xp = "//*[@id='" + targetArray[i] + "']";
            let xpathResult = doc.evaluate(xp, node, doc.defaultNSResolver, 0 /* XPathResult.ANY_TYPE */, null);
            let r = xpathResult.iterateNext();
            if (!r) returnnotfoundids += targetArray[i] + ', ';
        }
        if (RPTUtil.normalizeSpacing(returnnotfoundids).length >= 2)
            returnnotfoundids = returnnotfoundids.substring(0, returnnotfoundids.length - 2);
        else
            returnnotfoundids = '';
        return returnnotfoundids;
    }

    public static getDocElementsByTag(elem, tagName) {
        let doc = FragmentUtil.getOwnerFragment(elem) as any;
        tagName = tagName.toLowerCase();
        let cache = getCache(doc, "RPT_DOCELEMSBYTAG", {});
        if (!(tagName in cache)) {
            cache[tagName] = doc.querySelectorAll(tagName);
            setCache(doc, "RPT_DOCELEMSBYTAG", cache);
        }
        return cache[tagName];
    }

    /**
     * This function is responsible for get a list of all the child elemnts which match the tag
     * name provided.
     *
     * Note: This is a wrapper function to: RPTUtil.getChildByTagHidden
     *
     * @parm {element} parentElem - The parent element
     * @parm {string} tagName - The tag to search for under the parent element
     * @parm {boolean} ignoreHidden - true if hidden elements with the tag should ignored from the list
     *                                false if the hidden elements should be added
     *
     * @return {List} retVal - list of all the elements which matched the tag under the parent that were provided.
     *
     * @memberOf RPTUtil
     */
    public static getChildByTag(parentElem, tagName) {
        return RPTUtil.getChildByTagHidden(parentElem, tagName, false, false);
    }

    /**
     * This function is responsible for get a list of all the child elemnts which match the tag
     * name provided.
     *
     * @parm {element} parentElem - The parent element
     * @parm {string} tagName - The tag to search for under the parent element
     * @parm {boolean} ignoreHidden - true if hidden elements with the tag should ignored from the list
     *                                false if the hidden elements should be added
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     *
     * @return {List} retVal - list of all the elements which matched the tag under the parent that were provided.
     *
     * @memberOf RPTUtil
     */
    public static getChildByTagHidden(parentElem, tagName, ignoreHidden, considerHiddenSetting) {
        // Variable Decleration
        let retVal = [];
        let child = parentElem.firstChild;

        // Loop over all the child elements of the parent to build a list of all the elements that
        // match the tagName provided
        while (child != null) {

            // Only include the children into the return array if they match with tagname.
            if (child.nodeName.toLowerCase() === tagName) {

                // In the case that ignorehidden was set to true, then perform a isNodeVisible check
                // and in the case the node is not visilble we more to theses then move to the next node.
                // Perform a couple of checks to determine if hidden elements should be ignored or not.
                //  1. When ignoreHidden is set to true upfront, then perform a isNodeVisible
                //  2. If considerHiddenSetting option is set to true then we perform the check to consider the
                //     Check Hidden Content that is provided.
                //  2.1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                //       be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                //       add it to the roleToElems hash at all or even do any checking for it at all.
                if ((ignoreHidden || (considerHiddenSetting && !RPTUtil.shouldCheckHiddenContent(child))) && !VisUtil.isNodeVisible(child)) {
                    // Move on to the next element
                    child = child.nextSibling;

                    continue;
                }

                // Push the element
                retVal.push(child);
            }

            // Move to the next sibling element
            child = child.nextSibling;
        }
        return retVal;
    }

    /**
     * This function is responsible for finding a list of elements that match given roles(s).
     * This function by defauly will not consider Check Hidden Setting at all.
     * This function by defauly will not consider implicit roles.
     * Note: This is a wrapper function to: RPTUtil.getElementsByRoleHidden
     *
     * @parm {document} doc - The document node
     * @parm {list or string} roles - List or single role for which to return elements based on.
     *
     * @return {List} retVal - list of all the elements which matched the role(s) that were provided.
     *
     * @memberOf RPTUtil
     */
    public static getElementsByRole(doc, roles) {
        return RPTUtil.getElementsByRoleHidden(doc, roles, false, false);
    }

    /**
     * This function is responsible for finding a list of elements that match given roles(s).
     * This function aslo finds elements with implicit roles.
     * This function will also consider elements that are hidden based on the if the Check
     * Hidden Content settings should be considered or not.
     *
     * @parm {document} doc - The document node
     * @parm {list or string} roles - List or single role for which to return elements based on.
     * @parm {bool} considerHiddenSetting - true or false based on if hidden setting should be considered.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} retVal - list of all the elements which matched the role(s) that were provided.
     *
     * @memberOf RPTUtil
     */
    public static getElementsByRoleHidden(doc, roles, considerHiddenSetting, considerImplicitRoles?) {
        
        // In the case that the role to element assoication is already made, and available in the global hasAttribute
        // we can just use that one instead of building a new one.
        let roleToElems = null;
        if (considerImplicitRoles) {
            roleToElems = getCache(doc, "RPTUtil_GETELEMENTSBY_ROLE_IMPLICIT", null);
        } else {
            roleToElems = getCache(doc, "RPTUtil_GETELEMENTSBY_ROLE", null);
        }


        // Build the new role to element, this is where we loop through all the elements and extract all the
        // elements bsaed on roles.
        if (roleToElems === null) {
            // Re-initialize the roleToElems hash
            roleToElems = {};

            // Get the body of the doc
            let root = doc.body;

            // Keep looping until we are at the very parent node of the entire page, so that we can loop through
            // all the nodes.
            while (DOMWalker.parentNode(root) !== null) {
                // Get the parentNode
                root = DOMWalker.parentNode(root);
            }
            // Build a nodewalter based of the root node, this node walter will be use loop over all the nodes
            // and build the roles to Element coralation
            let nw = new NodeWalker(root);

            // Loop over the entire doc/list of nodes to build the role to element map
            // Note: This will build an roleToElems hash which is in the following format.
            // roleToElems = {
            //    document: [{div},{abbr},{var}],
            //    main: [{div}],
            //    navigation: [{div}]
            // }
            while (nw.nextNode()) {
                if (!nw.elem()) continue;                
                // Only check the elements which have the role attribute assiciated to them
                if (!nw.bEndTag) {

                    let wRoles = [];
                    //check if the node has role attributes
                    if (nw.elem() && nw.elem().hasAttribute("role")) {
                        // Extract all the roles that are assigned to this element, can have multiple roles on one
                        // element split by space, so we need to extract all of them into an array.
                        wRoles = nw.elem().getAttribute("role").split(" ");
                    }

                    if (nw.elem() && wRoles.length === 0 && considerImplicitRoles) {
                        //check if there are any implicit roles for this element.
                        let implicitRole = RPTUtil.getImplicitRole(nw.node);
                        if (implicitRole !== null && implicitRole.length > 0)
                            wRoles = implicitRole;
                    }

                    if (wRoles.length === 0) {
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
                    if (considerHiddenSetting && RPTUtil.shouldNodeBeSkippedHidden(nw.node)) {
                        continue;
                    }

                    // Loop through all the roles and assigned this node to all thes roles
                    for (let i = 0; i < wRoles.length; ++i) {
                        // In the case that the role key is not already in the roleToElems hash, construct the
                        // add the key and assign empty array.
                        if (!(wRoles[i] in roleToElems)) {
                            roleToElems[wRoles[i]] = [];
                        }

                        // Add the node to the array for the role
                        roleToElems[wRoles[i]].push(nw.node);
                    }
                }
            }

            // Set the roleToElems hash map as a global variable
            if (considerImplicitRoles) {
                setCache(doc, "RPTUtil_GETELEMENTSBY_ROLE_IMPLICIT", roleToElems);
            } else {
                setCache(doc, "RPTUtil_GETELEMENTSBY_ROLE", roleToElems);
            }

        }

        // Initilize the return value
        let retVal = [];

        // Handle the cases where the provided role is a string and not an array,
        // for this case we take the string and put it into an array
        if (typeof (roles) === "string") {
            let role = roles;
            roles = [];
            roles.push(role);
        }

        // Loop through the roles that were provided and find the list of elements for this roles
        // and add them to the return value.
        if (roles.length) {
            // loop over all the roles
            for (let i = 0; i < roles.length; ++i) {
                // Extract the role from the array
                let nextRole = roles[i];
                // Fetch the list of all the elements for this role
                let copyRoles = roleToElems[nextRole];

                // If there are elements to copy to another array, then perform the copy
                if (copyRoles) {
                    // Loop over all the elements which are to be copied
                    for (let j = 0; j < copyRoles.length; ++j) {
                        // Add this element to the return val
                        retVal.push(copyRoles[j]);
                    }
                }
            }
        }

        return retVal;
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
     * @memberOf RPTUtil
     */
    public static getResolvedRole(elem: Element) : string {
        if (!elem) return null;
        let role = getCache(elem, "RPTUTIL_ELEMENT_RESOLVED_ROLE", null);
        if (role === null) {
            const roles = RPTUtil.getUserDefinedRoles(elem);
            let tagProperty = RPTUtil.getElementAriaProperty(elem);
            let allowedRoles = RPTUtil.getAllowedAriaRoles(elem, tagProperty);
            if (roles && roles.length > 0 && allowedRoles && allowedRoles.length > 0) {
                for (let i=0; i < roles.length; i++) {
                    if (allowedRoles.includes(roles[i])) {
                        role = roles[i];
                        break;
                    }    
                } 
            }
            
            if (role === null) {
                const implicitRole = RPTUtil.getImplicitRole(elem);
                role = implicitRole && implicitRole.length > 0 ? implicitRole[0] : undefined;
            }
            setCache(elem, "RPTUTIL_ELEMENT_RESOLVED_ROLE", role);
        }   
        return role !== undefined ? role : null;
    }

    /**
     * This function is responsible for retrieving user defined element's roles from dom.
     * @parm {HTMLElement} ele - element for which to find role.
     *
     * @return {List} roles - list of user defined roles in the element role attribute.
     *
     * @memberOf RPTUtil
     */
    public static getUserDefinedRoles(ele: Element) : string[] {
        return RPTUtil.getRoles(ele, false);
    }
    
    /**
     * This function is responsible for retrieving element's roles.
     * This function also finds implicit roles.
     * @parm {HTMLElement} ele - element for which to find role.
     * @parm {bool} considerImplicitRoles - true or false based on if implicit roles setting should be considered.
     *
     * @return {List} roles - list of attribute roles and implicit roles.
     *
     * @memberOf RPTUtil
     */
    public static getRoles(ele: Element, considerImplicitRoles: boolean) : string[] {
        let roles : string[] = [];
        if (ele && ele.hasAttribute && ele.hasAttribute("role")) {
            let attrRoles = RPTUtil.normalizeSpacing(ele.getAttribute("role").trim()).split(" ");
            for (let i = 0; i < attrRoles.length; ++i) {
                roles.push(attrRoles[i]);
            }
        }

        //check if implicit roles exist.
        //Note: element can have multiple implicit roles
        if (considerImplicitRoles) {
            let implicitRole = RPTUtil.getImplicitRole(ele);
            if (implicitRole !== null && implicitRole.length > 0) {
                //add implicit roles to the attributes roles.
                RPTUtil.concatUniqueArrayItemList(implicitRole, roles);
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
     * @memberOf RPTUtil
     */
    public static getImplicitRole(ele) : string[] {
        if (!ele || ele.nodeType !== 1) return [];
        let implicitRoles : string[] = getCache(ele, "RPTUtil_ImplicitRole", null);
        if (!implicitRoles) {
            let tagProperty = RPTUtil.getElementAriaProperty(ele);
            // check if there are any implicit roles for this element.
            if (tagProperty && tagProperty.implicitRole) {
                if (tagProperty.implicitRole.includes("generic")) {
                    // the 'generic' role is only allowed if a valid aria attribute exists.
                    let domAriaAttributes = RPTUtil.getUserDefinedAriaAttributes(ele);
                    if (domAriaAttributes.length === 0) {
                        setCache(ele, "RPTUtil_ImplicitRole", []);
                        return [];
                    }    
                    let roleAttributes = [];
                    let pattern = ARIADefinitions.designPatterns['generic'];
                    if (pattern.reqProps && pattern.reqProps.length > 0)
                        RPTUtil.concatUniqueArrayItemList(pattern.reqProps, roleAttributes);
                    
                    if (tagProperty.globalAriaAttributesValid)
                        RPTUtil.concatUniqueArrayItemList(ARIADefinitions.globalProperties, roleAttributes);
                    
                    if (pattern.deprecatedProps && pattern.deprecatedProps.length > 0)
                        RPTUtil.reduceArrayItemList(pattern.deprecatedProps, roleAttributes); 

                    // remove 'generic' role if roleAttributes doesn't contain any of domAriaAttributes 
                    if (roleAttributes.length > 0 && !roleAttributes.some(attr=> domAriaAttributes.includes(attr))) {
                        let implicit = RPTUtil.reduceArrayItemList(['generic'], tagProperty.implicitRole);
                        setCache(ele, "RPTUtil_ImplicitRole", implicit);
                        return implicit;
                    }    
                }
                setCache(ele, "RPTUtil_ImplicitRole", tagProperty.implicitRole);
                return tagProperty.implicitRole;   
            }
            setCache(ele, "RPTUtil_ImplicitRole", []);
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
     * @memberOf RPTUtil
     */
    public static getRoleRequiredProperties(role, ele) {
        if (role === null) {
            return null;
        }

        if (ARIADefinitions.designPatterns[role]) {
            let requiredAttributes = ARIADefinitions.designPatterns[role].reqProps;
            // handle special case of separator
            if (role.toLowerCase() === "separator" && ele && RPTUtil.isFocusable(ele)) {
                requiredAttributes = RPTUtil.concatUniqueArrayItemList(["aria-valuenow"], requiredAttributes || []);
            }
            return requiredAttributes;
        } else {
            return null;
        }
    }

    /**
     * Test if the ele node is focusable
     */
    public static isFocusable(ele) {
        if (ele === "undefined" || ele === null) {
            return false;
        }
        return RPTUtil.isTabbable(ele);
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
     * @memberOf RPTUtil
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
            let implicitRole = RPTUtil.getImplicitRole(ele);
            if (implicitRole !== null && implicitRole.length > 0) {
                RPTUtil.concatUniqueArrayItemList(implicitRole, wRoles);
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
     * @memberOf RPTUtil
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
        let impRoles = RPTUtil.getImplicitRole(ele);
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
     * @memberOf RPTUtil
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
            let impRoles = RPTUtil.getImplicitRole(ele);
            if (impRoles !== null && impRoles.length > 0)
                retVal = true;
        }
        return retVal;
    }

    public static isDataTable(tableNode) {
        return !(RPTUtil.hasRole(tableNode, "none") || RPTUtil.hasRole(tableNode, "presentation"));
    }

    /*
     * A complex data table is a data table with any of the following characteristics:
     *
     * a thead element that contains two or more tr elements
     * a table with more than one thead element
     * a table with two or more tr elements that contain only th elements
     * a th or td element with a rowspan or colspan attribute
     * a tr element that contains at least one td element and two or more th elements
     * a table with headers not located in the first row or first column
     * a td element with a headers attribute value that contains more than two IDREFs
     */
    public static isComplexDataTable(table) {

        if ("RPTUtil_isComplexDataTable" in table) {
            return !!table.RPTUtil_isComplexDataTable;
        }

        let isComplexTable = false;

        if (table && RPTUtil.isDataTable(table)) {

            let thNodes = null,
                tdNodes = null;
            let trNodes = table.getElementsByTagName("tr");
            let trNodeCount = trNodes.length;
            let tdNodeCount = 0,
                thNodeCount = 0,
                trNodesHavingOnlyThNodes = 0;

            for (let i = 0; !isComplexTable && i < trNodeCount; ++i) {

                thNodes = trNodes[i].getElementsByTagName("th");
                tdNodes = trNodes[i].getElementsByTagName("td");
                thNodeCount = thNodes.length;
                tdNodeCount = tdNodes.length;

                if (tdNodeCount !== 0) {

                    // a tr element that contains at least one td element and two or more th elements;
                    isComplexTable = thNodeCount > 1;

                    // a th element with a rowspan or colspan attribute
                    for (let j = 0; !isComplexTable && j < thNodeCount; ++j) {
                        isComplexTable = ((thNodes[j].hasAttribute("rowspan") ||
                            thNodes[j].hasAttribute("colspan")) &&
                            RPTUtil.getAncestor(thNodes[j], "table") === table);
                    }

                    // a td element with a rowspan or colspan attribute
                    // a td element with a headers attribute value that contains more than two IDREFs
                    for (let k = 0; !isComplexTable && k < tdNodeCount; ++k) {
                        isComplexTable = ((tdNodes[k].hasAttribute("rowspan") ||
                            tdNodes[k].hasAttribute("colspan") ||
                            (tdNodes[k].hasAttribute("headers") && RPTUtil.normalizeSpacing(tdNodes[k].getAttribute("headers")).split(" ").length > 2)) &&
                            RPTUtil.getAncestor(tdNodes[k], "table") === table);
                    }

                } else {

                    // two or more tr elements that contain only th elements
                    if (thNodeCount > 0) {
                        ++trNodesHavingOnlyThNodes;
                    }
                    isComplexTable = trNodesHavingOnlyThNodes === 2;
                }
            }

            if (!isComplexTable) {

                let theadNodes = table.getElementsByTagName("thead");
                let theadNodesLength = theadNodes.length;

                if (theadNodesLength > 0) {

                    // table has more than one thead element
                    isComplexTable = theadNodesLength > 1;

                    // a thead element that contains two or more tr elements
                    if (!isComplexTable) {
                        isComplexTable = theadNodes[0].getElementsByTagName("tr").length > 1;
                    }
                }
            }
            if (!isComplexTable && trNodeCount !== 0) {
                // a table with headers not located in the first row or first column
                isComplexTable = thNodeCount > 0 && !RPTUtil.tableHeaderExists(table);
            }
        }
        table.RPTUtil_isComplexDataTable = isComplexTable;

        return isComplexTable;
    }

    // Return true if a table cell is hidden or contain no data: <td></td>
    public static isTableCellEmpty(cell) {
        if (!cell || !VisUtil.isNodeVisible(cell) || cell.innerHTML.replace(/&nbsp;/g,' ').trim().length === 0)
            return true;
           
        return false;
    }

    // Return true if a table row is hidden or contain no data: <tr /> or <tr><td></td><td></td></tr> 
    public static isTableRowEmpty(row) {
        if (!row || !row.cells || row.cells.length === 0 || !VisUtil.isNodeVisible(row))
            return true;
           
        let passed = true; //empty
        for (let c=0; passed && c < row.cells.length; c++) {
            let cell = row.cells[c];
            passed = RPTUtil.isTableCellEmpty(cell);          
        }
        
        return passed;
    }

    // Return true if a table's header is in the first row or column
    public static tableHeaderExists(ruleContext) {

        let rows = ruleContext.rows;
        if (!rows || rows.length === 0)
            return null;

        // note that table.rows return all all the rows in the table, 
        // including the rows contained within <thead>, <tfoot>, and <tbody> elements. 
        
        //case 1: headers are in the very first row with data in tbody or thead, but not in tfoot   
        //get the first row with data, ignoring the rows with no data
        let passed = true;
        let firstRow = rows[0];
        for (let r=0; passed && r < rows.length; r++) {
            firstRow = rows[r];
            // ignore the rows from tfoot
            if (firstRow.parentNode && firstRow.parentNode.nodeName.toLowerCase() === 'tfoot') continue;
            
            passed = RPTUtil.isTableRowEmpty(firstRow);          
        }
        
        //table contain no data:  <table><tr><td></td><td></td></tr></table> 
        if (passed)
            return null;
        
        // Check if the cells with data in the first data row are all TH's
        passed = true;
        for (let r=0; passed && r < firstRow.cells.length; r++) {
            let cell = firstRow.cells[r];
            passed = RPTUtil.isTableCellEmpty(cell) || cell.nodeName.toLowerCase() === 'th';          
        }
        
        if (passed)
            return true;

        // Case 2: headers are in the first column with data
        // Assume that the first column has all TH's or a TD without data in the first column.
        passed = true;
        for (let i = 0; passed && i < rows.length; ++i) {
            // ignore the rows from tfoot
            if (rows[i].parentNode && rows[i].parentNode.nodeName.toLowerCase() === 'tfoot') continue;

            // If no cells in this row, or no data at all, that's okay too.
            passed = !rows[i].cells ||
                rows[i].cells.length === 0 ||
                rows[i].cells[0].innerHTML.trim().length === 0 ||
                rows[i].cells[0].nodeName.toLowerCase() != "td";
        }
        
        if (passed)
            return true;
            
        //case 3: all td data cells have headers attributes that point to the id of a th element in the same table. 
        // https://html.spec.whatwg.org/multipage/tables.html#attributes-common-to-td-and-th-elements
        passed = true; 
        let thIds = [];
        let tdHeaders = [];
        for (let r=0; passed && r < rows.length; r++) {
            let row = rows[r]; 
            // Check if the cells with data in the last data row are all TH's
            for (let c=0; c < row.cells.length; c++) {
                let cell = row.cells[c];
                if (RPTUtil.isTableCellEmpty(cell)) continue; 
                if (cell.nodeName.toLowerCase() === 'td') {
                    if (!cell.getAttribute('headers') || cell.getAttribute('headers').trim().length === 0)
                        passed = false;
                    else
                        RPTUtil.concatUniqueArrayItemList(cell.getAttribute('headers').trim().split(" "), tdHeaders);
                } else if (cell.nodeName.toLowerCase() === 'th' && cell.getAttribute('id') && cell.getAttribute('id').trim().length > 0)
                        RPTUtil.concatUniqueArrayItem(cell.getAttribute('id').trim(), thIds);    
            }      
        }
        
        if (passed) { // all td elements have headers, to exam if the headers point to a th id
            if (thIds.length > 0 && tdHeaders.every(header => thIds.includes(header)))
                return true; 
        }
        
        return false;
    }

    public static isNodeInGrid(node) {
        return RPTUtil.getAncestorWithRole(node, "grid") != null;
    }
    public static isLayoutTable(tableNode) {
        return RPTUtil.hasRole(tableNode, "presentation") || RPTUtil.hasRole(tableNode, "none");
    }
    public static getFileExt(url) {
        let m = url.match(/\.(([^;?#\.]|^$)+)([;?#]|$)/);
        if (m != null && m.length >= 2) {
            return "." + m[1];
        }
        return "";
    }
    public static getFileAnchor(url) {
        let m = url.match(/#(([^;?\.]|^$)+)([;?]|$)/);
        if (m != null && m.length >= 2) {
            return m[1];
        }
        return "";
    }
    public static checkObjEmbed(node, extTest, mimeTest) {
        let nodeName = node.nodeName.toLowerCase();

        if (nodeName != "object" && nodeName != "embed" &&
            nodeName != "a" && nodeName != "area") return false;
        let retVal = false;
        // Check mime type
        if (!retVal && node.hasAttribute("type")) {
            let mime = node.getAttribute("type").toLowerCase();
            retVal = mimeTest(mime);
        }
        if (!retVal && node.hasAttribute("codetype")) {
            let mime = node.getAttribute("codetype");
            retVal = mimeTest(mime);
        }

        // Check the filename
        if (!retVal) {
            let filename = "";
            if (nodeName === "embed") {
                filename = node.getAttribute("src");
            } else if (nodeName === "a" || nodeName === "area") {
                filename = node.getAttribute("href");
            } else if (node.hasAttribute("data")) {
                filename = node.getAttribute("data");
            }
            if (filename === null) filename = "";
            let ext = RPTUtil.getFileExt(filename);
            retVal = extTest(ext);
        }

        // Check for filenames in the params
        if (!retVal && nodeName === "object") {
            // In the case that Check Hidden Option is set then comply with that setting
            let params = RPTUtil.getChildByTagHidden(node, "param", false, true);
            for (let i = 0; !retVal && params != null && i < params.length; ++i) {
                retVal = params[i].hasAttribute("value") &&
                    extTest(RPTUtil.getFileExt(params[i].getAttribute("value")));
            }
        }
        return retVal;
    }
    public static isAudioObjEmbedLink(node) {
        return RPTUtil.checkObjEmbed(node, RPTUtil.isAudioExt, function (mime) {
            return mime.startsWith("audio")
        });
    }
    public static isAudioExt(ext) {
        let audio_extensions = [".aif", ".aifc", ".aiff", ".air", ".asf", ".au", ".cda",
            ".dsm", ".dss", ".dwd", ".iff", ".kar", ".m1a", ".med",
            ".mp2", ".mp3", ".mpa", ".pcm", ".ra", ".ram", ".rm",
            ".sam", ".sf", ".sf2", ".smp", ".snd", ".svx", ".ul",
            ".voc", ".wav", ".wma", ".wve"
        ];
        return RPTUtil.valInArray(ext.toLowerCase(), audio_extensions);
    }
    public static isVideoObjEmbedLink(node) {
        return RPTUtil.checkObjEmbed(node, RPTUtil.isVideoExt, function (mime) {
            return mime.startsWith("video") ||
                mime.startsWith("application/x-shockwave-flash");
        });
    }
    public static isVideoExt(ext) {
        let video_extensions = [".asf", ".avi", ".divx", ".dv", ".m1v", ".m2p", ".m2v", ".moov",
            ".mov", ".mp4", ".mpeg", ".mpg", ".mpv", ".ogm", ".omf", ".qt",
            ".rm", ".rv", ".smi", ".smil", ".swf", ".vob", ".wmv", ".rmvb",
            ".mvb"
        ];
        return RPTUtil.valInArray(ext.toLowerCase(), video_extensions);
    }
    public static isImageObjEmbedLink(node) {
        return RPTUtil.checkObjEmbed(node, RPTUtil.isImgExt, function (mime) {
            return mime.startsWith("image");
        });
    }
    public static isImgExt(ext) {
        let image_extensions = [".bmp", ".gif", ".jpg", ".jpeg", ".pcx", ".png"];
        return RPTUtil.valInArray(ext.toLowerCase(), image_extensions);
    }
    public static isHtmlExt(ext) {
        let html_extensions = [".asp", ".aspx", ".cfm", ".cfml", ".cgi", ".htm", ".html", ".shtm",
            ".shtml", ".php", ".pl", ".py", ".shtm", ".shtml", ".xhtml"
        ];
        return RPTUtil.valInArray(ext.toLowerCase(), html_extensions);
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
        return RPTUtil.valInArray(node.nodeName.toLowerCase(), presentationalElements);
    }
    public static hasTriggered(doc, id) {
        return getCache(doc, id, false);
    }
    public static triggerOnce(doc, id, passed) {
        if (passed) return true;
        let triggered = getCache(doc, id, false);
        setCache(doc, id, true);
        return triggered;
    }

    /* determine if the given value exists in the given array */
    public static valInArray(value, arr) {
        for (let idx in arr) {
            if (arr[idx] === value) return true;
        }
        return false;
    }

    /**
     * return the ancestor of the given element
     * @param tagNames string, array, or dictionary containing the tags to search for
     */
    public static getAncestor(element, tagNames) {
        let walkNode = element;
        while (walkNode !== null) {
            let thisTag = walkNode.nodeName.toLowerCase();
            if (typeof (tagNames) === "string") {
                if (thisTag === tagNames.toLowerCase()) {
                    break;
                }
            } else if (tagNames.length) {
                for (let idx in tagNames) {
                    if (tagNames[idx] === thisTag)
                        return walkNode;
                }
            } else if (thisTag in tagNames) {
                break;
            }
            walkNode = DOMWalker.parentNode(walkNode);
        }
        return walkNode;
    }

    // return true if element1 and element2 are siblings
    public static isSibling(element1, element2) {
        if (element1 && element2) {
            let node = null;
            if (DOMWalker.parentNode(element1) && DOMWalker.parentNode(element1).firstChild) {
                node = DOMWalker.parentNode(element1).firstChild;
            }
            
            while (node) {
                if (node === element2) return true;
                node = node.nextSibling;
            }
        }
        return false;
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
     * @memberOf RPTUtil
     */
    public static getAncestorWithRole(element, roleName, considerImplicitRoles?) {
        let walkNode = DOMWalker.parentNode(element);
        while (walkNode !== null) {
            if (considerImplicitRoles) {
                if (RPTUtil.hasRoleInSemantics(walkNode, roleName)) {
                    break;
                }
            } else {
                if (RPTUtil.hasRole(walkNode, roleName, false)) {
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
     * @memberOf RPTUtil
     */
    public static getAncestorWithRoles(element, roleNames) {
        if (!element || !roleNames || !roleNames.length || roleNames.length === 0) return null;
        let walkNode = element;
        while (walkNode !== null) {
            let role = RPTUtil.getResolvedRole(walkNode);
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
     * @memberOf RPTUtil
     */
    public static getRolesWithTypes(element, types: string[]) {
        if (!element || !types || !types.length || types.length ===0) return null;
        
        let roles = getCache(element.ownerDocument, "roles_with_given_types", null);
        if (!roles || roles.length === 0) {
            roles = [];
            Object.entries(ARIADefinitions.designPatterns).forEach(([key, value]) => {
                if (types.includes(value.roleType))
                    roles.push(key);   
            });
            setCache(element.ownerDocument, "roles_with_given_types", roles);
        } 
        return roles;
    } 

    /**
     * return the ancestor with the given style properties.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {[string]} styleProps - The style properties and values of the parent to search for.
     *         such as {"overflow":['auto', 'scroll'], "overflow-x":['auto', 'scroll']}
     *          or {"overflow":['*'], "overflow-x":['*']}, The '*' for any value to check the existence of the style prop.
     * @parm {bool} excludedValues - style values that should be ignored.
     * @return {node} walkNode - A parent node of the element, which has the style properties
     * @memberOf RPTUtil
     */
     public static getAncestorWithStyles(elem, styleProps, excludedValues =[]) {
        let walkNode = elem;
        while (walkNode !== null) {
            const node = getCache(walkNode, "RPTUtil_AncestorWithStyles", null);
            if (node !== null) return node;

            const styles = getDefinedStyles(walkNode);
            for (const style in styleProps) {
                let value = styles[style];
                if (value) {
                    value = value.split(" ")[0]; //get rid of !important
                    if (!excludedValues.includes(value)) {
                        if (styleProps[style].includes('*')) {
                            setCache(walkNode, "RPTUtil_AncestorWithStyles", walkNode);
                            return walkNode;
                        } else if (styleProps[style].includes(value)) {
                            setCache(walkNode, "RPTUtil_AncestorWithStyles", walkNode);
                            return walkNode;
                        }    
                    }    
                }  
            }
            walkNode = DOMWalker.parentElement(walkNode);
        }
        setCache(elem, "RPTUtil_AncestorWithStyles", undefined);
        return null;
    }

    /**
     * This function is responsible for finding a node which matches the role and is a sibling of the
     * provided element.
     *
     * This function by default will not consider Check Hidden Setting at all.
     *
     * Note: This is a wrapper function to: RPTUtil.getSiblingWithRoleHidden
     *
     * @parm {element} element - The element to start the node walk on to find sibling node
     * @parm {string} role - The role to search for on an element under the provided element
     *
     * @return {node} walkNode - A sibling node of the element passed in, which has the provided role
     *
     * @memberOf RPTUtil
     */
    public static getSiblingWithRole(element, role) {
        return RPTUtil.getSiblingWithRoleHidden(element, role, false);
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
     * @memberOf RPTUtil
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
                if (considerHiddenSetting && RPTUtil.shouldNodeBeSkippedHidden(walkNode)) {
                    // Move on to the next node
                    walkNode = walkNode.nextSibling;

                    continue;
                }

                // Check if this node has the role that we need to check exists
                if (considerImplicitRole) {
                    hasRole = RPTUtil.hasRoleInSemantics(walkNode, role);
                } else {
                    hasRole = RPTUtil.hasRole(walkNode, role, false);
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
                    if (considerHiddenSetting && RPTUtil.shouldNodeBeSkippedHidden(walkNode)) {
                        // Move on to the next node
                        walkNode = walkNode.previousSibling;

                        continue;
                    }

                    // Check if this node has the role that we need to check exists
                    hasRole = RPTUtil.hasRole(walkNode, role, considerImplicitRole);

                    // Move on to the next node
                    walkNode = walkNode.previousSibling;
                }
            }
        }

        return walkNode;
    }

    public static isDescendant(parent, child) {
        let node = DOMWalker.parentNode(child);
        while (node != null) {
            if (node === parent) {
                return true;
            }
            node = DOMWalker.parentNode(node);
        }
        return false;
    }

    //check if the first form control child is disabled
    public static isDisabledByFirstChildFormElement(element) {
        let formElements = ["input", "textarea", "select", "keygen", "progress", "meter", "output"];
        if (element.firstChild != null) {
            let nw = new NodeWalker(element);
            while (nw.nextNode()) {
                if (formElements.includes(nw.node.nodeName.toLowerCase())) {
                    if (RPTUtil.isNodeDisabled(nw.node))
                        return true;
                    return false;
                }
            }
        }
        return false;
    }

    public static isDisabledByReferringElement(element) {
        let id = element.getAttribute("id");
        let doc = element.ownerDocument;
        let root = doc.body;
        while (DOMWalker.parentNode(root) !== null) {
            // Get the parentNode
            root = DOMWalker.parentNode(root);
        }
        let nw = new NodeWalker(root);
        while (nw.nextNode()) {
            // check the element whose 'aria-describedby' equals to the id
            if (nw.node && nw.node.nodeType === 1 && nw.elem()) {
                let AriaDescribedbyIDArray = (nw.elem().getAttribute("aria-describedby") || "").split(" ");
                if (AriaDescribedbyIDArray.includes(id) && RPTUtil.isNodeDisabled(nw.node)) {
                    return true;
                }
            }

        }
    }
    /**
     * This function is responsible for getting a descendant element with the specified role, under
     * the element that was provided.
     *
     * Note by default this function will not consider the Check Hidden Content Setting.
     *
     * Note: This is a wrapper function to: RPTUtil.getDescendantWithRoleHidden
     *
     * @parm {element} element - parent element for which we will be checking descendants for
     * @parm {string} roleName - The role to look for on the descendant's elements
     *
     * @return {node} - The descendant element that matches the role specified (only one)
     *
     * @memberOf RPTUtil
     */
    public static getDescendantWithRole(element, roleName) {
        return RPTUtil.getDescendantWithRoleHidden(element, roleName, false);
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
     * @memberOf RPTUtil
     */
    public static getDescendantWithRoleHidden(element, roleName, considerHiddenSetting, considerImplicitRoles?) {
        // Variable Decleration
        let descendant = null;
        let nw = new NodeWalker(element);

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
            if (considerHiddenSetting && RPTUtil.shouldNodeBeSkippedHidden(nw.node)) {
                continue;
            }

            // Check if this node has the role specified, if it does then set this as the descendant and stop checking the rest of the
            // nodes.
            // Check if this node has the implicit roles, if it does then set this as the descendant and stop checking the rest of the
            // nodes.
            if (considerImplicitRoles ? RPTUtil.hasRoleInSemantics(nw.node, roleName) : RPTUtil.hasRole(nw.node, roleName, false)) {
                descendant = nw.node;
                break;
            }
        }

        return descendant;
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
     * @return {node} - The descendant element that matches the role specified (only one)
     *
     * @memberOf RPTUtil
     */
    public static getAllDescendantsWithRoleHidden(element, roleName, considerHiddenSetting, considerImplicitRoles) {
        // Variable Decleration
        let descendants = [];
        let nw = new NodeWalker(element);

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
            if (considerHiddenSetting && RPTUtil.shouldNodeBeSkippedHidden(nw.node)) {
                continue;
            }

            // Check if this node has the role specified, if it does then set this as the descendant and stop checking the rest of the
            // nodes.
            // Check if this node has the implicit roles, if it does then set this as the descendant and stop checking the rest of the
            // nodes.
            if (RPTUtil.hasRole(nw.node, roleName, considerImplicitRoles)) {
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
     * @memberOf RPTUtil
     */
     public static getDirectATChildren(element) {
        let requiredChildRoles = RPTUtil.getRequiredChildRoles(element, true);
        let direct: Array<HTMLElement> = [];
        RPTUtil.retrieveDirectATChildren(element, requiredChildRoles, direct);
        return direct;
    }

    /**
     * This function is responsible for recursively any child path till either no child or a child with a role is found (exclude none and presentation)
     *
     * @parm {element} element - parent element for which we will be checking children for
     * @return {node} - The direct child elements in AT tree
     *
     * @memberOf RPTUtil
     */
     public static retrieveDirectATChildren(element, requiredChildRoles, direct: Array<HTMLElement>) {
        let children : HTMLElement[] = [];
        if (element.children !== null && element.children.length > 0) {
            for (let i=0; i < element.children.length; i++) {
                children.push(element.children[i]);
            }
        }
        // if the element contains "aria-own" attribute, then the aria-owned children need to be included too
        let owned = element.getAttribute("aria-owns");
        if (owned) {
            let doc = element.ownerDocument;
            if (doc) {
                let ownedIds = owned.split(" ");
                for (let i=0; i < ownedIds.length; i++) {
                    let ownedElem = doc.getElementById(ownedIds[i]);
                    if (ownedElem) {
                        children.push(ownedElem);
                    }
                }    
            }
        }
        if (children.length > 0) {
            for (let i=0; i < children.length; i++) {
                //ignore hidden and invisible child
                if (VisUtil.isNodeHiddenFromAT(children[i]) || !VisUtil.isNodeVisible(children[i])) continue;
                let roles = RPTUtil.getRoles(children[i], false);
                if (roles === null || roles.length === 0) {
                    roles = RPTUtil.getImplicitRole(children[i]);
                }

                if (roles && roles !== null && roles.length > 0) {
                    //remove 'none' and 'presentation'
                    roles = roles.filter(function(role) {
                        return role !== "none" && role !== "presentation";
                    })

                    // a 'group' role is allowed but not required for some elements so remove it if exists
                    if (roles.includes("group") && requiredChildRoles && requiredChildRoles.includes('group')) {
                        roles = roles.filter(function(role) {
                            return role !== 'group';
                        })
                    }
                } 
                if (roles && roles !== null && roles.length > 0) {
                    direct.push(children[i]);
                } else {
                    // recursive until get a return value, 
                    RPTUtil.retrieveDirectATChildren(children[i], requiredChildRoles, direct);
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
    public static getRequiredChildRoles(element, includeImplicit: boolean) : string[] {
        let roles = RPTUtil.getRoles(element, false);
        // if explicit role doesn't exist, get the implicit one
        if ((!roles || roles.length === 0) && includeImplicit) {
            roles = RPTUtil.getImplicitRole(element);
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
                requiredChildRoles = RPTUtil.concatUniqueArrayItemList(designPatterns[roles[j]].reqChildren, requiredChildRoles);
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
     * Note: This is a wrapper function to: RPTUtil.getAriaOwnsWithRoleHidden
     *
     * @parm {element} element - Element to check for aria-owns
     * @parm {string} roleName - The role to look for on the aria-owns element
     *
     * @return {node} - The element that is referenced by aria-owns and has role specified.
     *
     * @memberOf RPTUtil
     */
    public static getAriaOwnsWithRole(element, roleName) {
        return RPTUtil.getAriaOwnsWithRoleHidden(element, roleName, false);
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
     * @memberOf RPTUtil
     */
    public static getAriaOwnsWithRoleHidden(element, roleName, considerHiddenSetting, considerImplicitRoles?) {
        // Variable Decleration
        let referencedElement = null;
        let referencedElemHasRole = false;

        // In the case aria-owns is not on the element just break out of this function with null
        if (RPTUtil.attributeNonEmpty(element, "aria-owns")) {

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
            if (considerHiddenSetting && referencedElement != null && RPTUtil.shouldNodeBeSkippedHidden(referencedElement)) {
                referencedElemHasRole = null;
            } else {
                referencedElemHasRole = RPTUtil.hasRole(referencedElement, roleName, considerImplicitRoles);
            }
        }
        return referencedElemHasRole ? referencedElement : null;
    }

    /** get element containing label for the given element
     * @deprecated Deprecated because the function name is misleading. Use getLabelForElement(element) instead
     */
    public static getInputLabel(element) {
        return RPTUtil.getLabelForElement(element);
    }

    /**
     * This function is responsible for getting the element containing the label for the given element.
     *
     * Note: This is a wrapper function to: RPTUtil.getLabelForElementHidden
     *
     * @parm {element} element - The element for which to get the label element for.
     *
     * @return {element} element - return the element for the label, otherwise null
     *
     * @memberOf RPTUtil
     */
    public static getLabelForElement(element) {
        return RPTUtil.getLabelForElementHidden(element, false);
    }

    /**
     * This function is responsible for getting the element containing the label for the given element.
     *
     * This function will return null if the containing lable element is hidden, when the ignoreHidden option
     * is set to true.
     *
     * @parm {element} element - The element for which to get the label element for.
     * @parm {boolean} ignoreHidden - true if hidden elements with label should be ignored from the list
     *                                false if the hidden elements should be added
     *
     * @return {element} element - return the element for the label, otherwise null
     *
     * @memberOf RPTUtil
     */
    public static getLabelForElementHidden(element: Element, ignoreHidden) {
        // Check if the global RPTUtil_LABELS hash is available, as this will contain the label nodes based on
        // for attribute.
        //if (!getCache(element.ownerDocument,"RPTUtil_LABELS", null)) {
        let root = element.getRootNode();
        if (!getCache((root.nodeType === 11)? <ShadowRoot>root : <Document>root, "RPTUtil_LABELS", null)) {
            // Variable Decleration
            let idToLabel = {}

            // Get all the label elements in the entire doc
            let labelNodes = RPTUtil.getDocElementsByTag(element, "label");
            // Loop over all the label nodes, in the case the label node has a for attribute,
            // extract that attribute and add this node to the hash if it is visible.
            for (let i = 0; i < labelNodes.length; ++i) {

                if (labelNodes[i].hasAttribute("for")) {
                    // If ignore hidden is specified and the node is not visible we do not add it to the
                    // labelNodes hash.
                    if (ignoreHidden && !VisUtil.isNodeVisible(labelNodes[i])) {
                        continue;
                    }

                    idToLabel[labelNodes[i].getAttribute("for")] = labelNodes[i];
                }
            }

            // Add the built hash to the ownerDocument (document), to be used later to fast retrival
            //setCache(element.ownerDocument, "RPTUtil_LABELS", idToLabel);
            setCache((root.nodeType === 11)? <ShadowRoot>root : <Document>root, "RPTUtil_LABELS", idToLabel);
        }

        // If this element has an id attribute, get the corosponding label element
        if (element.hasAttribute("id")) {
            // Fetch the id attribute
            let ctrlId = element.getAttribute("id");
            // Return the corosponding label element.
            // Note: in the case that the the id is not found in the hash that means, it does not exists or is hidden
            if (ctrlId.trim().length > 0) {
                //return getCache(element.getRootNode().ownerDocument,"RPTUtil_LABELS",{})[ctrlId];
                return getCache((root.nodeType === 11)? <ShadowRoot>root : <Document>root, "RPTUtil_LABELS",{})[ctrlId];
            } 
        }
        return null;
    }

    /* Return specified element attribute if present else return null */
    public static getElementAttribute(element, attr) {
        //return (element && element.hasAttribute && element.hasAttribute(attr)) ? element.getAttribute(attr) : null;
        if (!attr || !element || !element.hasAttribute || !element.hasAttribute(attr)) return null;
        const atrValue = element.getAttribute(attr)
        if (!ARIADefinitions.referenceProperties.includes(attr))
            return atrValue;
        
        //attr is a reference to other elements(s)
        const values = atrValue.split(/ +/g);
        //ignore if none of the referred element(s) exist or all point to the element itself
        let exist = false;
        for (let id=0; values < values.length; ++id) {
            const referred = document.getElementById(values[id]);
            if (referred && !DOMUtil.sameNode(referred, element)) {
                exist = true;
                break;
            }
        }
        return exist ? atrValue : null;   
    }

    // Return true if the element has an ARIA label
    public static hasAriaLabel(element) {

        // Rpt_Aria_ValidIdRef determines if the aria-labelledby id points to a valid element
        return RPTUtil.attributeNonEmpty(element, "aria-label") || RPTUtil.attributeNonEmpty(element, "aria-labelledby");
    }

    // Return true if element has valid implicit label
    public static hasImplicitLabel(element) {
        let parentNode = RPTUtil.getAncestor(element, "label");
        // Test  a) if the parent is a label which is the implicit label
        //       b) if the form element is the first child of the label
        //       c) if the form element requires an implicit or explicit label : "input",  "textarea", "select", "keygen", "progress", "meter", "output"
        //       d) form elements which may have a label: button
        // form elements that do not require implicit or explicit label element are:
        // "optgroup", "option", "datalist"(added later). These were handled differently in the main rule, might need to refactor the code later

        if (parentNode && parentNode.tagName.toLowerCase() === "label" && RPTUtil.isFirstFormElement(parentNode, element)) {
            let parentClone = parentNode.cloneNode(true);
            // exclude all form elements from the label since they might also have inner content
            parentClone = RPTUtil.removeAllFormElementsFromLabel(parentClone);
            return RPTUtil.hasInnerContentHidden(parentClone);
        } else {
            return false;
        }
    }

    public static isFirstFormElement(parentNode, element) {
        let formElementsRequiringLabel = ["input", "textarea", "select", "keygen", "progress", "meter", "output"];
        if (parentNode.firstChild != null) {
            let nw = new NodeWalker(parentNode);
            while (nw.nextNode()) {
                if (formElementsRequiringLabel.indexOf(nw.node.nodeName.toLowerCase()) !== -1) {
                    return nw.node === element;
                }
            }
        }
        return false;
    }

    // check if the element is a shadow host or descendant of a shadow host, but not a descedant of the shadow root of the host (to be assigned to shadow slot or ignored)  
    public static isShadowHostElement(element: Element) {
        if (RPTUtil.isShadowElement(element)) 
            return false;
        let walkNode : Element = element;
        while (walkNode) {
            if (walkNode.shadowRoot) return true;
            walkNode = DOMWalker.parentElement(walkNode);
        }
        return false;
    }

    //check if an element is in a shadow tree
    public static isShadowElement(element: Element) {
        let root  = element.getRootNode();
        if (root.toString() === "[object ShadowRoot]")
            return true;
        return false;
    }

    public static removeAllFormElementsFromLabel(element) {
        let formElements = ["input", "textarea", "select", "button", "datalist", "optgroup", "option", "keygen", "output", "progress", "meter"];
        let childNodes = element.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            if (formElements.indexOf(childNodes[i].nodeName.toLowerCase()) > -1) {
                element.removeChild(childNodes[i]);
            }
        }
        return element;
    }

    // Given an array of elements, return true if the elements have unique ARIA labels
    public static hasUniqueAriaLabelsLocally(elements, isGlobal) {
        if (elements.length === 0) return false;
        let doc = elements[0].ownerDocument;
        let hasDuplicateLabels = false;
        let uniqueAriaLabels = null;

        if (isGlobal) {
            uniqueAriaLabels = getCache(doc, "RPTUtil_HAS_UNIQUE_ARIA_LABELS", null);
        }
        if (uniqueAriaLabels === null) {
            uniqueAriaLabels = {};
        }

        for (let i = 0; !hasDuplicateLabels && i < elements.length; ++i) {

            if (elements[i].hasAttribute) {

                if (elements[i].hasAttribute("aria-label")) {

                    let ariaLabel = RPTUtil.normalizeSpacing(elements[i].getAttribute("aria-label")).toLowerCase();
                    hasDuplicateLabels = ariaLabel in uniqueAriaLabels;
                    uniqueAriaLabels[ariaLabel] = true;

                } else if (elements[i].hasAttribute("aria-labelledby")) {

                    let labelID = elements[i].getAttribute("aria-labelledby");
                    let labelNode = FragmentUtil.getById(elements[i], labelID);
                    let label = labelNode && !DOMUtil.sameNode(labelNode, elements[i]) ? RPTUtil.getInnerText(labelNode) : "";
                    let normalizedLabel = RPTUtil.normalizeSpacing(label).toLowerCase();
                    hasDuplicateLabels = normalizedLabel in uniqueAriaLabels;
                    uniqueAriaLabels[normalizedLabel] = true;

                } else {
                    // Has no label at all
                    hasDuplicateLabels = true;
                }
            }
        }
        if (isGlobal) {
            setCache(doc, "RPTUtil_HAS_UNIQUE_ARIA_LABELS", uniqueAriaLabels);
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
                    let label = labelNode && !DOMUtil.sameNode(labelNode, ele) ? RPTUtil.getInnerText(labelNode) : "";
                    normalizedLabel += RPTUtil.normalizeSpacing(label).toLowerCase();
                }
                return normalizedLabel.trim();
            } else if (ele.hasAttribute("aria-label")) {
                return RPTUtil.normalizeSpacing(ele.getAttribute("aria-label")).toLowerCase().trim();
            }
        }
        if (ele.nodeName.toLowerCase() === "input") {
            //const label = RPTUtil.getLabelForElement(ele);
            const label = RPTUtil.getLabelForElementHidden(ele, true);
            if (!label) return "";
            return (RPTUtil.getAriaLabel(label) || label.innerText || "").trim();
        }
        return "";
    }

    /**
     * @param element 
     * @param idStr 
     * @returns true if any one (if multiple Ids) id points to itself
     */
    public static isIdReferToSelf(element, idStr:String) {
        if (!idStr || idStr.trim() === '') return false;
        let ids = idStr.trim().split(" ");
        for (let j = 0, length = ids.length; j < length; ++j) {
            let referredNode = FragmentUtil.getById(element, ids[j]);
            if (referredNode && DOMUtil.sameNode(referredNode, element)) return true;
        }
        return false;   
    }

    public static findAriaLabelDupes(elements) {
        let dupeMap = {}
        elements.forEach(function (ele) {
            dupeMap[RPTUtil.getAriaLabel(ele)] = (dupeMap[RPTUtil.getAriaLabel(ele)] || 0) + 1;
        })
        return dupeMap;
    }

    // Given an array of elements, return true if the elements have unique ARIA labels globally
    public static hasUniqueAriaLabels(elements) {
        return RPTUtil.hasUniqueAriaLabelsLocally(elements, true);
    }

    // Given an array of elements, return true if the elements have unique ARIA labels
    public static hasDuplicateAriaLabelsLocally(elements, isGlobal) {
        if (elements.length === 0) return false;
        let doc = elements[0].ownerDocument;

        let hasDuplicateLabels = false;
        let uniqueAriaLabels: { [key: string]: boolean } = null;
        let duplicateLabelNameArray = new Array();

        if (isGlobal) {
            uniqueAriaLabels = getCache(doc, "RPTUtil_HAS_UNIQUE_ARIA_LABELS", null);
        }
        if (uniqueAriaLabels === null) {
            uniqueAriaLabels = {};
        }

        for (let i = 0; i < elements.length; ++i) {

            if (elements[i].hasAttribute) {

                if (elements[i].hasAttribute("aria-label")) {

                    let ariaLabel = RPTUtil.normalizeSpacing(elements[i].getAttribute("aria-label")).toLowerCase();
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
                        let label = labelNode && !DOMUtil.sameNode(labelNode, elements[i]) ? RPTUtil.getInnerText(labelNode) : "";
                        normalizedLabel += RPTUtil.normalizeSpacing(label).toLowerCase();
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
            setCache(doc, "RPTUtil_HAS_UNIQUE_ARIA_LABELS", uniqueAriaLabels);
        }
        return duplicateLabelNameArray;
    }

    // Given an array of elements, return true if the elements have unique ARIA labels globally
    public static hasDuplicateAriaLabels(elements) {
        return RPTUtil.hasDuplicateAriaLabelsLocally(elements, true);
    }

    // Given an array of elements, return true if the elements have unique aria-labelledby attributes
    public static hasUniqueAriaLabelledby(elements) {

        let hasDuplicateLabels = false;
        let labelRefs = {};

        for (let i = 0; !hasDuplicateLabels && i < elements.length; ++i) {

            if (elements[i].hasAttribute && elements[i].hasAttribute("aria-labelledby") && !RPTUtil.isIdReferToSelf(elements[i],elements[i].getAttribute("aria-labelledby"))) {
                let labelRef = RPTUtil.normalizeSpacing(elements[i].getAttribute("aria-labelledby"));
                hasDuplicateLabels = labelRef in labelRefs;
                labelRefs[labelRef] = true;
            } else {
                hasDuplicateLabels = true;
            }
        }
        return !hasDuplicateLabels;
    }

    /* Determine the node depth of the given element */
    public static nodeDepth(element) {
        let depth = 0;
        let walkNode = element;
        while (walkNode !== null) {
            walkNode = DOMWalker.parentNode(walkNode);
            depth = depth + 1;
        }
        return depth;
    }

    /* compare node order of the 2 given nodes */
    /* returns
     *   0 if the nodes are equal
     *   1 if node b is before node a
     *  -1 if node a is before node b
     *   2 if node a is nested in node b
     *  -2 if node b is nested in node a
     *   null if either node is null or their parent nodes are not equal
     */
    public static compareNodeOrder(nodeA, nodeB) {
        if (nodeA === nodeB) return 0;

        let aDepth = RPTUtil.nodeDepth(nodeA);
        let bDepth = RPTUtil.nodeDepth(nodeB);
        if (bDepth > aDepth) {
            for (let i = 0; i < bDepth - aDepth; ++i)
                nodeB = DOMWalker.parentNode(nodeB);
            if (nodeA === nodeB) // Node B nested in Node A
                return -2;
        } else if (aDepth > bDepth) {
            for (let i = 0; i < aDepth - bDepth; ++i)
                nodeA = DOMWalker.parentNode(nodeA);
            if (nodeA === nodeB) // Node A nested in Node B
                return 2;
        }
        while (nodeA != null && nodeB != null && DOMWalker.parentNode(nodeA) != DOMWalker.parentNode(nodeB)) {
            nodeA = DOMWalker.parentNode(nodeA);
            nodeB = DOMWalker.parentNode(nodeB);
        }
        if (nodeA === null || nodeB === null || DOMWalker.parentNode(nodeA) != DOMWalker.parentNode(nodeB)) return null;
        while (nodeB != null && nodeB != nodeA)
            nodeB = nodeB.previousSibling;
        if (nodeB === null) // nodeB before nodeA
            return 1;
        else return -1;
    }

    /**
     *  Determine if the given attribute of the given element is not empty
     *  @memberOf RPTUtil
     */
    public static attributeNonEmpty(element, attrStr) {
        return element.hasAttribute(attrStr) && element.getAttribute(attrStr).trim().length > 0;
    }

    /* Return a pointer to the given frame, null if not found */
    public static getFrameByName(ruleContext,frameName) {
        let window = ruleContext.ownerDocument.defaultView;
        let frameList = [window];
        let idx = 0;
        while (idx < frameList.length) {
            try {
                if (frameList[idx].name === frameName) return frameList[idx];
                for (let i = 0; i < frameList[idx].frames.length; ++i) {
                    try {
                        // Ensure it's a real frame and avoid recursion
                        if (frameList[idx].frames[i] && !frameList.includes(frameList[idx].frames[i])) {
                            frameList.push(frameList[idx].frames[i]);
                        }
                    } catch (e) {}
                }
            } catch (e) {}
            ++idx;
        }
        return null;
    }

    public static defaultNSResolver(prefix){
        let uri;
        switch (prefix) {
            case 'html':
                uri = 'http://www.w3.org/1999/xhtml';
            case 'x2':
                uri = 'http://www.w3.org/TR/xhtml2';
            case 'x':
                uri = 'http://www.w3.org/1999/xhtml';
            case 'xhtml':
                uri = 'http://www.w3.org/1999/xhtml';
            default:
                uri = null;
        }
        return uri;
    }

    //checking if only the inner text is empty or not
    public static isInnerTextOnlyEmpty(element) {
        // Get the innerText of the element
        let text = element.innerText;
        
        if ((text === undefined || text === null || text.trim().length === 0) && element.nodeName.toLowerCase() !== 'slot' && element.textContent !== undefined) {
            //ignore slot because its text will be filled by the corresponding content in the light DOM 
            // innerText is sometimes 'undefined' in headless mode, or null if the element is invisible or not erxpanded 
            // so we try textContent as a workaround
            text = element.textContent
        }
        
        let retVal = !(text !== null && text.trim().length > 0);
        if (element.nodeType === 1 && element.nodeName.toLowerCase() === "slot") {
            //TODO: need to conside its own content, a slot may have its own content or assigned content
            for (const slotElem of element.assignedNodes()) {
                retVal = retVal && RPTUtil.isInnerTextEmpty(slotElem);
            }
        }

        // Trim the inner text and verify that it is not empty.
        return retVal;
    }

    /* Return the inner text of the given element */
    public static getInnerText(element) {
        let retVal = element.innerText;
        if (retVal === undefined || retVal === null || retVal.trim() === "")
            retVal = element.textContent;
        return retVal;
    }

    /** Return the text content of the given node 
     *  this is different than innerText or textContent that return text content of a node and its descendants
    */
    public static getNodeText(element) {
        if (!element) return "";
        let text = "";
        let childNodes = element.childNodes;
        for (let i = 0; i < childNodes.length; ++i) {
            if (childNodes[i].nodeType == 3) {
                text += childNodes[i].nodeValue;
            }
        }
        return text;
    }

    /**
     * This function is responsible for checking if elements inner text is empty or not.
     *
     * @parm {element} node The node which should be checked it has inner text or not.
     * @return {bool} true if element has empty inner text, false otherwise
     *
     * @memberOf RPTUtil
     */
    public static isInnerTextEmpty(element) {
        // Get the innerText of the element
        let text = RPTUtil.getInnerText(element);

        // Trim the inner text and verify that it is not empty.
        return !(text != null && text.trim().length > 0);
    }

    public static hasInnerContent(element) {
        let text = RPTUtil.getInnerText(element);
        let hasContent = (text != null && text.trim().length > 0);

        if (element.firstChild != null) {
            let nw = new NodeWalker(element);
            while (!hasContent && nw.nextNode()) {
                hasContent = (nw.node.nodeName.toLowerCase() === "img" &&
                    RPTUtil.attributeNonEmpty(nw.node, "alt"));
            }
        }
        return hasContent;
    }

    /**
     * This function is responsible for determine if an element has inner content.
     * This function also considers cases where inner text is hidden, which now will
     * be classified as does not have hidden content.
     *
     * @parm {element} node The node which should be checked it has inner text or not.
     * @return {bool} true if element has empty inner text, false otherwise
     *
     * @memberOf RPTUtil
     */
    public static hasInnerContentHidden(element) {
        return RPTUtil.hasInnerContentHiddenHyperLink(element, false);
    }

    public static svgHasName(element: SVGElement) {
        return RPTUtil.attributeNonEmpty(element, "aria-label")
            || RPTUtil.attributeNonEmpty(element, "aria-labelledby")
            || !!element.querySelector(":scope > title");
    }

    public static hasInnerContentHiddenHyperLink(element, hyperlink_flag) {
        if (!element) return false;
        // Variable Decleration
        let childElement = element.firstElementChild;
        let hasContent = false;

        // In the case that the childElement is not null then we need to check each of the elements
        // to make sure that the elements are not all hidden.
        if (childElement != null) {
            // Get the nodewalter of the element node, so that we can loop over it and verify
            // that the elements under the element are not completly hidden.
            let nw = new NodeWalker(element);

            // Loop over all the nodes until there are no more nodes or we have determine that there is content under
            // this parent element.
            while (!hasContent && nw.nextNode() && nw.node != element) {
                // Get the next node
                let node = nw.node;

                // In the case an img element is present with alt then we can mark this as pass
                // otherwise keep checking all the other elements. Make sure that this image element is not hidden.
                hasContent = (
                    node.nodeName.toLowerCase() === "img"
                    && (RPTUtil.attributeNonEmpty(node, "alt") || RPTUtil.attributeNonEmpty(node, "title"))
                    && VisUtil.isNodeVisible(node)
                ) || (
                    node.nodeName.toLowerCase() === "svg"
                    && RPTUtil.svgHasName(node as any)
                );
                
                // Now we check if this node is of type element, visible
                if (!hasContent && node.nodeType === 1 && VisUtil.isNodeVisible(node)) {
                    // Check if the innerText of the element is empty or not
                    hasContent = !RPTUtil.isInnerTextOnlyEmpty(node);
                    if (!hasContent && hyperlink_flag === true) {
                        hasContent = RPTUtil.attributeNonEmpty(node, "aria-label") || RPTUtil.attributeNonEmpty(node, "aria-labelledby");
                        let doc = node.ownerDocument;
                        if (doc) {
                            let win = doc.defaultView;
                            if (win) {
                                let cStyle = win.getComputedStyle(node as any);
                                if (!hasContent && cStyle != null) {
                                    //                                       console.log(cStyle.backgroundImage);
                                    //                                       console.log(cStyle.content)
                                    hasContent = ((cStyle.backgroundImage && cStyle.backgroundImage.indexOf) || cStyle.content) && RPTUtil.attributeNonEmpty(node, "alt");
                                }
                            }
                        }

                    }
                }

                // Check for cases where there is text node after an element under the parent
                // In the case we detect nodetype as text node and the patent of the text node is
                // the same element we are checking has Inner content for then get the inner content of this
                // text node.
                if (node.nodeType === 3 && DOMWalker.parentElement(node) === element) {
                    // Check if the innerText of the element is empty or not
                    hasContent = !RPTUtil.isInnerTextEmpty(node);
                }
            }
        }
        // In the case there are no child elements then we can simply perform the check for only innertext
        // the img with alt case will be covered in the above if, as img is considers as an element.
        else {
            // Check if the innerText of the element is empty or not
            hasContent = !RPTUtil.isInnerTextEmpty(element);
        }

        return hasContent;
    }

    public static hasInnerContentOrAlt(element) {
        let text = RPTUtil.getInnerText(element);
        let hasContent = (text != null && text.trim().length > 0) || RPTUtil.attributeNonEmpty(element, "alt");

        if (element.firstChild != null) {
            let nw = new NodeWalker(element);
            while (!hasContent && nw.nextNode() && nw.node != element) {
                hasContent = (nw.node.nodeName.toLowerCase() === "img" &&
                    RPTUtil.attributeNonEmpty(nw.node, "alt"));
                if (!hasContent
                    && (RPTUtil.hasRole(nw.node, "button", true) || RPTUtil.hasRole(nw.node, "textbox"))
                    && (RPTUtil.hasAriaLabel(nw.node) || RPTUtil.attributeNonEmpty(nw.node, "title") || RPTUtil.getLabelForElementHidden(nw.elem(), true)))
                {
                    hasContent = true;
                }

            }
        }
        return hasContent;
    }

    public static concatUniqueArrayItem(item: string, arr: string[]) : string[] {
        arr.indexOf(item) === -1 && item !== null ? arr.push(item) : false;
        return arr;
    }

    public static concatUniqueArrayItemList(itemList: string[], arr: string[]) : string[] {
        for (let i = 0; itemList !== null && i < itemList.length; i++) {
            arr = RPTUtil.concatUniqueArrayItem(itemList[i], arr);
        }
        return arr;
    }

    /**
     * remove array items from a given array
     * @param itemList items to be removed from arr
     * @param arr the array
     * @returns 
     */
    public static reduceArrayItemList(itemList: string[], arr: string[]) : string[] {
        if (arr && arr.length > 0 && itemList && itemList.length > 0) {
            let result = arr.filter((value) =>  {
                return !itemList.includes(value);
            });
            return result;
        }
        return arr;
    }

    /**
     * this function is responsible for resolving ARIA requirements for an HTML element per ARIA in HTML
     * @param ruleContext the HTML element to be examined
     * @returns 
     */
    public static getElementAriaProperty(ruleContext) {
        let tagProperty : IDocumentConformanceRequirement = getCache(ruleContext, "RPTUtil_ElementAriaProperty", null);
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
                        RPTUtil.attributeNonEmpty(ruleContext, "href") ? tagProperty = specialTagProperties["with-href"] : tagProperty = specialTagProperties["without-href"];
                        break;
                    case "area":
                        RPTUtil.attributeNonEmpty(ruleContext, "href") ? tagProperty = specialTagProperties["with-href"] : tagProperty = specialTagProperties["without-href"];
                        break;
                    case "figure": {
                        let fcs = RPTUtil.getChildByTag(ruleContext, "figcaption");
                        fcs !== null && fcs.length > 0 ? tagProperty = specialTagProperties["child-figcaption"] : tagProperty = specialTagProperties["no-child-figcaption"];
                        break;
                    }
                    case "footer": 
                    case "header":
                        if (RPTUtil.getAncestorWithRole(ruleContext, "article", true) !== null || RPTUtil.getAncestorWithRole(ruleContext, "complementary", true) !== null
                        || RPTUtil.getAncestorWithRole(ruleContext, "navigation", true) !== null || RPTUtil.getAncestorWithRole(ruleContext, "region", true) !== null
                        || RPTUtil.getAncestor(ruleContext, ["article", "aside", "main", "nav", "section"]) !== null)
                        tagProperty = specialTagProperties["des-section-article-aside-main-nav"];
                        else
                            tagProperty = specialTagProperties["other"];   
                        break;
                    case "img":
                        let alt = ruleContext.hasAttribute("alt") ? ruleContext.getAttribute("alt") : null;
                        let title = ruleContext.hasAttribute("title") ? ruleContext.getAttribute("title") : null;
                        if ( RPTUtil.getAriaLabel(ruleContext).trim().length !== 0 || (alt !== null && alt.length > 0) || (title !== null && title.length > 0)) {
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
                        if (RPTUtil.attributeNonEmpty(ruleContext, "type")) {
                            let type = ruleContext.getAttribute("type").trim().toLowerCase();
                            tagProperty = specialTagProperties[type];
                            if (tagProperty === null || tagProperty === undefined) {
                                switch (type) {
                                    case "checkbox":
                                        RPTUtil.attributeNonEmpty(ruleContext, "aria-pressed") ? tagProperty = specialTagProperties["checkbox-with-aria-pressed"] : tagProperty = specialTagProperties["checkbox-without-aria-pressed"];
                                        break;
                                    case "email":
                                        RPTUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["email-with-list"] : tagProperty = specialTagProperties["email-no-list"];
                                        break;
                                    case "search":
                                        RPTUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["search-with-list"] : tagProperty = specialTagProperties["search-no-list"];
                                        break;
                                    case "tel":
                                        RPTUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["tel-with-list"] : tagProperty = specialTagProperties["tel-no-list"];
                                        break;
                                    case "text":
                                        RPTUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["text-with-list"] : tagProperty = specialTagProperties["text-no-list"];
                                        break;
                                    case "url":
                                        RPTUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["url-with-list"] : tagProperty = specialTagProperties["url-no-list"];
                                        break;
                                    default:
                                        // default
                                        RPTUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["default-with-list"] : tagProperty = specialTagProperties["default-no-list"];
                                        break;
                                }
                            }
                        } else {
                            // default type is the same as type=text
                            RPTUtil.attributeNonEmpty(ruleContext, "list") ? tagProperty = specialTagProperties["text-with-list"] : tagProperty = specialTagProperties["text-no-list"];
                        }
                        break;
                    case "li":
                        specialTagProperties = ARIADefinitions.documentConformanceRequirementSpecialTags["li"];
                        if (ruleContext.parentElement && RPTUtil.hasRoleInSemantics(ruleContext.parentElement, "list"))
                            tagProperty = specialTagProperties["child-of-list-role"];
                        else
                            tagProperty = specialTagProperties["no-child-of-list-role"];
                        break;
                    case "section":
                        name = ARIAMapper.computeName(ruleContext);
                        if (name && name.trim().length > 0) {
                            tagProperty = specialTagProperties["with-name"];
                        } else {
                            tagProperty = specialTagProperties["without-name"];
                        }
                        break;    
                    case "select":
                        specialTagProperties = ARIADefinitions.documentConformanceRequirementSpecialTags["select"];
                        if (ruleContext.hasAttribute("multiple") ||
                            RPTUtil.attributeNonEmpty(ruleContext, "size") && ruleContext.getAttribute("size") > 1)
                            tagProperty = specialTagProperties["multiple-attr-size-gt1"];
                        else
                            tagProperty = specialTagProperties["no-multiple-attr-size-gt1"];
                        break;
                    case "summary":
                        specialTagProperties = ARIADefinitions.documentConformanceRequirementSpecialTags["summary"];
                        if (ruleContext.parentElement && ruleContext.parentElement.nodeName.toLowerCase() === 'details' 
                            && DOMUtil.sameNode([...ruleContext.parentElement.children].filter(elem=>elem.nodeName.toLowerCase() === 'summary')[0], ruleContext))
                            tagProperty = specialTagProperties["first-summary-of-detail"];
                        else
                            tagProperty = specialTagProperties["no-first-summary-of-detail"];
                        break;
                    case "tbody":
                    case "td":
                    case "tr":
                        if (RPTUtil.getAncestorWithRole(ruleContext, "table", true) !== null) {
                            tagProperty = specialTagProperties["des-table"];
                        } else {
                            RPTUtil.getAncestorWithRole(ruleContext, "grid", true) || RPTUtil.getAncestorWithRole(ruleContext, "treegrid", true) ? tagProperty = specialTagProperties["des-grid"] : tagProperty = specialTagProperties["des-other"];
                        }
                        break;
                    case "th":
                        if (RPTUtil.getAncestorWithRole(ruleContext, "table", true) !== null || RPTUtil.getAncestorWithRole(ruleContext, "grid", true) !== null || RPTUtil.getAncestorWithRole(ruleContext, "treegrid", true) !== null) {
                            const scope = RPTUtil.getScopeForTh(ruleContext);
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
        setCache(ruleContext, "RPTUtil_ElementAriaProperty", tagProperty);
        return tagProperty || null;
    }

    public static getScopeForTh(element) {
        /** https://www.w3.org/TR/html5/tabular-data.html#header-and-data-cell-semantics
         * A header cell anchored at the slot with coordinate (x, y) with width width and height height is 
         * said to be a column header if any of the following conditions are true:
         * * The cell's scope attribute is in the column state, or
         * * The cell's scope attribute is in the auto state, and there are no data cells in any of 
         *   the cells covering slots with y-coordinates y .. y+height-1.
         * A header cell anchored at the slot with coordinate (x, y) with width width and height height is
         * said to be a row header if any of the following conditions are true:
         * * The cell's scope attribute is in the row state, or
         * * The cell's scope attribute is in the auto state, the cell is not a column header, and there are
         *   no data cells in any of the cells covering slots with x-coordinates x .. x+width-1.
         */
        // Note: auto is default scope
        
        // Easiest answer is if scope is specified
        if (element.hasAttribute("scope")) {
            let scope = element.getAttribute("scope").toLowerCase();
            if (scope === "row" || scope === 'rowgroup') return "row";
            if (scope === "col" || scope === 'colgroup') return "column";
        }
        
        // scope is auto, default (without a scope) or invalid value.
        // if all the sibling elements are th, then return "columnheader" 
        var siblings = element => [...element.parentElement.children].filter(node=>node.nodeType === 1 && node.tagName != "TH");
        if (siblings === null || siblings.length === 0)
            return "column"; 
        else return "row";
    }

    public static getAllowedAriaRoles(ruleContext, properties: IDocumentConformanceRequirement) {
        let allowedRoles : string[] = getCache(ruleContext, "RPTUtil_AllowedAriaRoles", null);
        if (!allowedRoles) {
            allowedRoles = [];
            let tagProperty : IDocumentConformanceRequirement = null;
            if (properties !== null && properties !== undefined) {
                tagProperty = properties;
            } else {
                tagProperty = RPTUtil.getElementAriaProperty(ruleContext);
            }

            if (tagProperty !== null && tagProperty !== undefined) {
                if (tagProperty.implicitRole !== null) {
                    RPTUtil.concatUniqueArrayItemList(tagProperty.implicitRole, allowedRoles);
                }
                if (tagProperty.validRoles !== null) {
                    RPTUtil.concatUniqueArrayItemList(tagProperty.validRoles, allowedRoles);
                }
                let implicitRoles = RPTUtil.getImplicitRole(ruleContext);
                if (implicitRoles && implicitRoles.length > 0) {
                    RPTUtil.concatUniqueArrayItemList(tagProperty.validRoles, allowedRoles);
                }
            }
            setCache(ruleContext, "RPTUtil_AllowedAriaRoles", allowedRoles);
        }
        return allowedRoles;
    }

    public static getAllowedAriaAttributes(ruleContext, roles, properties) {
        let allowedAttributes : string[] = getCache(ruleContext, "RPTUtil_AllowedAriaAttributes", null);
        if (!allowedAttributes) {
            allowedAttributes = [];
            let permittedRoles = [...roles];
            let tagName = ruleContext.tagName.toLowerCase();
            
            let prohibitedAttributes = [];
            // Element with a disabled attribute  https://www.w3.org/TR/html5/disabled-elements.html
            if (ARIADefinitions.elementsAllowedDisabled.indexOf(tagName) > -1) {
                // Use the aria-disabled attribute on any element that is allowed the disabled attribute in HTML5.
                allowedAttributes = RPTUtil.concatUniqueArrayItem("aria-disabled", allowedAttributes);
            }
            // Element with a required attribute http://www.the-art-of-web.com/html/html5-form-validation/
            if (ARIADefinitions.elementsAllowedRequired.indexOf(tagName) > -1) {
                // Use the aria-required attribute on any element that is allowed the required attribute in HTML5.
                allowedAttributes = RPTUtil.concatUniqueArrayItem("aria-required", allowedAttributes);
            }

            if (ARIADefinitions.elementsAllowedReadOnly.indexOf(tagName) > -1) {
                // Use the aria-readonly attribute on any element that is allowed the readonly attribute in HTML5.
                allowedAttributes = RPTUtil.concatUniqueArrayItem("aria-readonly", allowedAttributes);
            }
            
            let tagProperty = null;
            if (properties != null && properties !== undefined)
                tagProperty = properties;
            else
                tagProperty = RPTUtil.getElementAriaProperty(ruleContext);

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
                            RPTUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                            properties = RPTUtil.getRoleRequiredProperties(tagProperty.implicitRole[i], ruleContext);
                            RPTUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                            let prohibitedProps = roleProperty.prohibitedProps;
                            if (prohibitedProps && prohibitedProps.length > 0) 
                                RPTUtil.concatUniqueArrayItemList(prohibitedProps, prohibitedAttributes);
                            
                            // special case of separator
                            if (tagProperty.implicitRole[i] === "separator" && RPTUtil.isFocusable(ruleContext)) {
                                RPTUtil.concatUniqueArrayItemList(["aria-disabled", "aria-valuenow", "aria-valuemax", "aria-valuemin", "aria-valuetext"], allowedAttributes);
                            }
                        }
                    }
                }
                // Adding the global properties to the valid attribute list
                if (tagProperty.globalAriaAttributesValid) {
                    let properties = ARIADefinitions.globalProperties; // global properties
                    RPTUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                } 
            }
            // adding the other role to the allowed roles for the attributes
            if (tagProperty && tagProperty.otherRolesForAttributes && tagProperty.otherRolesForAttributes.length > 0)
                RPTUtil.concatUniqueArrayItemList(tagProperty.otherRolesForAttributes, permittedRoles);       
            // adding the specified role properties to the allowed attribute list
            for (let i = 0; permittedRoles !== null && i < permittedRoles.length; i++) {
                let roleProperties = ARIADefinitions.designPatterns[permittedRoles[i]];
                if (roleProperties !== null && roleProperties !== undefined) {
                    // ignore the properties if the element doesn't allow attributes from the implicit role
                    if (!tagProperty || tagProperty.implicitRole === null || !tagProperty.implicitRole.includes(permittedRoles[i]) || (tagProperty.implicitRole.includes(permittedRoles[i]) && tagProperty.allowAttributesFromImplicitRole === undefined)) {
                        let properties = roleProperties.props; // allowed properties
                        RPTUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                        properties = RPTUtil.getRoleRequiredProperties(permittedRoles[i], ruleContext); // required properties
                        RPTUtil.concatUniqueArrayItemList(properties, allowedAttributes);
                    }
                    let prohibitedProps = roleProperties.prohibitedProps;
                    if (prohibitedProps && prohibitedProps.length>0)
                        RPTUtil.concatUniqueArrayItemList(prohibitedProps, prohibitedAttributes);
                    // special case for separator
                    if (permittedRoles[i] === "separator" && RPTUtil.isFocusable(ruleContext)) {
                        RPTUtil.concatUniqueArrayItemList(["aria-disabled", "aria-valuemax", "aria-valuemin", "aria-valuetext"], allowedAttributes);
                    }
                }
            }
            
            // ignore aria-level, aria-setsize or aria-posinset if "row" is not in treegrid
            if (permittedRoles.includes("row") && RPTUtil.getAncestorWithRole(ruleContext, "treegrid", true) == null ) {
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
                for (let p=0; p < tagProperty.otherAllowedAriaAttributes.length; p++) {
                    const attr = tagProperty.otherAllowedAriaAttributes[p];
                    if (attr.includes("=")) {
                        const pair = attr.split("=");
                        if (ruleContext.getAttribute(pair[0]) === pair[1])
                            allowed.push(pair[0]);
                    } else
                        allowed.push(attr);
                } 
                if (allowed.length > 0)    
                    RPTUtil.concatUniqueArrayItemList(allowed, allowedAttributes);
            }
            // add the other prohibitted attributes for the element
            if (tagProperty && tagProperty.otherDisallowedAriaAttributes && tagProperty.otherDisallowedAriaAttributes.length > 0) {
                // check attribute-value pair if exists
                let disallowed = [];
                for (let p=0; p < tagProperty.otherDisallowedAriaAttributes.length; p++) {
                    const attr = tagProperty.otherDisallowedAriaAttributes[p];
                    if (attr.includes("=")) {
                        const pair = attr.split("="); 
                        if (ruleContext.getAttribute(pair[0]) === pair[1])
                            disallowed.push(pair[0]);
                    } else
                        disallowed.push(attr);
                }
                if (disallowed.length > 0)
                    RPTUtil.concatUniqueArrayItemList(disallowed, prohibitedAttributes);
            }
            //exclude the prohibitedAttributes from the allowedAttributes
            allowedAttributes = RPTUtil.reduceArrayItemList(prohibitedAttributes, allowedAttributes);

            //exclude aria attribute for elements without implicit role and with 'Naming Prohibited'
            if ((!roles || roles.length === 0) && tagProperty.implicitRole === null && tagProperty.prohibitedAriaAttributesWhenNoImplicitRole)
                allowedAttributes = RPTUtil.reduceArrayItemList(tagProperty.prohibitedAriaAttributesWhenNoImplicitRole, allowedAttributes);
            
            setCache(ruleContext, "RPTUtil_AllowedAriaAttributes", allowedAttributes);
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
            let examinedHtmlAtrNames = [];
            let ariaAttrValue = '';
            if (type === 'conflict') {
                if (!exist.conflict) return null;
                ariaAttrValue = exist.conflict.ariaAttributeValue;
            } else if (type === 'overlapping')  {
                if (!exist.overlapping) return null;
                ariaAttrValue = exist.overlapping.ariaAttributeValue; 
            } else
                return null;    
            if (ariaAttrValue === null || ariaAttrValue === 'VALUE' || ariaAttrValue === ariaAttr['value']) {
                let htmlAttrNames = [];
                let htmlAttrValues = [];
                if (type === 'conflict') {
                     htmlAttrNames = exist.conflict.htmlAttributeNames;
                     htmlAttrValues = exist.conflict.htmlAttributeValues;
                }  else {
                     htmlAttrNames = exist.overlapping.htmlAttributeNames;
                     htmlAttrValues = exist.overlapping.htmlAttributeValues;
                }    
                for (let i = 0; i < htmlAttrs.length; i++) { 
                    let index = htmlAttrNames.indexOf(htmlAttrs[i]['name']); 
                    if (index !== -1) { 
                        if (htmlAttrValues === null
                            || (ariaAttrValue === 'VALUE' && htmlAttrValues[index] === 'VALUE' && htmlAttrs[i]['value'] !== ariaAttr['value'])
                            || htmlAttrs[i]['value'] === htmlAttrValues[index]) {
                               examinedHtmlAtrNames.push({result: 'Failed', 'attr': htmlAttrs[i]['name']});
                               continue;
                        } else 
                            examinedHtmlAtrNames.push({result: 'Pass', 'attr': htmlAttrs[i]['name']});
                    }         
                }
            }
            return examinedHtmlAtrNames;
        } else
            return null;
    }

    public static containsPresentationalChildrenOnly(elem : HTMLElement) : boolean {
        let roles = RPTUtil.getRoles(elem, false);
        // if explicit role doesn't exist, get the implicit one
        if (!roles || roles.length === 0) 
            roles =  RPTUtil.getImplicitRole(elem);
        
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

    public static shouldBePresentationalChild(element : HTMLElement) : boolean {
        let walkNode : Element = DOMWalker.parentElement(element);
        while (walkNode) {
            if (RPTUtil.containsPresentationalChildrenOnly(walkNode as HTMLElement)) return true;

            //aria-own case: if the element is referred by an aria-won
            walkNode = ARIAMapper.getAriaOwnedBy(walkNode as HTMLElement) || DOMWalker.parentElement(walkNode);    
        }
        return false;
    }
    
    /** moved to CSSUtil
    public static CSS(element) {
        let styleText = "";
        if (element === null) return [];
        if (element.IBM_CSS_THB) return element.IBM_CSS_THB;
        let nodeName = element.nodeName.toLowerCase();
        if (nodeName === "style") {
            styleText = RPTUtil.getInnerText(element);
        } else if (element.hasAttribute("style")) {
            styleText = element.getAttribute("style");
        } else return [];
        if (styleText === null || styleText.trim().length === 0) return [];
        //remove comment blocks
        let re = /(\/\*+(?:(?:(?:[^\*])+)|(?:[\*]+(?!\/)))[*]+\/)|\/\/.* /g;
        let subst = ' ';
        styleText = styleText.replace(re, subst);
        // Find all "key : val;" pairs with various whitespace inbetween
        let rKeyVals = /\s*([^:\s]+)\s*:\s*([^;$}]+)\s*(;|$)/g;
        // Find all "selector { csskeyvals } with various whitespace inbetween
        let rSelectors = /\s*([^{]*){([^}]*)}/g;
        if (styleText.indexOf("{") === -1) {

            let keyVals = {};
            let m;
            while ((m = rKeyVals.exec(styleText)) != null) {
                keyVals[m[1]] = m[2].trim().toLowerCase();
            }
            let retVal = [{
                selector: null,
                values: keyVals
            }];
            element.IBM_CSS_THB = retVal;
            return retVal;
        } else {
            let retVal = [];
            let m;
            let m2;
            while ((m = rSelectors.exec(styleText)) != null) {
                let keyVals = {}
                let selKey = m[1];
                let selVal = m[2];

                while ((m2 = rKeyVals.exec(selVal)) != null) {
                    keyVals[m2[1]] = m2[2].trim().toLowerCase();
                }
                retVal.push({
                    selector: selKey,
                    values: keyVals
                });
            }
            element.IBM_CSS_THB = retVal;
            return retVal;
        }
    }
    */
    
    public static getControlOfLabel(node: Node) {
        // Handle the easy case of label -> for
        let labelAncestor = RPTUtil.getAncestor(node, "label");
        if (labelAncestor) {
            if (labelAncestor.hasAttribute("for")) {
                return FragmentUtil.getById(node, labelAncestor.getAttribute("for"));
            }
        }

        // Create a dictionary containing ids of parent nodes
        let idDict = {};
        let parentWalk = node;
        while (parentWalk) {
            if (parentWalk.nodeType === 1 /* Node.ELEMENT_NODE */) {
                const ancestor = parentWalk as Element;
                if (ancestor.hasAttribute("id")) {
                    idDict[ancestor.getAttribute("id")] = true;
                }
            }
            parentWalk = DOMWalker.parentNode(parentWalk);
        }

        // Iterate through controls that use aria-labelledby and see if any of them reference one of my ancestor ids
        const inputsUsingLabelledBy = node.ownerDocument.querySelectorAll("*[aria-labelledby]");
        for (let idx=0; idx<inputsUsingLabelledBy.length; ++idx) {
            const inputUsingLabelledBy = inputsUsingLabelledBy[idx];
            const ariaLabelledBy = inputUsingLabelledBy.getAttribute("aria-labelledby");
            const sp = ariaLabelledBy.split(" ");
            for (const id of sp) {
                if (id in idDict && !RPTUtil.isIdReferToSelf(node, (node as Element).getAttribute("aria-labelledby"))) {
                    return inputUsingLabelledBy;
                }
            }
        }

        // Find the cases where we're within an aria labelledby
        return null;
    }

    /**
     * This function is responsible for checking if the node that is provied is
     * disabled or not. Following is how the check is performed:
     *    1. Check if the current node is disabled with the following options:
     *       attribute --> disabled
     *         Also needs to be "button", "input", "select", "textarea", "optgroup", "option",
     *         "menuitem", "fieldset" nodes (in array elementsAllowedDisabled)
     *       attribute --> aria-disabled="true"
     *    2. Check if any of the current nodes parents are disabled with the same
     *       options listed in 1.
     *
     *    Note: If either current node or any of the parent nodes are disabled then this
     *          function will return true (node is disabled).
     *
     * @parm {HTMLElement} node - The node which should be checked if it is disabled or not.
     * @return {bool} true if the node is disabled, false otherwise
     *
     * @memberOf RPTUtil
     */
    public static isNodeDisabled(node) {

        // Set PT_NODE_DISABLED to false for all the nodes, before the check and this will be changed to
        // true when we detect that the node is disabled. We have to set it to false so that we know
        // the node has already been checked. Only set it to false if the setting is undefined or null
        // as if it is defined we do not wnat to reset it. As if it is true then we should make use of it
        // to speed up the check.
        let PT_NODE_DISABLED = getCache(node, "PT_NODE_DISABLED", false);

        // Check the nodeType of this node, if this node is a text node then
        // we get the parentnode and set that as the node as a text nodes,
        // disabled is directly related to the parent node.
        if (node.nodeType === 3) {
            node = DOMWalker.parentNode(node);
        }

        // Variable Declaration
        let nodeName = node.nodeName.toLowerCase();

        // Get the disabled element property, disabled and aria-disabled attribute and check that it is true
        let disabledAttribute = node.hasAttribute("disabled");
        let disabledPropertyCustom = PT_NODE_DISABLED;
        let ariaDisabledAttribute = node.hasAttribute('aria-disabled') && node.getAttribute("aria-disabled") === 'true';

        // If this node has disabled attribute and the node allows disabled attribute, then return true.
        // Disabled attribute is only allowed on "button", "input", "select", "textarea", "optgroup", "option", "menuitem", "fieldset"
        // In the case aria-disabled is set to true, then also return true
        if (disabledPropertyCustom || (disabledAttribute && ARIADefinitions.elementsAllowedDisabled.indexOf(nodeName) > -1) || ariaDisabledAttribute) {
            PT_NODE_DISABLED = true;
            setCache(node, "PT_NODE_DISABLED", PT_NODE_DISABLED);
            return true;
        }

        // Get the parentNode for this node, becuase we have to check all parents to make sure they do not have
        // disabled attribute. Only keep checking until we are all the way back to the parentNode
        // element.
        let parentElement = DOMWalker.parentNode(node);

        // If the parent node exists and the nodetype is element (1), then run recursive call to perform the check
        // all the way up to the very parent node. Use recursive call here instead of a while loop so that we do not
        // have to duplicate the logic for checking if the node is disabled or not for all the parents starting with
        // child node.
        if (parentElement != null && parentElement.nodeType === 1) {
            // Check upwards recursively, and save the results in an variable
            let nodeDisabled = RPTUtil.isNodeDisabled(parentElement);

            // If the node is found to be disabled then add the custom PT_NODE_DISABLED to true.
            // so that we can use this next time, to quickly determine if node is disabled or not.
            // This is extra percaution, the isNodeDisabled function already sets this.
            if (nodeDisabled) {
                PT_NODE_DISABLED = true;
            }

            // Check upwards recursively
            setCache(node, "PT_NODE_DISABLED", PT_NODE_DISABLED);
            return nodeDisabled;
        }

        // Return false (node is not disabled)
        return false;
    }

    /**
     * This function is responsible for determine if hidden content should be checked
     * in rules.
     *
     * @parm {element} node - A node so that the document can be accessed to check for the
     *                        option. Can be document element or a simple node element.
     * @return {bool} true if hidden content should be checked, false otherwise
     *
     * @memberOf RPTUtil
     */
    public static shouldCheckHiddenContent(node) {
        return false;
    }

    /**
     * This function is responsible for determining if node should be skipped from checking or not, based
     * on the Check Hidden Content settings and if the node is visible or not.
     *
     * @parm {element} node - Node to check if it is visible or not based on the Check Hidden Content
     *                        setting.
     *
     * @return {bool} true if node should be skipped, false otherwise
     *
     * @memberOf RPTUtil
     */
    public static shouldNodeBeSkippedHidden(node) {
        // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
        // or not.
        //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
        //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we
        //     return true to identify that the node should not be scanned/added to any hash/array.
        //
        // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
        //       so on and so forth.
        if (!RPTUtil.shouldCheckHiddenContent(node) && !VisUtil.isNodeVisible(node)) {
            return true;
        }

        return false;
    }

    public static isfocusableByDefault(node) {
        var focusableElements = ['input', 'select', 'button', 'textarea', 'option', 'area'];
        if (node.nodeName.toLowerCase() === "a" && RPTUtil.hasAttribute(node, 'href')) return true;
        if (node.nodeName.toLowerCase() === "area" && RPTUtil.hasAttribute(node, 'href')) return true;
        if (focusableElements.indexOf(node.nodeName.toLowerCase()) != -1) return true;
        return false;
    }

    /**
     * This function check if a non-tabable node has valid tabable content.
     * If it is tabable (the tabindex is not speicified or is not -1), returns false;
     * If it is non-tabable, but a child is tabable and does not have element content, returns false;
     * Otherwise, returns true.
     */
    public static nonTabableChildCheck(element : Element): boolean {
        if (!element.hasAttribute("tabindex") ||
            (parseInt(element.getAttribute("tabindex")) != -1)) {
            return false;
        }
        let nw = new NodeWalker(element);
        while (nw.nextNode()) {
            let child = nw.elem();
            if (child === null) { // Text node. usually is a cartridge return.
                continue;
            }
            if (child.hasAttribute("tabindex") &&
                (parseInt(child.getAttribute("tabindex")) != -1) &&
                !RPTUtil.hasInnerContent(child)) {
                return false;
            }
        }
        return true;
    }

    public static hasAttribute(element, attributeName) {
        var hasAttribute = false;
        if (element.hasAttribute) {
            hasAttribute = element.hasAttribute(attributeName);
        } else if (element.attributes && element.attributes.getNamedItem) {
            var attr = element.attributes.getNamedItem(attributeName);
            hasAttribute = attr && attr.specified;
        }
        return hasAttribute;
    }
}
/** moved to CSSUtil
export class RPTUtilStyle {
    public static getWeightNumber(styleVal) {
        let map = {
            "light": 100,
            "bold": 700
        };
        let retVal = parseInt(styleVal);
        if (retVal) return retVal;
        if (styleVal in map)
            return map[styleVal];
        return 400;
    }

    public static getFontInPixels = function (styleVal) {
        let map = {
            "xx-small": 16,
            "x-small": 10,
            "small": 13,
            "medium": 16,
            "large": 18,
            "x-large": 24,
            "xx-large": 32
        };
        let value = parseFloat(styleVal);
        if (!value) {
            return map[styleVal];
        }
        let units = styleVal.substring(("" + value).length);
        if (units === "" || units === "px") return value;
        if (units === "em") return value * 16;
        if (units === "%") return value / 100 * 16;
        if (units === "pt") return value * 4 / 3;
        return Math.round(value);
    }
}
*/
/* Return a node walker for the given element.
 * bEnd is optional and defaults to false
 * but if true, indicates the node is the end node*/
export class NodeWalker {
    node : Node;
    bEndTag : boolean;
    constructor(node: Node, bEnd?: boolean) {
        this.node = node;
        this.bEndTag = (bEnd === undefined ? false : bEnd === true);
    }

    elem() : HTMLElement | null {
        return this.node.nodeType === 1 && this.node as HTMLElement || null;
    }

    nextNode() {
        if (!this.node) {
            this.bEndTag = false;
            return false;
        }    
        if (!this.bEndTag) {
            let iframeNode = (this.node as HTMLIFrameElement);
            let elementNode = (this.node as HTMLElement);
            let slotElement = (this.node as HTMLSlotElement)
            if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */
                && this.node.nodeName.toUpperCase() === "IFRAME"
                && iframeNode.contentDocument
                && iframeNode.contentDocument.documentElement)
            {
                let ownerElement = this.node;
                this.node = iframeNode.contentDocument.documentElement;
                (this.node as any).nwOwnerElement = ownerElement;
            } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */
                && elementNode.shadowRoot
                && elementNode.shadowRoot.firstChild)
            {
                let ownerElement = this.node;
                this.node = elementNode.shadowRoot;
                (this.node as any).nwOwnerElement = ownerElement;
            } else if (this.node.nodeType === 1
                && elementNode.nodeName.toLowerCase() === "slot"
                && slotElement.assignedNodes().length > 0)
            {
                let slotOwner = this.node;
                this.node = slotElement.assignedNodes()[0];
                (this.node as any).nwSlotOwner = slotOwner;
                (this.node as any).nwSlotIndex = 0;
            } else if (this.node.firstChild) {
                this.node = this.node.firstChild;
            } else {
                this.bEndTag = true;
                return this.nextNode();
            }
        } else {
            if ((this.node as any).nwSlotOwner) {
                let slotOwner = (this.node as any).nwSlotOwner;
                let nextSlotIndex = (this.node as any).nwSlotIndex+1;
                delete (this.node as any).nwSlotOwner;
                delete (this.node as any).nwSlotIndex;
                if (nextSlotIndex < slotOwner.assignedNodes().length) {
                    this.node = slotOwner.assignedNodes()[nextSlotIndex];
                    (this.node as any).nwSlotOwner = slotOwner;
                    (this.node as any).nwSlotIndex = nextSlotIndex;    
                    this.bEndTag = false;
                } else {
                    this.node = slotOwner;
                    this.bEndTag = true;
                }
            } else if ((this.node as any).nwOwnerElement) {
                this.node = (this.node as any).nwOwnerElement;
                this.bEndTag = true;
            } else if (this.node.nextSibling) {
                this.node = this.node.nextSibling;
                this.bEndTag = false;
            } else if (this.node.parentNode) {
                this.node = this.node.parentNode;
                this.bEndTag = true;
            } else {
                return false;
            }
        }
        return true;
    }

    prevNode() {
        if (this.bEndTag && this.node.lastChild) {
            this.node = this.node.lastChild;
            this.bEndTag = true;
        } else if (this.node.previousSibling) {
            this.node = this.node.previousSibling;
            this.bEndTag = true;
        } else if (this.node.parentNode) {
            this.node = this.node.parentNode;
            this.bEndTag = false;
        } else {
            return false;
        }
        if (this.bEndTag && (this.node.firstChild === null || typeof (this.node.firstChild) === 'undefined'))
            this.bEndTag = false;
        return true;
    }
}
