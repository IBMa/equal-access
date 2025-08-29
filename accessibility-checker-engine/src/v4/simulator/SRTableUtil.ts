import { SRCursor } from "./SRCursor";

/**
 * TableUtil namespace provides utility functions for handling HTML tables in the accessibility simulator.
 * These functions help determine cell positions, relationships, and extract header information
 * to simulate how screen readers would announce table navigation.
 */
export namespace SRTableUtil {
    /**
     * Represents a table cell with its position and spanning information
     * @property rowIndexStart - The starting row index (0-based)
     * @property colIndexStart - The starting column index (0-based)
     * @property rowspan - Number of rows this cell spans
     * @property colspan - Number of columns this cell spans
     * @property cellCursor - SRCursor pointing to this cell
     */
    export type CellModel = { rowIndexStart: number, colIndexStart: number, rowspan: number, colspan: number, cellCursor: SRCursor }
    
    /**
     * Represents a row in a table as an array of cell models
     */
    export type RowModel = CellModel[];
    
    /**
     * Represents a complete table as an array of rows
     */
    export type TableModel = RowModel[];

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
     * Gets a cursor pointing to the current cell or the parent cell if the cursor
     * is inside a cell's content
     * @param cursor - The SRCursor to check
     * @returns A new SRCursor pointing to the cell or null if not in a cell
     */
    export function getCurrentOrParentCellCursor(cursor: SRCursor) : SRCursor {
        return cursor.getCurrentOrParentByRoleClone(["cell", "rowheader", "columnheader"], ["TD","TH"]);
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
     * Builds a complete model of a table's structure, accounting for rowspan and colspan
     *
     * This function traverses the entire table and creates a data structure that represents
     * the logical grid of cells, properly handling cells that span multiple rows or columns.
     * The resulting model makes it easier to determine cell relationships and positions.
     *
     * @param inTableCursor - A cursor within the table
     * @returns A TableModel representing the complete table structure, or null if not in a table
     */
    export function getTableModel(inTableCursor: SRCursor): TableModel {
        // Get a cursor pointing to the table element
        let tableCursor = inTableCursor.getCurrentOrParentByRoleClone(["table"]);
        if (!tableCursor) return null;
        let walkTableCursor = tableCursor.clone();

        let retVal: TableModel = [];  // The complete table model we're building
        let curRow: RowModel = [];    // The current row being processed
        let prevRow: RowModel;        // The previous row (needed for rowspan handling)
        
        // Walk through the table's DOM structure
        while (walkTableCursor.next(() => true) && !walkTableCursor.getNode().isSameNode(tableCursor.getNode())) {
            if (walkTableCursor.isEndTag() && walkTableCursor.getRole() === "row") {
                // Reached the end of the row, push what we have and reset
                retVal.push(curRow);
                prevRow = curRow;
                curRow = [];

                // Handle cells with rowspan from previous rows that affect this row
                // This ensures cells spanning multiple rows are properly represented in the model
                while (prevRow && curRow.length < prevRow.length &&
                      ((prevRow[curRow.length].rowIndexStart + prevRow[curRow.length].rowspan - 1) >= retVal.length)) {
                    curRow.push(prevRow[curRow.length]);
                }
            }
            
            // Process each cell in the row
            if (!walkTableCursor.isEndTag() && isCursorCellRole(walkTableCursor)) {
                const colspan = getColSpan(walkTableCursor);
                // Create a cell model with position and spanning information
                const cellInfo: CellModel = {
                    rowIndexStart: retVal.length,
                    colIndexStart: curRow.length,
                    rowspan: getRowSpan(walkTableCursor),
                    colspan,
                    cellCursor: walkTableCursor.clone()
                };
                
                // For cells with colspan, add the same cell info to multiple columns
                for (let idx=0; idx<colspan; ++idx) {
                    curRow.push(cellInfo);
                }
                
                // Continue handling cells with rowspan from previous rows
                while (prevRow && curRow.length < prevRow.length &&
                      ((prevRow[curRow.length].rowIndexStart + prevRow[curRow.length].rowspan - 1) >= retVal.length)) {
                    curRow.push(prevRow[curRow.length]);
                }
            }
        }
        return retVal;
    }

    /**
     * Gets the cell model for a specific cell in the table
     *
     * This function finds the CellModel object that represents a specific cell,
     * which contains information about its position and spanning.
     *
     * @param inCellCursor - A cursor pointing to a cell or its contents
     * @param tableModel - Optional pre-built table model (will be created if not provided)
     * @returns The CellModel for the specified cell, or null if not found
     */
    export function getCellModel(inCellCursor: SRCursor, tableModel?: TableModel) : CellModel {
        let cellCursor = getCurrentOrParentCellCursor(inCellCursor);
        if (!tableModel) {
            tableModel = getTableModel(inCellCursor);
        }
        // Search through the table model to find the matching cell
        for (let rowIndex = 0; rowIndex < tableModel.length; ++rowIndex) {
            for (let colIndex = 0; colIndex < tableModel[rowIndex].length; ++colIndex) {
                if (tableModel[rowIndex][colIndex].cellCursor.isSameNode(cellCursor)) {
                    return tableModel[rowIndex][colIndex];
                }
            }
        }
        return null;
    }

    /**
     * Checks if a cell spans a specific column
     *
     * @param cellModel - The cell model to check
     * @param colIdx - The column index to check
     * @returns True if the cell contains the specified column
     */
    export function cellModelContainsColumn(cellModel: CellModel, colIdx: number) {
        return colIdx >= cellModel.colIndexStart && colIdx < cellModel.colIndexStart+cellModel.colspan;
    }

    /**
     * Checks if a cell spans a specific row
     *
     * @param cellModel - The cell model to check
     * @param rowIdx - The row index to check
     * @returns True if the cell contains the specified row
     */
    export function cellModelContainsRow(cellModel: CellModel, rowIdx: number) {
        return rowIdx >= cellModel.rowIndexStart && rowIdx < cellModel.rowIndexStart+cellModel.rowspan;
    }

    /**
     * Gets the row headers associated with a cell
     * First checks for explicit headers attribute, then looks for row headers in the same row
     * @param cursor - The SRCursor pointing to a cell
     * @returns A string containing the concatenated header names
     */
    export function getRowHeaders(cursor: SRCursor) {
        return "";
    }

    /**
     * Gets the column headers associated with a cell
     * First checks for explicit headers attribute, then looks for column headers in the same column
     * @param cursor - The SRCursor pointing to a cell
     * @returns A string containing the concatenated header names
     */
    export function getColumnHeadersForCursor(inCellCursor: SRCursor, tableModel?: TableModel) {
        if (!tableModel) {
            tableModel = getTableModel(inCellCursor);
            if (!tableModel) return "";
        }
        const cellModel = getCellModel(inCellCursor, tableModel);
        if (!cellModel) return "";

        const cellCursor = cellModel.cellCursor;
        if (!cellCursor) return "";

        const cellElem = cellCursor.getElement();
        if (!cellElem) return "";

        const colDatas: Array<{
            potentialColHeaders: SRCursor[],
            existsDataCell: boolean,
            colIdx: number
        }> = [];
        for (let colIdx = cellModel.colIndexStart; colIdx < cellModel.colIndexStart+cellModel.colspan; ++colIdx) {
            colDatas.push({
                potentialColHeaders: [],
                existsDataCell: false,
                colIdx
            });
        }
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
                // Remove headers that aren't in the same column (ignore column headers)
                .filter(cursor => colDatas.some(colData => cellModelContainsColumn(SRTableUtil.getCellModel(cursor, tableModel), colData.colIdx)))
        } else {
            // Get all cells in this column
            // Note - if everything in this column is empty or a header cell, this is probably not a heading
            for (let rowIdx=0; rowIdx < tableModel.length; ++rowIdx) {
                for (const colData of colDatas) {
                    const colIdx = colData.colIdx;
                    const checkInfo = tableModel[rowIdx][colIdx];
                    const checkCursor = checkInfo.cellCursor;
                    const checkCursorElem = checkCursor.getElement();
                    // If this row/col isn't found, or is the same cursor as our original cell model, or already in our list, skip, but check if it's a data cell
                    if (!checkInfo || !checkCursor || checkCursor.isSameNode(cellCursor) || potentialHeaders.some(c => checkCursor.isSameNode(c))) {
                        colData.existsDataCell = colData.existsDataCell || (isDataCell(checkCursor) && (checkCursor.hasNonEmptyName() || colData.potentialColHeaders.length > 0));
                        continue;
                    }

                    const c = checkCursor.clone();
                    if (checkCursor.getRole() === "columnheader") {
                        potentialHeaders.push(c);
                        colData.potentialColHeaders.push(c);
                    } else if (!checkCursorElem.hasAttribute("role") && checkCursorElem.nodeName.toUpperCase() === "TH") {
                        if (checkCursorElem.getAttribute("scope") === "col" || checkCursorElem.getAttribute("scope") === "axis") {
                            potentialHeaders.push(c);
                            colData.potentialColHeaders.push(c);
                        } else if (!checkCursorElem.hasAttribute("scope") && checkCursor.hasNonEmptyName()) {
                            potentialHeaders.push(c);
                            colData.potentialColHeaders.push(c);
                        }
                    } else {
                        colData.existsDataCell = colData.existsDataCell || (isDataCell(checkCursor) && (checkCursor.hasNonEmptyName() || colData.potentialColHeaders.length > 0));
                    }
                }
            }
            for (const colData of colDatas) {
                if (!colData.existsDataCell) {
                    colData.potentialColHeaders = [];
                }
            }
            potentialHeaders = potentialHeaders.filter(one => colDatas.some(colData => colData.potentialColHeaders.some(two => two.isSameNode(one))))
        }
        return potentialHeaders
            // And then return the names of the headers
            .map(cursor => cursor.getName()?.name || "")
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .join(", ");
    }

