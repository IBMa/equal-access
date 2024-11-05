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
                    DBG && console.log("!!!0a");
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && (this.considerHidden ? VisUtil.isNodeVisible(elementNode) : true)
                    && elementNode.shadowRoot
                    && elementNode.shadowRoot.firstChild)
                {
                    DBG && console.log("!!!0b");
                    let ownerElement = this.node;
                    this.node = elementNode.shadowRoot;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 
                    && elementNode.nodeName.toLowerCase() === "slot"
                    && slotElement.assignedNodes().length > 0) 
                {
                    DBG && console.log("!!!0c");
                    let slotOwner = this.node;
                    this.node = slotElement.assignedNodes()[0];
                    (this.node as any).slotOwner = slotOwner;
                    (this.node as any).slotIndex = 0;
                } else if ((this.node.nodeType === 1 /* Node.ELEMENT_NODE */ || this.node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) && this.node.firstChild && !(this.node.firstChild as any).slotOwner) {
                    DBG && console.log("!!!0d");
                    this.node = this.node.firstChild;
                } else {
                    DBG && console.log("!!!0e");
                    this.bEndTag = true;
                }
            } else {
                DBG && console.log("!!!1");
                if (this.atRoot()) {
                    DBG && console.log("!!!1a");
                    return false;
                } else if ((this.node as any).slotOwner) {
                    DBG && console.log("!!!1b");
                    let slotOwner = (this.node as any).slotOwner;
                    let nextSlotIndex = (this.node as any).slotIndex+1;
                    // delete (this.node as any).slotOwner;
                    // delete (this.node as any).slotIndex;
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
                    DBG && console.log("!!!1c");
                    this.node = (this.node as any).ownerElement;
                    this.bEndTag = true;
                } else if (this.node.nextSibling) {
                    DBG && console.log("!!!1d");
                    this.node = this.node.nextSibling;
                    this.bEndTag = false;
                } else if (this.node.parentNode) {
                    DBG && console.log("!!!1e");
                    this.node = this.node.parentNode;
                    this.bEndTag = true;
                } else {
                    DBG && console.log("!!!f");
                    return false;
                }
            }
        } while (
            (this.node.nodeType !== 1 && this.node.nodeType !== 11 && this.node.nodeType !== 3 )
            || (this.node.nodeType === 1 && (this.node as Element).getAttribute("aChecker") === "ACE")
        );
        const indent = () => {
            let s = "";
            for (let idx=0; idx<this.indent; ++idx) {
                s += " ";
            }
            return s;
        }
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