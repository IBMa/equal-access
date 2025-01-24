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

import { IIssue } from "../interfaces/interfaces";

export default class DomPathUtils {
    public static getScreenRect(node: HTMLElement) {
        if (typeof node.getBoundingClientRect === 'undefined') {
            return null;
        } else {
            let rect = node.getBoundingClientRect();
            rect.y += window.scrollY;
            rect.x += window.scrollX;
            return rect;
        }
    }

    public static domPathsToElements(xpaths: string[]) {
        // console.log("Function: domPathsToElements: ")
        let results: HTMLElement[] = [];
        xpaths.map((xpath: any) => {
            // console.log("xpath ",index);
            let element;
            // console.log("xpath = ",xpath);
            element = this.domPathToElem(xpath);
            if (element) {
                results.push(element);
            }
        });
        return results;
    }
    
    public static issuesToDomPaths(issues: IIssue[]) {
        // console.log("Inside issuesToDomPaths");
        let tabXpaths: string[] = [];
        issues.map((result) => {
            if (result != null) {
                // console.log("result.path.dom = "+result.path.dom);
                tabXpaths.push(result.path.dom);
            }
        });
        return tabXpaths;
    }

    private static docDomPathToElement(doc: Document | ShadowRoot, domPath:string) : HTMLElement | null {
        if (doc.nodeType === 1) { // element
            let selector = domPath.substring(1).replace(/\//g, " > ").replace(/\[(\d+)\]/g, ":nth-of-type($1)"); // fixed from original
            let element = doc.querySelector(selector);
            return element as HTMLElement;
        } else if (doc.nodeType === 11) { // document fragment 
            let selector = ":host" + domPath.replace(/\//g, " > ").replace(/\[(\d+)\]/g, ":nth-of-type($1)"); // fixed from original
            let element = doc.querySelector(selector);
            return element as HTMLElement;
        } else { // regular doc type = 9
            domPath = domPath.replace(/\/svg\[/g, "/svg:svg[");
            let nodes = (doc as Document).evaluate(domPath, doc, function(prefix) { 
                if (prefix === 'svg') { 
                    return 'http://www.w3.org/2000/svg';
                } else {
                    return null;
                }
            }, XPathResult.ANY_TYPE, null);
            let element = nodes.iterateNext();
            if (element) {
                console.log("docDomPathToElement returned element: ", element);
                return element as HTMLElement;
            } else {
                return null;
            }
        }
    }

    public static domPathToElem(srcPath: string | null | undefined) {
        let doc : Document | ShadowRoot = document;
        let element = null;
        while (srcPath && (srcPath.includes("iframe") || srcPath.includes("#document-fragment") || srcPath.includes("slot"))) {
            let parts = srcPath.match(/(.*?)(\/#document-fragment\[\d+\]|iframe\[\d+\]|slot\[\d+\]\/[^/]*)(.*)/)!;
            if (parts[2].includes("iframe")) {
                let iframe = this.docDomPathToElement(doc, parts[1]+parts[2]) as HTMLIFrameElement;
                element = iframe || element;
                if (iframe && iframe.contentDocument) {
                    doc = iframe.contentDocument;
                    srcPath = parts![3];
                } else {
                    srcPath = null;
                }
            } else if (parts[2].includes("#document-fragment")) {
                let fragment : any = element;
                if (parts[1].length > 0) {
                    fragment = this.docDomPathToElement(doc, parts![1]); // get fragment which is in main document
                }
                element = fragment || element;
                if (fragment && fragment.shadowRoot) {
                    doc = fragment.shadowRoot;
                    srcPath = parts![3];
                } else {
                    srcPath = null;
                }
            } else {
                // slots
                let slotParts = parts[2].match(/(slot\[\d+\])\/([^[]*)\[(\d+)\]/)!;
                let slot = this.docDomPathToElement(doc, parts[1]+slotParts[1]);
                let count = parseInt(slotParts[3]);
                for (let slotIdx=0; slotIdx < (slot as any).assignedNodes().length; ++slotIdx) {
                    let slotNode = (slot as any).assignedNodes()[slotIdx];
                    if (slotNode.nodeName.toLowerCase() === slotParts[2].toLowerCase()) {
                        --count;
                        if (count === 0) {
                            element = slotNode;
                            break;
                        }
                    }
                }
                if (count !== 0) {
                    srcPath = null;
                } else {
                    srcPath = parts[3];
                    doc = element;
                }
            }
        }
        if (srcPath) {
            element = this.docDomPathToElement(doc, srcPath) || element;
        }
        console.log("domPathToElem returned element: ", element);
        return element;
    }

    public static getDomPathForElement(element: any) {
        const idx: any = (sib: any, name: any) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
        const segs: any = (elm: any) => (!elm || elm.nodeType !== 1) ? [''] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
        return segs(element).join('/');
    }
}
