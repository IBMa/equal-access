import { AriaUtil } from "../util/AriaUtil";
import { VisUtil } from "../util/VisUtil";
import { SRController } from "./SRController";
import { SRNavigator } from "./SRNavigator";
import { ContainerChanges, NavigationMode } from "./SRTypes";
import { SRWalker } from "./SRWalker";

export namespace SRRenderer {
    const CONTAINER_RESULT = (_itemWalker: SRWalker) => "";
    const IGNORE_RESULT = (_itemWalker: SRWalker) => "";

    const renderRoleRules: {
        [mode: string]: {
            [role: string]: Array<(walker: SRWalker) => string | null>
        }
    } = {
        "default": {
            // "null": [ 
            //     (_itemWalker: SRWalker) => ""
            // ],
            // "undefined": [ 
            //     (_itemWalker: SRWalker) => ""
            // ],
            "default": [
                // DEBUG
                (itemWalker: SRWalker) => !itemWalker.isEndTag() ? `!!<${itemWalker.getRole()}>${(itemWalker.getName()?.name+"")}!!` : `!!</${itemWalker.getRole()}>!!`
            ],

            // DEBUG: Ignore because they're containers
            "article": [ CONTAINER_RESULT ],
            "banner": [ CONTAINER_RESULT ],
            "blockquote": [ CONTAINER_RESULT ],
            "caption": [ CONTAINER_RESULT ],
            "cell": [ CONTAINER_RESULT ],
            "code": [ CONTAINER_RESULT ],
            "columnheader": [ CONTAINER_RESULT ],
            "complementary": [ CONTAINER_RESULT ],
            "contentinfo": [ CONTAINER_RESULT ],
            "figure": [ CONTAINER_RESULT ],
            "form": [ CONTAINER_RESULT ],
            "group": [ CONTAINER_RESULT ],
            "list": [ CONTAINER_RESULT ],
            "main": [ CONTAINER_RESULT ],
            "mark": [ CONTAINER_RESULT ],
            "navigation": [ CONTAINER_RESULT ],
            "region": [ CONTAINER_RESULT ],
            "row": [ CONTAINER_RESULT ],
            "search": [ CONTAINER_RESULT ],
            "table": [ CONTAINER_RESULT ],
            "toolbar": [ CONTAINER_RESULT ],

            // DEBUG: Ignore because screen reader don't announce these
            "paragraph": [ IGNORE_RESULT ],
            "rowgroup":  [ IGNORE_RESULT ],
            "status": [ IGNORE_RESULT ],
            "strong": [ IGNORE_RESULT ],
            "subscript": [ IGNORE_RESULT ],
            "superscript": [ IGNORE_RESULT ],
            "tablist": [ IGNORE_RESULT ],
            "tabpanel": [ IGNORE_RESULT ],
            "term": [ IGNORE_RESULT ],
            "time": [ IGNORE_RESULT ],

            "button":  [
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && (itemWalker.getNode() as HTMLElement).getAttribute("aria-pressed") === "true") ? `[toggle button, pressed] ${itemWalker.getName()?.name || ""}`: null,
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && (itemWalker.getNode() as HTMLElement).getAttribute("aria-pressed") === "false") ? `[toggle button, not pressed] ${itemWalker.getName()?.name || ""}`: null,
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && `[button] ${itemWalker.getName()?.name || ""}` || "")
            ],
            "checkbox":  [
                (itemWalker: SRWalker) => {
                    if (!itemWalker.isEndTag()) {
                        const elem = itemWalker.getNode() as HTMLInputElement;
                        if (elem.getAttribute("aria-checked") === "mixed") {
                            return `[checkbox, half checked]`
                        } else {
                            return `[checkbox, ${elem.checked ? "checked": "not checked"}]`
                        }
                    } else {
                        return "";
                    }
                }
            ],
            "deletion":  [
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && `[deleted]` || "")
            ],
            "document":  [
                () => ""
            ],
            "graphics-document": [
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && !itemWalker.getName()?.name && itemWalker.getName()?.name !== "" && "[Unlabeled graphic]") || null,
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && (itemWalker.getName()?.name === "")) ? "" : null,
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && itemWalker.getName()?.name && `[graphic] ${itemWalker.getName()?.name || ""}`) || null,
                (itemWalker: SRWalker) => (itemWalker.isEndTag()) ? "" : null,
            ],
            "heading":  [
                (itemWalker: SRWalker) => {
                    let retVal = "";
                    if (!itemWalker.isEndTag()) {
                        retVal = `[heading level ${(itemWalker.getNode() as HTMLElement).ariaLevel || itemWalker.getNode().nodeName.substring(1)}]`;
                        let nameInfo = itemWalker.getName();
                        if (nameInfo.nameFrom !== "content") {
                            retVal += ` ${itemWalker.getName()?.name || ""}`;
                        }
                    }
                    return retVal;
                }
            ],
            "img": [
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && !itemWalker.getName()?.name && itemWalker.getName()?.name !== "" && "[Unlabeled graphic]") || null,
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && (itemWalker.getName()?.name === "")) ? "" : null,
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && itemWalker.getName()?.name && `[graphic] ${itemWalker.getName()?.name || ""}`) || null
            ],
            "insertion":  [
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && `[inserted]` || "")
            ],
            "link": [
                (itemWalker: SRWalker) => {
                    let href: string = ((itemWalker.getNode() as any).href) || "";
                    let retVal = "";
                    if (!itemWalker.isEndTag()) {
                        if (href.startsWith(document.location.href) && href.charAt(document.location.href.length) === "#") {
                            retVal = `[same page link]`;
                        } else {
                            retVal = `[link]`;
                        }
                        let nameInfo = itemWalker.getName();
                        if (nameInfo.nameFrom !== "content") {
                            retVal += ` ${(nameInfo?.name || "")}`
                        }
                    }
                    return retVal;
                }
            ],
            "listitem": [
                (itemWalker: SRWalker) => {
                    let isOrdered: boolean | undefined;
                    let walkParents = itemWalker.getNode().parentNode;
                    while (typeof isOrdered === "undefined" && walkParents) {
                        if (walkParents.nodeType === 1) {
                            const elem = walkParents as HTMLElement;
                            if (elem.hasAttribute("role")) {
                                if (elem.getAttribute("role") === "list") {
                                    isOrdered = false;
                                }
                            } else if (elem.nodeName.toUpperCase() === "UL") {
                                isOrdered = false;
                            } else if (elem.nodeName.toUpperCase() === "OL") {
                                isOrdered = true;
                            }
                        }
                        walkParents = walkParents.parentNode;
                    }
                    let retStr = "";
                    if (!isOrdered) {
                        retStr = !itemWalker.isEndTag() ? `[bullet] ${(itemWalker.getName()?.name || "")}` : "";
                    } else {
                        let walkBack = itemWalker.clone();
                        let count = 0;
                        while (walkBack.getRole() !== "list") {
                            if (!walkBack.isEndTag() && walkBack.getRole() === "listitem") {
                                ++count;
                            }
                            walkBack.previous(() => true);
                        }
                        retStr = !itemWalker.isEndTag() ? `${count}. ${(itemWalker.getName()?.name || "")}` : "";
                    }
                    return retStr;
                }
            ],
            "meter": [
                (itemWalker: SRWalker) => `[progress bar, ${((itemWalker.getNode() as HTMLInputElement).value)}]`
            ],
            "progressbar": [
                (itemWalker: SRWalker) => `[progress bar, ${((itemWalker.getNode() as HTMLInputElement).value)}]`
            ],
            "radio":  [
                (itemWalker: SRWalker) => {
                    if (!itemWalker.isEndTag()) {
                        return `[radio button, ${(itemWalker.getNode() as any).checked ? "checked": "not checked"}]`
                    } else {
                        return "";
                    }
                }
            ],
            "slider": [
                (itemWalker: SRWalker) => !itemWalker.isEndTag() ? `[slider, ${(itemWalker.getNode() as any).value}]` : ""
            ],
            "searchbox": [
                (itemWalker: SRWalker) => !itemWalker.isEndTag() ? `[edit]` : ""
            ],
            "separator":  [
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && `[separator]` || "")
            ],
            "spinbutton": [
                (itemWalker: SRWalker) => !itemWalker.isEndTag() ? `[spinbutton, editable]` : ""
            ],
            "tab": [
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && `[tab${(itemWalker.getNode() as HTMLElement).getAttribute("aria-selected") === "true" ? ", selected": ""}] ${itemWalker.getName()?.name || ""}`) || ""
            ],
            "text": [
                (itemWalker: SRWalker) => !itemWalker.isEndTag() ? `${(itemWalker.getName()?.name+"")}` : null
            ],
            "textbox":  [
                (itemWalker: SRWalker) => (!itemWalker.isEndTag() && `[edit] ${itemWalker.getName()?.name || ""}`) || ""
            ],
        }
    };

    const renderElemRules: {
        [mode: string]: {
            [role: string]: Array<(walker: SRWalker) => string | null>
        }
    } = {
        "default": {
            "dl": [ CONTAINER_RESULT ],

            "br": [
                (itemWalker: SRWalker) => {
                    try {
                        let walk = itemWalker.clone();
                        // Walk until we hit the beginning of the page, find another BR, or find something with a name
                        const DEBUG = true;
                        while (walk.previous(() => true) && walk.getNode().nodeName.toUpperCase() !== "BR" && walk.getName() && walk.getName().name.trim().length === 0);
                        return walk.getNode().nodeName.toUpperCase() === "BR" ? "[blank]" : null;
                    } catch (err) {
                        console.error(err);
                    }
                }
            ],
            "li": [
                (itemWalker: SRWalker) => !itemWalker.isEndTag() ? `[bullet] ${(itemWalker.getName()?.name || "")}` : ""
            ]
        }
    }

    const renderEnterTableCell = (newWalker: SRWalker, oldWalker: SRWalker) => {
        return "[header name, column X]";
    }

    const renderEnterTableRow = (newWalker: SRWalker, oldWalker: SRWalker) => {
        return "[row Y]";
    }

    const renderEnterRoleRules: {
        [mode: string]: {
            [role: string]: (walker: SRWalker, oldWalker: SRWalker) => string | null
        }
    } = {
        "default": {
            "article":
                (itemWalker: SRWalker) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [article landmark]`;
                }
            , "banner":
                (itemWalker: SRWalker) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [banner landmark]`;
                }
            , "blockquote": 
                (_itemWalker: SRWalker) => "[blockquote]"
            , "caption": 
                (_itemWalker: SRWalker) => "[caption]"
            , "cell": renderEnterTableCell
            , "columnheader": renderEnterTableCell
            , "complementary":
                (itemWalker: SRWalker) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [complementary landmark]`
                }
            , "contentinfo":
                (itemWalker: SRWalker) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [content info landmark]`
                }
            , "figure": 
                (_itemWalker: SRWalker) => "[figure]"
            , "form":
                (_itemWalker: SRWalker) => {
                    return `[grouping]`
                }
            , "group":
                (itemWalker: SRWalker) => {
                    if (itemWalker.getName() === null) return;
                    return `[grouping] ${itemWalker.getName()?.name || ""}`
                }
            , "region":
                (itemWalker: SRWalker) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [region]`;
                }
            , "row": renderEnterTableRow
            , "rowheader": renderEnterTableCell
            , "search":
                (itemWalker: SRWalker) => `${itemWalker.getName()?.name || ""} [search landmark]`
            , "toolbar":
                (itemWalker: SRWalker) => `${itemWalker.getName()?.name || ""} [toolbar]`
            , "list":
                (itemWalker: SRWalker) => {
                    const node = itemWalker.getNode() as HTMLElement;
                    const descendantListItems = document.evaluate(".//li | .//*[@role='listitem']", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    const descendantListItemsInOtherLists = document.evaluate(
                        ".//ul//li|.//ul//*[@role='listitem']|.//ol//li|.//ol//*[@role='listitem']|.//*[@role='list']//li|.//*[@role='list']//*[@role='listitem']",
                        node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    let numItems = descendantListItems.snapshotLength-descendantListItemsInOtherLists.snapshotLength;
                    let addName = itemWalker.getName()?.name;
                    if (addName) { addName = addName + " " } else { addName = "" };
                    return `${addName}[list with ${numItems} items]`;
                }
            , "main":
                (itemWalker: SRWalker) => `${itemWalker.getName()?.name || ""} [main landmark]`
            , "navigation":
                (itemWalker: SRWalker) => `${itemWalker.getName()?.name || ""} [navigation landmark]`
            , "table":
                (_itemWalker: SRWalker) => {
                    // TODO: table info
                    return `[table with X rows and Y columns]`;
                }
        }
    };

    const renderLeaveRoleRules: {
        [mode: string]: {
            [role: string]: (walker: SRWalker, oldWalker: SRWalker) => string | null
        }
    } = {
        "default": {
            "group":
                (itemWalker: SRWalker) => {
                    if (itemWalker.getName() === null) return;
                    else return "[out of grouping]";
                }
            , "blockquote": 
                (_itemWalker: SRWalker) => "[out of blockquote]"
            , "caption": 
                (_itemWalker: SRWalker) => "[out of caption]"
            , "figure": 
                (_itemWalker: SRWalker) => "[out of figure]"
            , "form": 
                (_itemWalker: SRWalker) => "[out of grouping]"
            , "list":
                (_itemWalker: SRWalker) => `[out of list]`
            , "region":
                (itemWalker: SRWalker) => {
                    if (itemWalker.getName() === null) return;
                    else return "[out of region]";
                }
            , "table": 
                (_itemWalker: SRWalker) => "[out of table]"
            , "toolbar":
                (_itemWalker: SRWalker) => `[out of toolbar]`
        }
    };

    const renderEnterElemRules: {
        [mode: string]: {
            [role: string]: (walker: SRWalker, oldWalker: SRWalker) => string | null
        }
    } = {
        "default": {
            "dl":
                (itemWalker: SRWalker) => {
                    const node = itemWalker.getNode() as HTMLElement;
                    const descendantListItems = document.evaluate(".//dt | .//dd", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    let numItems = descendantListItems.snapshotLength;
                    let addName = itemWalker.getName()?.name;
                    if (addName) { addName = addName + " " } else { addName = "" };
                    return `${addName}[list with ${numItems} items]`;
                }
            , "figcaption": 
                (_itemWalker: SRWalker) => "[caption]"
            , "mark": 
                (_itemWalker: SRWalker) => "[highlighted]"
        }
    };

    const renderLeaveElemRules: {
        [mode: string]: {
            [role: string]: (walker: SRWalker, oldWalker: SRWalker) => string | null
        }
    } = {
        "default": {
            "dl":
                (_itemWalker: SRWalker) => `[out of list]`
            , "figcaption":
                (_itemWalker: SRWalker) => `[out of caption]`
            , "mark":
                (_itemWalker: SRWalker) => `[out of highlighted]`
        }
    };

    export function renderEnter(mode: NavigationMode | "focus", walker: SRWalker, oldWalker?: SRWalker): string | null {
        const role = walker.getRole();
        const node = walker.getNode();
        const DEBUG = false; //node.nodeName === "MARK";
        DEBUG && console.log("-=-=-=-=-= renderEnter =-=-=-=-=-");
        DEBUG && console.log(role, node.nodeName);
        const nodeNameLookup = role === null ? node.nodeName.toLowerCase() : "ARIA";
        let rule = renderEnterRoleRules[mode]?.[role]
            || renderEnterRoleRules["default"]?.[role]
            || renderEnterElemRules[mode]?.[nodeNameLookup]
            || renderEnterElemRules["default"]?.[nodeNameLookup]
        ;
        if (rule) return rule(walker, oldWalker);
        return null;
    }

    export function renderLeave(mode: NavigationMode, walker: SRWalker, oldWalker?: SRWalker): string | null  {
        const role = walker.getRole();
        const node = walker.getNode();
        const nodeNameLookup = role === null ? node.nodeName.toLowerCase() : "ARIA";
        let rule = renderLeaveRoleRules[mode]?.[role]
            || renderLeaveRoleRules["default"]?.[role]
            || renderLeaveElemRules[mode]?.[nodeNameLookup]
            || renderLeaveElemRules["default"]?.[nodeNameLookup]
        ;
        if (rule) return rule(walker, oldWalker);
        return null;
    }

    export function renderCurrent(mode: NavigationMode, walker: SRWalker, containerChanges: ContainerChanges): string {
        let startOfRender = SRNavigator.jumpCurrent(mode, walker);
        let endOfRender = SRNavigator.jumpCurrentEnd(mode, walker);
        let renderStr = SRRenderer.renderRange(mode, startOfRender, endOfRender);
        return (containerChanges.leaving || []).concat(containerChanges.entering || []).concat([renderStr]).join(" ").replace(/\s+/g, " ");
    }

    export function renderRange(mode: NavigationMode, startOfRender: SRWalker, endOfRender: SRWalker) : string {
        let lastIterWalker = null;
        let iterWalker = startOfRender.clone();
        let renderStrs = [];
        let bContinue = true;
        while (bContinue) {
            const role = iterWalker.getRole();
            const node = iterWalker.getNode();
            const nodeNameLookup = role === null ? node.nodeName.toLowerCase() : "ARIA";
            const elem = node as HTMLElement;
            const nodeType = node.nodeType;
            if (nodeType === 1 && VisUtil.isNodeHiddenFromAT(iterWalker.getNode() as HTMLElement)) {
                iterWalker.setEndTag(true);
            } else {
                if (lastIterWalker) {
                    const containerChanges = SRController.diffContainers(mode, iterWalker, lastIterWalker);
                    renderStrs = renderStrs.concat(containerChanges.leaving.filter(s => s.trim().length > 0));
                    renderStrs = renderStrs.concat(containerChanges.entering.filter(s => s.trim().length > 0));
                }
                lastIterWalker = iterWalker.clone();
                const rules = (renderRoleRules[mode]?.[role] || [])
                    .concat((renderRoleRules.default?.[role] || []))
                    .concat(renderElemRules[mode]?.[nodeNameLookup] || [])
                    .concat(renderElemRules["default"]?.[nodeNameLookup] || [])
                    .concat((role && role !== "null") ? renderRoleRules.default.default : []);
                for (const rule of rules) {
                    let s = rule(iterWalker);
                    if (typeof s !== "undefined" && s !== null) {
                        if (nodeType === 1 && elem.getAttribute("aria-haspopup") === "menu") {
                            s = "[subMenu] "+s;
                        }
                        if (nodeType === 1 && elem.getAttribute("aria-expanded") === "false") {
                            s = "[collapsed] "+s;
                        }
                        if (nodeType === 1 && elem.getAttribute("aria-expanded") === "true") {
                            s = "[expanded] "+s;
                        }
                        if (s !== "") {
                            renderStrs.push(s);
                        }
                        break;
                    }
                }
                if (AriaUtil.containsPresentationalChildrenOnly(iterWalker.getNode() as HTMLElement)
                    || (["link", "heading"].includes(role) && iterWalker.getName().nameFrom !== "content")) 
                {
                    iterWalker.setEndTag(true);
                }
            }
            bContinue = iterWalker.next(() => true) && SRWalker.compare(iterWalker, endOfRender) < 0;
        }
        let retVal = renderStrs.filter(s => s.trim().length > 0).join(" ");
        return retVal;
    }

}

