/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 *****************************************************************************/

import { VisUtil } from "./VisUtil";
import { AriaUtil } from "./AriaUtil";
import { CommonUtil } from "./CommonUtil";
import {RuleContextHierarchy } from "../api/IRule";

export class TableUtil {

    public static isDataTable(tableNode) {
        return !(AriaUtil.hasRole(tableNode, "none") || AriaUtil.hasRole(tableNode, "presentation"));
    }

    /*
     * A complex data table is a data table with any of the following characteristics:
     *
     * a thead element that contains two or more tr elements
     * a table with more than one thead element
     * a table with two or more tr elements that contain only th elements
     * a th or td element with a rowspan or colspan attribute
     * a tr element that contains at least one td element and two or more th elements
     * a table with headers not located in the first row or first column
     * a td element with a headers attribute value that contains more than two IDREFs
     */
    public static isComplexDataTable(table) {

        if ("AriaUtil_isComplexDataTable" in table) {
            return !!table.AriaUtil_isComplexDataTable;
        }

        let isComplexTable = false;

        if (table && TableUtil.isDataTable(table)) {

            let thNodes = null,
                tdNodes = null;
            let trNodes = table.getElementsByTagName("tr");
            let trNodeCount = trNodes.length;
            let tdNodeCount = 0,
                thNodeCount = 0,
                trNodesHavingOnlyThNodes = 0;

            for (let i = 0; !isComplexTable && i < trNodeCount; ++i) {

                thNodes = trNodes[i].getElementsByTagName("th");
                tdNodes = trNodes[i].getElementsByTagName("td");
                thNodeCount = thNodes.length;
                tdNodeCount = tdNodes.length;

                if (tdNodeCount !== 0) {

                    // a tr element that contains at least one td element and two or more th elements;
                    isComplexTable = thNodeCount > 1;

                    // a th element with a rowspan or colspan attribute
                    for (let j = 0; !isComplexTable && j < thNodeCount; ++j) {
                        isComplexTable = ((thNodes[j].hasAttribute("rowspan") ||
                            thNodes[j].hasAttribute("colspan")) &&
                            CommonUtil.getAncestor(thNodes[j], "table") === table);
                    }

                    // a td element with a rowspan or colspan attribute
                    // a td element with a headers attribute value that contains more than two IDREFs
                    for (let k = 0; !isComplexTable && k < tdNodeCount; ++k) {
                        isComplexTable = ((tdNodes[k].hasAttribute("rowspan") ||
                            tdNodes[k].hasAttribute("colspan") ||
                            (tdNodes[k].hasAttribute("headers") && CommonUtil.normalizeSpacing(tdNodes[k].getAttribute("headers")).split(" ").length > 2)) &&
                            CommonUtil.getAncestor(tdNodes[k], "table") === table);
                    }

                } else {

                    // two or more tr elements that contain only th elements
                    if (thNodeCount > 0) {
                        ++trNodesHavingOnlyThNodes;
                    }
                    isComplexTable = trNodesHavingOnlyThNodes === 2;
                }
            }

            if (!isComplexTable) {

                let theadNodes = table.getElementsByTagName("thead");
                let theadNodesLength = theadNodes.length;

                if (theadNodesLength > 0) {

                    // table has more than one thead element
                    isComplexTable = theadNodesLength > 1;

                    // a thead element that contains two or more tr elements
                    if (!isComplexTable) {
                        isComplexTable = theadNodes[0].getElementsByTagName("tr").length > 1;
                    }
                }
            }
            if (!isComplexTable && trNodeCount !== 0) {
                // a table with headers not located in the first row or first column
                isComplexTable = thNodeCount > 0 && !TableUtil.tableHeaderExists(table);
            }
        }
        table.AriaUtil_isComplexDataTable = isComplexTable;

        return isComplexTable;
    }

    // Return true if a table cell is hidden or contain no data: <td></td>
    public static isTableCellEmpty(cell) {
        if (!cell || !VisUtil.isNodeVisible(cell) || cell.innerHTML.replace(/&nbsp;/g,' ').trim().length === 0)
            return true;
           
        return false;
    }

