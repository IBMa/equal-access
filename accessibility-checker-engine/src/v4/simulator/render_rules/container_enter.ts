import { SRRendererRule } from "../SRRendererRule";
import { SRCursor } from "../SRCursor";
import { SRTableUtil } from "../SRTableUtil";
import { quoteNamePadAfter, quoteNamePadBefore } from "./common";
import { AriaUtil } from "../../util/AriaUtil";
import { ARIADefinitions } from "../../../v2/aria/ARIADefinitions";

/**
 * Generates the announcement text when entering a table cell
 */
function renderEnterTableCell(newCursor: SRCursor, oldCursor: SRCursor) {
    const newTableModel = SRTableUtil.getTableModel(newCursor);
    const oldCellInfo = SRTableUtil.getCellModel(oldCursor, newTableModel);
    const newCellInfo = SRTableUtil.getCellModel(newCursor, newTableModel);
    if (!newCellInfo) return "";

    let retVal: string[] = [];

    // Announce row information if we've moved to a different row or the rowspan has changed
    if (!oldCellInfo || oldCellInfo.rowIndexStart !== newCellInfo.rowIndexStart || oldCellInfo.rowspan !== newCellInfo.rowspan) {
        // If a change in row or a change in rowSpan
        let rowHeaders = SRTableUtil.getRowHeadersForCursor(newCursor, newTableModel);
        let headerInfoStr = rowHeaders && rowHeaders.trim().length > 0 ? `${rowHeaders}, ` : "";
        retVal.push(`[${headerInfoStr}row ${(newCellInfo.rowIndexStart+1)}${newCellInfo.rowspan > 1 ? " through " + (newCellInfo.rowIndexStart+newCellInfo.rowspan) : ""}]`);
    }

    // Announce column information if we've moved to a different column or the colspan has changed
    if (!oldCellInfo || oldCellInfo.colIndexStart !== newCellInfo.colIndexStart || oldCellInfo.colspan !== newCellInfo.colspan) {
        // If a change in column or a change in colspan
        let columnHeaders = SRTableUtil.getColumnHeadersForCursor(newCursor, newTableModel);
        let headerInfoStr = columnHeaders && columnHeaders.trim().length > 0 ? `“${columnHeaders}”, ` : "";
        retVal.push(`[${headerInfoStr}column ${(newCellInfo.colIndexStart+1)}${newCellInfo.colspan > 1 ? " through " + (newCellInfo.colIndexStart+newCellInfo.colspan) : ""}]`);
    }

    return retVal.join(" ");
}

