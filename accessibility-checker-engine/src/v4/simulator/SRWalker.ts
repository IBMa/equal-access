import { NodeWalker } from "../../v2/dom/NodeWalker";
import { AccessibleNameResult, AccNameUtil } from "../util/AccNameUtil";
import { AriaUtil } from "../util/AriaUtil";

export type SRWalkerMatchFunc = (role: string, bStartTag: boolean, node: Node) => boolean;

export class SRWalker {
    private role: string;
    private name: AccessibleNameResult;
    private walker: NodeWalker;
    
    constructor(element : Node, bEnd? : boolean, root? : Node) {
        this.walker = new NodeWalker(element, bEnd);
    }

    clone() : SRWalker {
        let retVal = new SRWalker(this.walker.node, this.walker.bEndTag);
        retVal.role = this.role;
        retVal.name = this.name;
        return retVal;
    }

    // set(other: SRWalker) {
    //     this.role = other.role;
    //     this.name = other.name;
    //     this.walker.node = other.walker.node;
    //     this.walker.bEndTag = other.walker.bEndTag;
    // }

    public next(matchingFunc: SRWalkerMatchFunc) : boolean {
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
        } else {
            this.role = undefined;
            this.name = undefined;
        }
        return foundNext;
    }

    public previous(matchingFunc: SRWalkerMatchFunc) : boolean {
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

    public isEndTag() {
        return this.walker.bEndTag;
    }

    /**
     * 
     * @param one 
     * @param two 
     * @returns 0 if equal, -1 if one is before two, 1 if one is after two
     */
    public static compare(one: SRWalker | null, two: SRWalker | null) {
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

    public contains(other: SRWalker) {
        return this.getNode().contains(other.getNode()) 
            && !this.getNode().isSameNode(other.getNode());
    }
}