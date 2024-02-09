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

import ExcelJS from "exceljs"
import { IArchiveDefinition, IStoredReportMeta, StoredScanData } from "../../../../interfaces/interfaces";

function perc(a: number, b: number) {
    return parseInt((((a) / b) * 100).toFixed(0));
}

export default class MultiScanReport {

    public static async multiScanXlsxDownload(storedScans: IStoredReportMeta[], archives: IArchiveDefinition[]) {
        // create workbook
        let reportWorkbook = await MultiScanReport.generateWorkbook(storedScans, archives);

        // create binary buffer
        const buffer = await reportWorkbook.xlsx.writeBuffer();

        // create xlsx blob
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const blob = new Blob([buffer], { type: fileType });

        // const fileName = ReportUtil.single_page_report_file_name(xlsx_props.tab_title);
        const fileName = ReportUtil.single_page_report_file_name(storedScans[storedScans.length - 1].pageTitle);

        // download file
        ReportUtil.download_file(blob, fileName);
    }

    public static async generateWorkbook(storedScans: IStoredReportMeta[], archives: IArchiveDefinition[]) {
        let msReport = new MultiScanReport(storedScans, archives);
        return msReport.getWorkbook();
    }

    // @ts-ignore
    private workbook = new ExcelJS.Workbook({ useStyles: true });

    /**
     * @param storedScans 
     * @param scanType 
     * @param storedScanCount 
     * @param archives 
     * @returns 
     */
    private constructor(storedScans: IStoredReportMeta[], archives: IArchiveDefinition[]) {
        // create worksheets
        this.createOverviewSheet(storedScans, archives);
        this.createScanSummarySheet(storedScans);
        this.createIssueSummarySheet(storedScans);
        this.createIssuesSheet(storedScans);
        this.createDefinitionsSheet();
    }

    private getWorkbook() {
        return this.workbook;
    }

    private createOverviewSheet(storedScans: IStoredReportMeta[], archives: IArchiveDefinition[]) {

        let violations = 0;
        let needsReviews = 0;
        let recommendations = 0;
        let hidden = 0;

        for (const storedScan of storedScans) {
            violations += (storedScan.counts.Violation || 0);
            needsReviews += (storedScan.counts["Needs review"] || 0);
            recommendations += (storedScan.counts.Recommendation || 0);
            hidden += (storedScan.counts.Hidden || 0);
        }
        let totalIssues = violations + needsReviews + recommendations;

        let lastScan = storedScans[storedScans.length - 1];
        const worksheet = this.workbook.addWorksheet("Overview");

        // Report Title
        worksheet.mergeCells('A1', "E1");
        const titleRow = worksheet.getRow(1);
        titleRow.height = 27;

        const cellA1 = worksheet.getCell('A1');
        cellA1.value = "Accessibility Scan Report";
        cellA1.alignment = { vertical: "middle", horizontal: "left" };
        cellA1.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellA1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        // what are column widths - can't get it till you set it
        const colWidthData = [
            { col: 'A', width: 15.1 },
            { col: 'B', width: 15.9 },
            { col: 'C', width: 16.23 },
            { col: 'D', width: 19.4 },
            { col: 'E', width: 15.9 },
        ]

        for (let i = 0; i < 5; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }


        // set row height for rows 2-10
        for (let i = 2; i < 11; i++) {
            if (i == 7) {
                worksheet.getRow(i).height = 36;
            } else {
                worksheet.getRow(i).height = 12; // results in a row height of 16
            }
        }

        let uniqueURLs = new Set(storedScans.map(scan => scan.pageURL)).size;

        // note except for Report Date this is the same for all scans
        const rowData = [
            { key1: 'Tool:', key2: 'IBM Equal Access Accessibility Checker' },
            { key1: 'Version:', key2: chrome.runtime.getManifest().version },
            //@ts-ignore
            { key1: 'Rule set:', key2: (lastScan.ruleset === "Latest Deployment") ? archives[1].name : lastScan.ruleset },
            { key1: 'Guidelines:', key2: lastScan.guideline },
            { key1: 'Report date:', key2: new Date(lastScan.timestamp) }, // do we need to get actual date?
            { key1: 'Platform:', key2: navigator.userAgent },
            { key1: 'Scans:', key2: storedScans.length }, // *** NEED TO FIX FOR selected
            { key1: 'Pages:', key2: uniqueURLs }
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


        for (let i = 2; i < 10; i++) {
            worksheet.getRow(i).getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            worksheet.getRow(i).getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            worksheet.getRow(i).getCell(1).alignment = { horizontal: "left" };
            worksheet.getRow(i).getCell(2).alignment = { horizontal: "left" };
            if (i == 7) {
                worksheet.getRow(i).getCell(1).alignment = { vertical: "top" };
                worksheet.getRow(i).getCell(2).alignment = { wrapText: true };
            }
        }
        for (let i = 2; i < 10; i++) {
            worksheet.getRow(i).getCell(1).value = rowData[i - 2].key1; worksheet.getRow(i).getCell(2).value = rowData[i - 2].key2;
        }

        // Summary Title
        worksheet.mergeCells('A11', "E11");

        const summaryRow = worksheet.getRow(11);
        summaryRow.height = 27;

        const cellA11 = worksheet.getCell('A11');
        cellA11.value = "Summary";
        cellA11.alignment = { vertical: "middle", horizontal: "left" };
        cellA11.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellA11.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        // Scans info Headers
        worksheet.getRow(12).height = 16; // actual height is

        const cellA12 = worksheet.getCell('A12'); cellA12.value = "Total issues";
        const cellB12 = worksheet.getCell('B12'); cellB12.value = "Violations";
        const cellC12 = worksheet.getCell('C12'); cellC12.value = "Needs review";
        const cellD12 = worksheet.getCell('D12'); cellD12.value = "Recommendations";
        const cellE12 = worksheet.getCell('E12'); cellE12.value = "Hidden";

        const cellObjects1 = [cellA12, cellB12, cellC12, cellD12, cellE12];

        for (let i = 0; i < 5; i++) {
            cellObjects1[i].alignment = { vertical: "middle", horizontal: "center" };
            if (i == 1 || i == 2 || i == 3 || i == 4) {
                cellObjects1[i].font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            } else {
                cellObjects1[i].font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
            }

            // cellObjects1[i].fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };
            cellObjects1[i].border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            }
        }

        cellA12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        cellB12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        cellC12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        cellD12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        cellE12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFBFBF' } };


        // Scans info Values
        worksheet.getRow(13).height = 27; // actual height is

        const cellA13 = worksheet.getCell('A13'); cellA13.value = totalIssues;
        const cellB13 = worksheet.getCell('B13'); cellB13.value = violations;
        const cellC13 = worksheet.getCell('C13'); cellC13.value = needsReviews;
        const cellD13 = worksheet.getCell('D13'); cellD13.value = recommendations;
        const cellE13 = worksheet.getCell('E13'); cellE13.value = hidden;

        const cellObjects2 = [cellA13, cellB13, cellC13, cellD13, cellE13];

        for (let i = 0; i < 5; i++) {
            cellObjects2[i].alignment = { vertical: "middle", horizontal: "center" };
            cellObjects2[i].font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            // cellObjects2[i].fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            cellObjects2[i].border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            }
        }
    }

