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
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { DOMUtil } from "../../v2/dom/DOMUtil";

type ElemCalc = (elem: Element) => string;
type NodeCalc = (node: Node) => string;

export class AccNameUtil {
    
    // calculate accessible name for a given node
    public static computeAccessibleName(elem: Element) : any | null {
        if (!elem) return null;
        const nodeName = elem.nodeName.toLowerCase();

        let name_pair = CacheUtil.getCache(elem, "ELEMENT_ACCESSBLE_NAME", undefined);
        if (name_pair !== undefined) return name_pair;

        // 1. name from author, or elements without a role but with aria-labelledby or aria-label 
        //   get aria label even for the role where the name is prohibited or is 'presentation' or 'none'
        let accName = AriaUtil.getAriaLabel(elem);
        if (accName && accName.trim() !== "") {
            CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", {"name":accName, "nameFrom": "ariaLabel"});
            return {"name":CommonUtil.truncateText(accName), "nameFrom": "ariaLabel"};
        }

        // 2. accessible name mapping for native html elements
        name_pair = AccNameUtil.computeAccessibleNameForNativeElement(elem);
        if (name_pair) {
            CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", name_pair);
            return name_pair;
        }
        
        // 3. name from content for custom elements
        const role = AriaUtil.getResolvedRole(elem);
        if (ARIADefinitions.designPatterns[role] && ARIADefinitions.designPatterns[role].nameFrom.includes("contents")) {
            name_pair = AccNameUtil.computeAccessibleNameFromContent(elem);
            if (name_pair) {
                CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", name_pair);
                return name_pair;
            }
        }

        // 4. name from the global attribute "title"
        if (elem.hasAttribute("title")) {
            let title = elem.getAttribute("title").trim();
            CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", {"name":title, "nameFrom": "title"});
            return {"name":CommonUtil.truncateText(title), "nameFrom": "title"};
        }
        
        // 5. name from the attribute "placeholder"
        if (nodeName === 'input' && (!elem.hasAttribute("type") || CommonUtil.input_type_with_placeholder.includes(elem.getAttribute("type")))) {
            const placeholder = CommonUtil.truncateText(elem.getAttribute("placeholder"));
            CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", placeholder);
            return {"name":placeholder, "nameFrom": "placeholder"};
        }

        CacheUtil.setCache(elem, "ELEMENT_ACCESSBLE_NAME", null);
        return null;
    }

