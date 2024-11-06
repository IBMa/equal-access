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

import { CommonMapper } from "../common/CommonMapper";
import { Bounds } from "../api/IMapper";
import { CacheUtil } from "../../v4/util/CacheUtil";

export class DOMMapper extends CommonMapper {
    getRole(node: Node) : string {
        return node.nodeName.toLowerCase();
    }
    getNamespace(): string {
        return "dom"
    }
    getAttributes(node: Node) : { [key:string]: string } {
        let retVal = {};
        if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
            const elem = node as Element;
            for (let idx=0; idx<elem.attributes.length; ++idx) {
                const attrInfo = elem.attributes[idx];
                retVal[attrInfo.name.toLowerCase()] = attrInfo.nodeValue;
            }
        }
        return retVal;
    }

    /**
     * get scaled bounds for screenshot etc. adjusted for devicePixelRatio and scroll
     * @param node 
     * @returns 
     */
    getBounds(node: Node) : Bounds {
        if (node.nodeType !== 1 /*Node.ELEMENT_NODE*/) return null;

        const bunds = CacheUtil.getCache(node as Element, "DOMMapper_Bounds", undefined);
        if (bunds === undefined) {
            let adjustment = 1;
            if (node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.devicePixelRatio) {
                adjustment = node.ownerDocument.defaultView.devicePixelRatio;
            }
            let bounds = (node as Element).getBoundingClientRect();
    
            // Do a check whether bounds has value as we use different tool (htmlUnit, browser) to call this function
            if (bounds) {
                let scrollX = node && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.scrollX || 0;
                let scrollY = node && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.scrollY || 0;
                const ret = {
                    "left": Math.ceil((bounds.left + scrollX) * adjustment),
                    "top": Math.ceil((bounds.top + scrollY) * adjustment),
                    "height": Math.ceil(bounds.height * adjustment),
                    "width": Math.ceil(bounds.width * adjustment)
                };
                CacheUtil.setCache(node as Element, "DOMMapper_Bounds", ret);
                return ret;
            }
            return null;
        }
        return bunds;
    }

    /**
     * get real CSS bounds in css pixels, adjusted for scroll only
     * @param node 
     * @returns 
     */
    getUnadjustedBounds(node: Node) : Bounds {
        if (node.nodeType !== 1 /*Node.ELEMENT_NODE*/) return null;

        const bunds = CacheUtil.getCache(node as Element, "DOMMapper_UnadjustedBounds", undefined);
        if (bunds === undefined) {
            const bounds = (node as Element).getBoundingClientRect();
            // adjusted for scroll if any
            if (bounds) {
                let scrollX = node && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.scrollX || 0;
                let scrollY = node && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.scrollY || 0;
                const ret = {
                    "left": Math.ceil(bounds.left + scrollX),
                    "top": Math.ceil(bounds.top + scrollY),
                    "height": Math.ceil(bounds.height),
                    "width": Math.ceil(bounds.width)
                };
                CacheUtil.setCache(node as Element, "DOMMapper_UnadjustedBounds", ret);
                return ret;
            }
            return null;
        }
        return bunds;
    }
}
