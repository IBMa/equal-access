import { SRCursor } from "./SRCursor";

/**
 * TableUtil namespace provides utility functions for handling HTML tables in the accessibility simulator.
 * These functions help determine cell positions, relationships, and extract header information
 * to simulate how screen readers would announce table navigation.
 */
export namespace SRTableUtil {
    /**
     * Represents a range of cells (either rows or columns) in a table
     * @property start - The starting index (1-based)
     * @property end - The ending index (1-based)
     */
    export type CellRange = { start: number, end: number };

    /**
     * Determines the column range for a given cell
     * @param cursor - The SRCursor pointing to a cell or its contents
     * @returns The column range object or null if not in a cell
     */
    export function getColRange(cursor: SRCursor) : CellRange | null {
        let walkBack = SRTableUtil.getCurrentOrParentCellCursor(cursor);
        if (!walkBack) return null;

        // Determine how many columns this cell spans for later
        let colSpan = getColSpan(walkBack);

        let count = getColumnIndex(walkBack)+1;
        return { start: count, end: count+colSpan-1 };
    }

    /**
     * Determines the row range for a given cell
     * @param cursor - The SRCursor pointing to a cell or a node within the cell
     * @returns The row range object or null if not in a cell
     */
    export function getRowRange(cursor: SRCursor) : CellRange | null {
        let walkBack = cursor.getCurrentOrParentByRoleClone(["cell", "rowheader", "columnheader"], ["TD","TH"]);
        if (!walkBack) return null;

        // Determine how many rows this cell spans for later
        let rowSpan = 1;
        if (walkBack) {
            rowSpan = getRowSpan(walkBack);
        } else {
            walkBack = cursor.clone();
        }

        // Determine how many rows are before this row
        let count = 0;
        while (walkBack.getRole() !== "table") {
            if (!walkBack.isEndTag() && walkBack.getRole() === "row") {
                ++count;
            }
            walkBack.previous(() => true);
        }
        return { start: count, end: count+rowSpan-1 };
    }

    /**
     * Checks if two cell ranges overlap
     * @param one - First cell range
     * @param two - Second cell range
     * @returns True if the ranges overlap, false otherwise
     */
    export function cellRangesOverlap(one: CellRange, two: CellRange): boolean {
        if (!(!!one && !!two)) return false;
        return !(two.end < one.start || two.start > one.end);
    }

    /**
     * Determines if the cursor is pointing to a cell element (TD or TH)
     * or has a cell-related ARIA role
     * @param cursor - The SRCursor to check
     * @returns true if the cursor is on a cell, false otherwise
     */
    export function isCursorCellRole(cursor: SRCursor) {
        if (!cursor.getElement()) return false;
        if (["cell", "rowheader", "columnheader"].includes(cursor.getRole())) {
            return true;
        }
        return !cursor.getElement().hasAttribute("role") && ["TH", "TD"].includes(cursor.getElement().nodeName.toUpperCase());
    }

    /**
     * Determines if the cursor is pointing to a row header element
     * @param cursor - The SRCursor to check
     * @returns true if the cursor is on a row header, false otherwise
     */
    export function isCursorRowHeaderRole(cursor: SRCursor) {
        if (!cursor.getElement()) return false;
        if (["rowheader"].includes(cursor.getRole())) {
            return true;
        }
        return !cursor.getElement().hasAttribute("role") && ["TH"].includes(cursor.getElement().nodeName.toUpperCase());
    }

    /**
     * Determines if the cursor is pointing to a column header element
     * @param cursor - The SRCursor to check
     * @returns true if the cursor is on a column header, false otherwise
     */
    export function isCursorColumnHeaderRole(cursor: SRCursor) {
        if (!cursor.getElement()) return false;
        if (["rowheader"].includes(cursor.getRole())) {
            return true;
        }
        return !cursor.getElement().hasAttribute("role") && ["TH"].includes(cursor.getElement().nodeName.toUpperCase());
    }

