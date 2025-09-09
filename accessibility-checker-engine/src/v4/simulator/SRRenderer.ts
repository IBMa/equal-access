import { AriaUtil } from "../util/AriaUtil";
import { VisUtil } from "../util/VisUtil";
import { SRController } from "./SRController";
import { SRNavigator } from "./SRNavigator";
import { ContainerChanges, NavigationMode } from "./SRTypes";
import { SRCursor } from "./SRCursor";
import { SRTableUtil } from "./SRTableUtil";

/**
 * SRRenderer namespace provides functionality for simulating how screen readers
 * announce content to users. It contains rules for rendering different types of
 * elements and ARIA roles in various navigation modes.
 *
 * The renderer uses a rule-based system to determine what text should be announced
 * when navigating to, within, or away from elements based on their roles and properties.
 */
export namespace SRRenderer {
    /**
     * Helper function that returns an empty string for container elements
     * Container elements typically don't have their own announcement but contain other elements
     */
    const CONTAINER_RESULT = (_itemWalker: SRCursor) => "";
    
    /**
     * Helper function that returns an empty string for elements that screen readers typically ignore
     */
    const IGNORE_RESULT = (_itemWalker: SRCursor) => "";

    function padNameAfter(cursor: SRCursor) {
        return cursor.getName()?cursor.getName()+" ":"";
    }

    function padNameBefore(cursor: SRCursor) {
        return cursor.getName()?" "+cursor.getName():"";
    }

