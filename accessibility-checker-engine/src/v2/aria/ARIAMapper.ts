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

import { ARIADefinitions } from "./ARIADefinitions";
import { CommonMapper } from "../common/CommonMapper";
import { DOMUtil } from "../dom/DOMUtil";
import { DOMWalker } from "../dom/DOMWalker";
import { RPTUtil } from "../checker/accessibility/util/legacy"
import { FragmentUtil } from "../checker/accessibility/util/fragment";
type ElemCalc = (elem: Element) => string;
type NodeCalc = (node: Node) => string;

export class ARIAMapper extends CommonMapper {
    childrenHaveRole(node: Node, role: string) : boolean {
        // if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
        //     const elem = node as Element;
        //     if (elem.getAttribute("aria-hidden") === "true") {
        //         return false;
        //     }
        // }
        return !(role in ARIADefinitions.designPatterns && ARIADefinitions.designPatterns[role].presentationalChildren);
    }
    getRole(node: Node) : string {
        const role = ARIAMapper.nodeToRole(node);
        return role;
    }
    getNamespace(): string {
        return "aria"
    }
    getAttributes(node: Node) : { [key:string]: string } {
        let retVal = {};
        if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
            const elem = node as Element;
            for (let idx=0; idx<elem.attributes.length; ++idx) {
                const attrInfo = elem.attributes[idx];
                const name = attrInfo.name.toLowerCase();
                if (name.startsWith("aria-")) {
                    retVal[name.substring(5)] = attrInfo.nodeValue;
                }
            }

            let applyAttrRole= function(nodeName:string) {
                if (!(nodeName in ARIAMapper.elemAttrValueCalculators)) return;
                for (const attr in ARIAMapper.elemAttrValueCalculators[nodeName]) {
                    if (!(attr in retVal)) {
                        let value = ARIAMapper.elemAttrValueCalculators[nodeName][attr];
                        if (typeof value != "undefined" && value !== null) {
                            if (typeof value !== typeof "") {
                                value = (value as NodeCalc)(elem);
                            }
                            retVal[attr] = value;
                        }
                    } 
                }
            }
            applyAttrRole("global");
            applyAttrRole(node.nodeName.toLowerCase());
        } else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
            for (const attr in ARIAMapper.textAttrValueCalculators) {
                let val = ARIAMapper.textAttrValueCalculators[attr](node);
                if (typeof val != "undefined" && val !== null) {
                    retVal[attr] = val;
                }
            }
        }
        return retVal;
    }

    reset(node: Node) {
        ARIAMapper.nameComputationId = 0;
        super.reset(node);
    }

    ////////////////////////////////////////////////////////////////////////////
    // Helper functions
    ////

    // https://www.w3.org/TR/html-aam-1.0/#mapping-html-to-accessibility-apis
    public static elemAttrValueCalculators: { [nodeName:string]: { [attr:string]: string | ElemCalc }} = {
        "global": {
            "name": ARIAMapper.computeName
        }
        , "datalist": {
            // set to "true" if the datalist's selection model allows multiple option elements to be
            // selected at a time, and "false" otherwise
            "multiselectable": elem => {
                const id = elem.getAttribute("id");
                if (id && id.length > 0) {
                    let input = elem.ownerDocument.querySelector("input[list='"+id+"']");
                    return ""+(elem.getAttribute("multiple") 
                        && (elem.getAttribute("multiple")=="true" || elem.getAttribute("multiple")==""))
                }
                return null;
            }
        }
        , "h1": {
            "level": "1"
        }
        , "h2": {
            "level": "2"
        }
        , "h3": {
            "level": "3"
        }
        , "h4": {
            "level": "4"
        }
        , "h5": {
            "level": "5"
        }
        , "h6": {
            "level": "6"
        }
        , "input": {
            // - type="checkbox" state set to "mixed" if the element's indeterminate IDL attribute 
            // is true, or "true" if the element's checkedness is true, or "false" otherwise
            // - type="radio" state set to "true" if the element's checkedness is true, or "false" 
            // otherwise. 
            "checked": elem => { 
                if (elem.getAttribute("type") === "checkbox" || elem.getAttribute("type") === "radio") {
                    return ""+(elem as HTMLInputElement).checked;
                }
                return null;
            }
            // - type="radio" and not in menu reflecting number of type=radio input elements 
            // within the radio button group
            , "setsize": elem => { return null; throw new Error("NOT IMPLEMENTED"); }
            // - type="radio" and not in menu value reflecting the elements position 
            // within the radio button group."
            , "posinset": elem => { return null; throw new Error("NOT IMPLEMENTED"); }
            // input (type attribute in the Text, Search, Telephone, URL, or E-mail states with a 
            // suggestions source element) combobox role, with the aria-owns property set to the same
            // value as the list attribute
            , "owns": elem => { return null; throw new Error("NOT IMPLEMENTED"); }
        }
        , "keygen": {
            "multiselectable": "false"
        }
        , "li": {
            // Number of li elements within the ol, ul, menu
            "setsize": elem => {
                let parent = DOMUtil.getAncestor(elem, ["ol", "ul", "menu"]);
                if (!parent) return null;
                let lis = parent.querySelectorAll("li");
                let otherlis = parent.querySelectorAll("ol li, ul li, menu li");
                return ""+(lis.length-otherlis.length);
            }
            // Position of li element within the ol, ul, menu
            , "posinset": elem => {
                let parent = DOMUtil.getAncestor(elem, ["ol", "ul", "menu"])
                if (!parent) return null;
                let lis = parent.querySelectorAll("li");
                let num = 0;
                for (let idx=0; idx<lis.length; ++idx) {
                    const li = lis[idx];
                    if (DOMUtil.sameNode(parent, DOMUtil.getAncestor(li, ["ol", "ul", "menu"]))) {
                        return ""+num;
                    }
                    ++num;
                }
                return null;
            }
        }
        , "menuitem": {
            // type = checkbox or radio, set to "true" if the checked attribute 
            // is present, and "false" otherwise
            "checked": elem => ""+!!(elem.getAttribute("checked") 
                && (elem.getAttribute("checked")=="true" || elem.getAttribute("checked")==""))
        }
        , "option": {
            // set to "true" if the element's selectedness is true, or "false" otherwise.
            "selected": elem => ""+!!(elem.getAttribute("selected") 
                && (elem.getAttribute("selected")=="true" || elem.getAttribute("selected")==""))
        }
        , "progress": {
            "valuemax": elem => elem.getAttribute("max") || "1"
            , "valuemin": elem => "0"
            , "valuenow": elem => elem.getAttribute("value")
        }
        
    }
    public static textAttrValueCalculators: { [attr:string]: NodeCalc } = {
        "name": node => node.nodeValue
    }

    private static nameComputationId = 0;
    public static computeName(cur: Node) : string {
        ++ARIAMapper.nameComputationId;
        return ARIAMapper.computeNameHelp(ARIAMapper.nameComputationId, cur, false, false);
    }

    public static computeNameHelp(walkId: number, cur: Node, labelledbyTraverse: boolean, walkTraverse: boolean) : string {
        // 2g. None of the other content applies to text nodes, so just do this first
        if (cur.nodeType === 3 /* Node.TEXT_NODE */) return cur.nodeValue;
        if (cur.nodeType === 11) return "";
        if (cur.nodeType !== 1 /* Node.ELEMENT_NODE */) {
            if (walkTraverse || labelledbyTraverse) return "";
            throw new Error ("Can only compute name on Element and Text" + cur.nodeType);
        }

        const elem = cur as Element;
        // We've been here before - prevent recursion
        if (RPTUtil.getCache(elem, "data-namewalk", null) === ""+walkId) return "";
        RPTUtil.setCache(elem, "data-namewalk", ""+walkId);
        // See https://www.w3.org/TR/html-aam-1.0/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-url-and-textarea-element

        // 2a. Only show hidden content if it's referenced by a labelledby
        if (!labelledbyTraverse && !DOMUtil.isNodeVisible(cur)) {
            return "";
        }

        // 2b. collect valid id references
        if (!labelledbyTraverse && elem.hasAttribute("aria-labelledby")) {
            let labelledby = elem.getAttribute("aria-labelledby").split(" ");
            let validElems = [];
            for (const ref of labelledby) {
                const refElem = FragmentUtil.getById(cur, ref);
                if (refElem) {
                    validElems.push(refElem);
                }
            }
            if (validElems.length > 0) {
                let accumulated = "";
                for (const elem of validElems) {
                    accumulated += " " + this.computeNameHelp(walkId, elem, true, false);
                }
                return accumulated.trim();
            }
        }
        // 2c. If label or walk, and this is a control, skip to the value, otherwise provide the label
        const role = ARIAMapper.nodeToRole(cur);
        let isEmbeddedControl = [
            "textbox", "button", "combobox", "listbox", 
            "progressbar", "scrollbar", "slider", "spinbutton"
        ].includes(role);
        if (elem.hasAttribute("aria-label") && elem.getAttribute("aria-label").trim().length > 0) {
            // If I'm not an embedded control or I'm not recursing, return the aria-label
            if (!labelledbyTraverse && !walkTraverse || !isEmbeddedControl) {
                return elem.getAttribute("aria-label").trim();
            }
        }

        // 2d. 
        if (role !== "presentation" && role !== "none") {
            if ((cur.nodeName.toLowerCase() === "img" || cur.nodeName.toLowerCase() === "area") && elem.hasAttribute("alt")) {
                return DOMUtil.cleanWhitespace(elem.getAttribute("alt")).trim();
            }

            if (cur.nodeName.toLowerCase() === "input" && elem.hasAttribute("id") && elem.getAttribute("id").length > 0) {
                let label = elem.ownerDocument.querySelector("label[for='"+elem.getAttribute("id")+"']");
                if (label) {
                    return this.computeNameHelp(walkId, label, false, false);
                }
            }
        }

        // 2e.
        if ((walkTraverse || labelledbyTraverse) && isEmbeddedControl) {
            // If the embedded control has role textbox, return its value.
            if (role === "textbox") {
                if (elem.nodeName.toLowerCase() === "input") {
                    if (elem.hasAttribute("value")) return elem.getAttribute("value");
                } else {
                    walkTraverse = false;
                }
            }

            // If the embedded control has role button, return the text alternative of the button.
            if (role === "button") {
                if (elem.nodeName.toLowerCase() === "input") {
                    let type = elem.getAttribute("type").toLowerCase();
                    if (["button", "submit", "reset"].includes(type)) {
                        if (elem.hasAttribute("value")) return elem.getAttribute("value");
                        if (type === "submit") return "Submit";
                        if (type === "reset") return "Reset";
                    }
                } else {
                    walkTraverse = false;
                }
            }

            // TODO: If the embedded control has role combobox or listbox, return the text alternative of the chosen option.
            if (role === "combobox") {
                if (elem.hasAttribute("aria-activedescendant")) {
                    let selected = FragmentUtil.getById(elem, "aria-activedescendant");
                    if (selected) {
                        return ARIAMapper.computeNameHelp(walkId, selected, false, false);
                    }
                }
            }

            // If the embedded control has role range (e.g., a spinbutton or slider):
            if (["progressbar", "scrollbar", "slider", "spinbutton"].includes(role)) {
                // If the aria-valuetext property is present, return its value,
                if (elem.hasAttribute("aria-valuetext")) return elem.getAttribute("aria-valuetext");
                // Otherwise, if the aria-valuenow property is present, return its value,
                if (elem.hasAttribute("aria-valuenow")) return elem.getAttribute("aria-valuenow");
                // TODO: Otherwise, use the value as specified by a host language attribute.
            }
        }

        // 2f. 2h.
        if (walkTraverse || ARIADefinitions.nameFromContent(role) || labelledbyTraverse) {
            // 2fi. Set the accumulated text to the empty string.
            let accumulated = "";
            // 2fii. Check for CSS generated textual content associated with the current node and 
            // include it in the accumulated text. The CSS :before and :after pseudo elements [CSS2] 
            // can provide textual content for elements that have a content model.
            //   For :before pseudo elements, User agents MUST prepend CSS textual content, without 
            //     a space, to the textual content of the current node.
            //   For :after pseudo elements, User agents MUST append CSS textual content, without a 
            //     space, to the textual content of the current node.
            let before = null;
            before = elem.ownerDocument.defaultView.getComputedStyle(elem,"before").content;

            if (before && before !== "none") {
                before = before.replace(/^"/,"").replace(/"$/,"");
                accumulated += before;
            }
            // 2fiii. For each child node of the current node:
            //   Set the current node to the child node.
            //   Compute the text alternative of the current node beginning with step 2. Set the result 
            //     to that text alternative.
            //   Append the result to the accumulated text.
            let walkChild = elem.firstChild;
            while (walkChild) {
                accumulated += " " + ARIAMapper.computeNameHelp(walkId, walkChild, labelledbyTraverse, true);
                walkChild = walkChild.nextSibling;
            }

            let after = null;
            try {
                after = elem.ownerDocument.defaultView.getComputedStyle(elem,"after").content;
            } catch (e) {}

            if (after && after !== "none") {
                after = after.replace(/^"/,"").replace(/"$/,"");
                accumulated += after;
            }
            // 2fiv. Return the accumulated text.
            accumulated = accumulated.replace(/\s+/g," ").trim();
            if (accumulated.trim().length > 0) {
                return accumulated;
            }
        }

        // 2i. Otherwise, if the current node has a Tooltip attribute, return its value.
        if (elem.hasAttribute("title")) {
            return elem.getAttribute("title");
        }
        if (elem.tagName.toLowerCase() === "svg") {
            let title = elem.querySelector("title");
            if (title) {
                return title.textContent || title.innerText;
            }
        }

        return "";
    }

