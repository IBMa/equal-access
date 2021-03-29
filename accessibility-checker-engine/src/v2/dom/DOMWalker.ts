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

import { DOMUtil } from "./DOMUtil";

export class DOMWalker {
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
        do {
            if (!this.bEndTag) {
                let iframeNode = (this.node as HTMLIFrameElement);
                let elementNode = (this.node as HTMLElement);
                if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && this.node.nodeName.toUpperCase() === "IFRAME"
                    && DOMUtil.isNodeVisible(iframeNode)
                    && iframeNode.contentDocument
                    && iframeNode.contentDocument.documentElement)
                {
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && DOMUtil.isNodeVisible(elementNode)
                    && elementNode.shadowRoot
                    && elementNode.shadowRoot.firstChild)
                {
                    let ownerElement = this.node;
                    this.node = elementNode.shadowRoot;
                    (this.node as any).ownerElement = ownerElement;
                } else if ((this.node.nodeType === 1 /* Node.ELEMENT_NODE */ || this.node.nodeType === 11) /* Node.ELEMENT_NODE */ && this.node.firstChild) {
                    this.node = this.node.firstChild;
                } else {
                    this.bEndTag = true;
                }
            } else {
                if (this.atRoot()) {
                    return false;
                } else if (this.node.nextSibling) {
                    this.node = this.node.nextSibling;
                    this.bEndTag = false;
                } else if ((this.node as any).ownerElement) {
                    this.node = (this.node as any).ownerElement;
                    this.bEndTag = true;
                } else if (this.node.parentNode) {
                    this.node = this.node.parentNode;
                    this.bEndTag = true;
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

    prevNode() : boolean {
        do {
            if (this.bEndTag) {
                let iframeNode = (this.node as HTMLIFrameElement);
                let elementNode = (this.node as HTMLElement);
                if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && this.node.nodeName.toUpperCase() === "IFRAME"
                    && DOMUtil.isNodeVisible(iframeNode)
                    && iframeNode.contentDocument
                    && iframeNode.contentDocument.documentElement) 
                {
                    let ownerElement = this.node;
                    this.node = iframeNode.contentDocument.documentElement;
                    (this.node as any).ownerElement = ownerElement;
                } else if (this.node.nodeType === 1 /* Node.ELEMENT_NODE */ 
                    && DOMUtil.isNodeVisible(elementNode)
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