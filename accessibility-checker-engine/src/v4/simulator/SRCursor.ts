import { NodeWalker } from "../../v2/dom/NodeWalker";
import { AccessibleNameResult, AccNameUtil } from "../util/AccNameUtil";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";

/**
 * Function type for matching nodes during cursor navigation
 * @param role - The ARIA role of the current node
 * @param bStartTag - Whether this is a start tag (true) or end tag (false)
 * @param node - The DOM node being evaluated
 * @returns True if the node matches the criteria, false otherwise
 */
export type SRCursorMatchFunc = (role: string, bStartTag: boolean, node: Node) => boolean;

/**
 * SRCursor (Screen Reader Cursor) class
 *
 * This class provides a cursor-like interface for navigating the DOM in a way that
 * simulates how screen readers process and navigate content. It tracks:
 * - The current node position
 * - Whether it's at a start or end tag
 * - The ARIA role of the current node
 * - The accessible name of the current node
 */
export class SRCursor {
    /** The ARIA role of the current node */
    private role: string;
    /** The computed accessible name of the current node */
    private name: AccessibleNameResult;
    /** The underlying DOM walker that handles node traversal */
    private walker: NodeWalker;
    
    /**
     * Creates a new SRCursor positioned at the specified element
     * @param element - The DOM node to position the cursor at
     * @param bEnd - Whether to position at the end tag (true) or start tag (false)
     */
    constructor(element : Node, bEnd? : boolean) {
        this.walker = new NodeWalker(element, bEnd);
        if (element) {
            this.refreshName();
        }
    }

    /**
     * Creates a copy of this cursor at the same position
     * @returns A new SRCursor instance with the same position and properties
     */
    clone() : SRCursor {
        let retVal = new SRCursor(this.walker.node, this.walker.bEndTag);
        retVal.role = this.role;
        retVal.name = this.name;
        return retVal;
    }

    /**
     * Updates the role and accessible name properties based on the current node
     * This is called whenever the cursor position changes
     * @private
     */
    private refreshName() {
        if (this.walker.node.nodeType === 1) {
            // Element node
            this.role = AriaUtil.getResolvedRole(this.walker.node as HTMLElement, true);
            this.name = AccNameUtil.computeAccessibleName(this.walker.node as HTMLElement);
        } else if (this.walker.node.nodeType === 3) {
            // Text node
            this.role = "text";
            this.name = { name: this.walker.node.textContent, nameFrom: "text" };
        } else {
            // Other node types
            this.role = undefined;
            this.name = undefined;
        }
    }

    /**
     * Moves the cursor to the next node that matches the provided criteria
     * @param matchingFunc - Function that determines if a node matches the search criteria
     * @returns true if a matching node was found, false otherwise
     */
    public next(matchingFunc: SRCursorMatchFunc) : boolean {
        let bContinue = true;
        let foundNext = false;
        while (bContinue && !foundNext) {
            bContinue = this.walker.nextNode();
            if (bContinue) {
                // Update role based on node type
                if (this.walker.node.nodeType === 1) {
                    this.role = AriaUtil.getResolvedRole(this.walker.node as HTMLElement, true);
                } else if (this.walker.node.nodeType === 3) {
                    this.role = "text";
                }
                // Check if this node matches our criteria
                foundNext = matchingFunc(this.role, !this.walker.bEndTag, this.walker.node);
            }
        }
        if (foundNext) {
            this.refreshName();
        } else {
            // Reset properties if no match was found
            this.role = undefined;
            this.name = undefined;
        }
        return foundNext;
    }

    /**
     * Moves the cursor to the previous node that matches the provided criteria
     * @param matchingFunc - Function that determines if a node matches the search criteria
     * @returns true if a matching node was found, false otherwise
     */
    public previous(matchingFunc: SRCursorMatchFunc) : boolean {
        let bContinue = true;
        let foundNext = false;
        while (bContinue && !foundNext) {
            bContinue = this.walker.prevNode();
            if (bContinue) {
                // Update role based on node type
                if (this.walker.node.nodeType === 1) {
                    this.role = AriaUtil.getResolvedRole(this.walker.node as HTMLElement, true);
                } else if (this.walker.node.nodeType === 3) {
                    this.role = "text";
                }
                // Check if this node matches our criteria
                foundNext = matchingFunc(this.role, !this.walker.bEndTag, this.walker.node);
            }
        }
        if (foundNext) {
            this.refreshName();
        } else {
            // Reset properties if no match was found
            this.role = undefined;
            this.name = undefined;
        }
        return foundNext;
    }

