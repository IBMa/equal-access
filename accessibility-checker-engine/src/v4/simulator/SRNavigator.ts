import { DOMWalker } from "../../v2/dom/DOMWalker";
import { AccNameUtil } from "../util/AccNameUtil";
import { NavigationMode } from "./SRTypes";
import { SRCursor, SRCursorMatchFunc, SRCursorSkipFunc } from "./SRCursor";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";
import { AriaUtil } from "../util/AriaUtil";

export namespace SRNavigator {
    /**
     * Determine if a node is a block-level element based on its display property
     * @param node The DOM node to check
     * @returns true if the node is a block-level element, false otherwise
     */
    function isBlockElement(node: Node) {
        if (node.nodeType !== 1) return false;
        if (node.nodeName.toLowerCase() === "br") return true;
        const elem = node as HTMLElement;
        const mywin = elem.ownerDocument.defaultView;
        const disp = mywin.getComputedStyle(elem)?.display;
        if (disp && disp.startsWith("table")) return true;
        if (disp === "block" && elem.style.display !== "block") {
            // Is this block because it's a flex elem?
            if (elem.parentElement && mywin.getComputedStyle(elem.parentElement).display === "flex") {
                return false;
            }
        }
        if (AriaUtil.getResolvedRole(elem, true) === "link") {
            let temp = new DOMWalker(node, false, undefined, false);
            temp.prevNode();
            if (!isBlockElement(temp.node)) {
                return true;
            }
        }
        return ["block", "flex", "grid", "list-item"].includes(disp);
    }

    /**
     * Collect all logical lines from a <pre> element by walking its entire subtree
     * (via DOMWalker, shadow-DOM safe) and concatenating text node content, splitting
     * on newlines.  Only inline-context nodes are included — any descendant block
     * element would be unusual inside <pre> and is ignored.
     *
     * Returns the trimmed, non-empty lines.
     */
    export function getPreLines(preElem: HTMLElement): string[] {
        // Concatenate all text inside the <pre>, preserving inline structure
        let fullText = preElem.textContent ?? "";
        const rawLines = fullText.split("\n");
        // Trim leading and trailing blank lines
        let start = 0;
        while (start < rawLines.length && rawLines[start].trim() === "") start++;
        let end = rawLines.length - 1;
        while (end >= start && rawLines[end].trim() === "") end--;
        return rawLines.slice(start, end + 1);
    }

    /**
     * Returns true if node is a <pre> element (the item-level cursor position for
     * preformatted lines uses the <pre> element itself with preLineIndex set).
     */
    function isPreElement(node: Node): boolean {
        return node.nodeType === 1 && (node as HTMLElement).nodeName.toUpperCase() === "PRE";
    }

    function getExplicitTabindex(node: Node): number | null {
        if (!node || node.nodeType !== 1) return null;
        const elem = node as HTMLElement;
        if (!elem.hasAttribute("tabindex")) return null;
        const tabindexValue = parseInt(elem.getAttribute("tabindex"), 10);
        return Number.isNaN(tabindexValue) ? null : tabindexValue;
    }

    function isPositiveTabFocus(node: Node): boolean {
        if (!node || node.nodeType !== 1) return false;
        const elem = node as HTMLElement;
        const explicitTabindex = getExplicitTabindex(elem);
        return explicitTabindex !== null && explicitTabindex > 0 && CommonUtil.isTabbable(elem);
    }

    function isDefaultOrZeroTabFocus(node: Node): boolean {
        if (!node || node.nodeType !== 1) return false;
        const elem = node as HTMLElement;
        const explicitTabindex = getExplicitTabindex(elem);
        return (explicitTabindex === null || explicitTabindex === 0) && CommonUtil.isTabbable(elem);
    }

    function getTabFocusStartFunc(includePositiveTabindex: boolean = true): SRCursorMatchFunc {
        return (_role: string, bStartTag: boolean, node: Node) => {
            if (!(node && node.nodeType === 1 && bStartTag && CommonUtil.isTabbable(node))) return false;
            return includePositiveTabindex || isDefaultOrZeroTabFocus(node);
        };
    }

