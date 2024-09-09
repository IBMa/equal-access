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

    constructor(element : Node, bEnd? : boolean, root? : Node, considerHidden? : boolean) {
        this.root = root || (element.ownerDocument ? element.ownerDocument.documentElement: element);
        this.node = element;
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
    
    static isNodeVisible(node: Node) {
        if (node === null) return false;
        
        try {
            let vis = null;
            while (node && node.nodeType !== 1 /* Node.ELEMENT_NODE */) {
                node = DOMWalker.parentElement(node);
            }
            let elem = node as Element;
            let w = elem.ownerDocument.defaultView;
            do {
                let cs = w.getComputedStyle(elem);
                if (cs.display === "none") return false;
                if (vis === null && cs.visibility) {
                    vis = cs.visibility;
                    if (vis === "hidden") return false;
                }
                elem = DOMWalker.parentElement(elem);
            } while (elem);
            return true;
        } catch (err) {
            return false;
        }
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
        if (!this.node) {
            this.bEndTag = false;
            return false;
        }
        do {
            //console.log("HERE", this.node.nodeName, this.bEndTag?"END":"START", this.node.nodeType === 1 && (this.node as any).getAttribute("id"));
            if (!this.bEndTag) {
                let iframeNode = (this.node as HTMLIFrameElement);
                let elementNode = (this.node as HTMLElement);
                let slotElement = (this.node as HTMLSlotElement)
                if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && this.node.nodeName.toUpperCase() === "IFRAME"
                    && (this.considerHidden ? DOMWalker.isNodeVisible(iframeNode) : true)
                    && iframeNode.contentDocument
                    && iframeNode.contentDocument.documentElement)
                {
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && (this.considerHidden ? DOMWalker.isNodeVisible(elementNode) : true)
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
                    let slotOwner = this.node;
                    this.node = slotElement.assignedNodes()[0];
                    (this.node as any).slotOwner = slotOwner;
                    (this.node as any).slotIndex = 0;
                //} else if ((this.node.nodeType === 1 /* Node.ELEMENT_NODE */ || this.node.nodeType === 11) /* Node.DOCUMENT_FRAGMENT_NODE */ && this.node.firstChild) {
                } else if (this.node.firstChild) {
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
                } else if (this.node.parentNode) {
                    this.node = this.node.parentNode;
                    this.bEndTag = true;
                } else {
                    return false;
                }
            }
        } while (
            (this.node.nodeType !== 1 && this.node.nodeType !== 11 && this.node.nodeType !== 3 )
            || (this.node.nodeType === 1 && (this.node as Element).getAttribute("aChecker") === "ACE")
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
                    && (this.considerHidden ? DOMWalker.isNodeVisible(iframeNode) : true)
                    && iframeNode.contentDocument
                    && iframeNode.contentDocument.documentElement) 
                {
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && (this.considerHidden ? DOMWalker.isNodeVisible(elementNode) : true)
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