    /**
     * Moves the cursor to the parent node of the current node
     * @param endTag - Whether to position at the end tag (true) or start tag (false)
     * @returns true if successfully moved to parent, false if no parent exists
     */
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

    /**
     * Moves the cursor up the DOM tree until finding a node with a matching role or element name
     * @param roles - Array of ARIA roles to match
     * @param elems - Optional array of element names to match
     * @returns true if a matching node was found, false otherwise
     */
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

    /**
     * Creates a new cursor and moves it up the DOM tree until finding a node with a matching role or element name
     * @param roles - Array of ARIA roles to match
     * @param elems - Optional array of element names to match
     * @returns A new cursor at the matching node, or null if no match found
     */
    public getCurrentOrParentByRoleClone(roles: string[], elems?: string[]) {
        let retVal = this.clone();
        if (retVal.getCurrentOrParentByRole(roles, elems)) {
            return retVal;
        }
        return null;
    }

    /**
     * Gets the ARIA role of the current node
     * @returns The ARIA role as a string, or undefined if not available
     */
    public getRole(): string | undefined {
        return this.role;
    }

    /**
     * Gets the accessible name info for the current node
     * @returns The AccessibleNameResult object, or undefined if not available
     */
    public getNameInfo(): AccessibleNameResult | undefined {
        return this.name;
    }

    /**
     * Get the accessible name of the current node
     */
    public getName(): string | undefined {
        // Handle one-off quirks in the name calculation
        const nameInfo = this.getNameInfo();
        if (nameInfo && nameInfo.name) {
            return nameInfo.name;
        }
        const elem = this.getElement();
        if (elem) {
            const labelElem = CommonUtil.getLabelForElementHidden(elem, true);
            if (labelElem) {
                return labelElem.innerText || labelElem.textContent;
            }
        }
    }

    /**
     * Sets whether the cursor is at an end tag or start tag
     * @param val - True for end tag, false for start tag
     */
    public setEndTag(val: boolean) {
        this.walker.bEndTag = val;
    }

    /**
     * Gets the DOM node at the current cursor position
     * @returns The current DOM node
     */
    public getNode() {
        return this.walker.node;
    }

    /**
     * Gets the current node as an HTMLElement if it is an element node
     * @returns The current node as HTMLElement, or undefined if not an element
     */
    public getElement() {
        if (this.walker.node.nodeType !== 1) return undefined;
        return this.walker.node as HTMLElement;
    }

    /**
     * Checks if the cursor is positioned at an end tag
     * @returns true if at an end tag, false if at a start tag
     */
    public isEndTag() {
        return this.walker.bEndTag;
    }

    /**
     * Compares the document position of two cursors
     * @param one - First cursor to compare
     * @param two - Second cursor to compare
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
            // two precedes one in the document
            return 1;
        } else if (docPosition & 0x4) {
            // one precedes two in the document
            return -1;
        }
        return 0;
    }

    /**
     * Checks if this cursor's node contains another cursor's node
     * @param other - The other cursor to check
     * @returns true if this cursor contains (is a parent/ancestor of) the other cursor's node
     */
    public contains(other: SRCursor) {
        return this.getNode().contains(other.getNode())
            && !this.isSameNode(other);
    }

    /**
     * Checks if this cursor points to the same node as another cursor
     * @param other - The other cursor to compare with
     * @returns true if both cursors point to the same node
     */
    public isSameNode(other: SRCursor) {
        if (!other) return false;
        return this.getNode().isSameNode(other.getNode());
    }

    /**
     * Checks if the current node has a non-empty accessible name
     * @returns true if the node has a non-empty accessible name
     */
    public hasNonEmptyName() {
        return (this.getNameInfo()?.name || "").trim().length > 0;
    }

}