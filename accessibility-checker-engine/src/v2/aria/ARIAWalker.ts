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

import { FragmentUtil } from "../checker/accessibility/util/fragment";
import { DOMWalker } from "../dom/DOMWalker";
import { ARIAMapper } from "./ARIAMapper";

/**
 * Walks in an ARIA order
 * 
 * See also ../dom/DOMWalker
 */
export class ARIAWalker {
    root : Node;
    node : Node;
    bEndTag: boolean;

    constructor(element : Node, bEnd? : boolean, root? : Node) {
        this.root = root || element;
        this.node = element;
        this.bEndTag = (bEnd == undefined ? false : bEnd == true);
    }

    atRoot() : boolean {
        if ((this as any).ownerElement) return false;
        if (this.root === this.node) {
            return true;
        } else if (this.root.isSameNode) {
            return this.root.isSameNode(this.node);
        } else if (this.root.compareDocumentPosition) {
            return this.root.compareDocumentPosition(this.node) === 0;
        } else {
            // Not supported in this environment - try our best
            return this.node.parentNode === null;
        }
    }

    nextNode() : boolean {
        let skipOwned = false;
        do {
            skipOwned = false;
            // console.log(this.node.nodeName, this.bEndTag?"END":"START", this.node.nodeType === 1 && (this.node as any).getAttribute("id"));
            if (!this.bEndTag) {
                let iframeNode = (this.node as HTMLIFrameElement);
                let elementNode = (this.node as HTMLElement);
                let slotElement = (this.node as HTMLSlotElement)
                if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && this.node.nodeName.toUpperCase() === "IFRAME"
                    && DOMWalker.isNodeVisible(iframeNode)
                    && iframeNode.contentDocument
                    && iframeNode.contentDocument.documentElement)
                {
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && DOMWalker.isNodeVisible(elementNode)
                    && elementNode.shadowRoot
                    && elementNode.shadowRoot.firstChild)
                {
                    let ownerElement = this.node;
                    this.node = elementNode.shadowRoot;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 
                    && elementNode.nodeName.toLowerCase() === "slot"
                    && slotElement.assignedNodes().length > 0) 
                {
                    //TODO: need to conside its own content, a slot may have its own content or assigned content
                    let slotOwner = this.node;
                    this.node = slotElement.assignedNodes()[0];
                    (this.node as any).slotOwner = slotOwner;
                    (this.node as any).slotIndex = 0;
                } else if ((this.node.nodeType === 1 /* Node.ELEMENT_NODE */ || this.node.nodeType === 11) /* Node.ELEMENT_NODE */ && this.node.firstChild) {
                    this.node = this.node.firstChild;
                } else {
                    this.bEndTag = true;
                }
            } else {
                if (this.atRoot()) {
                    return false;
                } else if ((this.node as any).slotOwner) {
                    let slotOwner = (this.node as any).slotOwner;
                    let nextSlotIndex = (this.node as any).slotIndex+1;
                    delete (this.node as any).slotOwner;
                    delete (this.node as any).slotIndex;
                    if (nextSlotIndex < slotOwner.assignedNodes().length) {
                        this.node = slotOwner.assignedNodes()[nextSlotIndex];
                        (this.node as any).slotOwner = slotOwner;
                        (this.node as any).slotIndex = nextSlotIndex;    
                        this.bEndTag = false;
                    } else {
                        this.node = slotOwner;
                        this.bEndTag = true;
                    }
                } else if ((this.node as any).ownerElement) {
                    this.node = (this.node as any).ownerElement;
                    this.bEndTag = true;
                } else if (this.node.nextSibling) {
                    this.node = this.node.nextSibling;
                    this.bEndTag = false;
                    skipOwned = true;
                } else if (this.node.parentNode) {
                    if (this.node.parentNode.nodeType === 1 && (this.node.parentNode as HTMLElement).hasAttribute("aria-owns")) {
                        let ownIds = (this.node.parentNode as HTMLElement).getAttribute("aria-owns").split(/ +/g);
                        if (this.node.nodeType !== 1 || !(this.node as HTMLElement).hasAttribute("id")) {
                            this.node = FragmentUtil.getOwnerFragment(this.node).getElementById(ownIds[0]);
                            this.bEndTag = false;
                        } else {
                            let idx = ownIds.indexOf((this.node as HTMLElement).getAttribute("id"));
                            if (idx === ownIds.length - 1) {
                                // last one
                                this.node = this.node.parentNode;
                                this.bEndTag = true;            
                            } else {
                                // grab next
                                this.node = FragmentUtil.getOwnerFragment(this.node).getElementById(ownIds[idx+1]);
                                this.bEndTag = false;
                            }
                        }
                    }
                    this.node = this.node.parentNode;
                    this.bEndTag = true;
                } else {
                    return false;
                }
            }
        } while (
            (this.node.nodeType !== 1 /* Node.ELEMENT_NODE */ && this.node.nodeType !== 11 && this.node.nodeType !== 3 /* Node.TEXT_NODE */)
            || (this.node.nodeType === 1 && (this.node as Element).getAttribute("aChecker") === "ACE")
            || (skipOwned && this.node.nodeType === 1 && !!ARIAMapper.getAriaOwnedBy(this.node as HTMLElement))
        );
        return true;
    }

    prevNode() : boolean {
        do {
            if (this.bEndTag) {
                let iframeNode = (this.node as HTMLIFrameElement);
                let elementNode = (this.node as HTMLElement);
                if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && this.node.nodeName.toUpperCase() === "IFRAME"
                    && DOMWalker.isNodeVisible(iframeNode)
                    && iframeNode.contentDocument
                    && iframeNode.contentDocument.documentElement) 
                {
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && DOMWalker.isNodeVisible(elementNode)
                    && elementNode.shadowRoot
                    && elementNode.shadowRoot.lastChild) 
                {
                    let ownerElement = this.node;
                    this.node = elementNode.shadowRoot;
                    (this.node as any).ownerElement = ownerElement;
                } else if ((this.node.nodeType === 1 /* Node.ELEMENT_NODE */ || this.node.nodeType === 11) && this.node.lastChild) {
                    this.node = this.node.lastChild;
                } else {
                    this.bEndTag = false;
                }
            } else {
                if (this.atRoot()) {
                    return false;
                } else if (this.node.previousSibling) {
                    this.node = this.node.previousSibling;
                    this.bEndTag = true;
                } else if ((this.node as any).ownerElement) {
                    this.node = (this.node as any).ownerElement;
                    this.bEndTag = false;
                } else if (this.node.parentNode) {
                    this.node = this.node.parentNode;
                    this.bEndTag = false;
                } else {
                    return false;
                }
            }
        } while (
            (this.node.nodeType !== 1 /* Node.ELEMENT_NODE */ && this.node.nodeType !== 11)
            || (this.node.nodeType === 1 && (this.node as Element).getAttribute("aChecker") === "ACE")
        );
        return true;
    }
}