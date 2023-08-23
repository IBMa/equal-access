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

import { IConfigInternal, eRuleLevel } from "../config/IConfig.js";
import { CompressedReport, IRuleset, eRuleConfidence, eToolkitLevel } from "../engine/IReport.js";
import { GenSummReturn, IReporter, ReporterManager } from "./ReporterManager.js";
import * as ExcelJS from "exceljs";

type PolicyInfo = {
    tkLevels: eToolkitLevel[]
    wcagLevels: string[]
    cps: string[]
};

function dropDupes<T>(arr: T[]): T[] {
    let dupes = {}
    return arr.filter(item => {
        if (item.toString() in dupes) {
            return false;
        } {
            return dupes[item.toString()] = true;
        }
    })
}
export class ACReporterXLSX implements IReporter {
    public name(): string {
        return "xlsx";
    }

    public generateReport(_reportData): { reportPath: string, report: string } | void {
    }

    public async generateSummary(config: IConfigInternal, rulesets: IRuleset[], endReport: number, summaryData: CompressedReport[]): Promise<GenSummReturn> {
        let storedReport = ReporterManager.uncompressReport(summaryData[0])
        let cfgRulesets = rulesets.filter(rs => config.policies.includes(rs.id));
        let policyInfo: {
            [ruleId: string]: PolicyInfo
        } = {};
        for (const rs of cfgRulesets) {
            for (const cp of rs.checkpoints) {
                for (const rule of cp.rules) {
                    policyInfo[rule.id] = policyInfo[rule.id] || {
                        tkLevels: [],
                        wcagLevels: [],
                        cps: []
                    }
                    policyInfo[rule.id].tkLevels.push(rule.toolkitLevel);
                    policyInfo[rule.id].wcagLevels.push(cp.wcagLevel);
                    policyInfo[rule.id].cps.push(`${cp.num}`);
                }
            }
        }
        for (const ruleId in policyInfo) {
            policyInfo[ruleId].tkLevels = dropDupes(policyInfo[ruleId].tkLevels);
            policyInfo[ruleId].cps = dropDupes(policyInfo[ruleId].cps);
            policyInfo[ruleId].wcagLevels = dropDupes(policyInfo[ruleId].wcagLevels);
            policyInfo[ruleId].tkLevels.sort();
            policyInfo[ruleId].cps.sort();
            policyInfo[ruleId].wcagLevels.sort();
        }

        // const buffer: any = await workbook.xlsx.writeBuffer();
        let startScan = new Date(storedReport.engineReport.summary.startScan);
        let reportFilename = `results_${startScan.toISOString()}.xlsx`;
        if (config.outputFilenameTimestamp === false) {
            reportFilename = `results.xlsx`;
        }
        return {
            summaryPath: reportFilename,
            summary: async (filename?: string) => {
                // @ts-ignore
                const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename, useStyles: true });
//                const workbook = new ExcelJS.Workbook({ useStyles: true });
                ACReporterXLSX.createOverviewSheet(config, summaryData, workbook);
                ACReporterXLSX.createScanSummarySheet(config, summaryData, workbook);
                ACReporterXLSX.createIssueSummarySheet(config, policyInfo, summaryData, workbook);
                ACReporterXLSX.createIssuesSheet(config, policyInfo, summaryData, workbook);
                ACReporterXLSX.createDefinitionsSheet(workbook);
                workbook.commit();
            }
        }
    }

    private static createOverviewSheet(config: IConfigInternal, compressedScans: CompressedReport[], workbook: ExcelJS.Workbook) {
        let violations = 0;
        let needsReviews = 0;
        let recommendations = 0;
        let archived = 0;
        let totalIssues = 0;

        let startScan = 0;
        // BIG QUESTION: is report 
        //               1. for current scan (from menu)
        //               2. all stored scans (from menu)
        //               3. selected stored scans (from scan manager)
        for (const compressedScan of compressedScans) {
            let storedScan = ReporterManager.uncompressReport(compressedScan)
            if (startScan === 0) startScan = storedScan.engineReport.summary.startScan;
            const counts = storedScan.engineReport.summary.counts;
            violations += counts.violation;
            needsReviews += counts.potentialviolation + counts.manual;
            recommendations += counts.recommendation + counts.potentialrecommendation;
            archived += counts.ignored;
        }
        totalIssues = violations + needsReviews + recommendations + archived;


        const worksheet = workbook.addWorksheet("Overview");

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
        ]

        for (let i = 0; i < 4; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }

        // note except for Report Date this is the same for all scans
        const rowData: Array<{ key1: string, key2: string }> = [
            { key1: 'Tool:', key2: 'IBM Equal Access Accessibility Checker' },
            // {key1: 'Version:', key2: "chrome.runtime.getManifest().version"},
            { key1: 'Version:', key2: config.toolID },
            //@ts-ignore
            // {key1: 'Rule set:', key2: (theCurrentScan.ruleSet === "Latest Deployment") ? archives[1].name : theCurrentScan.ruleSet },
            { key1: 'Rule set:', key2: config.ruleArchiveLabel },
            { key1: 'Guidelines:', key2: config.policies.join(", ") },
            { key1: 'Report date:', key2: new Date(startScan).toLocaleString() }, // do we need to get actual date?
            { key1: 'Scans:', key2: "" + compressedScans.length }, // *** NEED TO FIX FOR selected
            // { key1: 'Pages:', key2: "" }
        ];

        for (let idx = 0; idx < rowData.length; ++idx) {
            worksheet.mergeCells(`B${idx + 2}`, `E${idx + 2}`);

            let i = idx + 2;
            worksheet.getRow(i).height = 12; // results in a row height of 16
            worksheet.getRow(i).getCell(1).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            worksheet.getRow(i).getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            worksheet.getRow(i).getCell(1).alignment = { horizontal: "left" };
            worksheet.getRow(i).getCell(2).alignment = { horizontal: "left" };
            // if (i == 7) {
            //     worksheet.getRow(i).getCell(1).alignment = { vertical: "top" };
            //     worksheet.getRow(i).getCell(2).alignment = { wrapText: true };
            // }

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
        const cellE12 = worksheet.getCell('E12'); cellE12.value = "Archived";

        const cellObjects1 = [cellA12, cellB12, cellC12, cellD12, cellE12];

        for (let i = 0; i < cellObjects1.length; i++) {
            cellObjects1[i].alignment = { vertical: "middle", horizontal: "center" };
            if (i == 1 || i == 2 || i == 3 || i === 4) {
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


        // Scans info Values
        worksheet.getRow(13).height = 27; // actual height is

        const cellA13 = worksheet.getCell('A13'); cellA13.value = totalIssues;
        const cellB13 = worksheet.getCell('B13'); cellB13.value = violations;
        const cellC13 = worksheet.getCell('C13'); cellC13.value = needsReviews;
        const cellD13 = worksheet.getCell('D13'); cellD13.value = recommendations;
        const cellE13 = worksheet.getCell('E13'); cellE13.value = archived;

        const cellObjects2 = [cellA13, cellB13, cellC13, cellD13, cellE13];

        for (let i = 0; i < cellObjects2.length; i++) {
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

    private static createScanSummarySheet(config: IConfigInternal, compressedScans: CompressedReport[], workbook: ExcelJS.Workbook) {

        const worksheet = workbook.addWorksheet("Scan summary");

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
        ]

        for (let i = 0; i < 9; i++) {
            worksheet.getColumn(colWidthData[i].col).width = colWidthData[i].width;
        }

        const cellA1 = worksheet.getCell('A1'); cellA1.value = "Page title";
        const cellB1 = worksheet.getCell('B1'); cellB1.value = "Page url";
        const cellC1 = worksheet.getCell('C1'); cellC1.value = "Scan label";

        const cellObjects1 = [cellA1, cellB1, cellC1];

        for (let i = 0; i < cellObjects1.length; i++) {
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

        const cellD1 = worksheet.getCell('D1'); cellD1.value = "Violations";
        const cellE1 = worksheet.getCell('E1'); cellE1.value = "Needs review";
        const cellF1 = worksheet.getCell('F1'); cellF1.value = "Recommendations";
        const cellG1 = worksheet.getCell('G1'); cellG1.value = "Archived";
        const cellH1 = worksheet.getCell('H1'); cellH1.value = "% elements without violations";
        const cellI1 = worksheet.getCell('I1'); cellI1.value = "% elements without violations or items to review";

        const cellObjects2 = [cellD1, cellE1, cellF1, cellG1, cellH1, cellI1];

        for (let i = 0; i < cellObjects2.length; i++) {
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

        cellD1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4AAAF' } };
        cellE1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4E08A' } };
        cellF1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF96A9D7' } };
        cellG1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cellH1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        cellI1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

        for (const compressedScan of compressedScans) {
            let storedScan = ReporterManager.uncompressReport(compressedScan);
            let counts = storedScan.engineReport.summary.counts;
            let row = worksheet.addRow([
                storedScan.pageTitle,
                storedScan.engineReport.summary.URL,
                storedScan.label,
                counts.violation,
                counts.potentialviolation + counts.manual,
                counts.recommendation + counts.potentialrecommendation,
                counts.ignored,
                (100 * (counts.elements - counts.elementsViolation) / counts.elements).toFixed(0),
                (100 * (counts.elements - counts.elementsViolationReview) / counts.elements).toFixed(0),
            ]);
            row.height = 37; // actual height is
            for (let i = 1; i < 4; i++) {
                row.getCell(i).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
                row.getCell(i).font = { name: "Calibri", color: { argb: "00000000" }, size: 12 };
            }
            for (let i = 4; i < 10; i++) {
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
            row.commit();
        }
        worksheet.commit();
    }

    private static buildIssueSummaryLevel(worksheet: ExcelJS.Worksheet, fillColor: string, title: string, levelCount: number, levelrowValues) {
        //       Level 1 Violation title
        const level1ViolationRow = worksheet.addRow(["", 0]);
        level1ViolationRow.height = 18; // target is 21

        const cellA6 = level1ViolationRow.getCell(1);
        cellA6.value = `     ${title}`;
        cellA6.alignment = { vertical: "middle", horizontal: "left" };
        cellA6.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        cellA6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        level1ViolationRow.getCell(1).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        };

        const cellB6 = level1ViolationRow.getCell(2);
        cellB6.value = levelCount; // total level violations
        cellB6.alignment = { vertical: "middle", horizontal: "right" };
        cellB6.font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
        cellB6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        level1ViolationRow.getCell(2).border = {
            top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            // left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
            right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        };

        // Level 1 Violation Rows

        // build rows
        let rowArray: any = [];
        // let row:any =[];
        for (const property in levelrowValues) {
            let row: any = ["     " + `${property}`, parseInt(`${levelrowValues[property]}`)
            ];
            rowArray.push(row);
        }

        // sort array according to count
        rowArray.sort((a, b) => (a[1] < b[1]) ? 1 : -1);

        // add array of rows

        for (const rowInfo of rowArray) {
            const row = worksheet.addRow(rowInfo);
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
            row.commit();
        }
    }

    private static buildIssueSummaryTKLevel(worksheet: ExcelJS.Worksheet, title: string, levelCounts: number[], levelVrowValues, levelNRrowValues, levelRrowValues, levelArowValues) {
        /////////////////////////////
        // build Level title
        /////////////////////////////

        const level1Row = worksheet.addRow(["", 0]);
        level1Row.height = 27; // actual is 36

        const cellA5 = level1Row.getCell(1);
        cellA5.value = title;
        cellA5.alignment = { vertical: "middle", horizontal: "left" };
        cellA5.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellA5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        const cellB5 = level1Row.getCell(2);
        cellB5.value = levelCounts[0]; // total Level 1 issues
        cellB5.alignment = { vertical: "middle", horizontal: "right" };
        cellB5.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 16 };
        cellB5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        ACReporterXLSX.buildIssueSummaryLevel(worksheet, "FFE4AAAF", "Violation", levelCounts[1], levelVrowValues);
        ACReporterXLSX.buildIssueSummaryLevel(worksheet, "FFF4E08A", "Needs review", levelCounts[2], levelNRrowValues);
        ACReporterXLSX.buildIssueSummaryLevel(worksheet, "FF96A9D7", "Recommendation", levelCounts[3], levelRrowValues);
        if (levelCounts[4] > 0) {
            ACReporterXLSX.buildIssueSummaryLevel(worksheet, "FFCCCCCC", "Archived", levelCounts[4], levelArowValues);
        }
    }

    private static createIssueSummarySheet(config: IConfigInternal, policyInfo: { [ruleId: string]: PolicyInfo }, compressedScans: CompressedReport[], workbook: ExcelJS.Workbook) {

        let violations = 0;
        let needsReviews = 0;
        let recommendations = 0;
        let archive = 0;
        let totalIssues = 0;
        for (let i = 0; i < compressedScans.length; i++) {
            let storedScan = ReporterManager.uncompressReport(compressedScans[i]);
            let counts = storedScan.engineReport.summary.counts;
            violations += counts.violation;
            needsReviews += counts.potentialviolation + counts.manual;
            recommendations += counts.recommendation + counts.potentialrecommendation;
            archive += counts.ignored;
        }
        totalIssues = violations + needsReviews + recommendations;

        // counts
        let level1Counts = [0, 0, 0, 0, 0]; // level 1 total issues, violations, needs reviews, recommendations
        let level2Counts = [0, 0, 0, 0, 0];
        let level3Counts = [0, 0, 0, 0, 0];
        let level4Counts = [0, 0, 0, 0, 0];
        let level1V: any = []; let level2V: any = []; let level3V: any = []; let level4V: any = []
        let level1NR: any = []; let level2NR: any = []; let level3NR: any = []; let level4NR: any = [];
        let level1R: any = []; let level2R: any = []; let level3R: any = []; let level4R: any = [];
        let level1A: any = []; let level2A: any = []; let level3A: any = []; let level4A: any = []
        for (const compressedScan of compressedScans) {
            let scan = ReporterManager.uncompressReport(compressedScan);
            for (const issue of scan.engineReport.results) {
                if (!(issue.ruleId in policyInfo)) {
                    policyInfo[issue.ruleId] = {
                        tkLevels: [],
                        wcagLevels: [],
                        cps: []
                    }
                }
                let levelCounts, levelV, levelNR, levelR, levelA;

                const issuePolicyInfo = policyInfo[issue.ruleId];
                if (issuePolicyInfo.tkLevels.includes(eToolkitLevel.LEVEL_ONE)) {
                    levelCounts = level1Counts;
                    levelV = level1V;
                    levelNR = level1NR;
                    levelR = level1R;
                    levelA = level1A;
                } else if (issuePolicyInfo.tkLevels.includes(eToolkitLevel.LEVEL_TWO)) {
                    levelCounts = level2Counts;
                    levelV = level2V;
                    levelNR = level2NR;
                    levelR = level2R;
                    levelA = level2A;
                } else if (issuePolicyInfo.tkLevels.includes(eToolkitLevel.LEVEL_THREE)) {
                    levelCounts = level3Counts;
                    levelV = level3V;
                    levelNR = level3NR;
                    levelR = level3R;
                    levelA = level3A;
                } else if (issuePolicyInfo.tkLevels.includes(eToolkitLevel.LEVEL_FOUR)) {
                    levelCounts = level4Counts;
                    levelV = level4V;
                    levelNR = level4NR;
                    levelR = level4R;
                    levelA = level4A;
                }
                if (issue.value[1] !== eRuleConfidence.PASS) {
                    ++levelCounts[0];
                }
                if (issue.ignored) {
                    ++levelCounts[4];
                    levelA.push(issue.message.substring(0, 32767));
                } else if (issue.level === eRuleLevel.violation) {
                    ++levelCounts[1];
                    levelV.push(issue.message.substring(0, 32767));
                } else if (issue.level === eRuleLevel.potentialviolation || issue.level === eRuleLevel.manual) {
                    ++levelCounts[2];
                    levelNR.push(issue.message.substring(0, 32767));
                } else if (issue.level === eRuleLevel.recommendation || issue.level === eRuleLevel.potentialrecommendation) {
                    ++levelCounts[3];
                    levelR.push(issue.message.substring(0, 32767));
                }
            }
        }

        // @ts-ignore
        let level1VrowValues: { [index: string]: any } = this.countDuplicatesInArray(level1V); // note this returns an object
        // @ts-ignore
        let level1NRrowValues: { [index: string]: any } = this.countDuplicatesInArray(level1NR);
        // @ts-ignore
        let level1RrowValues: { [index: string]: any } = this.countDuplicatesInArray(level1R);
        // @ts-ignore
        let level1ArowValues: { [index: string]: any } = this.countDuplicatesInArray(level1A);

        // @ts-ignore
        let level2VrowValues: { [index: string]: any } = this.countDuplicatesInArray(level2V); // note this returns an object
        // @ts-ignore
        let level2NRrowValues: { [index: string]: any } = this.countDuplicatesInArray(level2NR);
        // @ts-ignore
        let level2RrowValues: { [index: string]: any } = this.countDuplicatesInArray(level2R);
        // @ts-ignore
        let level2ArowValues: { [index: string]: any } = this.countDuplicatesInArray(level2A);

        // @ts-ignore
        let level3VrowValues: { [index: string]: any } = this.countDuplicatesInArray(level3V); // note this returns an object
        // @ts-ignore
        let level3NRrowValues: { [index: string]: any } = this.countDuplicatesInArray(level3NR);
        // @ts-ignore
        let level3RrowValues: { [index: string]: any } = this.countDuplicatesInArray(level3R);
        // @ts-ignore
        let level3ArowValues: { [index: string]: any } = this.countDuplicatesInArray(level3A);

        // @ts-ignore
        let level4VrowValues: { [index: string]: any } = this.countDuplicatesInArray(level4V); // note this returns an object
        // @ts-ignore
        let level4NRrowValues: { [index: string]: any } = this.countDuplicatesInArray(level4NR);
        // @ts-ignore
        let level4RrowValues: { [index: string]: any } = this.countDuplicatesInArray(level4R);
        // @ts-ignore
        let level4ArowValues: { [index: string]: any } = this.countDuplicatesInArray(level4A);



        const worksheet = workbook.addWorksheet("Issue summary");

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

        ACReporterXLSX.buildIssueSummaryTKLevel(worksheet, "Level 1 - the most essential issues to address", level1Counts, level1VrowValues, level1NRrowValues, level1RrowValues, level1ArowValues);
        ACReporterXLSX.buildIssueSummaryTKLevel(worksheet, "Level 2 - the next most important issues", level2Counts, level2VrowValues, level2NRrowValues, level2RrowValues, level2ArowValues);
        ACReporterXLSX.buildIssueSummaryTKLevel(worksheet, "Level 3 - necessary to meet requirements", level3Counts, level3VrowValues, level3NRrowValues, level3RrowValues, level3ArowValues);
        ACReporterXLSX.buildIssueSummaryTKLevel(worksheet, "Level 4 - further recommended improvements to accessibility", level4Counts, level4VrowValues, level4NRrowValues, level4RrowValues, level4ArowValues);
        worksheet.commit();
    }

    private static createIssuesSheet(config: IConfigInternal, policyInfo: { [ruleId: string]: PolicyInfo }, compressedScans: CompressedReport[], workbook: ExcelJS.Workbook) {
        const valueMap: { [key: string]: { [key2: string]: string } } = {
            "VIOLATION": {
                "POTENTIAL": "Needs review",
                "FAIL": "Violation",
                "PASS": "Pass",
                "MANUAL": "Needs review"
            },
            "RECOMMENDATION": {
                "POTENTIAL": "Recommendation",
                "FAIL": "Recommendation",
                "PASS": "Pass",
                "MANUAL": "Recommendation"
            },
            "INFORMATION": {
                "POTENTIAL": "Needs review",
                "FAIL": "Violation",
                "PASS": "Pass",
                "MANUAL": "Recommendation"
            }
        };

        const worksheet = workbook.addWorksheet("Issues");

        // build rows
        let rowArray: any = [];
        for (const compressedScan of compressedScans) {
            let storedScan = ReporterManager.uncompressReport(compressedScan);
            for (const item of storedScan.engineReport.results) {
                if (!(item.ruleId in policyInfo)) {
                    policyInfo[item.ruleId] = {
                        tkLevels: [],
                        wcagLevels: [],
                        cps: []
                    }
                }
                let row = [
                    storedScan.pageTitle,
                    storedScan.engineReport.summary.URL,
                    storedScan.label,
                    this.stringHash(item.ruleId + item.path.dom),
                    `${valueMap[item.value[0]][item.value[1]]}${item.ignored ? ` (Archived)` : ``}`,
                    policyInfo[item.ruleId].tkLevels.join(", "),
                    policyInfo[item.ruleId].cps.join(", "),
                    policyInfo[item.ruleId].wcagLevels.join(", "),
                    item.ruleId,
                    item.message.substring(0, 32767), //max ength for MS Excel 32767 characters
                    this.get_element(item.snippet),
                    item.snippet.substring(0, 32767),
                    item.path.dom,
                    item.help
                    // engine_end_point + '/tools/help/' + item.ruleId
                ]

                // let row = [myStoredData[i][0], myStoredData[i][1], storedScans[j].label,
                // myStoredData[i][3], myStoredData[i][4], Number.isNaN(myStoredData[i][5]) ? "n/a" : myStoredData[i][5],
                // myStoredData[i][6], Number.isNaN(myStoredData[i][5]) ? "n/a" : myStoredData[i][7], myStoredData[i][8],
                // myStoredData[i][9], myStoredData[i][10], myStoredData[i][11],
                // myStoredData[i][12], myStoredData[i][13]
                // ];
                rowArray.push(row);
            }
        }

        // column widths
        const colWidthData: Array<{
            col: string,
            width: number,
            alignment: {
                vertical: "middle",
                horizontal: "left" | "center" | "fill"
            }
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
        
        // add table to a sheet
        let headRow = worksheet.addRow([ 
            "Page title",
            "Page URL",
            "Scan label",
            "Issue ID",
            "Issue type",
            "Toolkit level",
            "Checkpoint",
            "WCAG level",
            "Rule",
            "Issue",
            "Element",
            "Code",
            "Xpath",
            "Help",
            ""
        ]);

        // set font and alignment for the header cells
        for (let i = 1; i < 15; i++) {
            headRow.getCell(i).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            headRow.getCell(i).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: 12 };
            headRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };
            headRow.getCell(i).border = {
                top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
            }
        }

        // height for header row
        headRow.height = 24;
        
        headRow.commit();
        for (const rowInfo of rowArray) {
            const row = worksheet.addRow(rowInfo);
            row.height = 14;
            for (let j = 1; j <= 14; j++) {
                row.getCell(j).border = {
                    top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
                    right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
                }
            }
            row.commit();
        }
        for (const key in worksheet) {
            if (typeof worksheet[key] === "function") {
                console.log(key);
            }
        }
        // worksheet.addTable({
        //     name: 'MyTable',
        //     ref: 'A1',
        //     headerRow: true,
        //     // totalsRow: true,
        //     style: {
        //         theme: 'TableStyleMedium2',
        //         showRowStripes: true,
        //     },
        //     columns: [
        //         { name: 'Page title', filterButton: true },
        //         { name: 'Page URL', filterButton: true },
        //         { name: 'Scan label', filterButton: true },
        //         { name: 'Issue ID', filterButton: true },
        //         { name: 'Issue type', filterButton: true },
        //         { name: 'Toolkit level', filterButton: true },
        //         { name: 'Checkpoint', filterButton: true },
        //         { name: 'WCAG level', filterButton: true },
        //         { name: 'Rule', filterButton: true },
        //         { name: 'Issue', filterButton: true },
        //         { name: 'Element', filterButton: true },
        //         { name: 'Code', filterButton: true },
        //         { name: 'Xpath', filterButton: true },
        //         { name: 'Help', filterButton: true },

        //     ],
        //     rows: rowArray
        // });

        // for (let i = 2; i <= rowArray.length + 1; i++) {
        //     worksheet.getRow(i).height = 14;
        //     for (let j = 1; j <= 14; j++) {
        //         worksheet.getRow(i).getCell(j).border = {
        //             top: { style: 'thin', color: { argb: 'FFA6A6A6' } },
        //             left: { style: 'thin', color: { argb: 'FFA6A6A6' } },
        //             bottom: { style: 'thin', color: { argb: 'FFA6A6A6' } },
        //             right: { style: 'thin', color: { argb: 'FFA6A6A6' } }
        //         }
        //     }
        //     worksheet.getRow(i).commit();
        // }
        worksheet.commit();
    }

    private static createDefinitionsSheet(workbook: any) {

        const worksheet = workbook.addWorksheet("Definition of fields");

        // "Definition of fields" title
        worksheet.mergeCells('A1', "B1");

        const titleRow = worksheet.getRow(1);
        titleRow.height = 36; // actual is 48

        titleRow.getCell(1).value = "Definition of fields";
        titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        titleRow.getCell(1).font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "20" };
        titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF403151' } };

        const colWidthData = [
            { col: 'A', width: '41.51' }, // note .84 added to actual width
            { col: 'B', width: '119.51' },
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
            { key1: 'Violations', key2: 'Accessibility failures that need to be corrected.' },
            { key1: 'Needs review', key2: 'Issues that may not be a violation. These need a manual review to identify whether there is an accessibility problem.' },
            { key1: 'Recommendations', key2: 'Opportunities to apply best practices to further improve accessibility.' },
            { key1: '% elements without violations', key2: 'Percentage of elements on the page that had no violations found.' },
            { key1: '% elements without violations or items to review', key2: 'Percentage of elements on the page that had no violations found and no items to review.' },
            { key1: 'Level 1,2,3', key2: 'Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan#pace-of-completion for details.' }
        ];

        for (let i = 5; i < rowData.length + 5; i++) {
            worksheet.getRow(i).getCell(1).font = worksheet.getRow(i).getCell(2).font = { name: "Calibri", color: { argb: "FF000000" }, size: 12 };
            worksheet.getRow(i).getCell(1).alignment = worksheet.getRow(i).getCell(2).alignment = { horizontal: "left" };

        }
        for (let i = 5; i < rowData.length + 5; i++) {
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
            { key1: 'Toolkit level', key2: '1, 2 or 3. Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan#pace-of-completion for details' },
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
        worksheet.commit();
    }

    private static countDuplicatesInArray(array: []) {
        let count = {};
        // let result = [];

        array.forEach(item => {

            if (count[item]) {
                //@ts-ignore
                count[item] += 1
                return
            }
            //@ts-ignore
            count[item] = 1;
        })
        return count;
    }


    private static get_element(code: string) {

        if (code) {
            const ind_s = code.indexOf(' ');
            const ind_br = code.indexOf('>');
            return (ind_s > 0 && ind_s < ind_br) ? code.substring(1, ind_s) : code.substring(1, ind_br)
        }

        return '';
    }

    private static format_date(timestamp: string) {
        var date = new Date(timestamp);

        return date.getFullYear() + '-' + ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("00" + date.getDate()).slice(-2) + "-" +
            ("00" + date.getHours()).slice(-2) + "-" +
            ("00" + date.getMinutes()).slice(-2) + "-" +
            ("00" + date.getSeconds()).slice(-2);
    }

    // From https://github.com/darkskyapp/string-hash/blob/master/index.js
    private static stringHash(str) {
        var hash = 5381,
            i = str.length;

        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }

        /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
         * integers. Since we want the results to be always positive, convert the
         * signed int to an unsigned by doing an unsigned bitshift. */
        return hash >>> 0;
    }

}
