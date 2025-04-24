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

import { IMapper, IMapResult, Bounds } from "../api/IMapper";
import { DOMWalker } from "../dom/DOMWalker";

export abstract class CommonMapper implements IMapper {
    abstract getRole(node: Node) : string;
    abstract getNamespace() : string;
    abstract getAttributes(node: Node) : { [key:string]: string };

    protected hierarchyRole : string[] = null;
    protected hierarchyPath: Array<{
        rolePath: string,
        roleCount: {
            [role: string]: number
        }
    }> = null;
    protected hierarchyResults: IMapResult[] = null;

    getBounds(node: Node) : Bounds {
        return null;
    }

    reset(node: Node) {
        this.hierarchyRole = [];
        this.hierarchyResults = [];
        this.hierarchyPath = [{
            rolePath: "",
            roleCount: {}
        }];

        let ancestors : Node[] = [];
        let parent = DOMWalker.parentNode(node);
        while (parent && parent.nodeType != 9 /* Node.DOCUMENT_NODE */) {
            ancestors.push(parent);
            parent = DOMWalker.parentNode(parent);
        }
        ancestors = ancestors.reverse();
        for (const ancestor of ancestors) {
            let siblings = [];
            let sibling = ancestor.previousSibling;
            while (sibling) {
                siblings.push(sibling);
                sibling = sibling.previousSibling;
            }
            siblings = siblings.reverse();
            for (const sibling of siblings) {
                this.pushHierarchy(sibling);
                this.popHierarchy();
            }
            this.pushHierarchy(ancestor);
        }
    }

    protected pushHierarchy(node: Node) {
        let role : string = this.getRole(node) || null;
        this.hierarchyRole.push(role);
        if (role !== null) {
            let parentPathInfo = this.hierarchyPath[this.hierarchyPath.length-1];
            parentPathInfo.roleCount[role] = (parentPathInfo.roleCount[role] || 0) + 1; 
            this.hierarchyPath.push({
                "rolePath": parentPathInfo.rolePath+"/"+role+"["+parentPathInfo.roleCount[role]+"]",
                "roleCount": {}
            });
        }

        let attr = {}
        if (node.nodeType === 1) {
            attr = this.getAttributes(node);
        }
        this.hierarchyResults.push({
            node: node,
            namespace: this.getNamespace(),
            role: role,
            attributes: attr,
            rolePath: this.hierarchyPath[this.hierarchyPath.length-1].rolePath,
            bounds: this.getBounds(node)
        })
    }

    protected popHierarchy() {
        let role = this.hierarchyRole.pop();
        if (role !== null) {
            this.hierarchyPath.pop();
        }
        this.hierarchyResults.pop();
    }

    openScope(node: Node): IMapResult[] {
        if (this.hierarchyRole === null) {
            this.reset(node);
        }
        this.pushHierarchy(node)

        return this.hierarchyResults;
    }

    closeScope(node: Node): IMapResult[] {
        let retVal : IMapResult[] = [];
        for (const res of this.hierarchyResults) {
            // const temp = res.node;
            // res.node = null;
            // let cloned = JSON.parse(JSON.stringify(res));
            // cloned.node = res.node = temp; 
            // retVal.push(cloned);
            retVal.push(res);
        }
        retVal[retVal.length-1].role = "/"+retVal[retVal.length-1].role
        this.popHierarchy();
        return retVal;
    }
}