    /**
     * Gets the row headers associated with a cell
     * First checks for explicit headers attribute, then looks for row headers in the same row
     * @param cursor - The SRCursor pointing to a cell
     * @returns A string containing the concatenated header names
     */
    export function getRowHeadersForCursor(inCellCursor: SRCursor, tableModel?: TableModel) {
        if (!tableModel) {
            tableModel = getTableModel(inCellCursor);
            if (!tableModel) return "";
        }
        const cellModel = getCellModel(inCellCursor, tableModel);
        if (!cellModel) return "";

        const cellCursor = cellModel.cellCursor;
        if (!cellCursor) return "";

        const cellElem = cellCursor.getElement();
        if (!cellElem) return "";

        const rowDatas: Array<{
            potentialRowHeaders: SRCursor[],
            existsDataCell: boolean,
            rowIdx: number
        }> = [];
        for (let rowIdx = cellModel.rowIndexStart; rowIdx < cellModel.rowIndexStart+cellModel.rowspan; ++rowIdx) {
            rowDatas.push({
                potentialRowHeaders: [],
                existsDataCell: false,
                rowIdx
            });
        }

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
                .filter(cursor => rowDatas.some(rowData => cellModelContainsRow(SRTableUtil.getCellModel(cursor, tableModel), rowData.rowIdx)))
        } else {
            // Get all cells in the rows
            // Note - if everything in the row is empty or a header cell, this is probably not a heading
            let longestRow = rowDatas.reduce((prev, cur) => Math.max(prev, tableModel[cur.rowIdx].length), 0);
            for (let colIdx=0; colIdx < longestRow; ++colIdx) {
                for (const rowData of rowDatas) {
                    const rowIdx = rowData.rowIdx;
                    if (colIdx >= tableModel[rowIdx].length) continue;
                    const checkInfo = tableModel[rowIdx][colIdx];
                    const checkCursor = checkInfo.cellCursor;
                    const checkCursorElem = checkCursor.getElement();
                    // If this row/col isn't found, or is the same cursor as our original cell model, or already in our list, skip, but check if it's a data cell
                    if (!checkInfo || !checkCursor || checkCursor.isSameNode(cellCursor) || potentialHeaders.some(c => checkCursor.isSameNode(c))) {
                        rowData.existsDataCell = rowData.existsDataCell || (isDataCell(checkCursor) && (checkCursor.hasNonEmptyName() || rowData.potentialRowHeaders.length > 0));
                        continue;
                    }

                    const c = checkCursor.clone();
                    if (checkCursor.getRole() === "rowheader") {
                        potentialHeaders.push(c);
                        rowData.potentialRowHeaders.push(c);
                    } else if (!checkCursorElem.hasAttribute("role") && checkCursorElem.nodeName.toUpperCase() === "TH") {
                        if (checkCursorElem.getAttribute("scope") === "row" || checkCursorElem.getAttribute("scope") === "axis") {
                            potentialHeaders.push(c);
                            rowData.potentialRowHeaders.push(c);
                        } else if (!checkCursorElem.hasAttribute("scope") && checkCursor.hasNonEmptyName()) {
                            potentialHeaders.push(c);
                            rowData.potentialRowHeaders.push(c);
                        }
                    } else {
                        rowData.existsDataCell = rowData.existsDataCell || (isDataCell(checkCursor) && (checkCursor.hasNonEmptyName() || rowData.potentialRowHeaders.length > 0));
                    }
                }
            }
            for (const rowData of rowDatas) {
                if (!rowData.existsDataCell) {
                    rowData.potentialRowHeaders = [];
                }
            }
            potentialHeaders = potentialHeaders.filter(one => rowDatas.some(rowData => rowData.potentialRowHeaders.some(two => two.isSameNode(one))))
        }
        return potentialHeaders
            // And then return the names of the headers
            .map(cursor => cursor.getName()?.name || "")
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .join(", ");
    }

    /**
     * Determines if a cell is a data cell (not a header cell)
     *
     * A data cell is one with either:
     * - An explicit ARIA role of "cell"
     * - A TD element without an overriding role attribute
     *
     * @param checkCursor - The cursor to check
     * @returns True if the cursor points to a data cell
     */
    export function isDataCell(checkCursor: SRCursor) {
        const checkCursorElem = checkCursor.getElement();
        if (!checkCursorElem) return false;
        return checkCursor.getRole() === "cell" || (!checkCursorElem.hasAttribute("role") && checkCursorElem.nodeName.toUpperCase() === "TD");
    }
}