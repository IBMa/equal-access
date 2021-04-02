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

import { RuleContextHierarchy } from "../../../api/IEngine";

export class FragmentUtil {
    public static getOwnerFragment(node: Node) : Document | DocumentFragment {
        let n : Node = node;
        while(n.parentNode && (n = n.parentNode)){
            if (n.nodeType === 11) {
                return n as DocumentFragment;
            }
        }
        return node.ownerDocument;
    }

    public static getById(node: Node, id: string) {
        return this.getOwnerFragment(node).getElementById(id);
    }

    public static getAncestor(hierarchies: RuleContextHierarchy, elemName: string) {
        let matches = hierarchies["dom"].filter(info => info.role === elemName);
        return matches.length > 0 && matches[0].node || null;
    }

    public static getAncestorWithRole(hierarchies: RuleContextHierarchy, role: string) {
        let matches = hierarchies["aria"].filter(info => info.role === role);
        return matches.length > 0 && matches[0].node || null;
    }
}