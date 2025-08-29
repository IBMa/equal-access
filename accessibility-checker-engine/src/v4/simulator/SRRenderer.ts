import { AriaUtil } from "../util/AriaUtil";
import { VisUtil } from "../util/VisUtil";
import { SRController } from "./SRController";
import { SRNavigator } from "./SRNavigator";
import { ContainerChanges, NavigationMode } from "./SRTypes";
import { SRCursor } from "./SRCursor";
import { SRTableUtil } from "./SRTableUtil";

export namespace SRRenderer {
    const CONTAINER_RESULT = (_itemWalker: SRCursor) => "";
    const IGNORE_RESULT = (_itemWalker: SRCursor) => "";

    const renderRoleRules: {
        [mode: string]: {
            [role: string]: Array<(walker: SRCursor) => string | null>
        }
    } = {
        "default": {
            // "null": [ 
            //     (_itemWalker: SRCursor) => ""
            // ],
            // "undefined": [ 
            //     (_itemWalker: SRCursor) => ""
            // ],
            "default": [
                // DEBUG
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `!!<${itemWalker.getRole()}>${(itemWalker.getName()?.name+"")}!!` : `!!</${itemWalker.getRole()}>!!`
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
            "rowheader": [ CONTAINER_RESULT ],
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
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && (itemWalker.getNode() as HTMLElement).getAttribute("aria-pressed") === "true") ? `[toggle button, pressed] ${itemWalker.getName()?.name || ""}`: null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && (itemWalker.getNode() as HTMLElement).getAttribute("aria-pressed") === "false") ? `[toggle button, not pressed] ${itemWalker.getName()?.name || ""}`: null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `[button] ${itemWalker.getName()?.name || ""}` || "")
            ],
            "checkbox":  [
                (itemWalker: SRCursor) => {
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
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `[deleted]` || "")
            ],
            "document":  [
                () => ""
            ],
            "graphics-document": [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && !itemWalker.getName()?.name && itemWalker.getName()?.name !== "" && "[Unlabeled graphic]") || null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && (itemWalker.getName()?.name === "")) ? "" : null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && itemWalker.getName()?.name && `[graphic] ${itemWalker.getName()?.name || ""}`) || null,
                (itemWalker: SRCursor) => (itemWalker.isEndTag()) ? "" : null,
            ],
            "heading":  [
                (itemWalker: SRCursor) => {
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
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && !itemWalker.getName()?.name && itemWalker.getName()?.name !== "" && "[Unlabeled graphic]") || null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && (itemWalker.getName()?.name === "")) ? "" : null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && itemWalker.getName()?.name && `[graphic] ${itemWalker.getName()?.name || ""}`) || null
            ],
            "insertion":  [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `[inserted]` || "")
            ],
            "link": [
                (itemWalker: SRCursor) => {
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
                (itemWalker: SRCursor) => {
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
                (itemWalker: SRCursor) => `[progress bar, ${((itemWalker.getNode() as HTMLInputElement).value)}]`
            ],
            "progressbar": [
                (itemWalker: SRCursor) => `[progress bar, ${((itemWalker.getNode() as HTMLInputElement).value)}]`
            ],
            "radio":  [
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag()) {
                        return `[radio button, ${(itemWalker.getNode() as any).checked ? "checked": "not checked"}]`
                    } else {
                        return "";
                    }
                }
            ],
            "slider": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `[slider, ${(itemWalker.getNode() as any).value}]` : ""
            ],
            "searchbox": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `[edit]` : ""
            ],
            "separator":  [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `[separator]` || "")
            ],
            "spinbutton": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `[spinbutton, editable]` : ""
            ],
            "tab": [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `[tab${(itemWalker.getNode() as HTMLElement).getAttribute("aria-selected") === "true" ? ", selected": ""}] ${itemWalker.getName()?.name || ""}`) || ""
            ],
            "text": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `${(itemWalker.getName()?.name+"")}` : null
            ],
            "textbox":  [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `[edit] ${itemWalker.getName()?.name || ""}`) || ""
            ],
        }
    };

    const renderElemRules: {
        [mode: string]: {
            [role: string]: Array<(walker: SRCursor) => string | null>
        }
    } = {
        "default": {
            "dl": [ CONTAINER_RESULT ],

            "br": [
                (itemWalker: SRCursor) => {
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
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `[bullet] ${(itemWalker.getName()?.name || "")}` : ""
            ]
        }
    }

    function renderEnterTableCell(newWalker: SRCursor, oldWalker: SRCursor) {
        let oldTableNode = oldWalker.getCurrentOrParentByRoleClone(["table"]).getNode();
        let newTableNode = newWalker.getCurrentOrParentByRoleClone(["table"]).getNode();

        let newRowIdxs = SRTableUtil.getRowRange(newWalker);
        let oldRowIdxs = SRTableUtil.getRowRange(oldWalker);
        let newColIdxs = SRTableUtil.getColRange(newWalker);
        let oldColIdxs = SRTableUtil.getColRange(oldWalker);

        let retVal: string[] = [];

        if (!oldTableNode || !oldTableNode.isSameNode(newTableNode) || !SRTableUtil.cellRangesOverlap(oldRowIdxs, newRowIdxs) || JSON.stringify(oldRowIdxs) !== JSON.stringify(newRowIdxs)) {
            // If a change in row or a change in rowSpan            
            let rowHeaders = SRTableUtil.getRowHeaders(newWalker);
            let headerInfoStr = rowHeaders && rowHeaders.trim().length > 0 ? `${rowHeaders}, ` : "";
            retVal.push(`[${headerInfoStr}row ${newRowIdxs.start === newRowIdxs.end ? newRowIdxs.start : newRowIdxs.start + " through " + newRowIdxs.end}]`);
        }

        if (!oldTableNode || !oldTableNode.isSameNode(newTableNode) || !SRTableUtil.cellRangesOverlap(oldColIdxs, newColIdxs) || JSON.stringify(oldColIdxs) !== JSON.stringify(newColIdxs)) {
            // If a change in column or a change in rowSpan
            let columnHeaders = SRTableUtil.getColumnHeaders(newWalker);
            let headerInfoStr = columnHeaders && columnHeaders.trim().length > 0 ? `${columnHeaders}, ` : "";
            retVal.push(`[${headerInfoStr}column ${newColIdxs.start === newColIdxs.end ? newColIdxs.start : newColIdxs.start + " through " + newColIdxs.end}]`);
        }

        return retVal.join(" ");
    }

    const renderEnterTableRow = (newWalker: SRCursor, oldWalker: SRCursor) => {
        return "";
    }

    const renderEnterRoleRules: {
        [mode: string]: {
            [role: string]: (walker: SRCursor, oldWalker: SRCursor) => string | null
        }
    } = {
        "default": {
            "article":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [article landmark]`;
                }
            , "banner":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [banner landmark]`;
                }
            , "blockquote": 
                (_itemWalker: SRCursor) => "[blockquote]"
            , "caption": 
                (_itemWalker: SRCursor) => "[caption]"
            , "cell": renderEnterTableCell
            , "columnheader": renderEnterTableCell
            , "complementary":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [complementary landmark]`
                }
            , "contentinfo":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [content info landmark]`
                }
            , "figure": 
                (_itemWalker: SRCursor) => "[figure]"
            , "form":
                (_itemWalker: SRCursor) => {
                    return `[grouping]`
                }
            , "group":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getName() === null) return;
                    return `[grouping] ${itemWalker.getName()?.name || ""}`
                }
            , "region":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getName() === null) return;
                    return `${itemWalker.getName()?.name || ""} [region]`;
                }
            , "row": renderEnterTableRow
            , "rowheader": renderEnterTableCell
            , "search":
                (itemWalker: SRCursor) => `${itemWalker.getName()?.name || ""} [search landmark]`
            , "toolbar":
                (itemWalker: SRCursor) => `${itemWalker.getName()?.name || ""} [toolbar]`
            , "list":
                (itemWalker: SRCursor) => {
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
                (itemWalker: SRCursor) => `${itemWalker.getName()?.name || ""} [main landmark]`
            , "navigation":
                (itemWalker: SRCursor) => `${itemWalker.getName()?.name || ""} [navigation landmark]`
            , "table":
                (itemWalker: SRCursor) => {
                    let tableWalker = itemWalker.clone();
                    // Get to the start of the table
                    while (tableWalker.getRole() !== "table" && tableWalker.previous(() => true));
                    // Set an end to the table
                    let tableNode = tableWalker.getNode();
                    let rows = 0;
                    let cols = 0;
                    // Sanity check that the table has content
                    if (tableWalker.getNode().firstChild) {
                        let firstRowComplete = false;
                        while (tableWalker.next(() => true) && !tableWalker.getNode().isSameNode(tableNode)) {
                            const role = tableWalker.getRole();
                            if (!tableWalker.isEndTag()) {
                                if (role === "row") {
                                    ++rows;
                                } else {
                                    if (!firstRowComplete && ["cell", "rowheader", "columnheader"].includes(role)) {
                                        const elem = tableWalker.getNode() as HTMLElement;
                                        cols += parseInt(elem.getAttribute("colspan") || "1");
                                    }
                                }
                            } else if (role === "row") {
                                firstRowComplete = true;
                            }
                        }
                    }
                    
                    return `[table with ${rows} rows and ${cols} columns]`;
                }
        }
    };

    const renderLeaveRoleRules: {
        [mode: string]: {
            [role: string]: (walker: SRCursor, oldWalker: SRCursor) => string | null
        }
    } = {
        "default": {
            "group":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getName() === null) return;
                    else return "[out of grouping]";
                }
            , "blockquote": 
                (_itemWalker: SRCursor) => "[out of blockquote]"
            , "caption": 
                (_itemWalker: SRCursor) => "[out of caption]"
            , "figure": 
                (_itemWalker: SRCursor) => "[out of figure]"
            , "form": 
                (_itemWalker: SRCursor) => "[out of grouping]"
            , "list":
                (_itemWalker: SRCursor) => `[out of list]`
            , "region":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getName() === null) return;
                    else return "[out of region]";
                }
            , "table": 
                (_itemWalker: SRCursor) => "[out of table]"
            , "toolbar":
                (_itemWalker: SRCursor) => `[out of toolbar]`
        }
    };

    const renderEnterElemRules: {
        [mode: string]: {
            [role: string]: (walker: SRCursor, oldWalker: SRCursor) => string | null
        }
    } = {
        "default": {
            "dl":
                (itemWalker: SRCursor) => {
                    const node = itemWalker.getNode() as HTMLElement;
                    const descendantListItems = document.evaluate(".//dt | .//dd", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    let numItems = descendantListItems.snapshotLength;
                    let addName = itemWalker.getName()?.name;
                    if (addName) { addName = addName + " " } else { addName = "" };
                    return `${addName}[list with ${numItems} items]`;
                }
            , "figcaption": 
                (_itemWalker: SRCursor) => "[caption]"
            , "mark": 
                (_itemWalker: SRCursor) => "[highlighted]"
        }
    };

    const renderLeaveElemRules: {
        [mode: string]: {
            [role: string]: (walker: SRCursor, oldWalker: SRCursor) => string | null
        }
    } = {
        "default": {
            "dl":
                (_itemWalker: SRCursor) => `[out of list]`
            , "figcaption":
                (_itemWalker: SRCursor) => `[out of caption]`
            , "mark":
                (_itemWalker: SRCursor) => `[out of highlighted]`
        }
    };

    export function renderEnter(mode: NavigationMode | "focus", walker: SRCursor, oldWalker?: SRCursor): string | null {
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

    export function renderLeave(mode: NavigationMode, walker: SRCursor, oldWalker?: SRCursor): string | null  {
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

    export function renderCurrent(mode: NavigationMode, walker: SRCursor, containerChanges: ContainerChanges): string {
        let startOfRender = SRNavigator.jumpCurrent(mode, walker);
        let endOfRender = SRNavigator.jumpCurrentEnd(mode, walker);
        let renderStr = SRRenderer.renderRange(mode, startOfRender, endOfRender);
        return (containerChanges.leaving || []).concat(containerChanges.entering || []).concat([renderStr]).join(" ").replace(/\s+/g, " ");
    }

    export function renderRange(mode: NavigationMode, startOfRender: SRCursor, endOfRender: SRCursor) : string {
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
            bContinue = iterWalker.next(() => true) && SRCursor.compare(iterWalker, endOfRender) < 0;
        }
        let retVal = renderStrs.filter(s => s.trim().length > 0).join(" ");
        return retVal;
    }

}

