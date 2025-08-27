import { DOMWalker } from "../../v2/dom/DOMWalker";
import { NavigationMode } from "./SRTypes";
import { SRWalker, SRWalkerMatchFunc } from "./SRWalker";

export namespace SRNavigator {
    function isBlockElement(node: Node) {
        if (node.nodeType !== 1) return false;
        if (node.nodeName.toLowerCase() === "br") return true;
        const elem = node as HTMLElement;
        const disp = elem.ownerDocument.defaultView.getComputedStyle(elem)?.display;
        if (disp && disp.startsWith("table")) return true;
        return ["block", "flex", "grid", "list-item"].includes(disp);
    }

    function getStartFunc(mode: NavigationMode) : SRWalkerMatchFunc {
        switch (mode) {
            case "link": 
                return (role: string, bStartTag: boolean) => (bStartTag && role === "link");
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
            case "formcontrol":
            case "editbox":
            case "graphic":
            case "frame":
            case "region":
            case "division":
            case "tabcontrol":
            case "separator":
            case "clickable":
            case "mouseover":
                throw new Error("NOT_IMPLEMENTED");
        }
    }
    
    export function jumpCurrent(mode: NavigationMode, walker: SRWalker) : SRWalker {
        const matchFunc = getStartFunc(mode);
        if (matchFunc(walker.getRole(), !walker.isEndTag(), walker.getNode())) {
            return walker.clone();
        } else {
            return jumpPrevious(mode, walker);
        }
    }
    export function jumpCurrentEnd(mode: NavigationMode, walker: SRWalker) : SRWalker {
        if (mode === "item") {
            return jumpNext(mode, walker);
        } else {
            let retVal = walker.clone();
            retVal.setEndTag(true);
            retVal.next(() => true);
            return retVal
        }
    }

    export function jumpNext(mode: NavigationMode, walker: SRWalker) : SRWalker {
        let retVal = walker.clone();
        const matchFunc = getStartFunc(mode);
        if (retVal.next(matchFunc)) {
            return retVal;
        } else {
            return null;
        }
    }

    export function jumpPrevious(mode: NavigationMode, walker: SRWalker) : SRWalker {
        let retVal = walker.clone();
        const matchFunc = getStartFunc(mode);
        if (retVal.previous(matchFunc)) {
            return retVal;
        } else {
            return null;
        }
    }

}
