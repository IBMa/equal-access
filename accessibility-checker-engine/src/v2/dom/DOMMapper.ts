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

    getBounds(node: Node) : Bounds {
        if (node.nodeType === 1 /*Node.ELEMENT_NODE*/) {
            let adjustment = 1;
            if (node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.devicePixelRatio) {
                adjustment = node.ownerDocument.defaultView.devicePixelRatio;
            }
            let bounds = (node as Element).getBoundingClientRect();
    
            // Do a check whether bounds has value as we use different tool (htmlUnit, browser) to call this function
            if (bounds) {
                return {
                    "left": Math.ceil(bounds.left * adjustment),
                    "top": Math.ceil(bounds.top * adjustment),
                    "height": Math.ceil(bounds.height * adjustment),
                    "width": Math.ceil(bounds.width * adjustment)
                };
            }
        }

        return null;
    }
}
