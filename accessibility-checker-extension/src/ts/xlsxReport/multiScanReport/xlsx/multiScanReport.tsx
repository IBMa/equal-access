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

import ReportUtil from "../../reportUtil";
// import ReportSummaryUtil from '../../../util/reportSummaryUtil';


import ExcelJS from 'exceljs'

export default class MultiScanReport {

    public static async multiScanXlsxDownload(storedScans: any, currentScan:boolean, storedScanCount: number) {

        // create workbook
        var reportWorkbook = MultiScanReport.createReportWorkbook(storedScans, currentScan, storedScanCount);
        
        // create binary buffer
        const buffer = await reportWorkbook.xlsx.writeBuffer();

        // create xlsx blob
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const blob = new Blob([buffer], {type: fileType});
        console.log("blob = ", blob);

        // const fileName = ReportUtil.single_page_report_file_name(xlsx_props.tab_title);
        const fileName = ReportUtil.single_page_report_file_name(storedScans[storedScans.length - 1].pageTitle);

        // if scanStorage false clear/delete current scan


        // download file
        ReportUtil.download_file(blob, fileName);
    }

    public static createReportWorkbook(storedScans: any, currentScan: boolean, storedScanCount: number) {
        console.log("createReportWorkbook");
        // create workbook
        // @ts-ignore
        const workbook = new ExcelJS.Workbook({useStyles: true });
            
        // create worksheets
        this.createOverviewSheet(storedScans, currentScan, storedScanCount, workbook);
        this.createScanSummarySheet(storedScans, currentScan, workbook);
        this.createIssueSummarySheet(storedScans, currentScan, workbook);
        this.createIssuesSheet(storedScans, currentScan, workbook);
        this.createDefinitionsSheet(storedScans, workbook);

        return workbook;
    }

    
    public static createOverviewSheet(storedScans: any, currentScan: boolean, storedScanCount: number, workbook: any) {
        console.log("createOverviewSheet");

        let violations = 0;
        let needsReviews = 0;
        let recommendations = 0;
        let totalIssues = 0;

        // question 1: is report for current scans or all available scans?
        const theCurrentScan = storedScans[storedScans.length - 1];

        if (currentScan === true) {
            violations = theCurrentScan.violations;
            needsReviews = theCurrentScan.needsReviews;
            recommendations = theCurrentScan.recommendations;
            totalIssues = theCurrentScan.violations+theCurrentScan.needsReviews+theCurrentScan.recommendations;
        } else {
            for (let i=0; i < storedScans.length; i++) {
                violations += storedScans[i].violations;
                needsReviews += storedScans[i].needsReviews;
                recommendations += storedScans[i].recommendations;
            }
            totalIssues = violations+needsReviews+recommendations;
        }

        const worksheet = workbook.addWorksheet("Overview");


        // Report Title
        worksheet.mergeCells('A1', "D1");

        const titleRow = worksheet.getRow(1);
        titleRow.height = "27";

        const cellA1 = worksheet.getCell('A1');
        cellA1.value = "Accessibility Scan Report";
        cellA1.alignment = { vertical: "middle", horizontal: "left"};
        cellA1.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellA1.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };

        // what are column widths - can't get it till you set it

        const colWidthData = [
            {col: 'A', width: '15.1'},
            {col: 'B', width: '15.9'},
            {col: 'C', width: '16.23'},
            {col: 'D', width: '19.4'},
        ]

        for (let i=0; i<4; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }
        

        // set row height for rows 2-10
        for (let i=2; i<11; i++) {
            worksheet.getRow(i).height = 12; // results in a row height of 16
        }

        // note except for Report Date this is the same for all scans
        const rowData = [
            {key1: 'Tool:', key2: 'IBM Equal Access Accessibility Checker'},
            {key1: 'Version:', key2: chrome.runtime.getManifest().version},
            {key1: 'Rule set:', key2: theCurrentScan.ruleSet},
            {key1: 'Guidelines:', key2: theCurrentScan.guidelines},
            {key1: 'Report date:', key2: theCurrentScan.reportDate}, // do we need to get actual date?
            {key1: 'Platform:', key2: ""},
            {key1: 'Scans:', key2: storedScanCount},
            {key1: 'Pages:', key2: ""}
        ];
        
