import { DOMWalker } from "../../v2/dom/DOMWalker";
import { NavigationMode } from "./SRTypes";
import { SRCursor, SRCursorMatchFunc, SRCursorSkipFunc } from "./SRCursor";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";
import { AriaUtil } from "../util/AriaUtil";

export namespace SRNavigator {
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

    export function getStartFunc(mode: NavigationMode) : SRCursorMatchFunc {
        switch (mode) {
            case "link": 
                return (role: string, bStartTag: boolean) => (bStartTag && role === "link");
            case "tab_focus": 
                return (role: string, bStartTag: boolean, node: Node) => (node && node.nodeType === 1 && bStartTag && CommonUtil.isTabbable(node));
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
                return (_role: string, bStartTag: boolean, node: Node) => {
                    if (!bStartTag) return false;
                    if (isBlockElement(node)) return true;
                    const temp = new DOMWalker(node, !bStartTag);
                    if (temp.prevNode() && temp.bEndTag) {
                        return isBlockElement(temp.node);
                    }
                    return false;
                }
            case "region":
                return (role: string, bStartTag: boolean) => (bStartTag && ["main", "navigation", "banner", "search", "contentinfo"].includes(role));
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
    const isInShadowDOM = (element: HTMLElement) => {
        const root = element.getRootNode();
        return root instanceof ShadowRoot;
    }

    const SKIP_ITEM_BEHAVIOR = (cursor: SRCursor) : { skipCurrent: boolean, skipChildren: boolean} | null => {
        const DEBUG = false;
        DEBUG && console.group("SKIP_ITEM_BEHAVIOR");
        try {
            const nodeType = cursor.getNode().nodeType;
            let elem = cursor.getElement();
            const cursorStart = cursor.clone();
            cursorStart.setEndTag(false);

            DEBUG && console.log(nodeType);
            // Skip CDATA and comments completely
            if ([4, 8].includes(nodeType)) return { skipCurrent: true, skipChildren: true };
            // Only process elements and text
            if (![1,3].includes(nodeType)) return { skipCurrent: true, skipChildren: false };

            // For text elements, Consider with relation to their parent element
            if (nodeType === 3) {
                elem = cursor.getNode().parentElement;
                if (!elem) return VisUtil.isNodeHiddenFromAT(elem) ? { skipCurrent: true, skipChildren: false } : null;
            }
            // if (!elem) console.log(cursor.getNode());

            // We have an element

            // Make sure we're within the body element
            if (!elem.closest("body") && !isInShadowDOM(elem)) return { skipCurrent: true, skipChildren: false };

            // Make sure we're not in a script or style
            if (elem.closest("script,style")) return { skipCurrent: true, skipChildren: true };

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
                if (VisUtil.isNodeHiddenFromAT(elem)) return { skipCurrent: true, skipChildren: nodeType === 1 };
                if (!VisUtil.isNodeVisible(elem)) return { skipCurrent: true, skipChildren: nodeType === 1 };
            } else {
                // Check if the parent heading/link uses aria-label or aria-labelledby
                const parentElem = parentHeadingOrLink.getElement();
                const nameInfo = parentHeadingOrLink.getNameInfo();
                
                // If nameFrom is NOT "content" or "text", skip all content (it's using aria-label/aria-labelledby)
                if (nameInfo && !["content", "text"].includes(nameInfo.nameFrom)) {
                    // Parent uses aria-label/aria-labelledby - skip all content including nested headings/links
                    if (VisUtil.isNodeHiddenFromAT(elem)) return { skipCurrent: true, skipChildren: true };
                    if (!VisUtil.isNodeVisible(elem)) return { skipCurrent: true, skipChildren: true };
                } else if (isCurrentHeadingOrLink) {
                    // Current element is a heading/link inside another heading/link with content-based name
                    // Don't skip it - let it through so its content can be read
                    // (The logic at line 183 will handle whether to skip its children)
                } else {
                    // nameFrom is "content", so include hidden content but skip hidden images/graphics
                    const role = AriaUtil.getResolvedRole(elem);
                    if ((role === "img" || role === "graphics-document") && VisUtil.isNodeHiddenFromAT(elem)) {
                        return { skipCurrent: true, skipChildren: true };
                    }
                    // Don't skip other hidden content - it should be included in the accessible name
                }
            }
            if (elem.nodeName.toUpperCase() === "BODY") return { skipCurrent: false, skipChildren: false };

            // Skip label fors - they'll be read with the related input
            if (
                elem.nodeName.toUpperCase() === "LABEL" 
                && elem.hasAttribute("for") 
                && document.getElementById(elem.getAttribute("for"))
                && document.getElementById(elem.getAttribute("for")).getAttribute("type") !== "hidden"
            ) {
                return { skipCurrent: true, skipChildren: true };
            }

            const role = cursorStart.getRole();

            // If we have presentational children, read the element, skip the children
            if (AriaUtil.containsPresentationalChildrenOnly(elem)) {
                return { skipCurrent: false, skipChildren: true };
            }
            // Skip children of headings/links that don't use content-based names
            // UNLESS we're inside another heading/link that DOES use content-based names
            if (["link", "heading"].includes(role) && (!cursorStart.getName() || (!["content", "text"].includes(cursorStart.getNameInfo().nameFrom)))) {
                // Check if we're inside a parent heading/link with content-based name
                if (parentHeadingOrLink && parentHeadingOrLink.getNameInfo() && ["content", "text"].includes(parentHeadingOrLink.getNameInfo().nameFrom)) {
                    // Don't skip children - we're nested inside a content-based heading/link
                } else {
                    return { skipCurrent: false, skipChildren: true };
                }
            }
            if (elem && elem.nodeName.toUpperCase() === "MSUP") {
                return { skipCurrent: false, skipChildren: true };
            }
            if (elem.closest(".ibma-sr-overlay")) {
                return { skipCurrent: true, skipChildren: true };
            }
            return null;
        } finally {
            DEBUG && console.groupEnd();
        }
    }

    const SKIP_NESTED_BEHAVIOR = (cursor: SRCursor) : { skipCurrent: boolean, skipChildren: boolean} | null => {
        const nodeType = cursor.getNode().nodeType;
        const elem = cursor.getElement();
        // Only visit elements and text nodes
        if (nodeType !== 1 && nodeType !== 3) return { skipCurrent: true, skipChildren: false };
        if (nodeType === 3) return VisUtil.isNodeHiddenFromAT(elem) ? { skipCurrent: true, skipChildren: false } : null;
        // We have an elemenet
        if (VisUtil.isNodeHiddenFromAT(elem)) return { skipCurrent: true, skipChildren: true };
        // Skip label fors - they'll be read with the related input
        if (
            elem.nodeName.toUpperCase() === "LABEL" 
            && elem.hasAttribute("for") 
            && document.getElementById(elem.getAttribute("for"))
            && document.getElementById(elem.getAttribute("for")).getAttribute("type") !== "hidden"
        ) {
            return { skipCurrent: true, skipChildren: true };
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

    
    export function jumpCurrent(mode: NavigationMode, walker: SRCursor) : SRCursor {
        const matchFunc = getStartFunc(mode);
        if (matchFunc(walker.getRole(), !walker.isEndTag(), walker.getNode())) {
            return walker.clone();
        } else {
            return jumpPrevious(mode, walker);
        }
    }
    export function jumpCurrentEnd(mode: NavigationMode, walker: SRCursor) : SRCursor {
        if (mode === "item") {
            return jumpNext(mode, walker);
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
            let itemEnd = jumpNext("item", walker);
            if (SRCursor.compare(itemEnd, retVal) < 0) {
                return itemEnd;
            }
            return retVal
        }
    }

    export function jumpNext(mode: NavigationMode, walker: SRCursor) : SRCursor {
        const DEBUG = false;
        DEBUG && console.group("SRNavigator::jumpNext", walker.isEndTag()?"/":"", walker.getNode());
        try {
            let retVal = walker.clone();
            const matchFunc = getStartFunc(mode);
            const skipFunc = getSkipFunc(mode);
            if (retVal.next(matchFunc, skipFunc)) {
                DEBUG && console.log("SRNavigator::jumpNext result", retVal);
                return retVal;
            } else {
                return null;
            }
        } finally {
            console.groupEnd();
        }
    }

    export function jumpPrevious(mode: NavigationMode, walker: SRCursor) : SRCursor {
        let retVal = walker.clone();
        const matchFunc = getStartFunc(mode);
        const skipFunc = getSkipFunc(mode);
        if (retVal.previous(matchFunc, skipFunc)) {
            return retVal;
        } else {
            return null;
        }
    }

}
