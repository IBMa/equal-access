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

export class DOMUtil {
    
    static hasParent(node: Node, names:string[]) {
        let p = DOMUtil.parentElement(node);
        while (p && !names.includes(p.nodeName)) {
            p = DOMUtil.parentElement(p);
        }
        return !!p;
    }

    static getAncestor(node: Node, names:string[]) {
        let p = DOMUtil.parentElement(node);
        while (p && !names.includes(p.nodeName.toLowerCase())) {
            p = DOMUtil.parentElement(p);
        }
        return p;
    }

    static isNodeVisible(node: Node) {
        try {
            let vis = null;
            while (node && node.nodeType !== 1 /* Node.ELEMENT_NODE */) {
                node = DOMUtil.parentElement(node);
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
                elem = DOMUtil.parentElement(elem);
            } while (elem);
            return true;
        } catch (err) {
            return false;
        }
    }

    static sameNode(a: Node, b: Node) : boolean {
        if (a === b) {
            return true;
        } else if (a.isSameNode) {
            return a.isSameNode(b);
        } else if (a.compareDocumentPosition) {
            return a.compareDocumentPosition(b) === 0;
        } else {
            // Not supported in this environment - try our best
            return true;
        }
    }

    static cleanWhitespace(s: string) : string {
        let retVal = s.replace(/[ \t\r\n]/g, " ").replace(/ +/g," ");
        return retVal;
    }

    static cleanSpace(s: string) : string {
        let retVal = s.replace(/ +/g," ");
        return retVal;
    }

    static parentNode(node: Node) : Node | null {
        let p : Node = node.parentNode;
        if (p && p.nodeType === 11) {
            if ((p as ShadowRoot).host) {
                p = (p as ShadowRoot).host;
            } else if ((p as any).ownerElement) {
                p = (p as any).ownerElement;
            } else {
                p = null;
            }
        }
        return p;
    }

    static parentElement(node: Node) : Element | null {
        let elem;
        do {
            elem = DOMUtil.parentNode(node) as Element;
        } while (elem && elem.nodeType !== 1);
        return elem;
    }
}