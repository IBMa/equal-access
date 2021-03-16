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
            {key1: 'Scans:', key2: currentScan ? 1 : storedScanCount},
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
        console.log("createScanSummarySheet");

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
        console.log("storedScans.length = ", storedScans.length);
        let j = currentScan ? storedScans.length - 1 : 0;
        for (j; j < storedScans.length; j++) {
            let row = worksheet.addRow(
                [storedScans[j].pageTitle, 
                 storedScans[j].url, 
                 storedScans[j].userScanLabel, 
                 "none", 
                 storedScans[j].violations,
                 storedScans[j].needsReviews,
                 storedScans[j].recommendations,
                 storedScans[j].elementsNoViolations,
                 storedScans[j].elementsNoFailures
            ]);
            row.height = 37; // actual height is
            for (let i = 1; i < 5; i++) {
                row.getCell(i).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
                row.getCell(i).font = { name: "Calibri", color: { argb: "00000000" }, size: "12" };
            }
            for (let i = 5; i < 10; i++) {
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

        // counts
        let level1Counts = [0,0,0,0]; // level 1 total issues, violations, needs reviews, recommendations
        let level2Counts = [0,0,0,0];
        let level3Counts = [0,0,0,0];
        let level4Counts = [0,0,0,0];
        let level1V = []; let level2V = []; let level3V = []; let level4V = [];
        let level1NR = []; let level2NR = []; let level3NR = []; let level4NR = [];
        let level1R = []; let level2R = []; let level3R = []; let level4R = [];
        let j = currentScan ? storedScans.length - 1 : 0;
        for (j; j < storedScans.length; j++) { // for each scan
            const myStoredData = storedScans[j].storedScanData;
            
            for (let i=0; i<myStoredData.length;i++) { // for each issue row
                if (myStoredData[i][5] == 1) { // if level 1
                    level1Counts[0]++;
                    if (myStoredData[i][4] === "Violation") {
                        level1Counts[1]++;
                        level1V.push(myStoredData[i][9]);
                    }
                    if (myStoredData[i][4] === "Needs review") {
                        level1Counts[2]++;
                        level1NR.push(myStoredData[i][9]);
                    }
                    if (myStoredData[i][4] === "Recommendation") {
                        level1Counts[3]++;
                        level1R.push(myStoredData[i][9]);
                    }
                }
                if (myStoredData[i][5] == 2) { // if level 1
                    level2Counts[0]++;
                    if (myStoredData[i][4] === "Violation") {
                        level2Counts[1]++;
                        level2V.push(myStoredData[i][9]);
                    }
                    if (myStoredData[i][4] === "Needs review") {
                        level2Counts[2]++;
                        level2NR.push(myStoredData[i][9]);
                    }
                    if (myStoredData[i][4] === "Recommendation") {
                        level2Counts[3]++;
                        level2R.push(myStoredData[i][9]);
                    }
                }
                if (myStoredData[i][5] == 3) { // if level 1
                    level3Counts[0]++;
                    if (myStoredData[i][4] === "Violation") {
                        level3Counts[1]++;
                        level3V.push(myStoredData[i][9]);
                    }
                    if (myStoredData[i][4] === "Needs review") {
                        level3Counts[2]++;
                        level3NR.push(myStoredData[i][9]);
                    }
                    if (myStoredData[i][4] === "Recommendation") {
                        level3Counts[3]++;
                        level3R.push(myStoredData[i][9]);
                    }
                }
                if (myStoredData[i][5] == 1) { // if level 1
                    level4Counts[0]++;
                    if (myStoredData[i][4] === "Violation") {
                        level4Counts[1]++;
                        level4V.push(myStoredData[i][9]);
                    }
                    if (myStoredData[i][4] === "Needs review") {
                        level4Counts[2]++;
                        level4NR.push(myStoredData[i][9]);
                    }
                    if (myStoredData[i][4] === "Recommendation") {
                        level4Counts[3]++;
                        level4R.push(myStoredData[i][9]);
                    }
                }
                
            }
        }
        // @ts-ignore
        let level1VrowValues: { [index: string]:any } = this.countDuplicatesInArray(level1V); // note this returns an object
        console.log("level1VrowValues = ",level1VrowValues);
        
         // @ts-ignore
        let level1NRrowValues = this.countDuplicatesInArray(level1NR);
        console.log("level1NRrowValues = ",level1NRrowValues);

        // Unique issue arrays
        // let level1Vunique = Array.from(new Set(level1V)); let level1NRunique = Array.from(new Set(level1NR)); let level1Runique = Array.from(new Set(level1R));
        // let level2Vunique = Array.from(new Set(level1V)); let level2NRunique = Array.from(new Set(level1NR)); let level2Runique = Array.from(new Set(level1R));
        // let level3Vunique = Array.from(new Set(level1V)); let level3NRunique = Array.from(new Set(level1NR)); let level3Runique = Array.from(new Set(level1R));
        // let level4Vunique = Array.from(new Set(level1V)); let level4NRunique = Array.from(new Set(level1NR)); let level4Runique = Array.from(new Set(level1R));

        // issue counts




        const worksheet = workbook.addWorksheet("Issue summary");

        // Approach:
        // 1. sort by levels
        // 2. for each level sort by V, NR and R
        // 3. for each V, NR, and R in a level get issue dup counts
        // 4. build the rows

        // build Issue summary title
        worksheet.mergeCells('A1', "B1");

        const titleRow = worksheet.getRow(1);
        titleRow.height = "27"; // actual is 36

        const cellA1 = worksheet.getCell('A1');
        cellA1.value = "Issue summary";
        cellA1.alignment = { vertical: "middle", horizontal: "left"};
        cellA1.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellA1.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };

        const colWidthData = [
            {col: 'A', width: '155.51'}, // note .84 added to actual width
            {col: 'B', width: '21.16'},
        ]

        for (let i=0; i<2; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }

        // build Description title
        worksheet.mergeCells('A2', "B2");

        const descriptionRow = worksheet.getRow(2);
        descriptionRow.height = "20.25"; // actual is 27

        const cellA2 = worksheet.getCell("A2");
        cellA2.value = "     In the IBM Equal Access Toolkit, issues are divided into three levels (1-3). Tackle the levels in order to address some of the most impactful issues first.";
        cellA2.alignment = { vertical: "middle", horizontal: "left"};
        cellA2.font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };
        cellA2.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFCCC0DA'} };

        


        // build Total issues found: title
        // worksheet.mergeCells('A3', "B3");

        const totalIssuesRow = worksheet.getRow(3);
        totalIssuesRow.height = "27"; // actual is 36

        const cellA3 = worksheet.getCell("A3");
        cellA3.value = "Total issues found:";
        cellA3.alignment = { vertical: "middle", horizontal: "left"};
        cellA3.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellA3.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };

        const cellB3 = worksheet.getCell("B3");
        cellB3.value = totalIssues;
        cellB3.alignment = { vertical: "middle", horizontal: "right"};
        cellB3.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellB3.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };

        // build Number of issues title
        const numberOfIssuesRow = worksheet.getRow(4);
        numberOfIssuesRow.height = "20.25"; // actual is 27

        const cellA4 = worksheet.getCell("A4");
        // no value
        cellA4.alignment = { vertical: "middle", horizontal: "left"};
        
        const cellB4 = worksheet.getCell("B4");
        cellB4.value = "Number of issues";
        cellB4.alignment = { vertical: "middle", horizontal: "right"};
        cellB4.font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };

        // build Level 1 title
        const level1Row = worksheet.getRow(5);
        level1Row.height = "27"; // actual is 36

        const cellA5 = worksheet.getCell("A5");
        cellA5.value = "Level 1 - the most essential issues to address";
        cellA5.alignment = { vertical: "middle", horizontal: "left"};
        cellA5.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellA5.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };

        const cellB5 = worksheet.getCell("B5");
        cellB5.value = level1Counts[0]; // total Level 1 issues
        cellB5.alignment = { vertical: "middle", horizontal: "right"};
        cellB5.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellB5.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };
        
        //       Level 1 Violation title
        const level1ViolationRow = worksheet.getRow(6);
        level1ViolationRow.height = "18"; // target is 21

        const cellA6 = worksheet.getCell("A6");
        cellA6.value = "     Violation";
        cellA6.alignment = { vertical: "middle", horizontal: "left"};
        cellA6.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
        cellA6.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };

        const cellB6 = worksheet.getCell("B6");
        cellB6.value = level1Counts[1]; // total level 1 violations
        cellB6.alignment = { vertical: "middle", horizontal: "right"};
        cellB6.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
        cellB6.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };

        // Level 1 Violation Rows

        // build rows
        let rowArray = [];
            
        for (const property in level1VrowValues) {
            let row = [`${property}`,`${level1VrowValues[property]}` 
                    ];
            rowArray.push(row);
        }
       
        console.log("Violation Rows rowArray = ",rowArray);



        //       Level 1 Needs review title
        //       Level 1 Recommendation title

        // build Level 2 title
        //       Level 2 Violation title
        //       Level 2 Needs review title
        //       Level 2 Recommendation title

        // build Level 3 title
        //       Level 3 Violation title
        //       Level 3 Needs review title
        //       Level 3 Recommendation title

        // build Level 4 title
        //       Level 4 Violation title
        //       Level 4 Needs review title
        //       Level 4 Recommendation title
    }

    public static createIssuesSheet(storedScans: any, currentScan: boolean, workbook: any) {
        console.log("createIssuesSheet");

        const worksheet = workbook.addWorksheet("Issues");

        // build rows
        let rowArray = [];
        let j = currentScan ? storedScans.length - 1 : 0;
        for (j; j < storedScans.length; j++) {
            const myStoredData = storedScans[j].storedScanData;
            
            for (let i=0; i<myStoredData.length;i++) {
                let row = [myStoredData[i][0], myStoredData[i][1], myStoredData[i][2], 
                           myStoredData[i][3], myStoredData[i][4], myStoredData[i][5], 
                           myStoredData[i][6], myStoredData[i][7], myStoredData[i][8], 
                           myStoredData[i][9], myStoredData[i][10], myStoredData[i][11],
                           myStoredData[i][12], myStoredData[i][13] 
                        ];
                rowArray.push(row);
            }
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

        for (let i=2; i<=rowArray.length+1; i++) {
            worksheet.getRow(i).height = 14;
            for (let j=1; j<=14; j++) {
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

    public static countDuplicatesInArray(array: []) {
        let count = {};
        // let result = [];
        
        array.forEach(item => {
            
            if (count[item]) {
                //@ts-ignore
                count[item] +=1
                console.log("count[item] = ",count[item]);
                return
            }
            //@ts-ignore
            count[item] = 1;
            console.log("count[item] = ",count[item]);
        })
        
        return count;
    }   
}