import { SRRendererRule } from "../SRRendererRule";
import { SRCursor } from "../SRCursor";
import { quoteNamePadAfter, getRoleDescription } from "./common";

export let RULES: SRRendererRule[] = [
    // Single role rules - alphabetically sorted
    
    // Article role
    new SRRendererRule({
        roles: ["article"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const roleDesc = getRoleDescription(cursor, "article");
                return `[out of ${roleDesc}]`;
            }
        ]
    }),

    // Banner role
    new SRRendererRule({
        roles: ["banner"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const roleDesc = getRoleDescription(cursor, "banner region");
                return `[out of ${roleDesc}]`;
            }
        ]
    }),

    // Blockquote role
    new SRRendererRule({
        roles: ["blockquote"],
        elems: [],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => "[out of blockquote]"
        ]
    }),

    // Caption role
    new SRRendererRule({
        roles: ["caption"],
        elems: [],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => "[out of caption]"
        ]
    }),

    // Complementary role
    new SRRendererRule({
        roles: ["complementary"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const roleDesc = getRoleDescription(cursor, "complementary region");
                return `[out of ${roleDesc}]`;
            }
        ]
    }),

    // Contentinfo role
    new SRRendererRule({
        roles: ["contentinfo"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const roleDesc = getRoleDescription(cursor, "content info region");
                return `[out of ${roleDesc}]`;
            }
        ]
    }),

    // Figure role
    new SRRendererRule({
        roles: ["figure"],
        elems: [],
        modes: ["item", "region"],
        tests: [
            (_cursor: SRCursor) => "[out of figure]"
        ]
    }),

    // Form role
    new SRRendererRule({
        roles: ["form"],
        elems: [],
        modes: ["item", "region", "formcontrol"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) {
                    return "[out of section]";
                } else {
                    return `[out of form]`
                }
            }
        ]
    }),

    // Group role
    new SRRendererRule({
        roles: ["group"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                // <details> uses the group role but has its own disclosure widget semantics;
                // SRs do not announce "out of grouping" when leaving a details element.
                if (cursor.getNode().nodeName.toUpperCase() === "DETAILS") {
                    return "";
                }
                if (cursor.getNameInfo() === null) return null;
                if (cursor.getCurrentOrParentByRoleClone(["combobox"], ["select"])?.getNode().nodeName.toUpperCase() === "SELECT") {
                    return "";
                }
                return "[out of grouping]";
            }
        ]
    }),

    // List role
    new SRRendererRule({
        roles: ["list"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const node = cursor.getNode() as HTMLElement;
                const descendantListItems = document.evaluate(".//li | .//*[@role='listitem']", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                const descendantListItemsInOtherLists = document.evaluate(
                    ".//ul//li|.//ul//*[@role='listitem']|.//ol//li|.//ol//*[@role='listitem']|.//*[@role='list']//li|.//*[@role='list']//*[@role='listitem']",
                    node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                let numItems = descendantListItems.snapshotLength-descendantListItemsInOtherLists.snapshotLength;
                if (numItems === 0) return null;
                return `[${quoteNamePadAfter(cursor)}out of list]`;
            }
        ]
    }),

    // Main role
    new SRRendererRule({
        roles: ["main"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const roleDesc = getRoleDescription(cursor, "main region");
                return `[out of ${roleDesc}]`;
            }
        ]
    }),

    // menubar role
    new SRRendererRule({
        roles: ["menubar"],
        elems: [],
        modes: ["item", "list"],
        tests: [
            (_cursor: SRCursor) => `[out of menubar]`
        ]
    }),

    // Navigation role
    new SRRendererRule({
        roles: ["navigation"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const roleDesc = getRoleDescription(cursor, "navigation region");
                return `[out of ${roleDesc}]`;
            }
        ]
    }),

    // radiogroup role
    new SRRendererRule({
        roles: ["radiogroup"],
        elems: [],
        modes: ["item", "region", "tab_focus"],
        tests: [
            (_cursor: SRCursor) => "[out of grouping]"
        ]
    }),

    // Region role
    new SRRendererRule({
        roles: ["region"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                if (cursor.getNameInfo() === null) return null;
                const roleDesc = getRoleDescription(cursor, "region");
                return `[out of ${roleDesc}]`;
            }
        ]
    }),

    // Search role
    new SRRendererRule({
        roles: ["search"],
        elems: [],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => {
                const roleDesc = getRoleDescription(cursor, "search region");
                return `[out of ${roleDesc}]`;
            }
        ]
    }),

    // Table role
    new SRRendererRule({
        roles: ["table"],
        elems: [],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => "[out of table]"
        ]
    }),

    // Toolbar role
    new SRRendererRule({
        roles: ["toolbar"],
        elems: [],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => `[out of toolbar]`
        ]
    }),

    // HTML Element rules
    new SRRendererRule({
        roles: [],
        elems: ["ABBR"],
        modes: ["item"],
        tests: [
            (cursor: SRCursor) => cursor.getElement().hasAttribute("title") ? 
                `[${cursor.getElement().getAttribute("title")}]` : null
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["DL"],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => `[out of definition list]`
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["FIGCAPTION"],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => `[out of caption]`
        ]
    }),

    new SRRendererRule({
        roles: [],
        elems: ["MARK"],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => `[out of highlighted]`
        ]
    }),

    // Preformatted text (<pre>)
    new SRRendererRule({
        roles: [],
        elems: ["PRE"],
        modes: ["item"],
        tests: [
            (_cursor: SRCursor) => `[out of preformatted text]`
        ]
    }),

    // Multiple roles rules - placed at the bottom
    
    // Region mode rules - ignore container elements in region and heading mode
    new SRRendererRule({
        roles: ["group", "article", "banner", "blockquote", "caption", "complementary", 
                "contentinfo", "figure", "form", "list", "region", "main", "navigation", 
                "search", "table", "toolbar"],
        elems: [],
        modes: ["region", "heading"],
        tests: [
            () => ""
        ]
    }),
];
