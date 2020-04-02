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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass } from "../../../api/IEngine";
import { RPTUtil } from "../util/legacy";

let a11yRulesTable: Rule[] = [

    {
        /**
         * Description: Trigger if caption and summary say the same thing
         * Origin: WCAG 2.0 Technique H39, H73
         */
        id: "WCAG20_Table_CapSummRedundant",
        context: "dom:table",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let pofId;
            let passed = true;
            let sumStr;
            if (ruleContext.hasAttribute("summary")) {
                pofId = 0;
                sumStr = ruleContext.getAttribute("summary").trim().toLowerCase();
            } else if (ruleContext.hasAttribute("aria-describedby")) {
                pofId = 1;
                let summaryNodeId = ruleContext.getAttribute("aria-describedby");
                if (summaryNodeId) {
                    let summaryNode = ruleContext.ownerDocument.getElementById(summaryNodeId);
                    if (summaryNode) {
                        sumStr = RPTUtil.getInnerText(summaryNode).trim().toLowerCase();
                    }
                }
            }
            if (!sumStr) {
                return null;
            } else {
                let capElems = ruleContext.getElementsByTagName("caption");
                if (capElems.length === 0) {
                    return null;
                } else if (sumStr.length > 0) {
                    let capStr = RPTUtil.getInnerText(capElems[0]).trim().toLowerCase();
                    if (sumStr != capStr) {
                        return RulePass("Pass_0");
                    } else {
                        return RuleFail("Fail_1")
                    }
                }
            }
        }
    },
    {
        /**
         * Description: Ensure that table captions have content
         * Origin: Valerie
         */
        id: "Valerie_Caption_HasContent",
        context: "dom:caption",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = RPTUtil.hasInnerContentHidden(ruleContext);
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Ensure that table captions are in tables
         * Origin: Valerie
         */
        id: "Valerie_Caption_InTable",
        context: "dom:caption",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = RPTUtil.getAncestor(ruleContext, "table") != null;
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: Trigger if role!="presentation" or role!="none", and missing a summary or summary does not correspond to aria-label or aria-labelledby
         * Origin: WCAG 2.0 Technique H73
         */
        id: "WCAG20_Table_SummaryAria3",
        context: "dom:table",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = !RPTUtil.isComplexDataTable(ruleContext) || RPTUtil.attributeNonEmpty(ruleContext, "summary") || ruleContext.hasAttribute("aria-describedby");
            // check if aria-describedby points to valid id or valid summary
            let summaryNodeId = ruleContext.getAttribute("aria-describedby");
            let sumStr;
            if (summaryNodeId) {
                let summaryNode = ruleContext.ownerDocument.getElementById(summaryNodeId);
                if (summaryNode) {
                    sumStr = RPTUtil.getInnerText(summaryNode).trim().toLowerCase();
                    if (sumStr) {
                        passed = true;
                    }
                    else
                        passed = false;
                }
                else
                    passed = false;
            }

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },

    {
        /**
         * Description: Require that there be at least one header row or header column for a data table.
         * Origin: RPT 5.6 G113
         */
        id: "RPT_Table_DataHeadingsAria",
        context: "dom:table",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as HTMLTableElement;
            // If this is a layout table or there are no rows, the rule does not apply.
            let rows = ruleContext.rows;
            if (!RPTUtil.isDataTable(ruleContext) || rows == null || rows.length == 0)
                return null;

            let passed = RPTUtil.isTableHeaderInFirstRowOrColumn(ruleContext);

            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Every heading must point to some cell, and every cell must reference
         * some heading
         * Origin: Valerie
         */
        id: "Valerie_Table_DataCellRelationships",
        context: "dom:td, dom:th",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let parentTable = RPTUtil.getAncestor(ruleContext, "table");
            // If this is a layout table or a simple table the rule does not apply.
            if (parentTable == null || !RPTUtil.isComplexDataTable(parentTable))
                return null;

            // If this table hasn't been preprocessed, process it.
            if (RPTUtil.getCache(ruleContext, "Valerie_Table_DataCellRelationships", null) === null) {
                // Build a grid that's actually usable (rowspan and colspan elements are duplicated)
                // This builds a real 2d table array.
                let grid = [];
                for (let i = 0; i < parentTable.rows.length; ++i) {
                    let row = parentTable.rows[i];
                    if (!grid[i]) grid[i] = [];
                    for (let j = 0; j < row.cells.length; ++j) {
                        let cell = row.cells[j];
                        RPTUtil.setCache(cell, "Valerie_Table_DataCellRelationships", i + ":" + j);
                        let width = parseInt(cell.getAttribute("colspan"));
                        if (!width) width = 1;
                        let height = parseInt(cell.getAttribute("rowspan"));
                        if (!height) height = 1;
                        let gX = 0;
                        while (grid[i][gX]) gX += 1;
                        for (let k = 0; k < height; ++k) {
                            if (!grid[i + k]) grid[i + k] = []
                            for (let l = 0; l < width; ++l) {
                                grid[i + k][gX + l] = cell;
                            }
                        }
                    }
                }

                // Iterate through the table grid and record headers that point to cells and
                // cells that are pointed to by headers
                let doc = ruleContext.ownerDocument;
                let lookup = {}
                let scopedCols = {};
                for (let i = 0; i < grid.length; ++i) {
                    let rowScoped = false;
                    for (let j = 0; j < grid[i].length; ++j) {
                        let gridCell = grid[i][j];
                        let gridNodeName = gridCell.nodeName.toLowerCase();
                        if (gridNodeName == "th") {
                            if (gridCell.getAttribute("scope") == "row") {
                                rowScoped = true;
                                // If there's an axis attribute, it must be referred to by headers,
                                // scope is not enough.
                                if (!RPTUtil.attributeNonEmpty(gridCell, "axis"))
                                    lookup[RPTUtil.getCache(gridCell, "Valerie_Table_DataCellRelationships", null)] = true;
                            } else if (gridCell.getAttribute("scope") == "col") {
                                scopedCols[j] = true;
                                // If there's an axis attribute, it must be referred to by headers,
                                // scope is not enough.
                                if (!RPTUtil.attributeNonEmpty(gridCell, "axis"))
                                    lookup[RPTUtil.getCache(gridCell, "Valerie_Table_DataCellRelationships", null)] = true;
                            }
                            // Headers can refer to other headers
                            if (RPTUtil.attributeNonEmpty(gridCell, "headers")) {
                                let hdrs = gridCell.getAttribute("headers").split(" ");
                                for (let k = 0; k < hdrs.length; ++k) {
                                    let headElem = doc.getElementById(hdrs[k].trim());
                                    if (headElem && RPTUtil.getAncestor(headElem, "table") == parentTable) {
                                        lookup[RPTUtil.getCache(headElem, "Valerie_Table_DataCellRelationships", null)] = true;
                                    }
                                }
                            }
                        } else if (gridNodeName == "td") {
                            if (rowScoped || scopedCols[j]) {
                                lookup[RPTUtil.getCache(gridCell, "Valerie_Table_DataCellRelationships", null)] = true;
                            } else if (RPTUtil.attributeNonEmpty(gridCell, "headers")) {
                                let hdrs = gridCell.getAttribute("headers").split(" ");
                                for (let k = 0; k < hdrs.length; ++k) {
                                    let headElem = doc.getElementById(hdrs[k].trim());
                                    if (headElem && RPTUtil.getAncestor(headElem, "table") == parentTable) {
                                        lookup[RPTUtil.getCache(gridCell, "Valerie_Table_DataCellRelationships", null)] = true;
                                        lookup[RPTUtil.getCache(headElem, "Valerie_Table_DataCellRelationships", null)] = true;
                                    }
                                }
                            }
                        }
                    }
                }
                RPTUtil.setCache(parentTable, "Valerie_Table_DataCellRelationships", lookup);
            }

            let rcInfo = RPTUtil.getCache(ruleContext, "Valerie_Table_DataCellRelationships", null);
            let tInfo =  RPTUtil.getCache(parentTable, "Valerie_Table_DataCellRelationships", null);
            let passed = rcInfo !== null && tInfo !== null && rcInfo in tInfo;

            if (!passed && rcInfo === "0:0" &&
                RPTUtil.getInnerText(ruleContext).trim().length == 0) {
                // We don't test if it's the upper-left cell and it's empty
                return null;
            }

            // If the table has no th's, it may just be that this was supposed to be a layout
            // table, which introduces a lot of noise.  In that case, only trigger this error
            // once per table.
            if (!passed && parentTable.getElementsByTagName("th").length == 0) {
                if (parentTable.Valerie_Table_DataCellRelationships_TrigOnce)
                    passed = true;
                parentTable.Valerie_Table_DataCellRelationships_TrigOnce = true;
            }

            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Trigger if the values in scope attribute are invalid
         * Origin: WCAG 2.0 Technique H63
         */
        id: "WCAG20_Table_Scope_Valid",
        context: "dom:td[scope], dom:th[scope]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let scopeVal = ruleContext.getAttribute("scope").trim().toLowerCase();
            let passed = /^(row|col|rowgroup|colgroup)$/.test(scopeVal);
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: Trigger on all tables that are determined to be layout tables.
         * Origin: RPT 5.6
         */
        id: "RPT_Table_LayoutTrigger",
        context: "dom:table",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = !RPTUtil.isLayoutTable(ruleContext);
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger if role=="presentation" or role=="none" and has table structure
         * Origin: WCAG 2.0 Technique H39, H43, H73, RPT 5.6 471
         */
        id: "WCAG20_Table_Structure",
        context: "dom:table",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - OUT OF SCOPE hidden in context
            if (RPTUtil.isDataTable(ruleContext)) return null;
            if (RPTUtil.isNodeInGrid(ruleContext)) return null;

            let errorNodes = [];
            if (RPTUtil.attributeNonEmpty(ruleContext, "summary"))
                errorNodes.push(ruleContext);

            let captionElems = ruleContext.getElementsByTagName("caption");
            for (let i = 0; i < captionElems.length; ++i) {
                if (RPTUtil.getAncestor(captionElems[i], "table") == ruleContext) {

                    // Check if the node should be skipped or not based on the Check Hidden Content setting and if the node isVisible or
                    // not. 
                    if (RPTUtil.shouldNodeBeSkippedHidden(captionElems[i])) {
                        continue;
                    }

                    // Add the node to the errorNodes
                    errorNodes.push(captionElems[i]);

                    // Since we are not actually making use of theses errorNodes even though they are passed along with
                    // ValidationResult, we do not need to keep looping over and getting every single violating node under
                    // the rule context. This can be a future enhancenment where we actually make use of the error nodes that
                    // are passed along. Adding this break to speed up performance at this point.
                    break; // There is no point to keep adding the error nodes, stop after finding the first one
                }
            }

            let thNodes = ruleContext.getElementsByTagName("th");
            for (let i = 0; i < thNodes.length; ++i) {
                if (RPTUtil.getAncestor(thNodes[i], "table") == ruleContext) {

                    // Check if the node should be skipped or not based on the Check Hidden Content setting and if the node isVisible or
                    // not.
                    if (RPTUtil.shouldNodeBeSkippedHidden(thNodes[i])) {
                        continue;
                    }

                    // Add the node to the errorNodes
                    errorNodes.push(thNodes[i]);

                    // Since we are not actually making use of theses errorNodes even though they are passed along with
                    // ValidationResult, we do not need to keep looping over and getting every single violating node under
                    // the rule context. This can be a future enhancenment where we actually make use of the error nodes that
                    // are passed along. Adding this break to speed up performance at this point.
                    break; // There is no point to keep adding the error nodes, stop after finding the first one
                }
            }
            let tdNodes = ruleContext.getElementsByTagName("td");
            for (let i = 0; i < tdNodes.length; ++i) {
                if ((tdNodes[i].hasAttribute("scope") || tdNodes[i].hasAttribute("headers")) &&
                    RPTUtil.getAncestor(tdNodes[i], "table") == ruleContext) {

                    // Check if the node should be skipped or not based on the Check Hidden Content setting and if the node isVisible or
                    // not.
                    if (RPTUtil.shouldNodeBeSkippedHidden(tdNodes[i])) {
                        continue;
                    }

                    // Add the node to the errorNodes
                    errorNodes.push(tdNodes[i]);

                    // Since we are not actually making use of theses errorNodes even though they are passed along with
                    // ValidationResult, we do not need to keep looping over and getting every single violating node under
                    // the rule context. This can be a future enhancenment where we actually make use of the error nodes that
                    // are passed along. Adding this break to speed up performance at this point.
                    break; // There is no point to keep adding the error nodes, stop after finding the first one
                }
            }

            // Get the node name for the rule context element in this case it will always be table
            let currentElementToken = ruleContext.nodeName.toLowerCase();

            // Construct a new array which will contan only the element tag for the violation elements
            let structuralElementTokens = new Array();

            // Construct a seen hash that will keep trask of all the elements that were already added to the token array, to make sure
            // we do not duplicate any of the elements. Duplicate element tags in the token message looks bad and confusing.
            let seen = {};

            // Loop through all the violating structural elements and extract the element tag to be used as a token
            for (let i = 0; i < errorNodes.length; i++) {
                // Get the node name (tag name) for the violating structural element
                let nodeName = errorNodes[i].nodeName.toLowerCase();

                // Only need to add the violating element once
                if (!seen.hasOwnProperty(nodeName)) {
                    // Since we are adding the token as elements and attributes we need to handle
                    // the summary attribute on the ruleContext (table). We only add summary once, same as
                    // for elements to avoid duplication in the message. (Summary should not duplicate, but just in case)
                    if (nodeName == "table" && !seen.hasOwnProperty["summary"]) {
                        // Mark this as a new attribute
                        seen["summary"] = true;

                        // Since this is a new violating element add it to the structural element tokens array
                        structuralElementTokens.push("summary");
                    } else {
                        // Mark this as a new element
                        seen[nodeName] = true;

                        // Since this is a new violating element add it to the structural element tokens array
                        structuralElementTokens.push(nodeName);
                    }
                }
            }

            // We need to take the array of structural elements and join them with a comma and a space to make grammatical correct in
            // the message.
            let structuralElementTokensStr = structuralElementTokens.join(", ");

            //return new ValidationResult(errorNodes.length == 0, errorNodes, '', '', [currentElementToken, structuralElementTokens]);
            if (errorNodes.length == 0) {
                return RulePass("Pass_0");
            } else {
                return RuleFail("Fail_1", [currentElementToken, structuralElementTokensStr]);
            }
        }
    }

]
export { a11yRulesTable }