    /**
     * Rules for rendering elements based on their ARIA role
     *
     * This structure maps navigation modes and ARIA roles to arrays of rendering functions.
     * Each function takes a cursor and returns the text that should be announced,
     * or null/undefined if it doesn't apply.
     *
     * Functions are tried in order until one returns a non-null/undefined value.
     */
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
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `!!<${itemWalker.getRole()}>${(itemWalker.getNameInfo()?.name+"")}!!` : `!!</${itemWalker.getRole()}>!!`
            ],

            // DEBUG: Ignore because they're containers
            "article": [ CONTAINER_RESULT ],
            "banner": [ CONTAINER_RESULT ],
            "blockquote": [ CONTAINER_RESULT ],
            "caption": [ CONTAINER_RESULT ],
            "cell": [ CONTAINER_RESULT ],
            "code": [ CONTAINER_RESULT ],
            "columnheader": [ CONTAINER_RESULT ],
            "combobox": [
                (itemWalker: SRCursor) => {
                    if (itemWalker.isEndTag()) return "";
                    let state = "";
                    let value = "";
                    if (itemWalker.getNode().nodeName.toUpperCase() === "SELECT") {
                        state = ", collapsed";

                        const optionId = (itemWalker.getNode() as any).value;
                        let valueElem = itemWalker.getElement().querySelector(`option[value='${optionId}']`);
                        let temp = new SRCursor(valueElem, false);
                        value = temp.getNameInfo()?.name ? ` ${temp.getNameInfo()?.name}` : "";
                        return `${padNameAfter(itemWalker)}[combo box${state}]${value}`;
                    } else if (itemWalker.getNode().nodeName.toUpperCase() === "INPUT" && !itemWalker.getElement().hasAttribute("role")) {
                        return `${padNameAfter(itemWalker)}[combo box, has auto complete, editable, opens list]`;
                    } else {
                        const elem = itemWalker.getElement();
                        if (elem.hasAttribute("aria-expanded")) {
                            state = `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                            if (elem.hasAttribute("aria-autocomplete")) {
                                state += `, has auto complete`;
                            }
                            state += `, editable, opens list`
                        }
                        return `[combo box${state}]${value}`;
                    }
                }
            ],
            "complementary": [ CONTAINER_RESULT ],
            "contentinfo": [ CONTAINER_RESULT ],
            "figure": [ CONTAINER_RESULT ],
            "form": [ CONTAINER_RESULT ],
            "group": [ CONTAINER_RESULT ],
            "list": [ CONTAINER_RESULT ],
            "main": [ CONTAINER_RESULT ],
            "mark": [ CONTAINER_RESULT ],
            "navigation": [ CONTAINER_RESULT ],
            "option": [
                (itemWalker: SRCursor) => {
                    if (itemWalker.getCurrentOrParentByRoleClone(["combobox"], ["select"])?.getNode().nodeName.toUpperCase() === "SELECT") {
                        return "";
                    }
                    return "";
                }
            ],
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
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && (itemWalker.getNode() as HTMLElement).getAttribute("aria-pressed") === "true") ? `[toggle button, pressed] ${itemWalker.getNameInfo()?.name || ""}`: null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && (itemWalker.getNode() as HTMLElement).getAttribute("aria-pressed") === "false") ? `[toggle button, not pressed] ${itemWalker.getNameInfo()?.name || ""}`: null,
                (itemWalker: SRCursor) => {
                    if (itemWalker.isEndTag()) return undefined;
                    let expandStr = "";
                    const elem = itemWalker.getElement();
                    if (elem.hasAttribute("aria-expanded")) {
                        expandStr = `, ${elem.getAttribute("aria-expanded") === "true" ? "expanded" : "collapsed"}`;
                    }
                    return `${itemWalker.getNameInfo()?.name || ""} [button${expandStr}]`;
                },
                (itemWalker: SRCursor) => { if (itemWalker.isEndTag()) return ""; }
            ],
            "checkbox":  [
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag()) {
                        const elem = itemWalker.getNode() as HTMLInputElement;
                        if (elem.getAttribute("aria-checked") === "mixed") {
                            return `[checkbox, half checked]${padNameBefore(itemWalker)}`
                        } else {
                            return `[checkbox, ${elem.checked ? "checked": "not checked"}]${padNameBefore(itemWalker)}`
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
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && !itemWalker.getNameInfo()?.name && itemWalker.getNameInfo()?.name !== "" && "[Unlabeled graphic]") || null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && (itemWalker.getNameInfo()?.name === "")) ? "" : null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && itemWalker.getNameInfo()?.name && `[graphic] ${itemWalker.getNameInfo()?.name || ""}`) || null,
                (itemWalker: SRCursor) => (itemWalker.isEndTag()) ? "" : null,
            ],
            "heading":  [
                (itemWalker: SRCursor) => {
                    let retVal = "";
                    if (!itemWalker.isEndTag()) {
                        retVal = `[heading level ${(itemWalker.getNode() as HTMLElement).ariaLevel || itemWalker.getNode().nodeName.substring(1)}]`;
                        let nameInfo = itemWalker.getNameInfo();
                        if (nameInfo.nameFrom !== "content") {
                            retVal += ` ${itemWalker.getNameInfo()?.name || ""}`;
                        }
                    }
                    return retVal;
                }
            ],
            "img": [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && !itemWalker.getNameInfo()?.name && itemWalker.getNameInfo()?.name !== "" && "[Unlabeled graphic]") || null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && (itemWalker.getNameInfo()?.name === "")) ? "" : null,
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && itemWalker.getNameInfo()?.name && `[graphic] ${itemWalker.getNameInfo()?.name || ""}`) || null
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
                        let nameInfo = itemWalker.getNameInfo();
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
                        retStr = !itemWalker.isEndTag() ? `[bullet] ${(itemWalker.getNameInfo()?.name || "")}` : "";
                    } else {
                        let walkBack = itemWalker.clone();
                        let count = 0;
                        while (walkBack.getRole() !== "list") {
                            if (!walkBack.isEndTag() && walkBack.getRole() === "listitem") {
                                ++count;
                            }
                            walkBack.previous(() => true);
                        }
                        retStr = !itemWalker.isEndTag() ? `${count}. ${(itemWalker.getNameInfo()?.name || "")}` : "";
                    }
                    return retStr;
                }
            ],
            "math": [
                (itemWalker: SRCursor) => itemWalker.isEndTag() ? `[math content]` : ""
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
                        return `[radio button, ${(itemWalker.getNode() as any).checked ? "checked": "not checked"}]${padNameBefore(itemWalker)}`
                    } else {
                        return "";
                    }
                }
            ],
            "slider": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `${padNameAfter(itemWalker)}[slider, ${(itemWalker.getNode() as any).value}]` : ""
            ],
            "searchbox": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `${padNameAfter(itemWalker)}[edit]` : ""
            ],
            "separator":  [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `[separator]` || "")
            ],
            "spinbutton": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `${padNameAfter(itemWalker)}[spinbutton, editable]` : ""
            ],
            "tab": [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `[tab${(itemWalker.getNode() as HTMLElement).getAttribute("aria-selected") === "true" ? ", selected": ""}] ${itemWalker.getNameInfo()?.name || ""}`) || ""
            ],
            "text": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `${(itemWalker.getNameInfo()?.name+"")}` : null
            ],
            "textbox":  [
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag()) {
                        if (itemWalker.getNode().nodeName.toUpperCase() === "INPUT") {
                            return `${padNameAfter(itemWalker)}[edit] ${itemWalker.getNameInfo()?.name || ""}`;
                        } else {
                            return `${padNameAfter(itemWalker)}[edit, multiline] ${itemWalker.getNameInfo()?.name || ""}`;
                        }
                    } else if (itemWalker.getNode().nodeName.toUpperCase() === "TEXTAREA") {
                        return "[out of edit]";
                    } else {
                        return "";
                    }
                }
            ],
        }
    };

    /**
     * Rules for rendering elements based on their HTML tag name
     *
     * Similar to renderRoleRules, but matches on element tag names instead of ARIA roles.
     * Used as a fallback when an element doesn't have a specific ARIA role.
     */
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
                        while (walk.previous(() => true) && walk.getNode().nodeName.toUpperCase() !== "BR" && walk.getNameInfo() && walk.getNameInfo().name.trim().length === 0);
                        return walk.getNode().nodeName.toUpperCase() === "BR" ? "[blank]" : null;
                    } catch (err) {
                        console.error(err);
                    }
                }
            ],
            "input": [
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && itemWalker.getElement()?.getAttribute("type") === "password" && `${padNameAfter(itemWalker)}[edit, protected]`) || null,
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag() && itemWalker.getElement()?.getAttribute("type") === "file") {
                        let value = (itemWalker.getElement() as HTMLInputElement)?.value || "";
                        value = value === "" ? "No file chosen" : value.substring("C:\\fakepath\\".length);
                        return `${padNameAfter(itemWalker)}[button] ${padNameAfter(itemWalker)}[${value}]`;
                    }
                    return null;
                },
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag() && itemWalker.getElement()?.getAttribute("type") === "color") {
                        const val = (itemWalker.getElement() as HTMLInputElement).value;
                        const r = (Number(`0x${val.substring(1,3)}`)*100.0/Number("0xff")).toFixed(0);
                        const g = (Number(`0x${val.substring(3,5)}`)*100.0/Number("0xff")).toFixed(0);
                        const b = (Number(`0x${val.substring(5)}`)*100.0/Number("0xff")).toFixed(0);
                        return `${padNameAfter(itemWalker)}[clickable] [${r}% red ${g}% green ${b}% blue]`;
                    } 
                    return null;
                },
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag() && itemWalker.getElement()?.getAttribute("type") === "month") {
                        const val = (itemWalker.getElement() as HTMLInputElement).value;
                        let y = "0";
                        let m = "0";
                        if (val.trim().length > 0) {
                            let date = new Date(val);
                            y = ""+date.getFullYear();
                            m = ""+(date.getMonth()+1);
                        }
                        return `${padNameAfter(itemWalker)}[clickable] [spin button, ${m}] [spin button, ${y}] [menu button] [subMenu] Show month picker`;
                    } 
                    return null;
                },
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag() && itemWalker.getElement()?.getAttribute("type") === "date") {
                        const val = (itemWalker.getElement() as HTMLInputElement).value;
                        let y = "0";
                        let m = "0";
                        let day = "0";
                        if (val.trim().length > 0) {
                            let date = new Date(val);
                            y = ""+date.getFullYear();
                            m = ""+(date.getMonth()+1);
                            day = ""+(date.getDate());
                        }
                        return `${padNameAfter(itemWalker)}[clickable] [spin button, ${m}] / [spin button, ${day}] / [spin button, ${y}] [menu button] [subMenu] Show date picker`;
                    } 
                    return null;
                },
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag() && itemWalker.getElement()?.getAttribute("type") === "datetime-local") {
                        const val = (itemWalker.getElement() as HTMLInputElement).value; // 2025-09-12T04:20
                        let y = "0";
                        let m = "0";
                        let day = "0";
                        let hour = "0";
                        let min = "0";
                        let ampm = "0";
                        if (val.trim().length > 0) {
                            let date = new Date(val);
                            y = ""+date.getFullYear();
                            m = ""+(date.getMonth()+1);
                            day = ""+(date.getDate());
                            if (date.getHours() === 0 || date.getHours() === 12) {
                                hour = "12";
                            } else if (date.getHours() < 12) {
                                hour = ""+date.getHours();
                            } else {
                                hour = ""+(date.getHours()-12);
                            }
                            min = ""+date.getMinutes();
                            ampm = date.getHours() >= 12 ? "pm" : "am";
                        }
                        return `${padNameAfter(itemWalker)}[clickable] [spin button, ${m}] / [spin button, ${day}] / [spin button, ${y}] [spin button, ${hour}] : [spin button, ${min}] [spin button, ${ampm}]  [menu button] [subMenu] Show local date and time picker`;
                    } 
                    return null;
                },
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag() && itemWalker.getElement()?.getAttribute("type") === "time") {
                        const val = (itemWalker.getElement() as HTMLInputElement).value; // 2025-09-12T04:20
                        let hour = "0";
                        let min = "0";
                        let ampm = "0";
                        if (val.trim().length > 0) {
                            let date = val.split(":");
                            let hours = parseInt(date[0]);
                            if (hours === 0 || hours === 12) {
                                hour = "12";
                            } else if (hours < 12) {
                                hour = ""+hours;
                            } else {
                                hour = ""+(hours-12);
                            }
                            min = date[1];
                            ampm = hours >= 12 ? "pm" : "am";
                        }
                        return `${padNameAfter(itemWalker)}[grouping clickable [spin button, ${hour}] : [spin button, ${min}] [spin button, ${ampm}] [menu button] [subMenu] Show time picker [out of grouping]`;
                    } 
                    return null;
                },
                (itemWalker: SRCursor) => {
                    if (!itemWalker.isEndTag() && itemWalker.getElement()?.getAttribute("type") === "week") {
                        const val = (itemWalker.getElement() as HTMLInputElement).value; // 2025-W38
                        let year = "0";
                        let week = "0";
                        if (val.trim().length > 0) {
                            let date = val.split(/-W/);
                            year = date[0];
                            week = date[1];
                        }
                        return `${padNameAfter(itemWalker)}[clickable] [spin button, ${week}], [spin button, ${year}] [menu button] [subMenu] Show week picker`;
                    } 
                    return null;
                },
                (itemWalker: SRCursor) => (!itemWalker.isEndTag() && `${padNameAfter(itemWalker)}[!!input!!]`) || null,
            ],
            "li": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `[bullet] ${(itemWalker.getNameInfo()?.name || "")}` : ""
            ],
            /// MATHML
            "mfrac": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `[fraction]` : `[end fraction]`
            ],
            "msqrt": [
                (itemWalker: SRCursor) => !itemWalker.isEndTag() ? `[square root]` : `[end root]`
            ],
            "mrow": [
                (itemWalker: SRCursor) => {
                    // Only announce over on the end tag
                    if (!itemWalker.isEndTag()) return undefined;
                    let fraction = itemWalker.getCurrentOrParentByRoleClone([], ["mfrac"]);
                    if (fraction && fraction.getElement().querySelectorAll("mrow")[0]?.isSameNode(itemWalker.getNode())) {
                        return "[over]";
                    }
                }
            ],
            "msup": [
                (itemWalker: SRCursor) => {
                    if (itemWalker.isEndTag()) return undefined;
                    const mi = itemWalker.getElement().querySelector("mi")?.innerHTML || "";
                    const mn = itemWalker.getElement().querySelector("mn")?.innerHTML || "";
                    if (mn === "2") return `${mi} [squared]`;
                    if (mn === "3") return `${mi} [cubed]`;
                    return `${mi} [to the ${mn}]`;
                }
            ]
        }
    }

    /**
     * Generates the announcement text when entering a table cell
     *
     * This function creates announcements for:
     * - Row position and associated row headers
     * - Column position and associated column headers
     * - Cells that span multiple rows or columns
     *
     * @param newWalker - Cursor at the new cell position
     * @param oldWalker - Cursor at the previous position
     * @returns Announcement text for the table cell
     */
    function renderEnterTableCell(newWalker: SRCursor, oldWalker: SRCursor) {
        const newTableModel = SRTableUtil.getTableModel(newWalker);
        const oldCellInfo = SRTableUtil.getCellModel(oldWalker, newTableModel);
        const newCellInfo = SRTableUtil.getCellModel(newWalker, newTableModel);
        if (!newCellInfo) return "";

        let retVal: string[] = [];

        // Announce row information if we've moved to a different row or the rowspan has changed
        if (!oldCellInfo || oldCellInfo.rowIndexStart !== newCellInfo.rowIndexStart || oldCellInfo.rowspan !== newCellInfo.rowspan) {
            // If a change in row or a change in rowSpan
            let rowHeaders = SRTableUtil.getRowHeadersForCursor(newWalker, newTableModel);
            let headerInfoStr = rowHeaders && rowHeaders.trim().length > 0 ? `${rowHeaders}, ` : "";
            retVal.push(`[${headerInfoStr}row ${(newCellInfo.rowIndexStart+1)}${newCellInfo.rowspan > 1 ? " through " + (newCellInfo.rowIndexStart+newCellInfo.rowspan) : ""}]`);
        }

        // Announce column information if we've moved to a different column or the colspan has changed
        if (!oldCellInfo || oldCellInfo.colIndexStart !== newCellInfo.colIndexStart || oldCellInfo.colspan !== newCellInfo.colspan) {
            // If a change in column or a change in colspan
            let columnHeaders = SRTableUtil.getColumnHeadersForCursor(newWalker, newTableModel);
            let headerInfoStr = columnHeaders && columnHeaders.trim().length > 0 ? `${columnHeaders}, ` : "";
            retVal.push(`[${headerInfoStr}column ${(newCellInfo.colIndexStart+1)}${newCellInfo.colspan > 1 ? " through " + (newCellInfo.colIndexStart+newCellInfo.colspan) : ""}]`);
        }

        return retVal.join(" ");
    }

    /**
     * Generates the announcement text when entering a table row
     * Currently returns an empty string as row announcements are handled elsewhere
     */
    const renderEnterTableRow = (newWalker: SRCursor, oldWalker: SRCursor) => {
        return "";
    }

    /**
     * Rules for what to announce when entering an element with a specific ARIA role
     *
     * These rules generate announcements for landmarks, regions, and other
     * container elements when the user first navigates to them.
     */
    const renderEnterRoleRules: {
        [mode: string]: {
            [role: string]: (walker: SRCursor, oldWalker: SRCursor) => string | null
        }
    } = {
        "default": {
            "article":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getNameInfo() === null) return;
                    return `${itemWalker.getNameInfo()?.name || ""} [article landmark]`;
                }
            , "banner":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getNameInfo() === null) return;
                    return `${itemWalker.getNameInfo()?.name || ""} [banner landmark]`;
                }
            , "blockquote": 
                (_itemWalker: SRCursor) => "[blockquote]"
            , "caption": 
                (_itemWalker: SRCursor) => "[caption]"
            , "cell": renderEnterTableCell
            , "columnheader": renderEnterTableCell
            , "complementary":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getNameInfo() === null) return;
                    return `${itemWalker.getNameInfo()?.name || ""} [complementary landmark]`
                }
            , "contentinfo":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getNameInfo() === null) return;
                    return `${itemWalker.getNameInfo()?.name || ""} [content info landmark]`
                }
            , "figure": 
                (_itemWalker: SRCursor) => "[figure]"
            , "form":
                (_itemWalker: SRCursor) => {
                    return `[grouping]`
                }
            , "group":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getNameInfo() === null) return;
                    if (itemWalker.getCurrentOrParentByRoleClone(["combobox"], ["select"])?.getNode().nodeName.toUpperCase() === "SELECT") {
                        return "";
                    }
                    if (itemWalker.getNode().nodeName.toUpperCase() === "DETAILS") {
                        return `[button, ${itemWalker.getElement().hasAttribute("open") ? "expanded": "collapsed"}]`
                    } else {
                        return `[grouping] ${itemWalker.getNameInfo()?.name || ""}`
                    }
                }
            , "region":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getNameInfo() === null) return;
                    return `${itemWalker.getNameInfo()?.name || ""} [region]`;
                }
            , "row": renderEnterTableRow
            , "rowheader": renderEnterTableCell
            , "search":
                (itemWalker: SRCursor) => `${itemWalker.getNameInfo()?.name || ""} [search landmark]`
            , "toolbar":
                (itemWalker: SRCursor) => `${itemWalker.getNameInfo()?.name || ""} [toolbar]`
            , "list":
                (itemWalker: SRCursor) => {
                    const node = itemWalker.getNode() as HTMLElement;
                    const descendantListItems = document.evaluate(".//li | .//*[@role='listitem']", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    const descendantListItemsInOtherLists = document.evaluate(
                        ".//ul//li|.//ul//*[@role='listitem']|.//ol//li|.//ol//*[@role='listitem']|.//*[@role='list']//li|.//*[@role='list']//*[@role='listitem']",
                        node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    let numItems = descendantListItems.snapshotLength-descendantListItemsInOtherLists.snapshotLength;
                    let addName = itemWalker.getNameInfo()?.name;
                    if (addName) { addName = addName + " " } else { addName = "" };
                    return `${addName}[list with ${numItems} items]`;
                }
            , "main":
                (itemWalker: SRCursor) => `${itemWalker.getNameInfo()?.name || ""} [main landmark]`
            , "navigation":
                (itemWalker: SRCursor) => `${itemWalker.getNameInfo()?.name || ""} [navigation landmark]`
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

    /**
     * Rules for what to announce when leaving an element with a specific ARIA role
     *
     * These rules generate announcements for when the user navigates out of
     * landmarks, regions, and other container elements.
     */
    const renderLeaveRoleRules: {
        [mode: string]: {
            [role: string]: (walker: SRCursor, oldWalker: SRCursor) => string | null
        }
    } = {
        "default": {
            "group":
                (itemWalker: SRCursor) => {
                    if (itemWalker.getNameInfo() === null) return;
                    if (itemWalker.getCurrentOrParentByRoleClone(["combobox"], ["select"])?.getNode().nodeName.toUpperCase() === "SELECT") {
                        return "";
                    }
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
                    if (itemWalker.getNameInfo() === null) return;
                    else return "[out of region]";
                }
            , "table": 
                (_itemWalker: SRCursor) => "[out of table]"
            , "toolbar":
                (_itemWalker: SRCursor) => `[out of toolbar]`
        }
    };

    /**
     * Rules for what to announce when entering an element with a specific HTML tag
     *
     * Similar to renderEnterRoleRules, but matches on element tag names instead of ARIA roles.
     * Used as a fallback when an element doesn't have a specific ARIA role.
     */
    const renderEnterElemRules: {
        [mode: string]: {
            [role: string]: (walker: SRCursor, oldWalker: SRCursor) => string | null
        }
    } = {
        "default": {
            "dl":
                (itemWalker: SRCursor) => {
                    const node = itemWalker.getNode() as HTMLElement;
                    const descendantListItems = document.evaluate(".//dt", node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    let numItems = descendantListItems.snapshotLength;
                    let addName = itemWalker.getNameInfo()?.name;
                    if (addName) { addName = addName + " " } else { addName = "" };
                    return `${addName}[definition list with ${numItems} terms]`;
                }
            , "figcaption": 
                (_itemWalker: SRCursor) => "[caption]"
            , "mark": 
                (_itemWalker: SRCursor) => "[highlighted]"
        }
    };

    /**
     * Rules for what to announce when leaving an element with a specific HTML tag
     *
     * Similar to renderLeaveRoleRules, but matches on element tag names instead of ARIA roles.
     * Used as a fallback when an element doesn't have a specific ARIA role.
     */
    const renderLeaveElemRules: {
        [mode: string]: {
            [role: string]: (walker: SRCursor, oldWalker: SRCursor) => string | null
        }
    } = {
        "default": {
            "abbr": 
                (itemWalker: SRCursor) => itemWalker.getElement().hasAttribute("title") ? `[${itemWalker.getElement().getAttribute("title")}]` : undefined,
            "dl":
                (_itemWalker: SRCursor) => `[out of definition list]`
            , "figcaption":
                (_itemWalker: SRCursor) => `[out of caption]`
            , "mark":
                (_itemWalker: SRCursor) => `[out of highlighted]`
        }
    };

    /**
     * Generates the announcement text when entering an element
     *
     * This function looks up the appropriate rule based on the element's role or tag name
     * and applies it to generate the announcement text.
     *
     * @param mode - The current navigation mode
     * @param walker - Cursor at the current position
     * @param oldWalker - Optional cursor at the previous position
     * @returns Announcement text for entering the element, or null if no rule applies
     */
    export function renderEnter(mode: NavigationMode | "focus", walker: SRCursor, oldWalker?: SRCursor): string | null {
        const role = walker.getRole();
        const node = walker.getNode();
        const DEBUG = false; //node.nodeName === "MARK";
        DEBUG && console.log("-=-=-=-=-= renderEnter =-=-=-=-=-");
        DEBUG && console.log(role, node.nodeName);
        
        // If no role, use the element's tag name for lookup
        const nodeNameLookup = role === null ? node.nodeName.toLowerCase() : "ARIA";
        
        // Try to find a matching rule in this priority order:
        // 1. Mode-specific role rule
        // 2. Default role rule
        // 3. Mode-specific element rule
        // 4. Default element rule
        let rule = renderEnterRoleRules[mode]?.[role]
            || renderEnterRoleRules["default"]?.[role]
            || renderEnterElemRules[mode]?.[nodeNameLookup]
            || renderEnterElemRules["default"]?.[nodeNameLookup]
        ;
        
        if (rule) return rule(walker, oldWalker);
        return null;
    }

    /**
     * Generates the announcement text when leaving an element
     *
     * Similar to renderEnter, but applies rules for leaving elements instead.
     *
     * @param mode - The current navigation mode
     * @param walker - Cursor at the current position
     * @param oldWalker - Optional cursor at the previous position
     * @returns Announcement text for leaving the element, or null if no rule applies
     */
    export function renderLeave(mode: NavigationMode, walker: SRCursor, oldWalker?: SRCursor): string | null  {
        const role = walker.getRole();
        const node = walker.getNode();
        const nodeNameLookup = role === null ? node.nodeName.toLowerCase() : "ARIA";
        
        // Find the appropriate rule using the same priority as renderEnter
        let rule = renderLeaveRoleRules[mode]?.[role]
            || renderLeaveRoleRules["default"]?.[role]
            || renderLeaveElemRules[mode]?.[nodeNameLookup]
            || renderLeaveElemRules["default"]?.[nodeNameLookup]
        ;
        
        if (rule) return rule(walker, oldWalker);
        return null;
    }

    /**
     * Renders the current element and any container changes
     *
     * This function combines announcements for:
     * - Containers being left
     * - Containers being entered
     * - The current element itself
     *
     * @param mode - The current navigation mode
     * @param walker - Cursor at the current position
     * @param containerChanges - Information about containers being entered or left
     * @returns Combined announcement text
     */
    export function renderCurrent(mode: NavigationMode, walker: SRCursor, containerChanges: ContainerChanges): string {
        let startOfRender = SRNavigator.jumpCurrent(mode, walker);
        let endOfRender = SRNavigator.jumpCurrentEnd(mode, walker);
        let renderStr = SRRenderer.renderRange(mode, startOfRender, endOfRender);
        return (containerChanges.leaving || []).concat(containerChanges.entering || []).concat([renderStr]).join(" ").replace(/\s+/g, " ");
    }

    /**
     * Renders a range of elements between two cursors
     *
     * This function traverses the DOM from startOfRender to endOfRender,
     * applying rendering rules to each element and combining the results.
     *
     * @param mode - The current navigation mode
     * @param startOfRender - Cursor at the start of the range
     * @param endOfRender - Cursor at the end of the range
     * @returns Combined announcement text for the entire range
     */
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
            } else if (
                elem 
                && elem.nodeName.toUpperCase() === "LABEL" 
                && elem.hasAttribute("for") 
                && document.getElementById(elem.getAttribute("for"))
                && document.getElementById(elem.getAttribute("for")).getAttribute("type") !== "hidden"
            ) {
                // Skip labels that point to inputs
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
                        // if (nodeType === 1 && elem.getAttribute("aria-expanded") === "false") {
                        //     s = "[collapsed] "+s;
                        // }
                        // if (nodeType === 1 && elem.getAttribute("aria-expanded") === "true") {
                        //     s = "[expanded] "+s;
                        // }
                        if (s !== "") {
                            renderStrs.push(s);
                        }
                        break;
                    }
                }
                if (AriaUtil.containsPresentationalChildrenOnly(iterWalker.getNode() as HTMLElement)
                    || (["link", "heading"].includes(role) && iterWalker.getNameInfo().nameFrom !== "content")) 
                {
                    iterWalker.setEndTag(true);
                } else if (elem && elem.nodeName.toUpperCase() === "MSUP") {
                    iterWalker.setEndTag(true);
                }
            }
            bContinue = iterWalker.next(() => true) && SRCursor.compare(iterWalker, endOfRender) < 0;
        }
        let retVal = renderStrs.filter(s => s.trim().length > 0).join(" ");
        return retVal;
    }

}

