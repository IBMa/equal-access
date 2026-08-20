/******************************************************************************
  Copyright:: 2022- IBM, Inc
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

import { DOMUtil } from "../../v2/dom/DOMUtil";
import { DOMWalker } from "../../v2/dom/DOMWalker";

export interface CacheDocument extends Document {
    aceCache: { [key: string]: any }
}
export interface CacheElement extends Element {
    aceCache: { [key: string]: any }
}

export class CacheUtil {
    /* Return a pointer to the given global variable
         * with its initial value as given */
    public static getCache(cacheSpot: Element | Document | DocumentFragment, keyName, initValue) {
        if (!cacheSpot) return undefined;
        let cacheObj = (cacheSpot.nodeType === 9 /* Node.DOCUMENT_NODE */ || cacheSpot.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? cacheSpot as CacheDocument : cacheSpot as CacheElement;
        if (cacheObj.aceCache === undefined) {
            cacheObj.aceCache = {}
        }
        if (cacheObj.aceCache[keyName] === undefined) {
            cacheObj.aceCache[keyName] = initValue;
        }
        return cacheObj.aceCache[keyName]
    }

    public static setCache(cacheSpot: Document | Element | DocumentFragment | ShadowRoot, globalName, value): any {
        if (!cacheSpot) return undefined;
        let cacheObj = (cacheSpot.nodeType === 9 /* Node.DOCUMENT_NODE */ || cacheSpot.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? cacheSpot as CacheDocument : cacheSpot as CacheElement;
        if (cacheObj.aceCache === undefined) {
            cacheObj.aceCache = {}
        }
        cacheObj.aceCache[globalName] = value;
        return value;
    }

    public static getSetCache(cacheSpot: Element | Document | DocumentFragment, keyName, initFunc: () => any) {
        if (!cacheSpot) return undefined;
        let cacheObj = (cacheSpot.nodeType === 9 /* Node.DOCUMENT_NODE */ || cacheSpot.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? cacheSpot as CacheDocument : cacheSpot as CacheElement;
        if (cacheObj.aceCache === undefined) {
            cacheObj.aceCache = {}
        }
        if (cacheObj.aceCache[keyName] === undefined || typeof cacheObj.aceCache[keyName] === "undefined") {
            cacheObj.aceCache[keyName] = initFunc();
        }
        return cacheObj.aceCache[keyName]
    }

    public static clearCaches(cacheRoot: Node): number {
        let numNodesVisited = 0;
        delete (cacheRoot.ownerDocument as CacheDocument).aceCache;
        let nw = new DOMWalker(cacheRoot, false, cacheRoot, true);
        do {
            ++numNodesVisited;
            delete (nw.node as CacheElement).aceCache;
            nw.node.ownerDocument && delete (nw.node.ownerDocument as CacheDocument).aceCache;
        } while (nw.nextNode());
        if (cacheRoot !== cacheRoot.ownerDocument?.documentElement) {
            // Start the walker at the documentElement of cacheRoot's immediate document.
            // ownerDocument is guaranteed non-null here because the if-guard above
            // checks cacheRoot.ownerDocument?.documentElement.
            let nwDoc = new DOMWalker(cacheRoot.ownerDocument!.documentElement, false, undefined, true);
            // cacheRoot may be inside a shadow root or an iframe, which are themselves
            // nested inside ancestor documents. Walk up from cacheRoot across any
            // frame/shadow boundaries (DOMWalker.parentElement handles ownerElement
            // links set by the walker) to find the outermost ancestor element, then
            // reposition the walker there so the second pass covers every containing
            // document as well.
            {
                let tempElem: Element = nwDoc.node as Element;
                let parentElem: Element | null;
                while (parentElem = DOMWalker.parentElement(tempElem)) {
                    tempElem = parentElem;
                }
                nwDoc.node = tempElem;
            }
            do {
                // On the start-tag visit of cacheRoot, skip its entire subtree —
                // it was already cleared and counted in the first pass above.
                // Setting bEndTag=true makes the next nextNode() call emit cacheRoot's
                // end-tag and then advance to its next sibling without descending into
                // its children.
                if (!nwDoc.bEndTag && DOMUtil.sameNode(cacheRoot, nwDoc.node)) {
                    nwDoc.bEndTag = true;
                    continue;
                }
                delete (nwDoc.node as any).aceCache;
                nwDoc.node.ownerDocument && delete (nwDoc.node.ownerDocument as any).aceCache;
            } while (nwDoc.nextNode());
        }

        return numNodesVisited;
    }
}