    /**
     * Gets a cursor pointing to the current cell or the parent cell if the cursor
     * is inside a cell's content
     * @param cursor - The SRCursor to check
     * @returns A new SRCursor pointing to the cell or null if not in a cell
     */
    export function getCurrentOrParentCellCursor(cursor: SRCursor) : SRCursor {
        return cursor.getCurrentOrParentByRoleClone(["cell", "rowheader", "columnheader"], ["TD","TH"]);
    }

    /**
     * Gets the row headers associated with a cell
     * First checks for explicit headers attribute, then looks for row headers in the same row
     * @param cursor - The SRCursor pointing to a cell
     * @returns A string containing the concatenated header names
     */
    export function getRowHeaders(cursor: SRCursor) {
        let cell = cursor.getCurrentOrParentByRoleClone(["cell", "rowheader", "columnheader"], ["TH", "TD"]);
        if (cell === null) return "";
        let rowIdxs = SRTableUtil.getRowRange(cell);
        let cellElem = cell.getElement();
        let potentialHeaders: SRCursor[] = [];
        if (cellElem.hasAttribute("headers")) {
            potentialHeaders = cellElem.getAttribute("headers")
                // Split the header attribute into ids
                .split(" ")
                // Get the node for each id
                .map(id => document.getElementById(id))
                // Get rid of bad mappings
                .filter(node => !!node)
                // Convert to SRCursors to that we can get accessible names
                .map(node => new SRCursor(node))
                // Remove headers that aren't in the same row (ignore column headers)
            .filter(cursor => SRTableUtil.cellRangesOverlap(SRTableUtil.getRowRange(cursor), rowIdxs))
        } else {
            // Get all cells within the row
            let rowcursor = cell.getCurrentOrParentByRoleClone(["row"]);
            while (rowcursor.next(() => true) && rowcursor.getRole() !== "row") {
                if (!cell.getNode().isSameNode(rowcursor.getNode()) && !rowcursor.isEndTag()) {
                    const elem = rowcursor.getElement();
                    if (!elem) continue;
                    if (rowcursor.getRole() === "rowheader") {
                        potentialHeaders.push(rowcursor.clone());
                    } else if (!elem.hasAttribute("role") && elem.nodeName.toUpperCase() === "TH") {
                        if (elem.getAttribute("scope") === "row" || elem.getAttribute("scope") === "axis") {
                            potentialHeaders.push(rowcursor.clone());
                        } else if (!elem.hasAttribute("scope") && isRowHeader(rowcursor)) {
                            potentialHeaders.push(rowcursor.clone());
                        }
                    }
                }
            }
        }
        return potentialHeaders
            // And then return the names of the headers
            .map(cursor => cursor
            .getName()?.name || "")
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .join(", ");
    }

    /**
     * Gets the column headers associated with a cell
     * First checks for explicit headers attribute, then looks for column headers in the same column
     * @param cursor - The SRCursor pointing to a cell
     * @returns A string containing the concatenated header names
     */
    export function getColumnHeaders(cursor: SRCursor) {
        let cell = cursor.getCurrentOrParentByRoleClone(["cell", "rowheader", "columnheader"], ["TH", "TD"]);
        if (cell === null) return "";
        let colIdxs = SRTableUtil.getColRange(cell);
        let cellElem = cell.getElement();
        let potentialHeaders: SRCursor[] = [];
        if (cellElem.hasAttribute("headers")) {
            potentialHeaders = cellElem.getAttribute("headers")
                // Split the header attribute into ids
                .split(" ")
                // Get the node for each id
                .map(id => document.getElementById(id))
                // Get rid of bad mappings
                .filter(node => !!node)
                // Convert to SRCursors to that we can get accessible names
                .map(node => new SRCursor(node))
        } else {
            // Get all cells within the table
            let tablecursor = cell.getCurrentOrParentByRoleClone(["table"]);
            while (tablecursor.next(() => true) && tablecursor.getRole() !== "table") {
                if (!cell.getNode().isSameNode(tablecursor.getNode()) && !tablecursor.isEndTag() && tablecursor.getNode().nodeType === 1) {
                    const elem = tablecursor.getElement();
                    if (tablecursor.getRole() === "columnheader") {
                        potentialHeaders.push(tablecursor.clone());
                    } else if (!elem.hasAttribute("role") && elem.nodeName.toUpperCase() === "TH") {
                        if (elem.getAttribute("scope") === "col" || elem.getAttribute("scope") === "axis") {
                            potentialHeaders.push(tablecursor.clone());
                        } else if (!elem.hasAttribute("scope") && isColumnHeader(tablecursor)) {
                            potentialHeaders.push(tablecursor.clone());
                        }
                    }
                }
            }
        }
        return potentialHeaders
            // Remove headers that aren't in the same column (ignore column headers)
            .filter(cursor => SRTableUtil.cellRangesOverlap(SRTableUtil.getColRange(cursor), colIdxs))
            // And then return the names of the headers
            .map(cursor => cursor.getName()?.name || "")
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .join(", ");
    }

