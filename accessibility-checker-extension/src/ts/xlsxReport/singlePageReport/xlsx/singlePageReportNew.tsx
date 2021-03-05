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

import ReportUti from "../../reportUtil";
import ReportSummaryUtil from '../../../util/reportSummaryUtil';


import ExcelJS from 'exceljs'

export default class SinglePageReport {

    public static async single_page_xlsx_download(xlsx_props: any) {

        // create workbook
        var reportWorkbook = SinglePageReport.createReportWorkbook(xlsx_props);
        
        // create binary buffer
        const buffer = await reportWorkbook.xlsx.writeBuffer();

        // create xlsx blob
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const blob = new Blob([buffer], {type: fileType});
        console.log("blob = ", blob);

        const fileName = ReportUti.single_page_report_file_name(xlsx_props.tab_title);

        // download file
        ReportUti.download_file(blob, fileName);
    }

    public static createReportWorkbook(xlsx_props: any) {
        console.log("createReportWorkbook");
        // create workbook
        // @ts-ignore
        const workbook = new ExcelJS.Workbook({useStyles: true });
            
        // create worksheets
        this.createOverviewSheet(xlsx_props, workbook);

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
        worksheet.mergeCells('A1', "I1");

        const titleRow = worksheet.getRow(1);
        titleRow.height = "27";

        const cellA1 = worksheet.getCell('A1');
        cellA1.value = "Accessibility Scan Report";
        cellA1.alignment = { vertical: "middle", horizontal: "left"};
        cellA1.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellA1.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };

        // what are column widths can't get it till you set it
        
        // set column widths - note value is x + .9 to get width you want
        worksheet.getColumn("A").width = "15.1";
        worksheet.getColumn("B").width = "15.9";
        worksheet.getColumn("C").width = "16.23";
        worksheet.getColumn("D").width = "19.4";
        worksheet.getColumn("E").width = "18.07";
        worksheet.getColumn("F").width = "18.07";
        worksheet.getColumn("G").width = "18.07";
        worksheet.getColumn("H").width = "18.07";
        worksheet.getColumn("I").width = "18.07";

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
        
        worksheet.mergeCells('B2', "I2");
        worksheet.mergeCells('B3', "I3");
        worksheet.mergeCells('B4', "I4");
        worksheet.mergeCells('B5', "I5");
        worksheet.mergeCells('B6', "I6");
        worksheet.mergeCells('B7', "I7");
        worksheet.mergeCells('B8', "I8");
        worksheet.mergeCells('B9', "I9");
        worksheet.mergeCells('A10', "I10");


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
        worksheet.mergeCells('A11', "I11");

        const summaryRow = worksheet.getRow(11);
        summaryRow.height = "27";

        const cellA11 = worksheet.getCell('A11');
        cellA11.value = "Summary";
        cellA11.alignment = { vertical: "middle", horizontal: "left"};
        cellA11.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "16" };
        cellA11.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FF403151'} };

        // Scans info Headers
        worksheet.getRow(12).height = 16; // actual height is

        const cellA12 = worksheet.getCell('A12');
        cellA12.value = "Total issues";
        cellA12.alignment = { vertical: "middle", horizontal: "center"};
        cellA12.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
        cellA12.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };
        cellA12.border = {
            top: {style:'thin', color: {argb: 'FFA6A6A6'}},
            left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
            right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        }

        const cellB12 = worksheet.getCell('B12');
        cellB12.value = "Violations";
        cellB12.alignment = { vertical: "middle", horizontal: "center"};
        cellB12.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
        cellB12.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };
        cellB12.border = {
            top: {style:'thin', color: {argb: 'FFA6A6A6'}},
            left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
            right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        }

        const cellC12 = worksheet.getCell('C12');
        cellC12.value = "Needs review";
        cellC12.alignment = { vertical: "middle", horizontal: "center"};
        cellC12.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
        cellC12.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };
        cellC12.border = {
            top: {style:'thin', color: {argb: 'FFA6A6A6'}},
            left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
            right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        }

        const cellD12 = worksheet.getCell('D12');
        cellD12.value = "Recommendations";
        cellD12.alignment = { vertical: "middle", horizontal: "center"};
        cellD12.font = { name: "Calibri", color: { argb: "FFFFFFFF" }, size: "12" };
        cellD12.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFC65911'} };
        cellD12.border = {
            top: {style:'thin', color: {argb: 'FFA6A6A6'}},
            left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
            right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        }

        // Scans info Values
        worksheet.getRow(13).height = 27; // actual height is

        const cellA13 = worksheet.getCell('A13');
        cellA13.value = totalIssues;
        cellA13.alignment = { vertical: "middle", horizontal: "center"};
        cellA13.font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };
        cellA13.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
        cellA13.border = {
            top: {style:'thin', color: {argb: 'FFA6A6A6'}},
            left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
            right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        }

        const cellB13 = worksheet.getCell('B13');
        cellB13.value = violation;
        cellB13.alignment = { vertical: "middle", horizontal: "center"};
        cellB13.font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };
        cellB13.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
        cellB13.border = {
            top: {style:'thin', color: {argb: 'FFA6A6A6'}},
            left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
            right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        }

        const cellC13 = worksheet.getCell('C13');
        cellC13.value = needsReview;
        cellC13.alignment = { vertical: "middle", horizontal: "center"};
        cellC13.font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };
        cellC13.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
        cellC13.border = {
            top: {style:'thin', color: {argb: 'FFA6A6A6'}},
            left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
            right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        }

        const cellD13 = worksheet.getCell('D13');
        cellD13.value = recommendation;
        cellD13.alignment = { vertical: "middle", horizontal: "center"};
        cellD13.font = { name: "Calibri", color: { argb: "FF000000" }, size: "12" };
        cellD13.fill = { type: 'pattern', pattern: 'solid', fgColor:{argb:'FFf8cbad'} };
        cellD13.border = {
            top: {style:'thin', color: {argb: 'FFA6A6A6'}},
            left: {style:'thin', color: {argb: 'FFA6A6A6'}},
            bottom: {style:'thin', color: {argb: 'FFA6A6A6'}},
            right: {style:'thin', color: {argb: 'FFA6A6A6'}}
        }
    }
}