        worksheet.mergeCells('B2', "D2");
        worksheet.mergeCells('B3', "D3");
        worksheet.mergeCells('B4', "D4");
        worksheet.mergeCells('B5', "D5");
        worksheet.mergeCells('B6', "D6");
        worksheet.mergeCells('B7', "D7");
        worksheet.mergeCells('B8', "D8");
        worksheet.mergeCells('B9', "D9");
        worksheet.mergeCells('A10', "D10");


        for (let i=2; i<10; i++) {
            worksheet.getRow(i).getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };
            worksheet.getRow(i).getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };
            worksheet.getRow(i).getCell(1).alignment = { horizontal: "left"};
            worksheet.getRow(i).getCell(2).alignment = { horizontal: "left"};
        }
        for (let i=2; i<10; i++) {
            worksheet.getRow(i).getCell(1).value = rowData[i-2].key1; worksheet.getRow(i).getCell(2).value = rowData[i-2].key2;
        }
        
        // Summary Title
        worksheet.mergeCells('A11', "D11");

        const summaryRow = worksheet.getRow(11);
        summaryRow.height = "27";

        const cellA11 = worksheet.getCell('A11');
        cellA11.value = "Summary";
        cellA11.alignment = { vertical: "middle", horizontal: "left"};
        cellA11.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellA11.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };

        // Scans info Headers
        worksheet.getRow(12).height = 16; // actual height is

        const cellA12 = worksheet.getCell('A12'); cellA12.value = "Total issues";
        const cellB12 = worksheet.getCell('B12'); cellB12.value = "Violations";
        const cellC12 = worksheet.getCell('C12'); cellC12.value = "Needs review";
        const cellD12 = worksheet.getCell('D12'); cellD12.value = "Recommendations";

        const cellObjects1 = [cellA12, cellB12, cellC12, cellD12];

        for (let i=0; i<4; i++) {
            cellObjects1[i].alignment = { vertical: "middle", horizontal: "center"};
            cellObjects1[i].font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
            cellObjects1[i].fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };
            cellObjects1[i].border = {
                top: {style:'thin', color: {argb: 'FFA6A6A6'}},
                left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
                right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            }
        }

        // Scans info Values
        worksheet.getRow(13).height = 27; // actual height is

        const cellA13 = worksheet.getCell('A13'); cellA13.value = totalIssues;
        const cellB13 = worksheet.getCell('B13'); cellB13.value = violations;
        const cellC13 = worksheet.getCell('C13'); cellC13.value = needsReviews;
        const cellD13 = worksheet.getCell('D13'); cellD13.value = recommendations;

        const cellObjects2 = [cellA13, cellB13, cellC13, cellD13];

        for (let i=0; i<4; i++) {
            cellObjects2[i].alignment = { vertical: "middle", horizontal: "center"};
            cellObjects2[i].font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };
            cellObjects2[i].fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            cellObjects2[i].border = {
                top: {style:'thin', color: {argb: 'FFA6A6A6'}},
                left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
                right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            }
        }
    }

    public static createScanSummarySheet(storedScans: any, currentScan: boolean, workbook: any) {
        console.log("createOverviewSheet");

        const worksheet = workbook.addWorksheet("Scan summary");

        // Scans info Headers
        worksheet.getRow(1).height = 39; // actual height is 52

        const colWidthData = [
            {col: 'A', width: '27.0'},
            {col: 'B', width: '46.0'},
            {col: 'C', width: '20.17'},
            {col: 'D', width: '18.5'},
            {col: 'E', width: '17.17'},
            {col: 'F', width: '17.17'},
            {col: 'G', width: '17.17'},
            {col: 'H', width: '17.17'},
            {col: 'I', width: '17.17'},
        ]

        for (let i=0; i<9; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }

        const cellA1 = worksheet.getCell('A1'); cellA1.value = "Page title";
        const cellB1 = worksheet.getCell('B1'); cellB1.value = "Page url";
        const cellC1 = worksheet.getCell('C1'); cellC1.value = "Scan label";
        const cellD1 = worksheet.getCell('D1'); cellD1.value = "Base scan";

        const cellObjects1 = [cellA1, cellB1, cellC1, cellD1];

        for (let i=0; i<4; i++) {
            cellObjects1[i].alignment = { vertical: "middle", horizontal: "left"};
            cellObjects1[i].font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
            cellObjects1[i].fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };
            cellObjects1[i].border = {
                top: {style:'thin', color: {argb: 'FFA6A6A6'}},
                left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
                right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            }
        }

        const cellE1 = worksheet.getCell('E1'); cellE1.value = "Violations";
        const cellF1 = worksheet.getCell('F1'); cellF1.value = "Needs review";
        const cellG1 = worksheet.getCell('G1'); cellG1.value = "Recommendations";
        const cellH1 = worksheet.getCell('H1'); cellH1.value = "% elements without violations";
        const cellI1 = worksheet.getCell('I1'); cellI1.value = "% elements without violations or items to review";

        const cellObjects2 = [cellE1, cellF1, cellG1, cellH1, cellI1];

        for (let i=0; i<5; i++) {
            cellObjects2[i].alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            cellObjects2[i].font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
            cellObjects2[i].fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };
            cellObjects2[i].border = {
                top: {style:'thin', color: {argb: 'FFA6A6A6'}},
                left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
                right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            }
        }

        // if current scan use only the last scan otherwise loop through each scan an create row
        console.log("storedScans = ", storedScans.length);
        
        for (let i = 0; i < storedScans.length; i++) {
            let row = worksheet.addRow(
                [storedScans[i].pageTitle, 
                 storedScans[i].url, 
                 storedScans[i].userScanLabel, 
                 "none", 
                 storedScans[i].violations,
                 storedScans[i].needsReviews,
                 storedScans[i].recommendations,
                 storedScans[i].elementsNoViolations,
                 storedScans[i].elementsNoFailures
            ]);
            row.height = 37; // actual height is
            for (let i = 1; i < 5; i++) {
                console.log("i = ", i);
                row.getCell(i).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
                row.getCell(i).font = { name: "Calibri", color: { argb: "00000000" }, size: "12" };
            }
            for (let i = 5; i < 10; i++) {
                console.log("i = ", i);
                row.getCell(i).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
                row.getCell(i).font = { name: "Calibri", color: { argb: "00000000" }, size: "12" };
                row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
                row.getCell(i).border = {
                    top: {style:'thin', color: {argb: 'FFA6A6A6'}},
                    left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                    bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
                    right: {style:'thin', color: {argb: 'FFA6A6A6'}}
                }
            }
        }
    }

    public static createIssueSummarySheet(storedScans: any, currentScan: boolean, workbook: any) {
        console.log("createIssueSummarySheet");

        const worksheet = workbook.addWorksheet("Issue summary");
    }

    public static createIssuesSheet(storedScans: any, currentScan: boolean, workbook: any) {
        console.log("createIssueSheet");

        const worksheet = workbook.addWorksheet("Issues");

        // build rows

        for (let i = 0; i < storedScans.length; i++) {

        }
            

        const myStoredData = JSON.parse(localStorage.getItem("scan1Data")!);
        console.log(myStoredData.length);
        console.log(myStoredData);
        let rowArray = [];
        for (let i=0; i<myStoredData.length;i++) {
            let row = [myStoredData[i][0], myStoredData[i][1], myStoredData[i][2], 
                       myStoredData[i][3], myStoredData[i][4], myStoredData[i][5], 
                       myStoredData[i][6], myStoredData[i][7], myStoredData[i][8], 
                       myStoredData[i][9], myStoredData[i][10], myStoredData[i][11],
                       myStoredData[i][12], myStoredData[i][13] 
                    ];
            rowArray.push(row);
        }

        
        

        // column widths
        const colWidthData = [
            {col: 'A', width: '18.0', alignment: { vertical: "middle", horizontal: "left"}},
            {col: 'B', width: '20.5', alignment: { vertical: "middle", horizontal: "left"}},
            {col: 'C', width: '21.0', alignment: { vertical: "middle", horizontal: "center"}},
            {col: 'D', width: '18.5', alignment: { vertical: "middle", horizontal: "left"}},
            {col: 'E', width: '17.0', alignment: { vertical: "middle", horizontal: "center"}},
            {col: 'F', width: '17.17', alignment: { vertical: "middle", horizontal: "center"}},
            {col: 'G', width: '17.17', alignment: { vertical: "middle", horizontal: "left"}},
            {col: 'H', width: '17.17', alignment: { vertical: "middle", horizontal: "center"}},
            {col: 'I', width: '17.17', alignment: { vertical: "middle", horizontal: "left"}},
            {col: 'J', width: '17.17', alignment: { vertical: "middle", horizontal: "left"}},
            {col: 'K', width: '14.00', alignment: { vertical: "middle", horizontal: "center"}},
            {col: 'L', width: '17.17', alignment: { vertical: "middle", horizontal: "left"}},
            {col: 'M', width: '43.00', alignment: { vertical: "middle", horizontal: "left"}},
            {col: 'N', width: '17.17', alignment: { vertical: "middle", horizontal: "fill"}},
        ]

        for (let i=0; i<14; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
            worksheet.getColumn(colWidthData[i].col).alignment = colWidthData[i].alignment;
        }

        // set font and alignment for the header cells
        for (let i=1; i<15; i++) {
            worksheet.getRow(1).getCell(i).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            worksheet.getRow(1).getCell(i).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
            worksheet.getRow(1).getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };
            worksheet.getRow(1).getCell(i).border = {
                top: {style:'thin', color: {argb: 'FFA6A6A6'}},
                left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
                right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            }
        }

        // height for header row
        worksheet.getRow(1).height = 24;

        // add table to a sheet
        worksheet.addTable({
            name: 'MyTable',
            ref: 'A1',
            headerRow: true,
            // totalsRow: true,
            style: {
                theme: 'TableStyleMedium2',
                showRowStripes: true,
            },
            columns: [
                {name: 'Page title', filterButton: true},
                {name: 'Page URL', filterButton: true},
                {name: 'Scan label', filterButton: true},
                {name: 'Issue ID', filterButton: true},
                {name: 'Issue type', filterButton: true},
                {name: 'Toolkit level', filterButton: true},
                {name: 'Checkpoint', filterButton: true},
                {name: 'WCAG level', filterButton: true},
                {name: 'Rule', filterButton: true},
                {name: 'Issue', filterButton: true},
                {name: 'Element', filterButton: true},
                {name: 'Code', filterButton: true},
                {name: 'Xpath', filterButton: true},
                {name: 'Help', filterButton: true},
                
            ],
            rows: rowArray
        });

        console.log(worksheet.getRow(2).getCell(1).value);

        for (let i=2; i<=rowArray.length+1; i++) {
            console.log("i = ", i);
            worksheet.getRow(i).height = 14;
            for (let j=1; j<=14; j++) {
                console.log("j = ", j);
                worksheet.getRow(i).getCell(j).border = {
                    top: {style:'thin', color: {argb: 'FFA6A6A6'}},
                    left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                    bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
                    right: {style:'thin', color: {argb: 'FFA6A6A6'}}
                }
            }
        }
    }

    public static createDefinitionsSheet(storedScans: any, workbook: any) {
        console.log("createDefinitionsSheet");

        const worksheet = workbook.addWorksheet("Definition of fields");
    }
}