    // calculate accessible name for native elements
    public static computeAccessibleNameForNativeElement(elem: Element) : any | null {
        const nodeName = elem.nodeName.toLowerCase();
        
        // labellable fields
        if (CommonUtil.form_labelable_elements.includes(nodeName)) {
            // Get only the non-hidden labels for element
            const label = CommonUtil.getFormFieldLabel(elem);
            if (label && label.trim() !== '')
                return {"name":CommonUtil.truncateText(label), "nameFrom": "label"};
        }

        // input types: button, reset, submit
        if (nodeName === "input" && elem.hasAttribute("type") && CommonUtil.form_button_types.includes(elem.getAttribute("type"))) {
            // Get the "value" attribute for the element
            const value = CommonUtil.getElementAttribute(elem, "value");
            if (value && value.trim() !== '')
                return {"name":CommonUtil.truncateText(value), "nameFrom": "value"};

            // input 'submit' and 'reset' have visible defaults so pass if there is no 'value' attribute 
            return {"name":elem.getAttribute("type"), "nameFrom": "internal"};
        }

        // input type = 'image'
        if (nodeName === "input" && elem.hasAttribute("type") && elem.getAttribute("type") === 'image') {
            // note that though HTML 5 spec indicates "The element's [value] attribute must be omitted", Chrome uses the value.
            // Get the accessible name for the alt attribute
            const alt = CommonUtil.getElementAttribute(elem, "alt");
            if (alt && alt.trim() !== '')
                return {"name":CommonUtil.truncateText(alt), "nameFrom": "alt"};;

            // the visible default text for type "image" is "Submit" same with the type "submit"
            //return {"name":elem.getAttribute("type"), "nameFrom": "internal"};
        }

        // button
        // note button may have a value attribute, but it's not a visible text
        if (nodeName === "button") {
            // first use the button text
            const text = (elem as HTMLElement).innerText;
            if (text && text.trim() !== '')
                return {"name":CommonUtil.truncateText(text), "nameFrom": "text"};

            // for image button: get the first image if exists
            const image = elem.querySelector('img');
            if (image && !VisUtil.isNodeHiddenFromAT(image) && !VisUtil.isNodePresentational(image)) {
                let pair = AccNameUtil.computeAccessibleName(image); 
                if (pair && pair.name && pair.name.trim().length > 0) 
                    return pair;
            }       
        }

        // fieldset
        if (nodeName === "fieldset") {
            // if the fieldset element's first child is a legend element, then use the subtree of the legend
            const first = elem.firstElementChild;
            if (first && first.nodeName.toLowerCase() === 'legend') {
                // legend can be mixed text
                const text = (first as HTMLElement).innerText;
                if (text && text.trim().length > 0) 
                    return {"name":CommonUtil.truncateText(text), "nameFrom": "legend"}; 
            }        
        }

        // output
        if (nodeName === "output") {
            // if the associated label element exists, use concatenated accessible name(s) from labelled elements.
            if (elem.hasAttribute("for")) {
                let labelIDs = elem.getAttribute("for").trim().split(" ");
                if (labelIDs && labelIDs.length > 0) {
                    let label = "";
                    for (let j = 0; j < labelIDs.length; j++) {
                        let labelNode = elem.ownerDocument.getElementById(labelIDs[j]);
                        if (labelNode && !DOMUtil.sameNode(labelNode, elem) && !VisUtil.isNodeHiddenFromAT(labelNode) && !VisUtil.isNodePresentational(labelNode)) {
                            const pair = AccNameUtil.computeAccessibleName(labelNode);
                            if (pair && pair.name && pair.name.trim().length > 0) 
                                label += " " + CommonUtil.normalizeSpacing(pair.name);
                        }
                    }
                    if (label.trim().length > 0)
                        return {"name":CommonUtil.truncateText(label), "nameFrom": "label"};
                }
            }       
        }

        // summary
        if (nodeName === "summary") {
            // use summary element subtree
            const text = (elem as HTMLElement).innerText;
            if (text && text.trim().length > 0) 
                return {"name":CommonUtil.truncateText(text), "nameFrom": "legend"};         
        }

        // details
        if (nodeName === "details") {
            const first = elem.firstElementChild;
            if (first && first.nodeName.toLowerCase() === 'summary') {
                // get accessible name from summary
                const pair = AccNameUtil.computeAccessibleName(first);
                if (pair && pair.name && pair.name.trim().length > 0) 
                    return {"name":CommonUtil.truncateText(pair.name.trim()), "nameFrom": "summary"}; 
            }
            // If no summary element as a direct child of the details element, 
            // the user agent should provide one with a subtree containing a localized string of the word "details".
            return {"name":"details", "nameFrom": "internal"};         
        }

        // figure
        if (nodeName === "figure") {
            // if the figure element has a figcaption as the first or last child
            let caption = elem.firstElementChild;
            if (!caption) {
                caption = elem.lastElementChild;
                if (caption && caption.nodeName.toLowerCase() === 'figcaption') {
                    // figcaption can be mixed text
                    const text = (caption as HTMLElement).innerText;
                    if (text && text.trim().length > 0) 
                        return {"name":CommonUtil.truncateText(text), "nameFrom": "figcaption"}; 
                } 
            }        
        }

        // img elements: use attribute "alt"
        if (nodeName === "img") {
            if (elem.hasAttribute("alt")) {
                let alt = elem.getAttribute("alt");
                return {"name":CommonUtil.truncateText(alt), "nameFrom": "alt"};
            }
        }

        // area elements: use attribute "alt"
        if (nodeName === "area") {
            if (elem.hasAttribute("alt")) {
                let alt = elem.getAttribute("alt");
                if (alt && alt.trim().length > 0)
                    return {"name":CommonUtil.truncateText(alt), "nameFrom": "alt"};
            }
        }

        // table element
        if (nodeName === "table") {
            // if the figure element has a caption as the first child
            let captionElem = elem.firstElementChild;
            if (captionElem && captionElem.nodeName.toLowerCase() === 'caption') {
                // caption can be mixed text
                const caption = (captionElem as HTMLElement).innerText;
                if (caption && caption.trim().length > 0) 
                    return {"name":CommonUtil.truncateText(caption), "nameFrom": "caption"}; 
            }         
        }

        // a element
        if (nodeName === "a") {
            // first use the link text
            const text = (elem as HTMLElement).innerText;
            if (text && text.trim() !== '')
                return {"name":CommonUtil.truncateText(text), "nameFrom": "text"};
             
            //for image link: get the image or svg if exists
            const images = elem.querySelectorAll(":scope > img, :scope > svg");
            if (images && images.length > 0) {
                let text = "";
                images.forEach(image => {
                    if (!VisUtil.isNodeHiddenFromAT(image) && !VisUtil.isNodePresentational(image)) {
                        let pair = AccNameUtil.computeAccessibleName(image);
                        if (pair && pair.name && pair.name.trim().length > 0) 
                            text += " " + pair.name.trim();
                    }
                });
                if (text.trim() !== '')
                    return {"name":text.trim(), "nameFrom": "iamges"};
            }
        }

        // svg
        if (nodeName === "svg") {
            const pair = AccNameUtil.computeAccessibleNameForSVGElement(elem);
            if (pair && pair.name && pair.name.trim().length > 0) 
                return pair;
        }
        return null;
    }