    /**
     * Determines if a TH element is functioning as a column header
     * by checking if there are non-header cells in the same column
     * @param cursorThNode - The SRCursor pointing to a TH element
     * @param DEBUG - Optional debug flag
     * @returns True if the element is functioning as a column header
     */
    function isColumnHeader(cursorThNode: SRCursor, DEBUG?: boolean) {
        let colIdxs = SRTableUtil.getColRange(cursorThNode);
        let thElement = cursorThNode.getElement();
        let tablecursor = cursorThNode.getCurrentOrParentByRoleClone(["table"]);
        while (tablecursor.next(() => true) && tablecursor.getRole() !== "table") {
            if (tablecursor.isEndTag() || !isCursorCellRole(tablecursor)) continue;
            if (!thElement.isSameNode(tablecursor.getElement()) && SRTableUtil.cellRangesOverlap(SRTableUtil.getColRange(tablecursor), colIdxs)) {
                // This is in the same column, but not the same cell, if it's not blank and not a heading, then our original node is a heading
                if (!isCursorColumnHeaderRole(tablecursor) && (tablecursor.getName()?.name || "").trim().length > 0) {
                    return true;
                }
            }
            // Skip the contents of the cell
            tablecursor.setEndTag(true);
            continue;
        }
        return false;
    }

    /**
     * Determines if a TH element is functioning as a row header
     * by checking if there are non-header cells in the same row
     * @param cursorThNode - The SRCursor pointing to a TH element
     * @returns True if the element is functioning as a row header
     */
    function isRowHeader(cursorThNode: SRCursor) {
        // If the whole row is made of headers, then, no
        let rowIdxs = SRTableUtil.getRowRange(cursorThNode);
        let thElement = cursorThNode.getElement();
        let rowcursor = cursorThNode.getCurrentOrParentByRoleClone(["row"]);
        while (rowcursor.next(() => true) && rowcursor.getRole() !== "row") {
            if (rowcursor.isEndTag() || !isCursorCellRole(rowcursor)) continue;
            if (!thElement.isSameNode(rowcursor.getElement()) && SRTableUtil.cellRangesOverlap(SRTableUtil.getRowRange(rowcursor), rowIdxs)) {
                // This is in the same row, but not the same cell, if it's not blank and not a heading, then our original node is a heading
                if (!isCursorRowHeaderRole(rowcursor) && (rowcursor.getName()?.name || "").trim().length > 0) {
                    return true;
                }
            }
            // Skip the contents of the cell
            rowcursor.setEndTag(true);
            continue;
        }
        return false;
    }

    /**
     * Get the colspan of a cell at a given location
     * @param cursor The cursor to get the colspan from
     * @returns The colspan of the cell at the cursor's location or 0 if not in a column
     */
    export function getColSpan(cursor: SRCursor): number {
        if (!isCursorCellRole(cursor)) return 0;
        let colSpan = cursor.getElement().getAttribute("colspan");
        if (colSpan) {
            return parseInt(colSpan);
        }
        return 1;
    }

