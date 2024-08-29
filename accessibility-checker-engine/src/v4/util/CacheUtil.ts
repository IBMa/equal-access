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
        let cacheObj = (cacheSpot.nodeType === 9 /* Node.DOCUMENT_NODE */ || cacheSpot.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? cacheSpot as CacheDocument : cacheSpot as CacheElement;
        if (cacheObj.aceCache === undefined) {
            cacheObj.aceCache = {}
        }
        cacheObj.aceCache[globalName] = value;
        return value;
    }


    public static clearCaches(cacheRoot: Node): void {
        delete (cacheRoot.ownerDocument as CacheDocument).aceCache;
        let nw = new DOMWalker(cacheRoot);
        do {
            delete (nw.node as CacheElement).aceCache;
            nw.node.ownerDocument && delete (nw.node.ownerDocument as CacheDocument).aceCache;
        } while (nw.nextNode());
    }
}