/*        if (role in ARIADefinitions.designPatterns
            && ARIADefinitions.designPatterns[role].nameFrom 
            && ARIADefinitions.designPatterns[role].nameFrom.includes("contents")) 
        {
            name = elem.textContent;
        }
        if (elem.nodeName.toLowerCase() === "input" && elem.hasAttribute("id") && elem.getAttribute("id").trim().length > 0) {
            name = elem.ownerDocument.querySelector("label[for='"+elem.getAttribute("id").trim()+"']").textContent;
        }
        if (elem.hasAttribute("aria-label")) {
            name = elem.getAttribute("aria-label");
        }
        if (elem.hasAttribute("aria-labelledby")) {
            name = "";
            const ids = elem.getAttribute("aria-labelledby").split(" ");
            for (const id of ids) {
                name += FragmentUtil.getById(elem, id).textContent + " ";
            }
            name = name.trim();
        }
        return name;
    }*/

    public static nodeToRole(node : Node) {
        if (node.nodeType === 3 /* Node.TEXT_NODE */) {
            return "text";
        } else if (node.nodeType !== 1 /* Node.ELEMENT_NODE */) {
            return null;
        }
        const elem = node as Element;
        if (!elem || elem.nodeType !== 1 /* Node.ELEMENT_NODE */) {
            return null;
        }
        if (elem.hasAttribute("role") && elem.getAttribute("role").trim().length > 0) {
            let roleStr = elem.getAttribute("role").trim();
            let roles = roleStr.split(" ");
            for (const role of roles) {
                if (role === "presentation" || role === "none") {
                    // If element is focusable, then presentation roles are to be ignored
                    if (!RPTUtil.isFocusable(elem)) {
                        return null;
                    }
                } else if (role in ARIADefinitions.designPatterns) {
                    return role;
                }    
            }
        }
        return this.elemToImplicitRole(elem);
    }

    public static elemToImplicitRole(elem : Element) {
        let nodeName = elem.nodeName.toLowerCase();

        if (!(nodeName in ARIAMapper.elemToRoleMap)) {
            return null;
        }
        let role = ARIAMapper.elemToRoleMap[nodeName];
        if (typeof role === "string") {
            return role;
        } else if (typeof role === "function") {
            return role(elem);
        } else {
            return null;
        }
    }

    public static hasParentRole(element, role) : boolean {
        let parent = DOMUtil.parentNode(element);
        // If link is in a menu, it's a menuitem
        while (parent) {
            if (ARIAMapper.nodeToRole(parent) === role)
                return true;
            parent = DOMUtil.parentNode(parent);
        }
        return false;
    }

    private static inputToRoleMap = (function() {
        let menuButtonCheck = function(element) {
            return ARIAMapper.hasParentRole(element, "menu") ? "menuitem" : "button";
        };
        let textSuggestions = function(element) {
            if (element.hasAttribute("list")) {
                let id = element.getAttribute("list");
                let idRef = FragmentUtil.getById(element, id);
                if (idRef && idRef.nodeName.toLowerCase() === "datalist") {
                    return "combobox";
                }
            }
            return "textbox";
        }
        return {
            "button": menuButtonCheck,
            "image": menuButtonCheck,
            "checkbox": function(element) {
                return ARIAMapper.hasParentRole(element, "menu") ? "menuitemcheckbox" : "checkbox";
            },
            "radio": function(element) {
                return ARIAMapper.hasParentRole(element, "menu") ? "menuitemradio" : "radio";
            },
            "email": textSuggestions,
            "search": textSuggestions,
            "tel": textSuggestions,
            "text": textSuggestions,
            "url": textSuggestions,
            "password": "textbox",
            "number": "spinbutton",
            "range": "slider",
            "reset": "button",
            "submit": "button"
        }
    })();

    private static inputToRole(element) {
        if (!element) {
            return null;
        }

        let eType = "text";
        if (element.hasAttribute("type") && element.getAttribute("type").toLowerCase().trim().length > 0) {
            eType = element.getAttribute("type").toLowerCase().trim();
        }

        if (!(eType in ARIAMapper.inputToRoleMap)) {
            return null;
        }
        let role = ARIAMapper.inputToRoleMap[eType];
        if (typeof role === "string") {
            return role;
        } else if (typeof role === "function") {
            return role(element);
        } else {
            return null;
        }
    }

    private static elemToRoleMap = (function() {
        let sectioningRoots = {
            "blockquote": true,
            "body": true,
            "details": true,
            "dialog": true,
            "fieldset": true,
            "figure": true,
            "td": true
        };
        let sectioningContent = {
            "article": true,
            "aside": true,
            "nav": true,
            "section": true
        };
        let inputToRole = function(element) {
            return ARIAMapper.inputToRole(element);
        }
        return {
            "a": function(element) {
                // If it doesn't represent a hyperlink, no corresponding role
                if (!element.hasAttribute("href")) return null;
                // If link is in a menu, it's a menuitem, otherwise it's a link
                return ARIAMapper.hasParentRole(element, "menu") ? "menuitem" : "link";
            },
            "area": function(element) {
                // If it doesn't represent a hyperlink, no corresponding role
                if (!element.hasAttribute("href")) return null;
                return "link";
            },
            "article": "article",
            "aside": "complementary",
            "body": "document",
            "button": "button",
            "datalist": "listbox",
            "dd": "definition",
            "details": "group",
            "dialog": "dialog",
            "footer": function(element) {
                let parent = DOMUtil.parentNode(element);
                let nodeName = parent.nodeName.toLowerCase();
                // If nearest sectioningRoot or sectioningContent is body
                while (parent) {
                    if (sectioningRoots[nodeName] || sectioningContent[nodeName]) {
                        return (nodeName === "body") ? "contentinfo" : null;
                    }
                    parent = DOMUtil.parentNode(parent);
                    nodeName = parent.nodeName.toLowerCase();
                }
                return null;
            },
            "form": "form",
            "h1": "heading",
            "h2": "heading",
            "h3": "heading",
            "h4": "heading",
            "h5": "heading",
            "h6": "heading",
            "header": function(element) {
                let parent = DOMUtil.parentNode(element);
                // If nearest sectioningRoot or sectioningContent is body
                while (parent && parent.nodeType === 1) {
                    let nodeName = parent.nodeName.toLowerCase();
                    if (sectioningRoots[nodeName] || sectioningContent[nodeName]) {
                        return (nodeName === "body") ? "banner" : null;
                    }
                    parent = DOMUtil.parentNode(parent);
                }
                return null;
            },
            "hr": "separator",
            "img": function(element) {
                if (element.hasAttribute("alt") && element.getAttribute("alt").length === 0) {
                    return "presentation";
                } else {
                    return "img";
                }
            },
            "input": inputToRole,
            "keygen": "listbox",
            "li": "listitem",
            "main": "main",
            "math": "math",
            "menu": function(element) {
                if (!element.hasAttribute("type")) return null;
                let eType = element.getAttribute("type").toLowerCase();
                if (eType === "context") return "menu";
                if (eType === "toolbar") return "toolbar";
                return null;
            },
            "menuitem": function(element) {
                // Default type is command
                if (!element.hasAttribute("type")) return "menuitem";
                let eType = element.getAttribute("type").toLowerCase();
                if (eType.trim().length == 0) return "menuitem";

                if (eType === "command") return "menuitem";
                if (eType === "checkbox") return "menuitemcheckbox";
                if (eType === "radio") return "menuitemradio";
                return null;
            },
            "meter": "progressbar",
            "nav": "navigation",
            "ol": "list",
            "optgroup": "group",
            "option": "option",
            "output": "status",
            "progress": "progressbar",
            "section": "region",
            "select": function(element) {
                if (element.hasAttribute("multiple") || (element.hasAttribute("size") && parseInt(element.getAttribute("size")) > 1)) {
                    return "listbox";
                } else {
                    return "combobox";
                }
            },
            "table": "table",
            "textarea": "textbox",
            "tbody": "rowgroup",
            "td": function(element) {
                let parent = DOMUtil.parentNode(element);
                while (parent) {
                    let role = ARIAMapper.nodeToRole(parent);
                    if (role === "table") return "cell";
                    if (role === "grid") return "gridcell";

                    parent = DOMUtil.parentNode(parent);
                }
                return null;
            },
            "th": function(element) {
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
                
                let parent = DOMUtil.parentNode(element);
                while (parent) {
                    let role = ARIAMapper.nodeToRole(parent);
                    
                    if (role !== "table" && role !== "grid" && role !== "treegrid") {
                         parent = DOMUtil.parentNode(parent);
                         continue; 
                    }     
                    // Easiest answer is if scope is specified
                    if (element.hasAttribute("scope")) {
                        let scope = element.getAttribute("scope").toLowerCase();
                        if (scope === "row" || scope === 'rowgroup') return "rowheader";
                        if (scope === "col" || scope === 'colgroup') return "columnheader";
                    }

                    // scope is auto, default (without a scope) or invalid value. figure out if we might be a column or data header
                    

                    if (role === "table") return "cell";
                    if (role === "grid" || role === "treegrid") return "gridcell";
                    
                }
                return null;
            },
            "tfoot": "rowgroup",
            "thead": "rowgroup",
            "tr": "row",
            "ul": "list"
        }
    })()
}