    /**
     * Get the rowspan of a cell at a given location
     * @param cursor The cursor to get the rowspan from
     * @returns The rowspan of the cell at the cursor's location or 0 if not in a column
     */
    export function getRowSpan(cursor: SRCursor): number {
        if (!isCursorCellRole(cursor)) return 0;
        let rowSpan = cursor.getElement().getAttribute("rowspan");
        if (rowSpan) {
            return parseInt(rowSpan);
        }
        return 1;
    }

    /**
     * Gets the column index of a cell, accounting for rowspan effects from rows above
     * @param cursor The cursor pointing to a cell or its contents
     * @returns The column index (0-based) of the cell or -1 if not in a cell
     */
    export function getColumnIndex(cursor: SRCursor): number {
        // Get the current cell or parent cell
        let cellCursor = getCurrentOrParentCellCursor(cursor);
        if (!cellCursor) return -1;

        // Get the row index of the current cell
        const rowRange = getRowRange(cellCursor);
        if (!rowRange) return -1;
        const rowIndex = rowRange.start;

        // Get the table cursor
        let tableCursor = cellCursor.getCurrentOrParentByRoleClone(["table"]);
        if (!tableCursor) return -1;

        // Create a map to track cells with rowspan that affect our target row
        // Map structure: columnIndex -> ending row
        const rowspanMap = new Map<number, number>();
        let currentRowIndex = 0;
        let inTargetRow = false;

        // First pass: find all cells with rowspan that affect our target row
        while (tableCursor.next(() => true) && tableCursor.getRole() !== "table") {
            if (!tableCursor.isEndTag() && tableCursor.getRole() === "row") {
                currentRowIndex++;
                inTargetRow = currentRowIndex === rowIndex;
                continue;
            }

            // Skip if not a cell or if we've passed our target row
            if (tableCursor.isEndTag() || !isCursorCellRole(tableCursor) || currentRowIndex > rowIndex) {
                continue;
            }

            // If we're in a row before our target and the cell has rowspan that extends to our target row
            if (currentRowIndex < rowIndex) {
                const rs = getRowSpan(tableCursor);
                if (currentRowIndex + rs - 1 >= rowIndex) {
                    // Calculate this cell's column index in its own row
                    let colIndex = 0;
                    let tempCursor = tableCursor.clone();
                    tempCursor.previous(() => true);
                    
                    // Count cells to the left in the same row
                    while (tempCursor.getRole() !== "row") {
                        if (!tempCursor.isEndTag() && isCursorCellRole(tempCursor)) {
                            colIndex += getColSpan(tempCursor);
                        }
                        tempCursor.previous(() => true);
                    }
                    
                    // Add this cell to our rowspan map
                    for (let i = 0; i < getColSpan(tableCursor); i++) {
                        rowspanMap.set(colIndex + i, currentRowIndex + rs - 1);
                    }
                }
            }

            // If we're in our target row and this is our target cell, calculate its column index
            if (inTargetRow && tableCursor.getNode().isSameNode(cellCursor.getNode())) {
                let colIndex = 0;
                
                // Account for cells with rowspan from above rows
                for (let i = 0; i < 1000; i++) { // Safety limit
                    if (rowspanMap.has(colIndex) && rowspanMap.get(colIndex)! >= rowIndex) {
                        colIndex++;
                    } else {
                        break;
                    }
                }
                
                // Count cells to the left in the same row
                let tempCursor = cellCursor.clone();
                tempCursor.previous(() => true);
                
                while (tempCursor.getRole() !== "row") {
                    if (!tempCursor.isEndTag() && isCursorCellRole(tempCursor)) {
                        colIndex += getColSpan(tempCursor);
                    }
                    tempCursor.previous(() => true);
                }
                
                return colIndex;
            }
        }
        
        return -1;
    }
}