    /**
     * Collect all tabbable elements in tab order (positive tabindex first, then document order)
     * @param matchFunc Function to match tabbable elements
     * @param rootNode Optional root node to start collection from (defaults to document body)
     * @returns Array of cursors pointing to tabbable elements in tab order
     */
    function collectTabFocusCursors(matchFunc: SRCursorMatchFunc, rootNode?: Node): SRCursor[] {
        const root = (rootNode?.ownerDocument || document).body || rootNode;
        if (!root) return [];
        let walker = new SRCursor(root, false);
        const skipFunc = getSkipFunc("tab_focus");
        let positiveResults: SRCursor[] = [];
        let normalResults: SRCursor[] = [];

        const addCursor = (cursor: SRCursor) => {
            if (!matchFunc(cursor.getRole(), !cursor.isEndTag(), cursor.getNode())) return;
            if (isPositiveTabFocus(cursor.getNode())) {
                positiveResults.push(cursor.clone());
            } else if (isDefaultOrZeroTabFocus(cursor.getNode())) {
                normalResults.push(cursor.clone());
            }
        };

        addCursor(walker);
        while (walker.next(() => true, skipFunc)) {
            addCursor(walker);
        }

        positiveResults.sort((a, b) => {
            const aElem = a.getElement();
            const bElem = b.getElement();
            const aTabindex = getExplicitTabindex(aElem) || 0;
            const bTabindex = getExplicitTabindex(bElem) || 0;
            if (aTabindex !== bTabindex) return bTabindex - aTabindex;
            return SRCursor.compare(a, b);
        });

        return positiveResults.concat(normalResults);
    }

    /**
     * Find the index of a cursor in an array of tab focus cursors
     * @param cursors Array of cursors to search
     * @param walker The cursor to find
     * @returns The index of the cursor, or -1 if not found
     */
    function findTabFocusIndex(cursors: SRCursor[], walker: SRCursor): number {
        return cursors.findIndex(cursor => SRCursor.compare(cursor, walker) === 0);
    }

