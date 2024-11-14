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

/* Return a node walker for the given element.
 * bEnd is optional and defaults to false
 * but if true, indicates the node is the end node
 * 
 * TO be removed, replaced by DOMWalker.ts
 */
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