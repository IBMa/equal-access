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

export class StyleMapper extends CommonMapper {
    getRole(node: Node) : string {
        return "computed";
    }
    getNamespace(): string {
        return "css"
    }
    getAttributes(node: Node) : { [key:string]: string } {
        let retVal = {};
        if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
            const elem = node as Element;
            let style: CSSStyleDeclaration;
            try {
                style = elem?.ownerDocument?.defaultView?.getComputedStyle(elem);
            } catch (err) {}
            for (let idx=0; style && idx<style.length; ++idx) {
                const name = style[idx].toLowerCase();
                retVal[name] = style[name];
            }
        }
        return retVal;
    }
}
