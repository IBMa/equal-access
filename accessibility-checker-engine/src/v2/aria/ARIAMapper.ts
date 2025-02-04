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
import { CommonUtil } from "../../v4/util/CommonUtil";
import { AriaUtil } from "../../v4/util/AriaUtil";
import { FragmentUtil } from "../checker/accessibility/util/fragment";
import { IMapResult } from "../../v4/api/IMapper";
import { ARIAWalker } from "./ARIAWalker";
import { CacheUtil } from "../../v4/util/CacheUtil";
import { DOMWalker } from "../dom/DOMWalker";
import { AccNameUtil } from "../../v4/util/AccNameUtil";

type ElemCalc = (elem: Element) => string;
type NodeCalc = (node: Node) => string;

export class ARIAMapper extends CommonMapper {
    childrenCanHaveRole(node: Node, role: string) : boolean {
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

    static getAriaOwnedBy(elem: HTMLElement) : HTMLElement | null {
        const doc = FragmentUtil.getOwnerFragment(elem);
        if (!CacheUtil.getCache(doc, "ARIAMapper::precalcOwned", false)) {
            const owners = doc.querySelectorAll("[aria-owns]");
            for (let iOwner = 0; iOwner < owners.length; ++iOwner) {
                const owner = owners[iOwner];
                const ownIds = owner.getAttribute("aria-owns").split(/ +/g);
                for (let iId=0; iId < ownIds.length; ++iId) {
                    const owned = doc.getElementById(ownIds[iId]);
                    //ignore if the aria-owns point to the element itself
                    //if (owned && !DOMUtil.sameNode(owner, owned)) {
                    //    CacheUtil.setCache(owned, "aria-owned", owner);
                    //}
                    /**
                     *  circular hierarchy check:
                     *  (1) the owned element is neither the same element with the owner nor any ascendant of the owner
                     *  (2) any child with aria-owns cannot point to the owner or any ascendant of the owner
                     */ 
                    if (owned && !DOMUtil.sameNode(owner, owned)) {   
                        // check if the owned with aria-owns that points to another element
                        let ownedNodes = [];
                        const sub_owners = owned.querySelectorAll("[aria-owns]");
                        for (let i = 0; i < sub_owners.length; ++i) {
                            const sub_owner = sub_owners[i]; 
                            const sub_ownIds = sub_owner.getAttribute("aria-owns").split(/ +/g);
                            for (let j=0; j < sub_ownIds.length; ++j) {
                                const ownedNode = doc.getElementById(sub_ownIds[j]);
                                if (ownedNode)
                                    ownedNodes.push(ownedNode);
                            }    
                        }
                        if (ownedNodes.length === 0) {
                            CacheUtil.setCache(owned, "aria-owned", owner);
                            continue;
                        }    
                        // check if any aria-owns points to the element itself or any of it's parent
                        let parent : Element = owner;      
                        let circular = false;
                        while (parent !== null) {
                            const found = ownedNodes.some(item => DOMUtil.sameNode(parent, item));
                            if (!found)
                                parent = DOMWalker.parentElement(parent);
                            else { 
                                circular = true;
                                break;
                            }   
                        }
                        if (!circular)
                            CacheUtil.setCache(owned, "aria-owned", owner);    
                    }
                }
            }
            CacheUtil.setCache(doc, "ARIAMapper::precalcOwned", true);
        }
        return CacheUtil.getCache(elem, "aria-owned", null);
    }

    private getNodeHierarchy(node: Node) {
        if (!node) return [];
        if (node.nodeType !== 1) {
            let parentHierarchy = this.getNodeHierarchy(DOMWalker.parentElement(node));
            let parentInfo = parentHierarchy.length > 0 ? parentHierarchy[parentHierarchy.length-1] : {
                role: "",
                rolePath: "",
                roleCount: {},
                childrenCanHaveRole: true
            };
            let nodeHierarchy = [];
            // Set hierarchy
            for (const item of parentHierarchy) {
                nodeHierarchy.push(item);
            }
            nodeHierarchy.push({
                attributes: {},
                bounds: this.getBounds(node),
                namespace: this.getNamespace(),
                node: node,
                role: this.getRole(node) || "none",
                rolePath: parentInfo.rolePath+"/"+(this.getRole(node) || "none"),
                roleCount: {},
                childrenCanHaveRole: parentInfo.childrenCanHaveRole
            });
            return nodeHierarchy;
        } else {
            let elem = node as HTMLElement;
            let nodeHierarchy : Array<{
                role: string,
                rolePath: string,
                roleCount: {
                    [role: string]: number
                }
                childrenCanHaveRole: boolean
            }> = CacheUtil.getCache(elem, "ARIAMapper::getNodeHierarchy", null);
            if (!nodeHierarchy) {
                // This element hasn't been processed yet - but ::reset processes them all in the right order

                // Get details about the correct parent first
                let parent = ARIAMapper.getAriaOwnedBy(elem);
                if (!parent) {
                    parent = DOMWalker.parentElement(elem) as HTMLElement;
                } 
                while (parent && parent.nodeType !== 1) { 
                    parent = DOMWalker.parentElement(elem) as HTMLElement;
                }
                let parentHierarchy = parent ? this.getNodeHierarchy(parent) : [];
                let parentInfo = parentHierarchy.length > 0 ? parentHierarchy[parentHierarchy.length-1] : {
                    role: "",
                    rolePath: "",
                    roleCount: {},
                    childrenCanHaveRole: true
                };
                while (parentInfo.role === "none" || parentInfo.role === "/none") {
                    parent = ARIAMapper.getAriaOwnedBy(parent) || DOMWalker.parentElement(parent) as HTMLElement;
                    parentHierarchy = parent ? this.getNodeHierarchy(parent) : [];
                    parentInfo = parentHierarchy[parentHierarchy.length-1];
                }

                // Set initial node info
                let nodeInfo : {
                    attributes: {
                        [role: string]: string
                    }
                    bounds: any,
                    namespace: string,
                    node: HTMLElement,
                    role: string,
                    rolePath: string,
                    roleCount: {
                        [role: string]: number
                    }
                    childrenCanHaveRole: boolean
                } = {
                    attributes: elem.nodeType === 1 ? this.getAttributes(elem): {},   
                    bounds: this.getBounds(elem),
                    namespace: this.getNamespace(),
                    node: elem,
                    role: this.getRole(elem) || "none",
                    rolePath: "",
                    roleCount: {},
                    childrenCanHaveRole: true
                }

                // Adjust role if we're within a presentational container
                let presentationalContainer = !parentInfo.childrenCanHaveRole;
                if (presentationalContainer) {
                    nodeInfo.role = "none";
                } else {
                    nodeInfo.childrenCanHaveRole = parentInfo.childrenCanHaveRole 
                        && this.childrenCanHaveRole(elem, nodeInfo.role);
                }

                // Set the paths
                if (nodeInfo.role !== "none") {
                    parentInfo.roleCount[nodeInfo.role] = (parentInfo.roleCount[nodeInfo.role] || 0) + 1; 
                    nodeInfo.rolePath = parentInfo.rolePath+"/"+nodeInfo.role+"["+parentInfo.roleCount[nodeInfo.role]+"]";
                } else {
                    nodeInfo.rolePath = parentInfo.rolePath;
                }
        
                // Set hierarchy
                nodeHierarchy = []
                for (const item of parentHierarchy) {
                    nodeHierarchy.push(item);
                }
                nodeHierarchy.push(nodeInfo);
                CacheUtil.setCache(elem, "ARIAMapper::getNodeHierarchy", nodeHierarchy);
            }
            return nodeHierarchy;
        }
    }

    reset(node: Node) {
        ARIAMapper.nameComputationId = 0;
        this.hierarchyRole = [];
        this.hierarchyResults = [];
        this.hierarchyPath = [{
            rolePath: "",
            roleCount: {}
        }];
        // Get to the topmost node
        let goodNode = node;
        let next;
        while (next = DOMWalker.parentNode(goodNode)) {
            goodNode = next;
        };
        // Walk the tree and set the hierarchies in the right order
        let ariaWalker = new ARIAWalker(goodNode, false, goodNode);
        do {
            if (ariaWalker.node.nodeType === 1) {
                this.getNodeHierarchy(ariaWalker.node);
            }
        } while (ariaWalker.nextNode());
    }

    openScope(node: Node): IMapResult[] {
        if (this.hierarchyRole === null) {
            this.reset(node);
        }
        this.pushHierarchy(node)
        for (let idx=0; idx<this.hierarchyResults.length; ++idx) {
            if (this.hierarchyResults[idx].role[0] === "/") {
                this.hierarchyResults[idx].role = this.hierarchyResults[idx].role.substring(1);
            }
        }
        return this.hierarchyResults;
    }

    pushHierarchy(node: Node) {
        // If we're not an element, no special handling
        let nodeHierarchy = []
        // Determine our node info
        nodeHierarchy = this.getNodeHierarchy(node);
        let nodeInfo = nodeHierarchy[nodeHierarchy.length-1];
        this.hierarchyRole.push(nodeInfo.role);
        if (nodeInfo.role !== "none") {
            this.hierarchyPath.push(nodeInfo);
        }

        this.hierarchyResults = nodeHierarchy;
    }

    closeScope(node: Node): IMapResult[] {
        let retVal : IMapResult[] = [];
        for (const res of this.hierarchyResults) {
            // const temp = res.node;
            // res.node = null;
            // let cloned = JSON.parse(JSON.stringify(res));
            // cloned.node = res.node = temp; 
            // retVal.push(cloned);
            retVal.push(res);
        }
        if (retVal.length > 0) {
            retVal[retVal.length-1].role = "/"+retVal[retVal.length-1].role
            let parent = DOMWalker.parentElement(node);
            this.hierarchyResults = parent ? CacheUtil.getCache(parent as HTMLElement, "ARIAMapper::getNodeInfo", []) : [];
        }
        return retVal;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Helper functions
    ////

    // https://www.w3.org/TR/html-aam-1.0/#mapping-html-to-accessibility-apis
    public static elemAttrValueCalculators: { [nodeName:string]: { [attr:string]: string | ElemCalc }} = {
        "global": {
            "name": AccNameUtil.computeAccessibleName  //ARIAMapper.computeName
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
    /**public static computeName(cur: Node) : string {
        ++ARIAMapper.nameComputationId;
        return ARIAMapper.computeNameHelp(ARIAMapper.nameComputationId, cur, false, false);
    }

    public static computeNameHelp(walkId: number, cur: Node, labelledbyTraverse: boolean, walkTraverse: boolean) : string {
        // 2g. None of the other content applies to text nodes, so just do this first
        if (cur.nodeType === 3 ) return cur.nodeValue;
        if (cur.nodeType === 11) return "";
        if (cur.nodeType !== 1 ) {
            if (walkTraverse || labelledbyTraverse) return "";
            throw new Error ("Can only compute name on Element and Text " + cur.nodeType);
        }

        const elem = cur as Element;
        // We've been here before - prevent recursion
        if (CacheUtil.getCache(elem, "data-namewalk", null) === ""+walkId) return "";
        CacheUtil.setCache(elem, "data-namewalk", ""+walkId);
        // See https://www.w3.org/TR/html-aam-1.0/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-url-and-textarea-element

        // 2a. Only show hidden content if it's referenced by a labelledby
        if (!labelledbyTraverse && !VisUtil.isNodeVisible(cur)) {
            return "";
        }

        // 2b. collect valid id references
        if (!labelledbyTraverse && elem.hasAttribute("aria-labelledby")) {
            let labelledby = elem.getAttribute("aria-labelledby").split(" ");
            let validElems = [];
            for (const ref of labelledby) {
                const refElem = FragmentUtil.getById(cur, ref);
                if (refElem && !DOMUtil.sameNode(elem, refElem)) {
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

        // Since nodeToRole calls back here for form and section, we need special casing here to handle those two cases
        if (["section", "form"].includes(cur.nodeName.toLowerCase())) {
            if (elem.hasAttribute("aria-label") && elem.getAttribute("aria-label").trim().length > 0) {
                // If I'm not an embedded control or I'm not recursing, return the aria-label
                if (!labelledbyTraverse && !walkTraverse) {
                    return elem.getAttribute("aria-label").trim();
                }
            }
            if (elem.hasAttribute("title")) {
                return elem.getAttribute("title");
            }
            return "";
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
                    if (label.hasAttribute("aria-label") || (label.hasAttribute("aria-labelledby") && !CommonUtil.isIdReferToSelf(cur, label.getAttribute("aria-labelledby")))) {
                        return this.computeNameHelp(walkId, label, false, false);
                    } else {
                        return label.textContent;
                    }
                }
            }
            if (cur.nodeName.toLowerCase() === "fieldset") {
                if( (<Element>cur).querySelector("legend")){
                    let legend = (<Element>cur).querySelector("legend");
                    return legend.innerText;
                }else{
                    return this.computeNameHelp(walkId, cur, false, false);
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
                    if (selected && !DOMUtil.sameNode(elem, selected)) {
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
            if (elem.nodeName.toUpperCase() === "SLOT") {
                //if no assignedNode, check its own text 
                if (!(elem as HTMLSlotElement).assignedNodes() || (elem as HTMLSlotElement).assignedNodes().length === 0) {
                    let innerText = CommonUtil.getInnerText(elem);
                    if (innerText && innerText !== null && innerText.trim().length > 0)
                        accumulated +=  " " + innerText;
                } else {    
                    // check text from all assigned nodes
                    for (const slotChild of (elem as HTMLSlotElement).assignedNodes()) {
                        let nextChildContent = ARIAMapper.computeNameHelp(walkId, slotChild, labelledbyTraverse, true);
                        accumulated += " " + nextChildContent;
                    }
                }
            } else {
                let walkChild = elem.firstChild;
                while (walkChild) {
                    let nextChildContent = ARIAMapper.computeNameHelp(walkId, walkChild, labelledbyTraverse, true);
                    accumulated += " " + nextChildContent;
                    walkChild = walkChild.nextSibling;
                }
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
    */
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

        // TO DO: use AriaUtil.getResolvedRole(elem) to replace the code following, which uses only the valid roles for the element based on the aria fallback rule
        //const role = AriaUtil.getResolvedRole(elem);
        //return role === "presentation" || role === "none" ? null : role;
        
        if (elem.hasAttribute("role") && elem.getAttribute("role").trim().length > 0) {
            let roleStr = elem.getAttribute("role").trim();
            let roles = roleStr.split(" ");
            for (const role of roles) {
                if (role === "presentation" || role === "none") {
                    // If element is focusable, then presentation roles are to be ignored
                    if (!CommonUtil.isFocusable(elem)) {
                        return null;
                    }
                } else if (role in ARIADefinitions.designPatterns) {
                    return role;
                }    
            }
        }
        //return this.elemToImplicitRole(elem);
        const roles = AriaUtil.getImplicitRole(elem);
        //console.log("node=" + node.nodeName +", role= " + (roles ? roles[0] : null) +", resolved=" + AriaUtil.getResolvedRole(elem));
        const role = !roles || roles.length ===0 ? null : roles[0];
        return role === "presentation" || role === "none" ? null : role;
        //return AriaUtil.getResolvedRole(elem);
        
    }
} 
