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

import { VisUtil } from "../../v4/util/VisUtil";
/**
 * Walks in a DOM order
 * 
 * Assumption that nodes of shadow DOMs call assignSlots on the shadow root before 
 * doing other processing in that tree. If you walk into a shadow root, the DOMWalker
 * will do it automatically.
 * 
 * See also ../aria/ARIAWalker
 */
export class DOMWalker {
    root : Node;
    node : Node;
    bEndTag: boolean;
    considerHidden: boolean;
    DEBUG: boolean;

    constructor(element : Node, bEnd? : boolean, root? : Node, considerHidden? : boolean, DEBUG?: boolean) {
        this.DEBUG = !!DEBUG;
        this.root = root || ((element && element.ownerDocument) ? element.ownerDocument.documentElement: element);
        if (this.root.nodeType === 9) {
            this.root = (this.root as Document).documentElement
        }
        this.node = element;
        if (this.node.nodeType === 9) {
            this.node = (this.node as Document).documentElement
        }
        this.bEndTag = (bEnd == undefined ? false : bEnd == true);
        this.considerHidden = considerHidden || false;
    }

    elem() : HTMLElement | null {
        return this.node.nodeType === 1 && this.node as HTMLElement || null;
    }
    
    static parentNode(node: Node) : Node | null {
        if (node === null) return null;
        let p : Node = node.parentNode;
        if ((node as any).slotOwner) {
            p = (node as any).slotOwner;
        } else if ((node as any).ownerElement) {
            p = (node as any).ownerElement;
        } else if (p && p.nodeType === 11) {
            if ((p as ShadowRoot).host) {
                p = (p as ShadowRoot).host;
            } else {
                p = null;
            }
        }
        return p;
    }

    static parentElement(node: Node) : Element | null {
        let elem : Element = node as Element;
        do { 
            elem = DOMWalker.parentNode(elem) as Element;
        } while (elem && elem.nodeType !== 1);
        return elem;
    }

    static assignSlots(root: ShadowRoot) {
        let slots = root.querySelectorAll("slot");
        for (let iSlot=0; iSlot<slots.length; ++iSlot) {
            let processSlot = slots[iSlot];
            let assignedNodes = processSlot.assignedNodes();
            for (let iAssigned=0; iAssigned<assignedNodes.length; ++iAssigned) {
                (assignedNodes[iAssigned] as any).slotOwner = processSlot;
                (assignedNodes[iAssigned] as any).slotIndex = iAssigned;
            }
        }
    }

    static firstChildNotOwnedBySlot(node: Node) {
        let retVal = node.firstChild;
        while (retVal && (retVal as any).slotOwner) {
            retVal = retVal.nextSibling;
        }
        return retVal;
    }

    static lastChildNotOwnedBySlot(node: Node) {
        let retVal = node.lastChild;
        while (retVal && (retVal as any).slotOwner) {
            retVal = retVal.previousSibling;
        }
        return retVal;
    }

    static nextSiblingNotOwnedBySlot(node:Node) {
        let retVal = node.nextSibling;
        while (retVal && (retVal as any).slotOwner) {
            retVal = retVal.nextSibling;
        }
        return retVal;
    }