    // calculate accessible name for native elements
    public static computeAccessibleNameForSVGElement(elem: Element) : any | null {
        // 1. a direct child or descendant title element 
        const svgTitles = elem.querySelectorAll(":scope > title");
        if (svgTitles && svgTitles.length > 0) {
            let text = "";
            svgTitles.forEach(svgTitle => {
                if (svgTitle && !VisUtil.isNodeHiddenFromAT(svgTitle) && !VisUtil.isNodePresentational(svgTitle)) {
                    const title = svgTitle.textContent;
                    if (title && title.trim() !== '')
                        text += title.trim();
                }
            });
            if (text && text.trim() !== '')
            return {"name":text.trim(), "nameFrom": "svgTitle"};
        }

        // 2. xlink:title attribute on a link
        let linkTitle = elem.querySelector("a");
        if (linkTitle && !VisUtil.isNodeHiddenFromAT(linkTitle) && !VisUtil.isNodePresentational(linkTitle)) {
            let link = linkTitle.getAttribute("xlink:title");
            if (link && link.trim() !== '')
                return {"name":CommonUtil.truncateText(link), "nameFrom": "svglinkTitle"};
        }

        /** 3. for text container elements, the text content. 
         * note the SVG text content elements are: ‘text’, ‘textPath’ and ‘tspan’.
         *  svg element can be nested. One of the purposes is to to group SVG shapes together as a collection for responsive design.
         * 
         * select text content excluded the text from the nested svg elements and their children 
         */ 
        let text = "";
        elem.querySelectorAll(":scope > *").forEach((element) => {
            if (element.nodeName.toLowerCase() !== 'svg' && !VisUtil.isNodeHiddenFromAT(element) && !VisUtil.isNodePresentational(element)) {
                const value = element.textContent;
                if (value && value.trim().length > 0)
                    text += value;
            }    
        });
        if (text.trim() !== '')
            return {"name":CommonUtil.truncateText(text), "nameFrom": "svgText"}; 

        // 4. from aria-describedby or aria-description 
        let descby = AriaUtil.getAriaDescription(elem);
        if (descby && descby.trim().length > 0)
            return {"name":CommonUtil.truncateText(descby), "nameFrom": "aria-description"};

        // 5. a direct child or descendant desc element
        let descElems = elem.querySelectorAll(":scope > desc");
        if (descElems && descElems.length > 0) {
            let text = "";
            descElems.forEach(descElem => {
                if (descElem && !VisUtil.isNodeHiddenFromAT(descElem) && !VisUtil.isNodePresentational(descElem)) {
                    const desc = descElem.textContent;
                    if (desc && desc.trim() !== '')
                        text += desc.trim();
                }
            });
            if (text && text.trim() !== '')
                return {"name":text.trim(), "nameFrom": "svgDesc"};
        }
    }

    // calculate accessible name for custom elements marked with aria
    public static computeAccessibleNameFromContent(elem: Element) : any | null {
        const nodeName = elem.nodeName.toLowerCase();
        const role = AriaUtil.getResolvedRole(elem);
        
        // textbox etc. return its text value
        if (role === "textbox") {
            let name = elem.textContent;
            if (name && name.trim().length > 0)
                return {"name":CommonUtil.truncateText(name), "nameFrom": "value"};
        }
        
        // for combobox or listbox roles, return the text alternative of the chosen option.
        if (role === "combobox" || role === "listbox") {
            const selectedId = elem.getAttribute("aria-activedescendant") || elem.getAttribute("aria-selected") || elem.getAttribute("aria-checked");
            if (selectedId) {
                let selectedOption = elem.ownerDocument.getElementById(selectedId);
                if (selectedOption && !DOMUtil.sameNode(elem, selectedOption)) {
                    const pair = AccNameUtil.computeAccessibleName(selectedOption);
                    if (pair && pair.name)
                        return {"name": pair.name, "nameFrom": "option"};
                }
            }
        }

        // for roles "progressbar", "scrollbar", "slider", "spinbutton"
        if (["progressbar", "scrollbar", "slider", "spinbutton"].includes(role)) {
            // If the aria-valuetext property is present, return its value
            let value = elem.getAttribute("aria-valuetext");
            if (value && value.trim().length > 0) 
                return {"name":value, "nameFrom": "aria-valuetext"};
            // Otherwise, if the aria-valuenow property is present, return its value,
            value = elem.getAttribute("aria-valuenow");
            if (value && value.trim().length > 0) 
                return {"name":CommonUtil.truncateText(value), "nameFrom": "aria-valuenow"};
        }

        /** for any element, the content from CSS pseudo-elements 
         *  :before and :after pseudo elements [CSS2] can provide textual content for elements that have a content model.
         * For :before or :after pseudo elements, user agents must prepend CSS textual content, without a space, 
         *   to the textual content of the current node.
         */
        let pair = AccNameUtil.computeAccessibleNameForCSSPseudoElement(elem, "before");
        if (pair !== null && pair.name && pair.name.trim().length > 0)
            return pair;

        pair = AccNameUtil.computeAccessibleNameForCSSPseudoElement(elem, "after");
        if (pair && pair.name && pair.name.trim().length > 0)
            return pair;

        //  shadow host
        if (elem.shadowRoot) {
            pair = AccNameUtil.computeAccessibleNameForShadowHost(elem);
            if (pair && pair.name && pair.name.trim().length > 0)
                return {"name": pair.name, "nameFrom": "shadow"};;
        }
        
        // slot element
        if (nodeName === "slot") {
            pair = AccNameUtil.computeAccessibleNameForSlostElement(elem);
            if (pair && pair.name && pair.name.trim().length > 0)
                return {"name": pair.name, "nameFrom": "slot"};
        }

        // otherwise: get the value from the element
        pair = AccNameUtil.computeAccessibleNameFromChildren(elem);
        if (pair && pair.name && pair.name.trim().length > 0)
            return {"name": pair.name, "nameFrom": "content"};

        // no accessible name exists
        return null;    
    }

