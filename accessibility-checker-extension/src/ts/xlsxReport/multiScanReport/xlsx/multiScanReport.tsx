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

    public static async multiScanXlsxDownload(xlsx_props: any) {

        // create workbook
        var reportWorkbook = MultiScanReport.createReportWorkbook(xlsx_props);
        
        // create binary buffer
        const buffer = await reportWorkbook.xlsx.writeBuffer();

        // create xlsx blob
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const blob = new Blob([buffer], {type: fileType});
        console.log("blob = ", blob);

        const fileName = ReportUtil.single_page_report_file_name(xlsx_props.tab_title);

        // download file
        ReportUtil.download_file(blob, fileName);
    }

    public static createReportWorkbook(xlsx_props: any) {
        console.log("createReportWorkbook");
        // create workbook
        // @ts-ignore
        const workbook = new ExcelJS.Workbook({useStyles: true });
            
        // create worksheets
        this.createOverviewSheet(xlsx_props, workbook);
        this.createScanSummarySheet(xlsx_props, workbook);

        return workbook;
    }

    
    public static createOverviewSheet(xlsx_props: any, workbook: any) {
        console.log("createOverviewSheet");

        const report = xlsx_props.report;

        const violation = report?.counts.total.Violation;
        const needsReview = report?.counts.total["Needs review"];
        const recommendation = report?.counts.total.Recommendation;
        const totalIssues = violation + needsReview + recommendation;

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

        const rowData = [
            {key1: 'Tool:', key2: 'IBM Equal Access Accessibility Checker'},
            {key1: 'Version:', key2: chrome.runtime.getManifest().version},
            {key1: 'Rule set:', key2: report.option.deployment.name},
            {key1: 'Guidelines:', key2: report.option.guideline.name},
            {key1: 'Report date:', key2: new Date(report.timestamp)},
            {key1: 'Platform:', key2: ""},
            {key1: 'Scans:', key2: 1},
            {key1: 'Pages:', key2: 1}
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
        const cellB13 = worksheet.getCell('B13'); cellB13.value = violation;
        const cellC13 = worksheet.getCell('C13'); cellC13.value = needsReview;
        const cellD13 = worksheet.getCell('D13'); cellD13.value = recommendation;

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

    public static createScanSummarySheet(xlsx_props: any, workbook: any) {
        console.log("createOverviewSheet");

        const worksheet = workbook.addWorksheet("Scan summary");
    }
}