export let RULES: SRRendererRule[] = [
    // Single role rules - alphabetically sorted

    // Article role
    new SRRendererRule({
        roles: ["article"],
        elems: [],
        modes: ["item", "region", "article"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                return `[${quoteNamePadAfter(cursor)}(cursor)article region]`;
            }
        ]
    }),

    // Banner role
    new SRRendererRule({
        roles: ["banner"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                return `[${quoteNamePadAfter(cursor)}banner region]`;
            }
        ]
    }),

    // Blockquote role
    new SRRendererRule({
        roles: ["blockquote"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (_cursor: SRCursor) => "[blockquote]"
        ]
    }),

    // Caption role
    new SRRendererRule({
        roles: ["caption"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (_cursor: SRCursor) => "[caption]"
        ]
    }),

    // Cell role
    new SRRendererRule({
        roles: ["cell"],
        elems: [],
        modes: ["item", "table"],
        tests: [
            renderEnterTableCell
        ]
    }),

    // Columnheader role
    new SRRendererRule({
        roles: ["columnheader"],
        elems: [],
        modes: ["item", "table"],
        tests: [
            renderEnterTableCell
        ]
    }),

    // Complementary role
    new SRRendererRule({
        roles: ["complementary"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                return `[${quoteNamePadAfter(cursor)}complementary region]`;
            }
        ]
    }),

    // Contentinfo role
    new SRRendererRule({
        roles: ["contentinfo"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                return `[${quoteNamePadAfter(cursor)}content info region]`;
            }
        ]
    }),

    // Figure role
    new SRRendererRule({
        roles: ["figure"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (_cursor: SRCursor) => "[figure]"
        ]
    }),

    // Form role
    new SRRendererRule({
        roles: ["form"],
        elems: [],
        modes: ["item", "region", "formcontrol"],
        tests: [
            (_cursor: SRCursor) => "[grouping]"
        ]
    }),

    // Group role
    new SRRendererRule({
        roles: ["group"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                if (cursor.getCurrentOrParentByRoleClone(["combobox"], ["select"])?.getNode().nodeName.toUpperCase() === "SELECT") {
                    return "";
                }
                if (cursor.getNode().nodeName.toUpperCase() === "DETAILS") {
                    return `[button, ${cursor.getElement().hasAttribute("open") ? "expanded": "collapsed"}]`;
                } else {
                    return `[grouping${quoteNamePadBefore(cursor)}]`;
                }
            }
        ]
    }),

    // -- tab_focus
    new SRRendererRule({
        roles: ["group"],
        elems: [],
        modes: ["tab_focus"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                if (cursor.getCurrentOrParentByRoleClone(["combobox"], ["select"])?.getNode().nodeName.toUpperCase() === "SELECT") {
                    return "";
                }
                if (cursor.getNode().nodeName.toUpperCase() === "DETAILS") {
                    return `[button, ${cursor.getElement().hasAttribute("open") ? "expanded": "collapsed"}]`;
                } else {
                    return ``;
                }
            }
        ]
    }),

    // List role
    new SRRendererRule({
        roles: ["list"],
        elems: [],
        modes: ["item", "list"],
        tests: [
            (cursor: SRCursor) => {
                const node = cursor.getNode() as HTMLElement;
                const descendantListItems = document.evaluate(".//li | .//*[@role='listitem']", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                
                // Count items, excluding those in other lists or within presentational containers
                let numItems = 0;
                for (let i = 0; i < descendantListItems.snapshotLength; i++) {
                    const item = descendantListItems.snapshotItem(i) as HTMLElement;
                    
                    // Walk up ancestors to check for both nested lists and presentational containers
                    let isInOtherList = false;
                    let hasPresentationalAncestor = false;
                    let ancestor = item.parentElement;
                    
                    while (ancestor && ancestor !== node) {
                        // Check if ancestor is another list
                        const ancestorRole = AriaUtil.getResolvedRole(ancestor);
                        if (ancestorRole === "list" ||
                            ancestor.nodeName.toUpperCase() === "UL" ||
                            ancestor.nodeName.toUpperCase() === "OL") {
                            isInOtherList = true;
                            break;
                        }
                        
                        // Check if ancestor has presentational children
                        if (ancestorRole && ARIADefinitions.designPatterns[ancestorRole]?.presentationalChildren) {
                            hasPresentationalAncestor = true;
                            break;
                        }
                        
                        ancestor = ancestor.parentElement;
                    }
                    
                    if (!isInOtherList && !hasPresentationalAncestor) {
                        numItems++;
                    }
                }
                
                if (numItems === 0) return null;
                return `[${quoteNamePadAfter(cursor)}list of ${numItems} items]`;
            }
        ]
    }),

    // Main role
    new SRRendererRule({
        roles: ["main"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => `[${quoteNamePadAfter(cursor)}main region]`
        ]
    }),

    // menubar role
    new SRRendererRule({
        roles: ["menubar"],
        elems: [],
        modes: ["item", "list"],
        tests: [
            (cursor: SRCursor) => {
                const node = cursor.getNode() as HTMLElement;
                const descendantListItems = document.evaluate(".//*[@role='menuitem']", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                const descendantListItemsInOtherLists = document.evaluate(
                    ".//*[@role='menubar']//*[@role='menuitem']|.//*[@role='menu']//*[@role='menuitem']",
                    node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                // const descendantContainers = document.evaluate(".//*[@role='menuitem']/*[@role='menu']", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                // const descendantContainers2 = document.evaluate(".//*[@role='menubar']//*[@role='menuitem']/*[@role='menu']|.//*[@role='menu']//*[@role='menuitem']/*[@role='menu']", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                console.log("MENUBAR", cursor.isEndTag()?"/":"", cursor.getNode());
                console.log(descendantListItems, descendantListItemsInOtherLists);//, descendantContainers, descendantContainers2)
                let numItems = descendantListItems.snapshotLength-descendantListItemsInOtherLists.snapshotLength;//-descendantContainers.snapshotLength+descendantContainers2.snapshotLength;
                if (numItems === 0) return null;
                return `[${quoteNamePadAfter(cursor)}menubar with ${numItems} items]`;
            }
        ]
    }),

    // Navigation role
    new SRRendererRule({
        roles: ["navigation"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => `[${quoteNamePadAfter(cursor)}navigation region]`
        ]
    }),

    // Region role
    new SRRendererRule({
        roles: ["region"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                return `[${quoteNamePadAfter(cursor)}region]`;
            }
        ]
    }),

    // Row role
    new SRRendererRule({
        roles: ["row"],
        elems: [],
        modes: ["item", "table"],
        tests: [
            () => ""
        ]
    }),

    // Rowheader role
    new SRRendererRule({
        roles: ["rowheader"],
        elems: [],
        modes: ["item", "table"],
        tests: [
            renderEnterTableCell
        ]
    }),

    // Search role
    new SRRendererRule({
        roles: ["search"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => `[${quoteNamePadAfter(cursor)}search region]`
        ]
    }),

    // Table role
    new SRRendererRule({
        roles: ["table"],
        elems: [],
        modes: ["item", "table"],
        tests: [
            (cursor: SRCursor) => {
                let tableWalker = cursor.clone();
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
                        if (tableWalker.isStartTag()) {
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
        ]
    }),

    // Toolbar role
    new SRRendererRule({
        roles: ["toolbar"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (cursor: SRCursor) => `[${quoteNamePadAfter(cursor)}toolbar]`
        ]
    }),

    // HTML Element rules
    new SRRendererRule({
        roles: [],
        elems: ["DL"],
        modes: ["item", "list"],
        tests: [
            (cursor: SRCursor) => {
                const node = cursor.getNode() as HTMLElement;
                const descendantListItems = document.evaluate(".//dt", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                let numItems = descendantListItems.snapshotLength;
                return `[${quoteNamePadAfter(cursor)}definition list of ${numItems} terms]`;
            }
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["FIGCAPTION"],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => "[caption]"
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["MARK"],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => "[highlighted]"
        ]
    }),

    // Multiple roles rules - placed at the bottom

    // Heading mode rules - ignore container elements in heading mode (multiple roles)
    new SRRendererRule({
        roles: ["article", "banner", "blockquote", "caption", "cell", "columnheader", 
                "complementary", "contentinfo", "figure", "form", "group", "region", 
                "row", "rowheader", "search", "toolbar", "list", "main", "navigation", "table"],
        elems: [],
        modes: ["heading"],
        tests: [
            () => ""
        ]
    })
];
