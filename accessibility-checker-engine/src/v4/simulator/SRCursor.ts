import { NodeWalker } from "../../v2/dom/NodeWalker";
import { AccessibleNameResult, AccNameUtil } from "../util/AccNameUtil";
import { AriaUtil } from "../util/AriaUtil";

export type SRCursorMatchFunc = (role: string, bStartTag: boolean, node: Node) => boolean;

export class SRCursor {
    private role: string;
    private name: AccessibleNameResult;
    private walker: NodeWalker;
    
    constructor(element : Node, bEnd? : boolean, root? : Node) {
        this.walker = new NodeWalker(element, bEnd);
        if (element) {
            this.refreshName();
        }
    }

    clone() : SRCursor {
        let retVal = new SRCursor(this.walker.node, this.walker.bEndTag);
        retVal.role = this.role;
        retVal.name = this.name;
        return retVal;
    }

    // set(other: SRCursor) {
    //     this.role = other.role;
    //     this.name = other.name;
    //     this.walker.node = other.walker.node;
    //     this.walker.bEndTag = other.walker.bEndTag;
    // }
    private refreshName() {
        if (this.walker.node.nodeType === 1) {
            this.role = AriaUtil.getResolvedRole(this.walker.node as HTMLElement, true);
            this.name = AccNameUtil.computeAccessibleName(this.walker.node as HTMLElement);
        } else if (this.walker.node.nodeType === 3) {
            this.role = "text";
            this.name = { name: this.walker.node.textContent, nameFrom: "text" };
        } else {
            this.role = undefined;
            this.name = undefined;
        }
    }

    public next(matchingFunc: SRCursorMatchFunc) : boolean {
        let bContinue = true;
        let foundNext = false;
        while (bContinue && !foundNext) {
            bContinue = this.walker.nextNode();
            if (bContinue) {
                if (this.walker.node.nodeType === 1) {
                    this.role = AriaUtil.getResolvedRole(this.walker.node as HTMLElement, true);
                } else if (this.walker.node.nodeType === 3) {
                    this.role = "text";
                }
                foundNext = matchingFunc(this.role, !this.walker.bEndTag, this.walker.node);
            }
        }
        if (foundNext) {
            this.refreshName();
        } else {
            this.role = undefined;
            this.name = undefined;
        }
        return foundNext;
    }

    public previous(matchingFunc: SRCursorMatchFunc) : boolean {
        let bContinue = true;
        let foundNext = false;
        while (bContinue && !foundNext) {
            bContinue = this.walker.prevNode();
            if (bContinue) {
                if (this.walker.node.nodeType === 1) {
                    this.role = AriaUtil.getResolvedRole(this.walker.node as HTMLElement, true);
                } else if (this.walker.node.nodeType === 3) {
                    this.role = "text";
                }
                foundNext = matchingFunc(this.role, !this.walker.bEndTag, this.walker.node);
            }
        }
        if (foundNext) {
            this.refreshName();
        } else {
            this.role = undefined;
            this.name = undefined;
        }
        return foundNext;
    }

    public parent(endTag?: boolean) {
        if (!this.walker.node.parentNode) return false;
        this.walker.node = this.walker.node.parentNode;
        this.walker.bEndTag = endTag === true;
        if (this.walker.node.nodeType === 1) {
            this.role = AriaUtil.getResolvedRole(this.walker.node as HTMLElement, true);
            this.name = AccNameUtil.computeAccessibleName(this.walker.node as HTMLElement);
        } else if (this.walker.node.nodeType === 3) {
            this.role = "text";
            this.name = { name: this.walker.node.textContent, nameFrom: "text" };
        } else {
            this.role = undefined;
            this.name = undefined;
        }
        return true;
    }

    public getCurrentOrParentByRole(roles: string[], elems?: string[]) {
        const uppElems = elems ? elems.map(elem => elem.toUpperCase()) : [];
        const matches = (walker: SRCursor) => {
            const elem = walker.getElement();
            return roles.includes(this.getRole())
            || (elem && !elem.hasAttribute("role") && uppElems.includes(elem.nodeName.toUpperCase()));
        }
        while (!matches(this) && this.parent());
        return matches(this);
    }

    public getCurrentOrParentByRoleClone(roles: string[], elems?: string[]) {
        let retVal = this.clone();
        if (retVal.getCurrentOrParentByRole(roles, elems)) {
            return retVal;
        }
        return null;
    }

    public getRole(): string | undefined {
        return this.role;
    }

    public getName(): AccessibleNameResult | undefined {
        return this.name;
    }

    public setEndTag(val: boolean) {
        this.walker.bEndTag = val;
    }

    public getNode() {
        return this.walker.node;
    }

    public getElement() {
        if (this.walker.node.nodeType !== 1) return undefined;
        return this.walker.node as HTMLElement;
    }

    public isEndTag() {
        return this.walker.bEndTag;
    }

    /**
     * 
     * @param one 
     * @param two 
     * @returns 0 if equal, -1 if one is before two, 1 if one is after two
     */
    public static compare(one: SRCursor | null, two: SRCursor | null) {
        const nodeOne = one?.walker?.node;
        const nodeTwo = two?.walker?.node;
        if (!nodeOne && !nodeTwo) return 0;
        if (!nodeOne) return 1;
        if (!nodeTwo) return -1
        let docPosition = nodeOne.compareDocumentPosition(nodeTwo);
        if (docPosition & 0x8) {
            // one is contained within two
            // if two is an end tag, one is before, otherwise, one is after
            return two.walker.bEndTag ? -1 : 1;
        } else if (docPosition & 0x10) {
            // two is contained within one
            // if one is an end tag, one is after, otherwise, one is before
            return one.walker.bEndTag ? 1 : -1;
        } else if (docPosition & 0x2) {
            return 1;
        } else if (docPosition & 0x4) {
            return -1;
        }
        return 0;
    }

    public contains(other: SRCursor) {
        return this.getNode().contains(other.getNode()) 
            && !this.getNode().isSameNode(other.getNode());
    }
}