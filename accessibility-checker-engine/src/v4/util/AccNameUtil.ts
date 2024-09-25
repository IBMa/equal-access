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

import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { CommonUtil } from "./CommonUtil";
import { AriaUtil } from "./AriaUtil";
import { VisUtil } from "./VisUtil";
import { CacheUtil } from "./CacheUtil";
import { DOMUtil } from "../../v2/dom/DOMUtil";

type ElemCalc = (elem: Element) => string;
type NodeCalc = (node: Node) => string;

export class AccNameUtil {
    
    // calculate accessible name for a given node
    public static computeAccessibleName(cur: Node) : string | null {
        // None of the other content applies to text nodes, so just do this first
        if (cur.nodeType !== 1 /* Node.ELEMENT_NODE */) return null;
        
        const elem = cur as Element;
        const nodeName = elem.nodeName.toLowerCase();

        const role = AriaUtil.getResolvedRole(elem);
        if (!role || role === 'presentation' || role === 'none') return null;

        if (ARIADefinitions.designPatterns[role] && ARIADefinitions.designPatterns[role].nameFrom.includes("prohibited"))
             return null;
        
        let accName = CacheUtil.getCache(elem, "ELEMENT_ACCESSBLE_NAME", null);
        if (accName !== null) return accName;

        // 1. name from author, or elements without a role but with aria-labelledby or aria-label (except where prohibited)
        accName = AriaUtil.getAriaLabel(elem);
        if (accName && accName.trim() !== "") {
            CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", accName);
            return accName;
        }

        // 2. accessible name mapping for native html elements
        accName = AccNameUtil.computeAccessibleNameForNativeElement(elem);
        if (accName) {
            CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", accName);
            return accName;
        }

        // 3. name from content for custom elements
        if (ARIADefinitions.designPatterns[role] && ARIADefinitions.designPatterns[role].nameFrom.includes("content")) {
            accName = AccNameUtil.computeAccessibleNameForCustomElement(elem);
            if (accName) {
                CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", accName);
                return accName;
            }
        }

        // 4. name from the global attribute "title"
        if (elem.hasAttribute("title")) {
            CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", accName);
            return elem.getAttribute("title");
        }
        
        // 5. name from the attribute "placehold"
        if (nodeName === 'input' && (!elem.hasAttribute("type") || CommonUtil.input_type_with_placeholder.includes(elem.getAttribute("type")))) {
            CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", accName);
            return elem.getAttribute("placeholder");
        }
        
        return null;
    }

    // calculate accessible name for native elements
    public static computeAccessibleNameForNativeElement(elem: Element) : string | null {
        const nodeName = elem.nodeName.toLowerCase();
        let accName;
        
        // form labellable fields
        if (CommonUtil.form_labelable_elements.includes(nodeName)) {
            // Get only the non-hidden labels for element
            const label = CommonUtil.getFormFieldLabel(elem);
            if (label !== null || label.trim() !== '')
                return label;
        }

        // form button type: button, reset, submit
        if (nodeName === "button" || (nodeName === "input" && elem.hasAttribute("type") && CommonUtil.form_button_types.includes(elem.getAttribute("type")))) {
            // Get the "value" attribute for element
            const value = CommonUtil.getElementAttribute(elem, "value");
            if (value !== null || value.trim() !== '')
                return value;

            // input 'submit' and 'reset' have visible defaults so pass if there is no 'value' attribute 
            if (value === null && nodeName === "input")
                return elem.getAttribute("type");
        }

        // img and area elements: use attribute "alt"
        if (nodeName === "img" || nodeName === "area") {
            return elem.hasAttribute("alt")? DOMUtil.cleanWhitespace(elem.getAttribute("alt")).trim() : null;
        }
   
        // input type = 'image'
        if (nodeName === "input" && elem.hasAttribute("type") && elem.getAttribute("type") === 'image') {
            // Get the accessible name for the image
            const value = CommonUtil.getElementAttribute(elem, "value");
            if (value !== null || value.trim() !== '')
                return value;

            // input 'submit' and 'reset' have visible defaults so pass if there is no 'value' attribute 
            if (value === null && nodeName === "input")
                return elem.getAttribute("type");
        }

            /**
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
        */
        return "";
        
    
        

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
    }

    // calculate accessible name for native elements
    public static computeAccessibleNameForCustomElement(elem: Element) : string | null {
        const nodeName = elem.nodeName.toLowerCase();
        let accName;
        
        // form labellable fields
        if (CommonUtil.form_labelable_elements.includes(nodeName)) {
            // Get only the non-hidden labels for element
            const label = CommonUtil.getFormFieldLabel(elem);
            if (label !== null || label.trim() !== '')
                return label;
        }

        // form button type: button, reset, submit
        if (nodeName === "button" || (nodeName === "input" && elem.hasAttribute("type") && CommonUtil.form_button_types.includes(elem.getAttribute("type")))) {
            // Get the "value" attribute for element
            const value = CommonUtil.getElementAttribute(elem, "value");
            if (value !== null || value.trim() !== '')
                return value;

            // input 'submit' and 'reset' have visible defaults so pass if there is no 'value' attribute 
            if (value === null && nodeName === "input")
                return elem.getAttribute("type");
        }

        // img and area elements: use attribute "alt"
        if (nodeName === "img" || nodeName === "area") {
            return elem.hasAttribute("alt")? DOMUtil.cleanWhitespace(elem.getAttribute("alt")).trim() : null;
        }
   
        // input type = 'image'
        if (nodeName === "input" && elem.hasAttribute("type") && elem.getAttribute("type") === 'image') {
            // Get the accessible name for the image
            const value = CommonUtil.getElementAttribute(elem, "value");
            if (value !== null || value.trim() !== '')
                return value;

            // input 'submit' and 'reset' have visible defaults so pass if there is no 'value' attribute 
            if (value === null && nodeName === "input")
                return elem.getAttribute("type");
        }

            /**
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
        */
        return "";
        
    
        

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
    }
} 