    private createScanSummarySheet(storedScans: IStoredReportMeta[]) {

        const worksheet = this.workbook.addWorksheet("Scan summary");

        // Scans info Headers
        worksheet.getRow(1).height = 39; // actual height is 52

        const colWidthData = [
            { col: 'A', width: 27.0 },
            { col: 'B', width: 46.0 },
            { col: 'C', width: 20.17 },
            { col: 'D', width: 18.5 },
            { col: 'E', width: 17.17 },
            { col: 'F', width: 17.17 },
            { col: 'G', width: 17.17 },
            { col: 'H', width: 17.17 },
            { col: 'I', width: 17.17 },
            { col: 'J', width: 17.17 },
        ]

        for (let i = 0; i < 10; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }

        const cellA1 = worksheet.getCell('A1'); cellA1.value = "Page title";
        const cellB1 = worksheet.getCell('B1'); cellB1.value = "Page url";
        const cellC1 = worksheet.getCell('C1'); cellC1.value = "Scan label";
        const cellD1 = worksheet.getCell('D1'); cellD1.value = "Base scan";

        const cellObjects1 = [cellA1, cellB1, cellC1, cellD1];

        for (let i = 0; i < 4; i++) {
            cellObjects1[i].alignment = { vertical: "middle", horizontal: "left" };
            cellObjects1[i].font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
            cellObjects1[i].fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };
            cellObjects1[i].border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            }
        }

        const cellE1 = worksheet.getCell('E1'); cellE1.value = "Violations";
        const cellF1 = worksheet.getCell('F1'); cellF1.value = "Needs review";
        const cellG1 = worksheet.getCell('G1'); cellG1.value = "Recommendations";
        const cellH1 = worksheet.getCell('H1'); cellH1.value = "Hidden";
        const cellI1 = worksheet.getCell('I1'); cellI1.value = "% elements without violations";
        const cellJ1 = worksheet.getCell('J1'); cellJ1.value = "% elements without violations or items to review";

        const cellObjects2 = [cellE1, cellF1, cellG1, cellH1, cellI1, cellJ1];

        for (let i = 0; i < 6; i++) {
            cellObjects2[i].alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            if (i == 0 || i == 1 || i == 2 || i == 3) {
                cellObjects2[i].font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            } else {
                cellObjects2[i].font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
            }

            // cellObjects2[i].fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };
            cellObjects2[i].border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            }
        }

        cellE1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        cellF1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        cellG1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        cellH1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFBFBF' } };
        cellI1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        cellJ1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };


        // if current scan use last scan, if 
        // if current scan use only the last scan otherwise loop through each scan an create row
        for (const storedScan of storedScans) {
            // JCH find unique elements that have violations and needs review issues
            let violations = storedScan && storedScan.storedScanData.filter((result: StoredScanData) => {
                return result[4] === "Violation";
            }) || []

            let potentials = storedScan && storedScan.storedScanData.filter((result: StoredScanData) => {
                return result[4] === "Needs review";
            }) || []

            let violationXpaths: string[] = violations.map(result => result[12]);
            let reviewXpaths: string[] = potentials.map(result => result[12]);
            let violationPlusPotentialXpaths = violationXpaths.concat(reviewXpaths);
            let violationUniqueElements = new Set(violationXpaths).size;
            let violationPlusPotentialUniqueElements = new Set(violationPlusPotentialXpaths).size;
            let testedElements = (storedScan && storedScan.testedUniqueElements || 0);

            let row = worksheet.addRow(
                [storedScan.pageTitle,
                storedScan.pageURL,
                storedScan.label,
                    "none",
                storedScan.counts["Violation"],
                storedScan.counts["Needs review"],
                storedScan.counts["Recommendation"],
                storedScan.counts["Hidden"],
                perc(testedElements-violationUniqueElements, testedElements),
                perc(testedElements-violationPlusPotentialUniqueElements, testedElements)
            ]);
            row.height = 37; // actual height is
            for (let i = 1; i < 5; i++) {
                row.getCell(i).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
                row.getCell(i).font = { name: "Calibri", color: { argb: "00000000" }, size: 12 };
            }
            for (let i = 5; i < 11; i++) {
                row.getCell(i).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
                row.getCell(i).font = { name: "Calibri", color: { argb: "00000000" }, size: 12 };
                // row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
                row.getCell(i).border = {
                    top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
                }
            }
        }
    }

    private createIssueSummarySheet(storedScans: IStoredReportMeta[]) {

        let violations = 0;
        let needsReviews = 0;
        let recommendations = 0;
        let totalIssues = 0;

        console.log("storeScans: ", storedScans);

        for (const scan of storedScans) {
            violations += scan.counts["Violation"];
            needsReviews += scan.counts["Needs review"];
            recommendations += scan.counts.Recommendation;
        }
        totalIssues = violations + needsReviews + recommendations;

        // counts
        let level1Counts = [0, 0, 0, 0]; // level 1 total issues, violations, needs reviews, recommendations
        let level2Counts = [0, 0, 0, 0];
        let level3Counts = [0, 0, 0, 0];
        let level4Counts = [0, 0, 0, 0];
        let level1V = []; let level2V = []; let level3V = []; let level4V = [];
        let level1NR = []; let level2NR = []; let level3NR = []; let level4NR = [];
        let level1R = []; let level2R = []; let level3R = []; let level4R = [];
        for (const storedScan of storedScans) {
            const myStoredData = storedScan.storedScanData;
            for (let i = 0; i < myStoredData.length; i++) { // for each issue row
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
                if (myStoredData[i][5] == 2) { // if level 2
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
                if (myStoredData[i][5] == 3) { // if level 3
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
                if (myStoredData[i][5] == 4) { // if level 4
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
        let level1VrowValues = MultiScanReport.countDuplicatesInArray(level1V); // note this returns an object
        let level1NRrowValues = MultiScanReport.countDuplicatesInArray(level1NR);
        let level1RrowValues = MultiScanReport.countDuplicatesInArray(level1R);

        let level2VrowValues = MultiScanReport.countDuplicatesInArray(level2V); // note this returns an object
        let level2NRrowValues = MultiScanReport.countDuplicatesInArray(level2NR);
        let level2RrowValues = MultiScanReport.countDuplicatesInArray(level2R);

        let level3VrowValues = MultiScanReport.countDuplicatesInArray(level3V); // note this returns an object
        let level3NRrowValues = MultiScanReport.countDuplicatesInArray(level3NR);
        let level3RrowValues = MultiScanReport.countDuplicatesInArray(level3R);

        let level4VrowValues = MultiScanReport.countDuplicatesInArray(level4V); // note this returns an object
        let level4NRrowValues = MultiScanReport.countDuplicatesInArray(level4NR);
        let level4RrowValues = MultiScanReport.countDuplicatesInArray(level4R);

        const worksheet = this.workbook.addWorksheet("Issue summary");

        // Approach:
        // 1. sort by levels
        // 2. for each level sort by V, NR and R
        // 3. for each V, NR, and R in a level get issue dup counts
        // 4. build the rows

        // build Issue summary title
        worksheet.mergeCells('A1', "B1");

        const titleRow = worksheet.getRow(1);
        titleRow.height = 27; // actual is 36

        const cellA1 = worksheet.getCell('A1');
        cellA1.value = "Issue summary";
        cellA1.alignment = { vertical: "middle", horizontal: "left" };
        cellA1.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellA1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        const colWidthData = [
            { col: 'A', width: 155.51 }, // note .84 added to actual width
            { col: 'B', width: 21.16 },
        ]

        for (let i = 0; i < 2; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }

        // build Description title
        worksheet.mergeCells('A2', "B2");

        const descriptionRow = worksheet.getRow(2);
        descriptionRow.height = 20.25; // actual is 27

        const cellA2 = worksheet.getCell("A2");
        cellA2.value = "     In the IBM Equal Access Toolkit, issues are divided into three levels (1-3). Tackle the levels in order to address some of the most impactful issues first.";
        cellA2.alignment = { vertical: "middle", horizontal: "left" };
        cellA2.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        // cellA2.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFCCC0DA'} };




        // build Total issues found: title
        // worksheet.mergeCells('A3', "B3");

        const totalIssuesRow = worksheet.getRow(3);
        totalIssuesRow.height = 27; // actual is 36

        const cellA3 = worksheet.getCell("A3");
        cellA3.value = "Total issues found:";
        cellA3.alignment = { vertical: "middle", horizontal: "left" };
        cellA3.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellA3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

        const cellB3 = worksheet.getCell("B3");
        cellB3.value = totalIssues;
        cellB3.alignment = { vertical: "middle", horizontal: "right" };
        cellB3.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellB3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

        // build Number of issues title
        const numberOfIssuesRow = worksheet.getRow(4);
        numberOfIssuesRow.height = 20.25; // actual is 27


        const cellA4 = worksheet.getCell("A4");
        // no value
        cellA4.alignment = { vertical: "middle", horizontal: "left" };
        cellA4.border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
        };

        const cellB4 = worksheet.getCell("B4");
        cellB4.value = "Number of issues";
        cellB4.alignment = { vertical: "middle", horizontal: "right" };
        cellB4.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        cellB4.border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        /////////////////////////////
        // build Level 1 title
        /////////////////////////////

        const level1Row = worksheet.getRow(5);
        level1Row.height = 27; // actual is 36

        const cellA5 = worksheet.getCell("A5");
        cellA5.value = "Level 1 - the most essential issues to address";
        cellA5.alignment = { vertical: "middle", horizontal: "left" };
        cellA5.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellA5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        const cellB5 = worksheet.getCell("B5");
        cellB5.value = level1Counts[0]; // total Level 1 issues
        cellB5.alignment = { vertical: "middle", horizontal: "right" };
        cellB5.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellB5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        //       Level 1 Violation title
        const level1ViolationRow = worksheet.getRow(6);
        level1ViolationRow.height = 18; // target is 21

        const cellA6 = worksheet.getCell("A6");
        cellA6.value = "     Violation";
        cellA6.alignment = { vertical: "middle", horizontal: "left" };
        cellA6.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        cellA6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        level1ViolationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        const cellB6 = worksheet.getCell("B6");
        cellB6.value = level1Counts[1]; // total level 1 violations
        cellB6.alignment = { vertical: "middle", horizontal: "right" };
        cellB6.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        cellB6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        level1ViolationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 1 Violation Rows

        // build rows
        let rowArray = [];

        for (const property in level1VrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level1VrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        let rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            // row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            // row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });


        // Level 1 Needs review title
        const level1NeedsReviewRow = worksheet.addRow(["", 0]);
        level1NeedsReviewRow.height = 18; // target is 21

        level1NeedsReviewRow.getCell(1).value = "     Needs review";
        level1NeedsReviewRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level1NeedsReviewRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level1NeedsReviewRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        level1NeedsReviewRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level1NeedsReviewRow.getCell(2).value = level1Counts[2]; // total level 1 needs review
        level1NeedsReviewRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level1NeedsReviewRow.getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level1NeedsReviewRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        level1NeedsReviewRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 1 Needs review Rows

        // build rows
        rowArray = [];

        for (const property in level1NRrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level1NRrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = [];

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });

        // Level 1 Recommendation title
        const level1RecommendationRow = worksheet.addRow(["", 0]);
        level1RecommendationRow.height = 18; // target is 21

        level1RecommendationRow.getCell(1).value = "     Recommendation";
        level1RecommendationRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level1RecommendationRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level1RecommendationRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        level1RecommendationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level1RecommendationRow.getCell(2).value = level1Counts[3]; // total level 1 recommendations
        level1RecommendationRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level1RecommendationRow.getCell(2).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
        level1RecommendationRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        level1RecommendationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };


        // Level 1 Recommendation Rows

        // build rows
        rowArray = [];

        for (const property in level1RrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level1RrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = [];

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });


        /////////////////////////////
        // build Level 2 title
        /////////////////////////////

        const level2Row = worksheet.addRow(["", 0]);
        level2Row.height = 27; // actual is 36

        level2Row.getCell(1).value = "Level 2 - the next most important issues";
        level2Row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level2Row.getCell(1).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        level2Row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        level2Row.getCell(2).value = level2Counts[0]; // total Level 2 issues
        level2Row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level2Row.getCell(2).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        level2Row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        //       Level 2 Violation title
        const level2ViolationRow = worksheet.addRow(["", 0]);
        level2ViolationRow.height = 18; // target is 21

        level2ViolationRow.getCell(1).value = "     Violation";
        level2ViolationRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level2ViolationRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level2ViolationRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        level2ViolationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level2ViolationRow.getCell(2).value = level2Counts[1]; // total level 2 violations
        level2ViolationRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level2ViolationRow.getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level2ViolationRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        level2ViolationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 2 Violation Rows

        // build rows
        rowArray = [];

        for (const property in level2VrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level2VrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });


        // Level 2 Needs review title
        const level2NeedsReviewRow = worksheet.addRow(["", 0]);
        level2NeedsReviewRow.height = 18; // target is 21

        level2NeedsReviewRow.getCell(1).value = "     Needs review";
        level2NeedsReviewRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level2NeedsReviewRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level2NeedsReviewRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        level2NeedsReviewRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level2NeedsReviewRow.getCell(2).value = level2Counts[2]; // total level 2 needs review
        level2NeedsReviewRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level2NeedsReviewRow.getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level2NeedsReviewRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        level2NeedsReviewRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 2 Needs review Rows

        // build rows
        rowArray = [];

        for (const property in level2NRrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level2NRrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = [];

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });

        // Level 2 Recommendation title
        const level2RecommendationRow = worksheet.addRow(["", 0]);
        level2RecommendationRow.height = 18; // target is 21

        level2RecommendationRow.getCell(1).value = "     Recommendation";
        level2RecommendationRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level2RecommendationRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level2RecommendationRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        level2RecommendationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level2RecommendationRow.getCell(2).value = level2Counts[3]; // total level 2 recommendations
        level2RecommendationRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level2RecommendationRow.getCell(2).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
        level2RecommendationRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        level2RecommendationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 2 Recommendation Rows

        // build rows
        rowArray = [];

        for (const property in level2RrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level2RrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = [];

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });

        /////////////////////////////
        // build Level 3 title
        /////////////////////////////

        const level3Row = worksheet.addRow(["", 0]);
        level3Row.height = 27; // actual is 36

        level3Row.getCell(1).value = "Level 3 - necessary to meet requirements";
        level3Row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level3Row.getCell(1).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        level3Row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        level3Row.getCell(2).value = level3Counts[0]; // total Level 3 issues
        level3Row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level3Row.getCell(2).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        level3Row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        //       Level 3 Violation title
        const level3ViolationRow = worksheet.addRow(["", 0]);
        level3ViolationRow.height = 18; // target is 21

        level3ViolationRow.getCell(1).value = "     Violation";
        level3ViolationRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level3ViolationRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level3ViolationRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        level3ViolationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level3ViolationRow.getCell(2).value = level3Counts[1]; // total level 3 violations
        level3ViolationRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level3ViolationRow.getCell(2).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
        level3ViolationRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        level3ViolationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 3 Violation Rows

        // build rows
        rowArray = [];

        for (const property in level3VrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level3VrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });


        // Level 3 Needs review title
        const level3NeedsReviewRow = worksheet.addRow(["", 0]);
        level3NeedsReviewRow.height = 18; // target is 21

        level3NeedsReviewRow.getCell(1).value = "     Needs review";
        level3NeedsReviewRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level3NeedsReviewRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level3NeedsReviewRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        level3NeedsReviewRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level3NeedsReviewRow.getCell(2).value = level3Counts[2]; // total level 3 needs review
        level3NeedsReviewRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level3NeedsReviewRow.getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level3NeedsReviewRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        level3NeedsReviewRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 3 Needs review Rows

        // build rows
        rowArray = [];

        for (const property in level3NRrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level3NRrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = [];

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });

        // Level 3 Recommendation title
        const level3RecommendationRow = worksheet.addRow(["", 0]);
        level3RecommendationRow.height = 18; // target is 21

        level3RecommendationRow.getCell(1).value = "     Recommendation";
        level3RecommendationRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level3RecommendationRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level3RecommendationRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        level3RecommendationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level3RecommendationRow.getCell(2).value = level3Counts[3]; // total level 3 recommendations
        level3RecommendationRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level3RecommendationRow.getCell(2).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
        level3RecommendationRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        level3RecommendationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 3 Recommendation Rows

        // build rows
        rowArray = [];

        for (const property in level3RrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level3RrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = [];

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });


        /////////////////////////////
        // build Level 4 title
        /////////////////////////////

        const level4Row = worksheet.addRow(["", 0]);
        level4Row.height = 27; // actual is 36

        level4Row.getCell(1).value = "Level 4 - further recommended improvements to accessibility";
        level4Row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level4Row.getCell(1).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        level4Row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        level4Row.getCell(2).value = level4Counts[0]; // total Level 4 issues
        level4Row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level4Row.getCell(2).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        level4Row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        //       Level 4 Violation title
        const level4ViolationRow = worksheet.addRow(["", 0]);
        level4ViolationRow.height = 18; // target is 21

        level4ViolationRow.getCell(1).value = "     Violation";
        level4ViolationRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level4ViolationRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level4ViolationRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        level4ViolationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level4ViolationRow.getCell(2).value = level4Counts[1]; // total level 4 violations
        level4ViolationRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level4ViolationRow.getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level4ViolationRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        level4ViolationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 4 Violation Rows

        // build rows
        rowArray = [];

        for (const property in level4VrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level4VrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });


        // Level 4 Needs review title
        const level4NeedsReviewRow = worksheet.addRow(["", 0]);
        level4NeedsReviewRow.height = 18; // target is 21

        level4NeedsReviewRow.getCell(1).value = "     Needs review";
        level4NeedsReviewRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level4NeedsReviewRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level4NeedsReviewRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        level4NeedsReviewRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level4NeedsReviewRow.getCell(2).value = level4Counts[2]; // total level 4 needs review
        level4NeedsReviewRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level4NeedsReviewRow.getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level4NeedsReviewRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        level4NeedsReviewRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 4 Needs review Rows

        // build rows
        rowArray = [];

        for (const property in level4NRrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level4NRrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = [];

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });

        // Level 4 Recommendation title
        const level4RecommendationRow = worksheet.addRow(["", 0]);
        level4RecommendationRow.height = 18; // target is 21

        level4RecommendationRow.getCell(1).value = "     Recommendation";
        level4RecommendationRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        level4RecommendationRow.getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        level4RecommendationRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        level4RecommendationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        level4RecommendationRow.getCell(2).value = level4Counts[3]; // total level 4 recommendations
        level4RecommendationRow.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
        level4RecommendationRow.getCell(2).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
        level4RecommendationRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        level4RecommendationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 4 Recommendation Rows

        // build rows
        rowArray = [];

        for (const property in level4RrowValues) {
            let row = ["     " + `${property}`, parseInt(`${level4RrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        rows = [];

        rows = worksheet.addRows(rowArray);

        rows.forEach((row: any) => {
            row.height = 14;
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
            row.getCell(2).alignment = { vertical: "middle", horizontal: "right" };
            row.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            //row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            //row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
            row.getCell(1).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
            };
            row.getCell(2).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            };
        });

    }

    private createIssuesSheet(storedScans: IStoredReportMeta[]) {
        const worksheet = this.workbook.addWorksheet("Issues");

        // build rows
        let rowArray = [];
        for (const storedScan of storedScans) {
            const myStoredData = storedScan.storedScanData;
            for (let i = 0; i < myStoredData.length; i++) {
                let row = [myStoredData[i][0], myStoredData[i][1], storedScan.label,
                myStoredData[i][3], myStoredData[i][4], Number.isNaN(myStoredData[i][5]) ? "n/a" : myStoredData[i][5],
                myStoredData[i][6], Number.isNaN(myStoredData[i][5]) ? "n/a" : myStoredData[i][7], myStoredData[i][8],
                myStoredData[i][9], myStoredData[i][10], myStoredData[i][11],
                myStoredData[i][12], myStoredData[i][13]
                ];
                rowArray.push(row);
            }
        }

        // column widths
        const colWidthData : Array<{
            col: string,
            width: number,
            alignment: Partial<ExcelJS.Alignment>
        }> = [
            { col: 'A', width: 18.0, alignment: { vertical: "middle", horizontal: "left" } },
            { col: 'B', width: 20.5, alignment: { vertical: "middle", horizontal: "left" } },
            { col: 'C', width: 21.0, alignment: { vertical: "middle", horizontal: "center" } },
            { col: 'D', width: 18.5, alignment: { vertical: "middle", horizontal: "left" } },
            { col: 'E', width: 17.0, alignment: { vertical: "middle", horizontal: "center" } },
            { col: 'F', width: 17.17, alignment: { vertical: "middle", horizontal: "center" } },
            { col: 'G', width: 17.17, alignment: { vertical: "middle", horizontal: "left" } },
            { col: 'H', width: 17.17, alignment: { vertical: "middle", horizontal: "center" } },
            { col: 'I', width: 17.17, alignment: { vertical: "middle", horizontal: "left" } },
            { col: 'J', width: 17.17, alignment: { vertical: "middle", horizontal: "left" } },
            { col: 'K', width: 14.00, alignment: { vertical: "middle", horizontal: "center" } },
            { col: 'L', width: 17.17, alignment: { vertical: "middle", horizontal: "left" } },
            { col: 'M', width: 43.00, alignment: { vertical: "middle", horizontal: "left" } },
            { col: 'N', width: 17.17, alignment: { vertical: "middle", horizontal: "fill" } },
        ]

        for (let i = 0; i < 14; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
            worksheet.getColumn(colWidthData[i].col).alignment = colWidthData[i].alignment;
        }

        // set font and alignment for the header cells
        for (let i = 1; i < 15; i++) {
            worksheet.getRow(1).getCell(i).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            worksheet.getRow(1).getCell(i).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
            worksheet.getRow(1).getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };
            worksheet.getRow(1).getCell(i).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
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
                { name: 'Page title', filterButton: true },
                { name: 'Page URL', filterButton: true },
                { name: 'Scan label', filterButton: true },
                { name: 'Issue ID', filterButton: true },
                { name: 'Issue type', filterButton: true },
                { name: 'Toolkit level', filterButton: true },
                { name: 'Checkpoint', filterButton: true },
                { name: 'WCAG level', filterButton: true },
                { name: 'Rule', filterButton: true },
                { name: 'Issue', filterButton: true },
                { name: 'Element', filterButton: true },
                { name: 'Code', filterButton: true },
                { name: 'Xpath', filterButton: true },
                { name: 'Help', filterButton: true },

            ],
            rows: rowArray
        });

        for (let i = 2; i <= rowArray.length + 1; i++) {
            worksheet.getRow(i).height = 14;
            for (let j = 1; j <= 14; j++) {
                worksheet.getRow(i).getCell(j).border = {
                    top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
                }
            }
        }
    }

    private createDefinitionsSheet() {

        const worksheet = this.workbook.addWorksheet("Definition of fields");

        // "Definition of fields" title
        worksheet.mergeCells('A1', "B1");

        const titleRow = worksheet.getRow(1);
        titleRow.height = 36; // actual is 48

        titleRow.getCell(1).value = "Definition of fields";
        titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        titleRow.getCell(1).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 20 };
        titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        const colWidthData = [
            { col: 'A', width: 41.51 }, // note .84 added to actual width
            { col: 'B', width: 119.51 },
        ]

        for (let i = 0; i < 2; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }

        // blank row
        worksheet.mergeCells('A2', "B2");
        const blankRow = worksheet.getRow(2);
        blankRow.height = 12; // actual is 16

        // "Scan summary and Issue summary" title
        worksheet.mergeCells('A3', "B3");

        const summaryRow = worksheet.getRow(3);
        summaryRow.height = 20; // actual is 26.75

        summaryRow.getCell(1).value = "Scan summary and Issue summary";
        summaryRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        summaryRow.getCell(1).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        summaryRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        // row 4 Field / Definition
        const row4 = worksheet.getRow(4);
        row4.height = 16; // actual is 

        row4.getCell(1).value = "Field";
        row4.getCell(2).value = "Definition";
        row4.getCell(1).alignment = row4.getCell(2).alignment = { vertical: "middle", horizontal: "left" };
        row4.getCell(1).font = row4.getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 16 };
        row4.getCell(1).fill = row4.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCC0DA' } };
        row4.getCell(1).border = row4.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // rows 5-13

        // set row height for rows 5-13
        for (let i = 5; i < 14; i++) {
            worksheet.getRow(i).height = 12; // results in a row height of 16
        }

        let rowData = [
            { key1: 'Page', key2: 'Identifies the page or html file that was scanned.' },
            { key1: 'Scan label', key2: 'Label for the scan. Default values can be edited in the Accessibility Checker before saving this report, or programmatically assigned in automated testing.' },
            { key1: 'Base scan', key2: 'Scan label for a previous scan against which this scan was compared. Only new issues are reported when a base scan is used.' },
            { key1: 'Violations', key2: 'Accessibility failures that need to be corrected.' },
            { key1: 'Needs review', key2: 'Issues that may not be a violation. These need a manual review to identify whether there is an accessibility problem.' },
            { key1: 'Recommendations', key2: 'Opportunities to apply best practices to further improve accessibility.' },
            { key1: '% elements without violations', key2: 'Percentage of elements on the page that had no violations found.' },
            { key1: '% elements without violations or items to review', key2: 'Percentage of elements on the page that had no violations found and no items to review.' },
            { key1: 'Level 1,2,3', key2: 'Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan/overview#pace-of-completion for details.' }
        ];

        for (let i = 5; i < 14; i++) {
            worksheet.getRow(i).getCell(1).font = worksheet.getRow(i).getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            worksheet.getRow(i).getCell(1).alignment = worksheet.getRow(i).getCell(2).alignment = { horizontal: "left" };

        }
        for (let i = 5; i < 14; i++) {
            worksheet.getRow(i).getCell(1).value = rowData[i - 5].key1; worksheet.getRow(i).getCell(2).value = rowData[i - 5].key2;
        }

        // "Scan summary and Issue summary" title
        worksheet.mergeCells('A14', "B14");

        const issuesRow = worksheet.getRow(14);
        issuesRow.height = 20; // actual is 26.75

        issuesRow.getCell(1).value = "Issues";
        issuesRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        issuesRow.getCell(1).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        issuesRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        // row 15 Field / Definition
        const row15 = worksheet.getRow(15);
        row15.height = 16; // actual is 

        row15.getCell(1).value = "Field";
        row15.getCell(2).value = "Definition";
        row15.getCell(1).alignment = row15.getCell(2).alignment = { vertical: "middle", horizontal: "left" };
        row15.getCell(1).font = row15.getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 16 };
        row15.getCell(1).fill = row15.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCC0DA' } };
        row15.getCell(1).border = row15.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // rows 16-28

        // set row height for rows 16-28
        for (let i = 16; i < 29; i++) {
            worksheet.getRow(i).height = 12; // results in a row height of 16
        }

        rowData = [];

        rowData = [
            { key1: 'Page', key2: 'Identifies the page or html file that was scanned.' },
            { key1: 'Scan label', key2: 'Label for the scan. Default values can be edited in the Accessibility Checker before saving this report, or programmatically assigned in automated testing.' },
            { key1: 'Issue ID', key2: 'Identifier for this issue within this page. Rescanning the same page will produce the same issue ID. ' },
            { key1: 'Issue type', key2: 'Violation, needs review, or recommendation' },
            { key1: 'Toolkit level', key2: '1, 2 or 3. Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan/overview#pace-of-completion for details' },
            { key1: 'Checkpoint', key2: 'Web Content Accessibility Guidelines (WCAG) checkpoints this issue falls into.' },
            { key1: 'WCAG level', key2: 'A, AA or AAA. WCAG level for this issue.' },
            { key1: 'Rule', key2: 'Name of the accessibility test rule that detected this issue.' },
            { key1: 'Issue', key2: 'Message describing the issue.' },
            { key1: 'Element', key2: 'Type of HTML element where the issue is found.' },
            { key1: 'Code', key2: 'Actual HTML element where the issue is found.' },
            { key1: 'Xpath', key2: 'Xpath of the HTML element where the issue is found.' },
            { key1: 'Help', key2: 'Link to a more detailed description of the issue and suggested solutions.' },
        ];

        for (let i = 16; i < 29; i++) {
            worksheet.getRow(i).getCell(1).font = worksheet.getRow(i).getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            worksheet.getRow(i).getCell(1).alignment = worksheet.getRow(i).getCell(2).alignment = { horizontal: "left" };

        }
        for (let i = 16; i < 29; i++) {
            worksheet.getRow(i).getCell(1).value = rowData[i - 16].key1; worksheet.getRow(i).getCell(2).value = rowData[i - 16].key2;
        }

    }

    private static countDuplicatesInArray(array: string[]) {
        let count : {
            [key: string]: number
        } = {};
        for (const item of array) {
            count[item] = (count[item] || 0) + 1;
        }
        return count;
    }   
}