    /**
     * Get the match function for identifying start positions in a given navigation mode
     * @param mode The navigation mode (e.g., "link", "heading", "button", etc.)
     * @returns A function that matches elements appropriate for the navigation mode
     */
    export function getStartFunc(mode: NavigationMode) : SRCursorMatchFunc {
        switch (mode) {
            case "link":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "link");
            case "tab_focus":
                return getTabFocusStartFunc(false);
            case "heading":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "heading");
            case "h1":
                return (role: string, bStartTag: boolean, node: Node) => (bStartTag && role === "heading" && (node as HTMLElement).ariaLevel === "1");
            case "h2":
                return (role: string, bStartTag: boolean, node: Node) => (bStartTag && role === "heading" && (node as HTMLElement).ariaLevel === "2");
            case "h3":
                return (role: string, bStartTag: boolean, node: Node) => (bStartTag && role === "heading" && (node as HTMLElement).ariaLevel === "3");
            case "h4":
                return (role: string, bStartTag: boolean, node: Node) => (bStartTag && role === "heading" && (node as HTMLElement).ariaLevel === "4");
            case "h5":
                return (role: string, bStartTag: boolean, node: Node) => (bStartTag && role === "heading" && (node as HTMLElement).ariaLevel === "5");
            case "h6":
                return (role: string, bStartTag: boolean, node: Node) => (bStartTag && role === "heading" && (node as HTMLElement).ariaLevel === "6");
            case "image":
                return (role: string, bStartTag: boolean) => (bStartTag && ["img", "graphics-document"].includes(role));
            case "radio":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "radio");
            case "button":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "button");
            case "checkbox":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "checkbox");
            case "combo":       
                return (role: string, bStartTag: boolean) => (bStartTag && role === "combobox");
            case "list":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "list");
            case "listitem":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "listitem");
            case "article":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "article");
            case "table":
                return (role: string, bStartTag: boolean) => (bStartTag && role === "table");
            case "paragraph":
                return (_role: string, bStartTag: boolean, node: Node) => (bStartTag && (node as HTMLElement).nodeName.toUpperCase() === "P");
            case "dom":
                return () => true;
            case "item":
                return (cursor: SRCursor | any, bStartTag: boolean, node: Node) => {
                    if (!bStartTag) return false;
                    // A <pre> element with preLineIndex set is a virtual per-line item.
                    // The initial encounter (preLineIndex undefined) is also a match so
                    // jumpNext can set preLineIndex=0 on it.
                    if (isPreElement(node)) return true;
                    if (isBlockElement(node)) return true;
                    const temp = new DOMWalker(node, !bStartTag);
                    if (temp.prevNode() && temp.bEndTag) {
                        return isBlockElement(temp.node);
                    }
                    return false;
                }
            case "region":
                return (role: string, bStartTag: boolean, node: Node) => {
                    if (!bStartTag) return false;
                    if (["main", "navigation", "form", "banner", "search", "contentinfo"].includes(role)) return true;
                    if (role !== "region" || node?.nodeType !== 1) return false;
                    return !!AccNameUtil.computeAccessibleName(node as HTMLElement)?.name?.trim();
                };
            case "formcontrol":
            case "editbox":
            case "graphic":
            case "frame":
            case "division":
            case "tabcontrol":
            case "separator":
            case "clickable":
            case "mouseover":
                throw new Error("NOT_IMPLEMENTED");
        }
    }
    /**
     * Check if an element is within a Shadow DOM
     * @param element The element to check
     * @returns true if the element is in a Shadow DOM, false otherwise
     */
    const isInShadowDOM = (element: HTMLElement) => {
        const root = element.getRootNode();
        return root instanceof ShadowRoot;
    }

    /**
     * Determine skip behavior for item navigation mode
     * Handles complex visibility rules including hidden content in headings/links
     * @param cursor The cursor at the current position
     * @returns Object indicating whether to skip current node and/or its children, or null for default behavior
     */
    const SKIP_ITEM_BEHAVIOR = (cursor: SRCursor) : { skipCurrent: boolean, skipChildren: boolean} | null => {
        const DEBUG = false;
        DEBUG && console.group("SKIP_ITEM_BEHAVIOR");
        let retVal: { skipCurrent: boolean, skipChildren: boolean} | null = null;
        try {
            const nodeType = cursor.getNode().nodeType;
            let elem = cursor.getElement();
            const cursorStart = cursor.clone();
            cursorStart.setEndTag(false);

            DEBUG && console.log(nodeType);
            // Skip CDATA and comments completely
            if ([4, 8].includes(nodeType)) return retVal = { skipCurrent: true, skipChildren: true };
            // Only process elements and text
            if (![1,3].includes(nodeType)) return retVal = { skipCurrent: true, skipChildren: false };

            // For text elements, Consider with relation to their parent element
            if (nodeType === 3) {
                elem = cursor.getNode().parentElement;
                if (!elem) return retVal = VisUtil.isNodeHiddenFromAT(elem) ? { skipCurrent: true, skipChildren: false } : null;
            }
            // if (!elem) console.log(cursor.getNode());

            // We have an element

            // Make sure we're within the body element
            if (!elem.closest("body") && !isInShadowDOM(elem)) return retVal = { skipCurrent: true, skipChildren: false };

            // Make sure we're not in a script or style
            if (elem.closest("script,style")) return retVal = { skipCurrent: true, skipChildren: true };

            // For text nodes, we need to check visibility in context of parent heading/link
            // So we'll handle text node visibility checks below with the element visibility checks
            
            // Skip things hidden from the AT, UNLESS we're inside a heading or link
            // (headings and links should include their full accessible name, including hidden parts)
            // BUT only if the heading/link uses nameFrom="content" (not aria-label/aria-labelledby)
            const parentHeadingOrLink = cursorStart.getCurrentOrParentByRoleClone(["heading", "link"]);
            
            // Special case: if current element itself is a heading or link AND we're NOT inside another heading/link,
            // apply normal skip rules
            const currentRole = AriaUtil.getResolvedRole(elem);
            const isCurrentHeadingOrLink = currentRole === "heading" || currentRole === "link";
            
            if (!parentHeadingOrLink) {
                // Not inside any heading/link - apply normal skip rules
                if (VisUtil.isNodeHiddenFromAT(elem)) return retVal = { skipCurrent: true, skipChildren: nodeType === 1 };
                if (!VisUtil.isNodeVisible(elem)) return retVal = { skipCurrent: true, skipChildren: nodeType === 1 };
            } else {
                // Check if the parent heading/link uses aria-label or aria-labelledby
                const parentElem = parentHeadingOrLink.getElement();
                const nameInfo = parentHeadingOrLink.getNameInfo();
                
                // If nameFrom is NOT "content" or "text", skip all content (it's using aria-label/aria-labelledby)
                if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
                    // Parent uses aria-label/aria-labelledby - skip all content including nested headings/links
                    if (VisUtil.isNodeHiddenFromAT(elem)) return retVal = { skipCurrent: true, skipChildren: true };
                    if (!VisUtil.isNodeVisible(elem)) return retVal = { skipCurrent: true, skipChildren: true };
                } else if (isCurrentHeadingOrLink) {
                    // Current element is a heading/link inside another heading/link with content-based name
                    // Don't skip it - let it through so its content can be read
                    // (The logic at line 183 will handle whether to skip its children)
                } else {
                    // nameFrom is "content", so include hidden content but skip hidden images/graphics
                    const role = AriaUtil.getResolvedRole(elem);
                    if ((role === "img" || role === "graphics-document") && VisUtil.isNodeHiddenFromAT(elem)) {
                        return retVal = { skipCurrent: true, skipChildren: true };
                    }
                    // Don't skip other hidden content - it should be included in the accessible name
                }
            }
            if (elem.nodeName.toUpperCase() === "BODY") return retVal = { skipCurrent: false, skipChildren: false };

            // Skip labels that are associated with controls - they'll be read with the related input.
            // Keep children so interactive content (e.g. links) inside the label still appears in
            // reading/tab order.
            if (elem.nodeName.toUpperCase() === "LABEL") {
                if (
                    elem.hasAttribute("for")
                    && document.getElementById(elem.getAttribute("for"))
                    && document.getElementById(elem.getAttribute("for")).getAttribute("type") !== "hidden"
                ) {
                    return retVal = { skipCurrent: true, skipChildren: false };
                } else {
                    const nestedControl = elem.querySelector("input, select, textarea, button, [role='checkbox'], [role='combobox'], [role='listbox'], [role='menuitemcheckbox'], [role='menuitemradio'], [role='radio'], [role='searchbox'], [role='slider'], [role='spinbutton'], [role='switch'], [role='textbox']");
                    if (nestedControl && (nestedControl as HTMLElement).getAttribute("type") !== "hidden") {
                        return retVal = { skipCurrent: true, skipChildren: false };
                    }
                    // A <label> with no `for` and no nested control, used purely as an aria-labelledby
                    // target by another element, should be suppressed — it will be read as part of the
                    // widget's accessible name announcement.
                    const id = elem.getAttribute("id");
                    if (id && document.querySelector(`[aria-labelledby~="${id}"]`)) {
                        return retVal = { skipCurrent: true, skipChildren: false };
                    }
                }
            }

            // Skip non-interactive content that is a descendant of a for-linked label.
            // Such content is already surfaced as part of the associated control's announcement.
            // Interactive descendants (links, buttons, etc.) are allowed through.
            {
                const labelFor = elem.closest("label[for]") as HTMLElement | null;
                const labelForTarget = labelFor && labelFor.getAttribute("for");
                if (
                    labelFor
                    && labelForTarget
                    && document.getElementById(labelForTarget)
                    && document.getElementById(labelForTarget).getAttribute("type") !== "hidden"
                    && !elem.closest("a[href], [role='link'], button, [role='button']")
                ) {
                    return retVal = { skipCurrent: true, skipChildren: nodeType === 1 };
                }
            }

            const role = cursorStart.getRole();

            // A div/span combobox (role="combobox" on a non-input, non-select element) announces
            // its value directly from text content or the controlled listbox, so skip its children
            // to avoid double-announcing the inner text.
            if (role === "combobox"
                && elem.nodeName.toUpperCase() !== "SELECT"
                && elem.nodeName.toUpperCase() !== "INPUT"
                && !cursor.isEndTag()
            ) {
                return retVal = { skipCurrent: false, skipChildren: true };
            }

            // If we have presentational children, read the element, skip the children
            if (AriaUtil.containsPresentationalChildrenOnly(elem)) {
                return retVal = { skipCurrent: false, skipChildren: true };
            }
            // Skip children of headings/links that don't use content-based names
            // UNLESS we're inside another heading/link that DOES use content-based names
            if (["link", "heading"].includes(role) && (!cursorStart.getName() || (!["content", "text"].includes(cursorStart.getNameInfo().nameFrom)))) {
                // Check if we're inside a parent heading/link with content-based name
                if (parentHeadingOrLink && parentHeadingOrLink.getNameInfo() && ["content", "text"].includes(parentHeadingOrLink.getNameInfo().nameFrom)) {
                    // Don't skip children - we're nested inside a content-based heading/link
                } else {
                    return retVal = { skipCurrent: false, skipChildren: true };
                }
            }

            if (elem.nodeName.toUpperCase() === "LEGEND") {
                let parent = DOMWalker.parentElement(cursor.getNode());
                while (parent) {
                    if (parent.nodeName.toUpperCase() === 'FIELDSET') {
                        // Legend is within a fieldset, suppress output
                        return retVal = { skipCurrent: false, skipChildren: true };
                    }
                    parent = DOMWalker.parentElement(parent);
                }
            }
            if (elem && elem.nodeName.toUpperCase() === "MSUP") {
                return retVal = { skipCurrent: false, skipChildren: true };
            }

            // <summary> is a self-announcing disclosure button — its children
            // are folded into the ["label", button, collapsed] announcement,
            // so skip traversal into them.
            if (!cursor.isEndTag() && elem.nodeName.toUpperCase() === "SUMMARY") {
                const detailsParent = elem.parentElement;
                if (detailsParent && detailsParent.nodeName.toUpperCase() === "DETAILS") {
                    return retVal = { skipCurrent: false, skipChildren: true };
                }
            }

            // Skip non-summary children of a closed <details> element.
            // Browsers hide those children via UA stylesheet (display:none), so
            // they must not appear as reading stops when the widget is collapsed.
            // Exempt the <details> element itself and <summary> (always visible).
            if (!cursor.isEndTag()
                && elem.nodeName.toUpperCase() !== "DETAILS"
                && !elem.closest("summary")
            ) {
                const detailsAncestor = elem.closest("details");
                if (detailsAncestor && !detailsAncestor.hasAttribute("open")) {
                    return retVal = { skipCurrent: true, skipChildren: true };
                }
            }

            if (elem.closest(".ibma-sr-overlay")) {
                return retVal = { skipCurrent: true, skipChildren: true };
            }

            // Skip popup elements (listbox, tree, grid, dialog) that are owned by a combobox
            // via aria-controls. In a real SR these are only reachable via aria-activedescendant,
            // not by DOM traversal, so they should not appear as reading stops.
            if (nodeType === 1 && !cursor.isEndTag()) {
                const id = elem.getAttribute("id");
                if (id) {
                    const owner = document.querySelector(`[aria-controls~="${id}"]`) as HTMLElement | null;
                    if (owner && AriaUtil.getResolvedRole(owner) === "combobox") {
                        return retVal = { skipCurrent: true, skipChildren: true };
                    }
                }
            }

            return retVal = null;
        } finally {
            DEBUG && console.log("SKIP_ITEM retVal:", retVal);
            DEBUG && console.groupEnd();
        }
    }

    /**
     * Determine skip behavior for nested navigation modes (link, heading, image, etc.)
     * Simpler than SKIP_ITEM_BEHAVIOR as it doesn't need complex heading/link content rules
     * @param cursor The cursor at the current position
     * @returns Object indicating whether to skip current node and/or its children, or null for default behavior
     */
    const SKIP_NESTED_BEHAVIOR = (cursor: SRCursor) : { skipCurrent: boolean, skipChildren: boolean} | null => {
        const nodeType = cursor.getNode().nodeType;
        const elem = cursor.getElement();
        // Only visit elements and text nodes
        if (nodeType !== 1 && nodeType !== 3) return { skipCurrent: true, skipChildren: false };
        if (nodeType === 3) return VisUtil.isNodeHiddenFromAT(elem) ? { skipCurrent: true, skipChildren: false } : null;
        // We have an elemenet
        if (VisUtil.isNodeHiddenFromAT(elem)) return { skipCurrent: true, skipChildren: true };
        // Skip label fors - they'll be read with the related input.
        // Keep children so interactive content (e.g. links) inside the label still appears in
        // reading/tab order.
        if (
            elem.nodeName.toUpperCase() === "LABEL"
            && elem.hasAttribute("for")
            && document.getElementById(elem.getAttribute("for"))
            && document.getElementById(elem.getAttribute("for")).getAttribute("type") !== "hidden"
        ) {
            return { skipCurrent: true, skipChildren: false };
        }

        // Skip non-interactive content that is a descendant of a for-linked label.
        // Such content is already surfaced as part of the associated control's announcement.
        // Interactive descendants (links, buttons, etc.) are allowed through.
        {
            const labelFor = elem.closest("label[for]") as HTMLElement | null;
            const labelForTarget = labelFor && labelFor.getAttribute("for");
            if (
                labelFor
                && labelForTarget
                && document.getElementById(labelForTarget)
                && document.getElementById(labelForTarget).getAttribute("type") !== "hidden"
                && !elem.closest("a[href], [role='link'], button, [role='button']")
            ) {
                return { skipCurrent: true, skipChildren: nodeType === 1 };
            }
        }

        const role = cursor.getRole();

        // If we have presentational children, read the element, skip the children
        if (AriaUtil.containsPresentationalChildrenOnly(elem)) {
            return { skipCurrent: false, skipChildren: true };
        }
        if (elem && elem.nodeName.toUpperCase() === "MSUP") {
            return { skipCurrent: true, skipChildren: true };
        }
        if (elem.closest(".ibma-sr-overlay")) {
            return { skipCurrent: true, skipChildren: true };
        }
        return null;
    }

    /**
     * Get the skip function for a given navigation mode
     * @param mode The navigation mode
     * @returns A function that determines which nodes to skip during navigation
     */
    export function getSkipFunc(mode: NavigationMode) : SRCursorSkipFunc {
        switch (mode) {
            case "region":
            case "item": 
                return SKIP_ITEM_BEHAVIOR;
            case "link": 
            case "tab_focus": 
            case "heading":
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
            case "image":
                return SKIP_NESTED_BEHAVIOR;
            case "radio":
            case "button":
            case "checkbox":
            case "combo":       
            case "list":
            case "listitem":
            case "article":
            case "table":
            case "paragraph":
            case "dom":
            case "formcontrol":
            case "editbox":
            case "graphic":
            case "frame":
            case "division":
            case "tabcontrol":
            case "separator":
            case "clickable":
            case "mouseover":
                throw new Error("NOT_IMPLEMENTED");
        }
    }

    
    /**
     * Jump to the current position or the previous matching element if current doesn't match
     * @param mode The navigation mode
     * @param walker The cursor at the current position
     * @returns A cursor at the current or previous matching position
     */
    export function jumpCurrent(mode: NavigationMode, walker: SRCursor) : SRCursor {
        const matchFunc = mode === "tab_focus" ? getTabFocusStartFunc(true) : getStartFunc(mode);
        if (matchFunc(walker.getRole(), !walker.isEndTag(), walker.getNode())) {
            return walker.clone();
        } else {
            return jumpPrevious(mode, walker);
        }
    }
    /**
     * Jump to the end of the current element and return all intermediate item positions
     * @param mode The navigation mode
     * @param walker The cursor at the current position
     * @returns Array of cursors representing positions from current to end
     */
    export function jumpCurrentEnd(mode: NavigationMode, walker: SRCursor) : SRCursor[] {
        if (mode === "item") {
            // For any <pre> item (block-enter stop or per-line stop), the render range
            // must end at the next virtual line cursor (same <pre> node, next index) so
            // that renderRange never walks into <pre>'s children.
            if (isPreElement(walker.getNode()) && !walker.isEndTag()) {
                const lines = getPreLines(walker.getNode() as HTMLElement);
                const nextIdx = walker.preLineIndex === undefined ? 0 : walker.preLineIndex + 1;
                // Use nextIdx as the end sentinel — even if it equals lines.length (past
                // the last line), compare() will still correctly stop renderRange before
                // any child node because children are contained within <pre>.
                const endCursor = walker.clone();
                endCursor.preLineIndex = nextIdx;
                return [endCursor];
            }
            const itemEnd = jumpNext(mode, walker);
            return itemEnd ? [itemEnd] : [];
        } else {
            const nameInfo = walker.getNameInfo();
            let retVal = walker.clone();
            if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
                // Name is just from the item itself
                retVal.next(() => true);
            } else {
                // Name is from the content
                retVal.setEndTag(true);
                retVal.next(() => true);
            }

            const endCursors: SRCursor[] = [];
            let itemEnd = jumpNext("item", walker);
            while (itemEnd && SRCursor.compare(itemEnd, retVal) < 0) {
                endCursors.push(itemEnd);
                itemEnd = jumpNext("item", itemEnd);
            }
            endCursors.push(retVal);
            return mode === "tab_focus" && walker.getRole() === "link" ? [endCursors[endCursors.length - 1]] : endCursors;
        }
    }

    /**
     * Jump to the next matching element in the given navigation mode
     * @param mode The navigation mode
     * @param walker The cursor at the current position
     * @returns A cursor at the next matching position, or null if none found
     */
    export function jumpNext(mode: NavigationMode, walker: SRCursor) : SRCursor {
        const DEBUG = false;
        DEBUG && console.group("SRNavigator::jumpNext", walker.isEndTag()?"/":"", walker.getNode());
        try {
            if (mode === "tab_focus") {
                const tabFocusMatchFunc = getTabFocusStartFunc(true);
                const tabFocusCursors = collectTabFocusCursors(tabFocusMatchFunc, walker.getNode());
                if (tabFocusCursors.length > 0) {
                    // console.log(tabFocusCursors.map(c => c.getNode()));
                    const currentTabFocusParentCursor = walker.getCurrentOrParentTabbableClone();
                    const currentTabFocusCursor = currentTabFocusParentCursor && findTabFocusIndex(tabFocusCursors, currentTabFocusParentCursor) >= 0 ? currentTabFocusParentCursor : walker.clone();
                    const currentIndex = findTabFocusIndex(tabFocusCursors, currentTabFocusCursor);
                    if (currentIndex >= 0) {
                        if (currentIndex + 1 < tabFocusCursors.length) {
                            return tabFocusCursors[currentIndex + 1].clone();
                        }
                        return null;
                    }
                    return tabFocusCursors[0].clone();
                }
            }

            if (mode === "item" && isPreElement(walker.getNode()) && !walker.isEndTag()) {
                const lines = getPreLines(walker.getNode() as HTMLElement);

                if (walker.preLineIndex === undefined) {
                    // At the block-enter stop — jump to the first line item
                    if (lines.length > 0) {
                        let retVal = walker.clone();
                        retVal.preLineIndex = 0;
                        return retVal;
                    }
                    // Empty <pre> — fall through to DOM traversal past </pre>
                } else {
                    // At a line item — advance to the next line or past </pre>
                    const currentLineIdx = walker.preLineIndex;
                    if (currentLineIdx + 1 < lines.length) {
                        let retVal = walker.clone();
                        retVal.preLineIndex = currentLineIdx + 1;
                        return retVal;
                    }
                    // All lines exhausted — move past </pre> to the next DOM item.
                    // Always land on the block-enter stop (preLineIndex=undefined) so the
                    // caller gets a chance to render the container-enter announcement before
                    // advancing to the first line.
                    let retVal = walker.clone();
                    retVal.setEndTag(true);
                    const matchFunc = getStartFunc(mode);
                    const skipFunc = getSkipFunc(mode);
                    if (retVal.next(matchFunc, skipFunc)) {
                        if (isPreElement(retVal.getNode()) && !retVal.isEndTag()) {
                            retVal.preLineIndex = undefined; // block-enter stop
                        }
                        return retVal;
                    }
                    return null;
                }
            }

            let retVal = walker.clone();
            const matchFunc = getStartFunc(mode);
            const skipFunc = getSkipFunc(mode);
            if (retVal.next(matchFunc, skipFunc)) {
                // Landing on <pre> via DOM traversal always starts at the block-enter stop
                // (preLineIndex=undefined).  The per-line items are returned on subsequent
                // calls via the isPreElement early-return above.
                if (mode === "item" && isPreElement(retVal.getNode()) && !retVal.isEndTag()) {
                    retVal.preLineIndex = undefined;
                }
                DEBUG && console.log("SRNavigator::jumpNext result", retVal);
                return retVal;
            } else {
                return null;
            }
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Navigates to the previous element in screen reader navigation based on the specified mode.
     *
     * For tab_focus mode, this function attempts to move to the previous tabbable element by:
     * 1. First trying to move backward using the mode's match and skip functions
     * 2. If that fails, collecting all tab focus cursors and finding the previous one in the tab order
     *
     * @param mode - The navigation mode (e.g., "tab_focus") that determines how to navigate
     * @param walker - The current cursor position in the screen reader navigation
     * @returns A new cursor positioned at the previous element, or null if no previous element exists
     */
    export function jumpPrevious(mode: NavigationMode, walker: SRCursor) : SRCursor {
        if (mode === "tab_focus") {
            let retVal = walker.clone();
            const matchFunc = getStartFunc(mode);
            const skipFunc = getSkipFunc(mode);
            if (retVal.previous(matchFunc, skipFunc)) {
                return retVal;
            }

            const tabFocusMatchFunc = getTabFocusStartFunc(true);
            const tabFocusCursors = collectTabFocusCursors(tabFocusMatchFunc, walker.getNode());
            if (tabFocusCursors.length > 0) {
                const currentTabFocusParentCursor = walker.getCurrentOrParentTabbableClone();
                const currentTabFocusCursor = currentTabFocusParentCursor && findTabFocusIndex(tabFocusCursors, currentTabFocusParentCursor) >= 0 ? currentTabFocusParentCursor : walker.clone();
                const currentIndex = findTabFocusIndex(tabFocusCursors, currentTabFocusCursor);
                if (currentIndex > 0) {
                    return tabFocusCursors[currentIndex - 1].clone();
                }
            }
            return null;
        }

        if (mode === "item" && isPreElement(walker.getNode()) && !walker.isEndTag()) {
            if (walker.preLineIndex === undefined) {
                // At the block-enter stop — go to the previous DOM item (before <pre>)
                // fall through to normal previous() traversal below
            } else if (walker.preLineIndex === 0) {
                // At the first line — step back to the block-enter stop
                let retVal = walker.clone();
                retVal.preLineIndex = undefined;
                return retVal;
            } else {
                // Step back one line
                let retVal = walker.clone();
                retVal.preLineIndex = walker.preLineIndex - 1;
                return retVal;
            }
        }

        let retVal = walker.clone();
        const matchFunc = getStartFunc(mode);
        const skipFunc = getSkipFunc(mode);
        if (retVal.previous(matchFunc, skipFunc)) {
            // If we just landed on a <pre> element, position at its last line
            if (mode === "item" && isPreElement(retVal.getNode()) && !retVal.isEndTag()) {
                const lines = getPreLines(retVal.getNode() as HTMLElement);
                retVal.preLineIndex = lines.length > 0 ? lines.length - 1 : undefined;
            }
            return retVal;
        } else {
            return null;
        }
    }

}