    static previousSiblingNotOwnedBySlot(node:Node) {
        let retVal = node.previousSibling;
        while (retVal && (retVal as any).slotOwner) {
            retVal = retVal.previousSibling;
        }
        return retVal;
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

    DEBUGIDX = 0;
    indent = 0;
    nextNode() : boolean {
        const indent = () => {
            let s = "";
            for (let idx=0; idx<this.indent; ++idx) {
                s += " ";
            }
            return s;
        }
        let DBG = false;//this.DEBUGIDX >= 7 && this.DEBUGIDX <= 10;
        let startName = this.node.nodeName;
        if (!this.node) {
            this.bEndTag = false;
            return false;
        }
        do {
            //console.log(this.node.nodeName, this.bEndTag?"END":"START", this.node.nodeType === 1 && (this.node as any).getAttribute("id"));
            if (!this.bEndTag) {
                let iframeNode = (this.node as HTMLIFrameElement);
                let elementNode = (this.node as HTMLElement);
                let slotElement = (this.node as HTMLSlotElement)
                if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && this.node.nodeName.toUpperCase() === "IFRAME"
                    && (this.considerHidden ? VisUtil.isNodeVisible(iframeNode) : true)
                    && iframeNode.contentDocument
                    && iframeNode.contentDocument.documentElement)
                {
                    DBG && console.log("!!!Into Frame");
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && (this.considerHidden ? VisUtil.isNodeVisible(elementNode) : true)
                    && elementNode.shadowRoot
                    && elementNode.shadowRoot.firstChild)
                {
                    DBG && console.log("!!!Into shadow root");
                    let ownerElement = this.node;
                    this.node = elementNode.shadowRoot;
                    (this.node as any).ownerElement = ownerElement;
                    DOMWalker.assignSlots(this.node as ShadowRoot);
                } else if (this.node.nodeType === 1 
                    && elementNode.nodeName.toLowerCase() === "slot"
                    && slotElement.assignedNodes().length > 0) 
                {
                    DBG && console.log("!!!Into slot");
                    this.node = slotElement.assignedNodes()[0];
                } else if ((this.node.nodeType === 1 /* Node.ELEMENT_NODE */ || this.node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) 
                    && DOMWalker.firstChildNotOwnedBySlot(this.node)) {
                    DBG && console.log("!!!First child");
                    this.node = DOMWalker.firstChildNotOwnedBySlot(this.node);
                } else {
                    DBG && console.log("!!!Flip to end tag");
                    this.bEndTag = true;
                }
            } else {
                DBG && console.log("!!!1");
                if (this.atRoot()) {
                    DBG && console.log("!!!Done at root");
                    return false;
                } else if ((this.node as any).slotOwner) {
                    let slotOwner = (this.node as any).slotOwner;
                    let nextSlotIndex = (this.node as any).slotIndex+1;
                    // delete (this.node as any).slotOwner;
                    // delete (this.node as any).slotIndex;
                    if (nextSlotIndex < slotOwner.assignedNodes().length) {
                        DBG && console.log("!!!Next slot child");
                        this.node = slotOwner.assignedNodes()[nextSlotIndex];
                        this.bEndTag = false;
                    } else {
                        DBG && console.log("!!!Back up to slot owner");
                        this.node = slotOwner;
                        this.bEndTag = true;
                    }
                } else if ((this.node as any).ownerElement) {
                    DBG && console.log("!!!Up to frame owner");
                    this.node = (this.node as any).ownerElement;
                    this.bEndTag = true;
                } else if (DOMWalker.nextSiblingNotOwnedBySlot(this.node)) {
                    DBG && console.log("!!!Next sibling");
                    this.node = DOMWalker.nextSiblingNotOwnedBySlot(this.node);
                    this.bEndTag = false;
                } else if (this.node.parentNode) {
                    DBG && console.log("!!!Parent");
                    this.node = this.node.parentNode;
                    this.bEndTag = true;
                } else {
                    DBG && console.log("!!!Done with walk");
                    return false;
                }
            }
            if (DBG && (
                (this.node.nodeType !== 1 && this.node.nodeType !== 11 && this.node.nodeType !== 3 )
                || (this.node.nodeType === 1 && (this.node as Element).getAttribute("aChecker") === "ACE")
            )) {
                this.DEBUG && console.log(indent()+`<${this.bEndTag?"/":""}${this.node.nodeName}> (from ${startName}) ${this.DEBUGIDX++} SKIPPED`);
            }
        } while (
            (this.node.nodeType !== 1 && this.node.nodeType !== 11 && this.node.nodeType !== 3 )
            || (this.node.nodeType === 1 && (this.node as Element).getAttribute("aChecker") === "ACE")
        );
        if (this.bEndTag) this.indent -= 2;
        this.DEBUG && console.log(indent()+`<${this.bEndTag?"/":""}${this.node.nodeName}> (from ${startName}) ${this.DEBUGIDX++}`);
        this.DEBUG && (this.node as any).slotOwner && console.log(indent()+`slotOwner: ${(this.node as any).slotOwner.nodeName}`);
        this.DEBUG && (this.node as any).slotIndex && console.log(indent()+`slotIndex: ${(this.node as any).slotIndex}`);
        this.DEBUG && (this.node as any).ownerElement && console.log(indent()+`ownerElement: ${(this.node as any).ownerElement.nodeName}`);
        if (!this.bEndTag) this.indent += 2;
        return true;
    }

    prevNode() : boolean {
        do {
            if (this.bEndTag) {
                let iframeNode = (this.node as HTMLIFrameElement);
                let elementNode = (this.node as HTMLElement);
                if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && this.node.nodeName.toUpperCase() === "IFRAME"
                    && (this.considerHidden ? VisUtil.isNodeVisible(iframeNode) : true)
                    && iframeNode.contentDocument
                    && iframeNode.contentDocument.documentElement) 
                {
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && (this.considerHidden ? VisUtil.isNodeVisible(elementNode) : true)
                    && elementNode.shadowRoot
                    && elementNode.shadowRoot.lastChild) 
                {
                    let ownerElement = this.node;
                    this.node = elementNode.shadowRoot;
                    (this.node as any).ownerElement = ownerElement;
                    DOMWalker.assignSlots(this.node as ShadowRoot);
                } else if ((this.node.nodeType === 1 /* Node.ELEMENT_NODE */ || this.node.nodeType === 11) 
                    && DOMWalker.lastChildNotOwnedBySlot(this.node)) {
                    this.node = DOMWalker.lastChildNotOwnedBySlot(this.node);
                } else {
                    this.bEndTag = false;
                }
            } else {
                if (this.atRoot()) {
                    return false;
                } else if (DOMWalker.previousSiblingNotOwnedBySlot(this.node)) {
                    this.node = DOMWalker.previousSiblingNotOwnedBySlot(this.node);
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
            (this.node.nodeType !== 1 /* Node.ELEMENT_NODE */ && this.node.nodeType !== 11 && this.node.nodeType !== 3 )
            || (this.node.nodeType === 1 && (this.node as Element).getAttribute("aChecker") === "ACE")
        );
        return true;
    }
}