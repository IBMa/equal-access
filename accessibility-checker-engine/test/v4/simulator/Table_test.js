/******************************************************************************
    Copyright:: 2026- IBM, Inc

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

/*
 * Comprehensive unit tests for Table component screen reader rendering
 * Tests both implicit (<table>) and explicit (role="table") tables with headers and data cells
 */

let ace = require('../../../src/index');

// Helper function to trim region fields in results
function trimRegions(results) {
    return results.map(item => ({
        ...item,
        item: item.item.trim(),
        region: item.region.trim()
    }));
}

describe('Table Component Screen Reader Tests', function() {

    afterEach(function() {
        // Disconnect the SRController to stop mutation observers
        if (ace.SRController.getController) {
            let controller = ace.SRController.getController();
            if (controller && controller.disconnect) {
                controller.disconnect();
            }
        }
        
        // Clean up any fixtures
        let fixture = document.getElementById('fixture');
        if (fixture) {
            document.body.removeChild(fixture);
        }
    });

    describe("Implicit Table Role", function() {
        
        it("Should render basic table with headers", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                    </tr>
                    <tr>
                        <td>John</td>
                        <td>30</td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Name", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Age", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Name\", column 1] John", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Age\", column 2] 30", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with caption", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <caption>Employee Data</caption>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                    </tr>
                    <tr>
                        <td>Alice</td>
                        <td>Developer</td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns, \"Employee Data\"]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[caption] Employee Data", "tab_focus": "", "image": "", "selector": "#fixture > table > caption" },
                { "region": "", "heading": "", "item": "[out of caption]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Name", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Role", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Name\", column 1] Alice", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Role\", column 2] Developer", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with aria-label", function() {
            let fixture = `<div id='fixture'>
                <table aria-label='Product prices'>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                    </tr>
                    <tr>
                        <td>Widget</td>
                        <td>$10</td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns, \"Product prices\"]", "tab_focus": "", "image": "", "selector": "#fixture > table[aria-label=\"Product\\ prices\"]" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Product", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Price", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Product\", column 1] Widget", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Price\", column 2] $10", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Table with thead, tbody, tfoot", function() {
        
        it("Should render table with thead and tbody", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Apple</td>
                            <td>5</td>
                        </tr>
                        <tr>
                            <td>Orange</td>
                            <td>3</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 3 rows and 2 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Item", "tab_focus": "", "image": "", "selector": "#fixture > table > thead > tr > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Quantity", "tab_focus": "", "image": "", "selector": "#fixture > table > thead > tr > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Item\", column 1] Apple", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Quantity\", column 2] 5", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 3] [\"Item\", column 1] Orange", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Quantity\", column 2] 3", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with thead, tbody, and tfoot", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Item 1</td>
                            <td>$10</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Total</td>
                            <td>$10</td>
                        </tr>
                    </tfoot>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 3 rows and 2 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Item", "tab_focus": "", "image": "", "selector": "#fixture > table > thead > tr > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Cost", "tab_focus": "", "image": "", "selector": "#fixture > table > thead > tr > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Item\", column 1] Item 1", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Cost\", column 2] $10", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 3] [\"Item\", column 1] Total", "tab_focus": "", "image": "", "selector": "#fixture > table > tfoot > tr > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Cost\", column 2] $10", "tab_focus": "", "image": "", "selector": "#fixture > table > tfoot > tr > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Table with Row Headers", function() {
        
        it("Should render table with row headers", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <tr>
                        <th>Q1</th>
                        <td>100</td>
                    </tr>
                    <tr>
                        <th>Q2</th>
                        <td>150</td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Q1", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th" },
                { "region": "", "heading": "", "item": "[column 2] 100", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > td" },
                { "region": "", "heading": "", "item": "[row 2] [column 1] Q2", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > th" },
                { "region": "", "heading": "", "item": "[column 2] 150", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with both column and row headers", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <tr>
                        <th></th>
                        <th>2023</th>
                        <th>2024</th>
                    </tr>
                    <tr>
                        <th>Sales</th>
                        <td>100</td>
                        <td>120</td>
                    </tr>
                    <tr>
                        <th>Profit</th>
                        <td>20</td>
                        <td>30</td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 3 rows and 3 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1]", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] 2023", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[column 3] 2024", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(3)" },
                { "region": "", "heading": "", "item": "[row 2] [column 1] Sales", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > th" },
                { "region": "", "heading": "", "item": "[\"2023\", column 2] 100", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"2024\", column 3] 120", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 3] [column 1] Profit", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(3) > th" },
                { "region": "", "heading": "", "item": "[\"2023\", column 2] 20", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(3) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"2024\", column 3] 30", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(3) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Explicit Table Role", function() {
        
        it("Should render div with role='table'", function() {
            let fixture = `<div id='fixture'>
                <div role='table' aria-label='Custom table'>
                    <div role='row'>
                        <div role='columnheader'>Name</div>
                        <div role='columnheader'>Value</div>
                    </div>
                    <div role='row'>
                        <div role='cell'>Item</div>
                        <div role='cell'>100</div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns, \"Custom table\"]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"table\"][aria-label=\"Custom\\ table\"]" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Name", "tab_focus": "", "image": "", "selector": "#fixture > div > div:nth-of-type(1) > div[role=\"columnheader\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Value", "tab_focus": "", "image": "", "selector": "#fixture > div > div:nth-of-type(1) > div[role=\"columnheader\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Name\", column 1] Item", "tab_focus": "", "image": "", "selector": "#fixture > div > div:nth-of-type(2) > div[role=\"cell\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Value\", column 2] 100", "tab_focus": "", "image": "", "selector": "#fixture > div > div:nth-of-type(2) > div[role=\"cell\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with role='rowheader'", function() {
            let fixture = `<div id='fixture'>
                <div role='table' aria-label='Data table'>
                    <div role='row'>
                        <div role='rowheader'>Row 1</div>
                        <div role='cell'>Data 1</div>
                    </div>
                    <div role='row'>
                        <div role='rowheader'>Row 2</div>
                        <div role='cell'>Data 2</div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns, \"Data table\"]", "tab_focus": "", "image": "", "selector": "#fixture > div[role=\"table\"][aria-label=\"Data\\ table\"]" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Row 1", "tab_focus": "", "image": "", "selector": "#fixture > div > div:nth-of-type(1) > div[role=\"rowheader\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Data 1", "tab_focus": "", "image": "", "selector": "#fixture > div > div:nth-of-type(1) > div[role=\"cell\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [column 1] Row 2", "tab_focus": "", "image": "", "selector": "#fixture > div > div:nth-of-type(2) > div[role=\"rowheader\"]:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Data 2", "tab_focus": "", "image": "", "selector": "#fixture > div > div:nth-of-type(2) > div[role=\"cell\"]:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Table with Interactive Content", function() {
        
        it("Should render table with links in cells", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                    <tr>
                        <td>John</td>
                        <td><a href='/edit'>Edit</a></td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Name", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Action", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Name\", column 1] John", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Action\", column 2] [link] Edit", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "Edit [link]", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2) > a" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with buttons in cells", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <tr>
                        <th>Item</th>
                        <th>Actions</th>
                    </tr>
                    <tr>
                        <td>Product A</td>
                        <td><button>Delete</button></td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Item", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Actions", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Item\", column 1] Product A", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Actions\", column 2] [\"Delete\", button]", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "", "tab_focus": "[\"Delete\", button]", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2) > button" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });

    describe("Table Edge Cases", function() {
        
        it("Should render empty table", function() {
            let fixture = `<div id='fixture'>
                <table></table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 0 rows and 0 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with empty cells", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <tr>
                        <th>Col1</th>
                        <th>Col2</th>
                    </tr>
                    <tr>
                        <td></td>
                        <td>Data</td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 2 rows and 2 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Col1", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Col2", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(1) > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[row 2] [\"Col1\", column 1]", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[\"Col2\", column 2] Data", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr:nth-of-type(2) > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with role='presentation' (removes table semantics)", function() {
            let fixture = `<div id='fixture'>
                <table role='presentation'>
                    <tr>
                        <td>Cell 1</td>
                        <td>Cell 2</td>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "Cell 1", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr > td:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "Cell 2", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr > td:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });

        it("Should render table with single row", function() {
            let fixture = `<div id='fixture'>
                <table>
                    <tr>
                        <th>Header 1</th>
                        <th>Header 2</th>
                    </tr>
                </table>
            </div>`;
            document.body.insertAdjacentHTML('afterbegin', fixture);
            
            let result = trimRegions(ace.SRController.renderStructure(document));
            
            expect(result).withContext(JSON.stringify(result, null, 2)).toEqual([
                { "region": "", "heading": "", "item": "[Start of document]", "tab_focus": "", "image": "", "selector": "body" },
                { "region": "", "heading": "", "item": "[table with 1 row and 2 columns]", "tab_focus": "", "image": "", "selector": "#fixture > table" },
                { "region": "", "heading": "", "item": "[row 1] [column 1] Header 1", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr > th:nth-of-type(1)" },
                { "region": "", "heading": "", "item": "[column 2] Header 2", "tab_focus": "", "image": "", "selector": "#fixture > table > tbody > tr > th:nth-of-type(2)" },
                { "region": "", "heading": "", "item": "[out of table]", "tab_focus": "", "image": "" },
                { "region": "", "heading": "", "item": "[End of document]", "tab_focus": "", "image": "" }
            ]);
        });
    });
});

// Made with Bob