    // Return true if a table row is hidden or contain no data: <tr /> or <tr><td></td><td></td></tr> 
    public static isTableRowEmpty(row) {
        if (!row || !row.cells || row.cells.length === 0 || !VisUtil.isNodeVisible(row))
            return true;
           
        let passed = true; //empty
        for (let c=0; passed && c < row.cells.length; c++) {
            let cell = row.cells[c];
            passed = TableUtil.isTableCellEmpty(cell);          
        }
        
        return passed;
    }

    // Return true if a table's header is in the first row or column
    public static tableHeaderExists(ruleContext) {

        let rows = ruleContext.rows;
        if (!rows || rows.length === 0)
            return null;

        // note that table.rows return all all the rows in the table, 
        // including the rows contained within <thead>, <tfoot>, and <tbody> elements. 
        
        //case 1: headers are in the very first row with data in tbody or thead, but not in tfoot   
        //get the first row with data, ignoring the rows with no data
        let passed = true;
        let firstRow = rows[0];
        for (let r=0; passed && r < rows.length; r++) {
            firstRow = rows[r];
            // ignore the rows from tfoot
            if (firstRow.parentNode && firstRow.parentNode.nodeName.toLowerCase() === 'tfoot') continue;
            
            passed = TableUtil.isTableRowEmpty(firstRow);          
        }
        
        //table contain no data:  <table><tr><td></td><td></td></tr></table> 
        if (passed)
            return null;
        
        // Check if the cells with data in the first data row are all TH's
        passed = true;
        for (let r=0; passed && r < firstRow.cells.length; r++) {
            let cell = firstRow.cells[r];
            passed = TableUtil.isTableCellEmpty(cell) || cell.nodeName.toLowerCase() === 'th';          
        }
        
        if (passed)
            return true;

        // Case 2: headers are in the first column with data
        // Assume that the first column has all TH's or a TD without data in the first column.
        passed = true;
        for (let i = 0; passed && i < rows.length; ++i) {
            // ignore the rows from tfoot
            if (rows[i].parentNode && rows[i].parentNode.nodeName.toLowerCase() === 'tfoot') continue;

            // If no cells in this row, or no data at all, that's okay too.
            passed = !rows[i].cells ||
                rows[i].cells.length === 0 ||
                rows[i].cells[0].innerHTML.trim().length === 0 ||
                rows[i].cells[0].nodeName.toLowerCase() != "td";
        }
        
        if (passed)
            return true;
            
        //case 3: all td data cells have headers attributes that point to the id of a th element in the same table. 
        // https://html.spec.whatwg.org/multipage/tables.html#attributes-common-to-td-and-th-elements
        passed = true; 
        let thIds = [];
        let tdHeaders = [];
        for (let r=0; passed && r < rows.length; r++) {
            let row = rows[r]; 
            // Check if the cells with data in the last data row are all TH's
            for (let c=0; c < row.cells.length; c++) {
                let cell = row.cells[c];
                if (TableUtil.isTableCellEmpty(cell)) continue; 
                if (cell.nodeName.toLowerCase() === 'td') {
                    if (!cell.getAttribute('headers') || cell.getAttribute('headers').trim().length === 0)
                        passed = false;
                    else
                        CommonUtil.concatUniqueArrayItemList(cell.getAttribute('headers').trim().split(" "), tdHeaders);
                } else if (cell.nodeName.toLowerCase() === 'th' && cell.getAttribute('id') && cell.getAttribute('id').trim().length > 0)
                        CommonUtil.concatUniqueArrayItem(cell.getAttribute('id').trim(), thIds);    
            }      
        }
        
        if (passed) { // all td elements have headers, to exam if the headers point to a th id
            if (thIds.length > 0 && tdHeaders.every(header => thIds.includes(header)))
                return true; 
        }
        
        return false;
    }

    public static isLayoutTable(tableNode) {
        return AriaUtil.hasRole(tableNode, "presentation") || AriaUtil.hasRole(tableNode, "none");
    }

/* 
 * get conflict Aria and Html attributes
 * return: a list of Aria and Html attribute pairs that are conflict
*/
public static isTableDescendant(contextHierarchies?: RuleContextHierarchy) {
    if (!contextHierarchies) return null;
    
    return contextHierarchies["aria"].filter(hier => ["table", "grid", "treegrid"].includes(hier.role));
}
}