    // calculate accessible name from CSS generated content
    public static computeAccessibleNameForCSSPseudoElement(elem: Element, type:string) : any | null {
        const contentElem = elem.ownerDocument.defaultView.getComputedStyle(elem,type);
        if (contentElem) {
            let content = contentElem.content;
            if (content && content !== "none") {
                content = content.replace(/^"/,"").replace(/"$/,"");
                if (content.trim().length > 0)
                    return {"name": CommonUtil.truncateText(content), "nameFrom": "css-"+type};
            }
        }
        return null;
    }

    // calculate accessible name for SLOT element
    public static computeAccessibleNameForShadowHost(elem: Element) : any | null {
        let text = "";
        const shadowRoot = elem.shadowRoot;
        if (shadowRoot) {
            let children = shadowRoot.querySelectorAll('*');   
            // check text from all the children elements
            children.forEach(child => {
                const pair = AccNameUtil.computeAccessibleName(child);
                if (pair && pair.name && pair.name.trim().length > 0)
                    text += " " + pair.name.trim();
            });
        }
        if (text.trim().length > 0)
            return {"name": CommonUtil.truncateText(text), "nameFrom": "shadow-host"};

        return null;
    }

    // calculate accessible name for SLOT element
    public static computeAccessibleNameForSlostElement(elem: Element) : any | null {
        //if no assignedNode, check its own text 
        let text = "";
        if (!(elem as HTMLSlotElement).assignedNodes() || (elem as HTMLSlotElement).assignedNodes().length === 0) {
            const pair = AccNameUtil.computeAccessibleName(elem);
            if (pair && pair.name && pair.name.trim().length > 0)
                text += " " + pair.name.trim();
        } else {    
            // check text from all assigned nodes
            for (const slotChild of (elem as HTMLSlotElement).assignedNodes()) {
                let pair = AccNameUtil.computeAccessibleName(slotChild as Element);
                if (pair && pair.name && pair.name.length > 0)
                    text += " " + pair.name.trim();
            }
        }
        if (text.trim().length > 0)
            return {"name": CommonUtil.truncateText(text), "nameFrom": "content-slot"};

        return null;
    }

    // calculate accessible name from children content
    public static computeAccessibleNameFromChildren(elem: Element) : any | null {
        let text = "";
        //let walkChild = elem.firstChild;
        let nw = new DOMWalker(elem);
        // Loop over all the childrens of the element to get the text
        while (nw.nextNode() && nw.node !== elem && nw.node !== elem.parentNode) {
        //while (walkChild) { 
            const walkChild = nw.node; 
            if (walkChild.nodeType === 3) {
                // for the text node, get the parentnode to check visibility
                const parent = walkChild.parentElement;
                if (!VisUtil.isNodeHiddenFromAT(parent) && !VisUtil.isNodePresentational(parent) && walkChild.nodeValue && walkChild.nodeValue.trim().length > 0) 
                    text += " " + walkChild.nodeValue.trim();

            } else if (walkChild.nodeType === 1 && !VisUtil.isNodeHiddenFromAT(walkChild as HTMLElement) && !VisUtil.isNodePresentational(walkChild as HTMLElement)) {
                const pair = AccNameUtil.computeAccessibleName(walkChild as Element);
                if (pair && pair.name && pair.name.length > 0) 
                    text += " " + pair.name.trim();
            }
        }
        if (text.trim().length > 0)
            return {"name": CommonUtil.truncateText(text), "nameFrom": "content"};

        return null;
    }
} 
