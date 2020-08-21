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

var Excel = require('exceljs');
const stringHash = require("string-hash");

export default class SinglePageReport {

    public static async single_page_xlsx_download(xlsx_props: any) {

        var report_workbook = SinglePageReport.create_report_workbook(xlsx_props);

        report_workbook.xlsx.writeBuffer().then(function (data: Blob) {

            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const file_name = ReportUti.single_page_report_file_name(xlsx_props.tab_title);

            ReportUti.download_file(blob, file_name);
        });

    }

    public static create_report_workbook(xlsx_props: any) {

        var workbook = new Excel.Workbook();

        workbook.creator = 'IBM Equal Access';
        workbook.created = new Date();

        var header_sheet = workbook.addWorksheet('Header');
        this.create_header_sheet(xlsx_props, header_sheet);

        var issues_sheet = workbook.addWorksheet('Issues');
        this.create_issues_sheet(xlsx_props, issues_sheet);

        var definition_sheet = workbook.addWorksheet('Definition of fields');
        this.create_definition_sheet(definition_sheet);

        return workbook;
    }

    public static create_header_sheet(xlsx_props: any, header_sheet: any) {
        console.log('----report------', xlsx_props.report);
        var report = xlsx_props.report;
        var tab_url = xlsx_props.tabURL;


        var summaryNumbers = ReportSummaryUtil.calcSummary(report);
        var element_no_failures = parseInt((((summaryNumbers[4] - summaryNumbers[3]) / summaryNumbers[4]) * 100).toFixed(0));
        var element_no_violations = parseInt((((summaryNumbers[4] - summaryNumbers[0]) / summaryNumbers[4]) * 100).toFixed(0));

        var violation = report?.counts.total.Violation;
        var needs_review = report?.counts.total["Needs review"];
        var recommendation = report?.counts.total.Recommendation;
        //var pass = report?.counts.total.Pass;


        //set column width
        header_sheet.getColumn('A').width = 10;
        header_sheet.getColumn('B').width = 25;
        header_sheet.getColumn('C').width = 25;
        header_sheet.getColumn('D').width = 40;
        header_sheet.getColumn('E').width = 15;
        header_sheet.getColumn('F').width = 15;
        header_sheet.getColumn('G').width = 20;

        var report_title = header_sheet.getCell('A1');
        report_title.value = 'Accessibility Scan Report';
        report_title.font = {
            bold: true
        };

        var tool = header_sheet.getCell('A3');
        var tool_info = header_sheet.getCell('B3');
        tool.value = 'Tool:';
        tool_info.value = 'IBM Equal Access Accessibility Checker';

        var version = header_sheet.getCell('A4');
        var version_info = header_sheet.getCell('B4');
        version.value = 'Version:';
        version_info.value = chrome.runtime.getManifest().version;

        var rule_set = header_sheet.getCell('A5');
        var rule_set_info = header_sheet.getCell('B5');
        rule_set.value = 'Rule set:';
        rule_set_info.value = report.option.deployment.name;

        var guidelines = header_sheet.getCell('A6');
        var guidelines_info = header_sheet.getCell('B6');
        guidelines.value = 'Guidelines:';
        guidelines_info.value = report.option.guideline.name;

        var scan_date = header_sheet.getCell('A7');
        var scan_date_info = header_sheet.getCell('B7');
        scan_date.value = 'Scan date:';
        scan_date_info.value = new Date(report.timestamp);
        scan_date_info.alignment = { horizontal: 'left' };

        var scans = header_sheet.getCell('A9');
        var scans_info = header_sheet.getCell('B9');
        scans.value = 'Scans:';
        scans_info.value = '1';


        var summary = header_sheet.getCell('A11');
        summary.value = 'Summary';
        summary.font = {
            bold: true
        };

        var summary_row_header = header_sheet.getRow(13);
        summary_row_header.values = [
            'Page',
            'Scan Label',
            '% elements without violations',
            '% elements without violations or items to review',
            '# violations', '# needs review',
            '# recommendations'];

        var summary_row_info = header_sheet.getRow(14);
        summary_row_info.values = [
            tab_url,
            this.format_date(report.timestamp),
            element_no_violations,
            element_no_failures,
            violation,
            needs_review,
            recommendation
        ];

        return header_sheet;
    }

    public static create_issues_sheet(xlsx_props: any, issues_sheet: any) {

        issues_sheet.columns = [
            { header: 'Page', key: 'page', width: 20 },
            { header: 'Scan Label', key: 'scan_label', width: 20 },
            { header: 'Issue ID', key: 'issue_id', width: 15 },
            { header: 'Issue Type', key: 'issue_type', width: 15 },
            { header: 'Toolkit Level', key: 'toolkit_level', width: 10 },
            { header: 'Checkpoint', key: 'checkpoint', width: 25 },
            { header: 'WCAG Level', key: 'wcag_level', width: 10 },
            { header: 'Rule', key: 'rule', width: 25 },
            { header: 'Issue', key: 'issue', width: 50 },
            { header: 'Element', key: 'element', width: 10 },
            { header: 'Code', key: 'code', width: 50 },
            { header: 'Xpath', key: 'xpath', width: 50 },
            { header: 'Help', key: 'help', width: 50 }

        ];

        this.issues_sheet_rows(xlsx_props, issues_sheet)

        return issues_sheet;
    }

    public static issues_sheet_rows(xlsx_props: any, issues_sheet: any) {


        var report = xlsx_props.report;
        var tab_url = xlsx_props.tabURL;
        const engine_end_point = process.env.engineEndpoint;

        const valueMap: { [key: string]: { [key2: string]: string } } = {
            "VIOLATION": {
                "POTENTIAL": "Needs review",
                "FAIL": "Violation",
                "PASS": "Pass",
                "MANUAL": "Recommendation"
            },
            "RECOMMENDATION": {
                "POTENTIAL": "Recommendation",
                "FAIL": "Recommendation",
                "PASS": "Pass",
                "MANUAL": "Recommendation"
            }
        };

        if (report == null) {
            return;
        }

        let itemIdx = 0;

        for (const item of report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }

            item.itemIdx = itemIdx++;

            issues_sheet.addRow({
                page: tab_url,
                scan_label: this.format_date(report.timestamp),
                issue_id: stringHash(item.ruleId + item.path.aria),
                issue_type: valueMap[item.value[0]][item.value[1]],
                toolkit_level: '',
                checkpoint: '',
                wcag_level: '',
                rule: item.ruleId,
                issue: item.message,
                element: this.get_element(item.snippet),
                code: item.snippet,
                xpath: item.path.aria,
                help: engine_end_point + '/tools/help/' + item.ruleId
            });
        }

    }

    public static get_element(code: string) {

        if (code) {
            const ind_s = code.indexOf(' ');
            const ind_br = code.indexOf('>');
            return (ind_s > 0 && ind_s < ind_br) ? code.substring(1, ind_s) : code.substring(1, ind_br)
        }

        return '';
    }

    public static create_definition_sheet(definition_sheet: any) {
        definition_sheet.columns = [
            { header: 'Field', key: 'field', width: 15 },
            { header: 'Definition', key: 'definition', width: 50 }
        ];

        var field_col = definition_sheet.getColumn('field');
        var def_col = definition_sheet.getColumn('definition');

        field_col.values = ['Field',
            'Page',
            'Scan Label',
            'IssueID',
            'IssueType',
            'ToolkitLevel',
            'Checkpoint',
            'WCAGLevel',
            'Rule',
            'Issue',
            'Element',
            'Code',
            'Xpath',
            'Help'];

        var field_cell = definition_sheet.getCell('A1');
        field_cell.font = {
            bold: true
        };

        var definition_cell = definition_sheet.getCell('B1');
        definition_cell.font = {
            bold: true
        };

        def_col.values = ['Definition',
            'Identifies the page or html file that was scanned.',
            'Label for the scan. Default value is date and time of scan but other values can be programmatically assigned in automated testing.',
            'Identifier for this issue within this page.',
            'Violation, needs review, or recommendation',
            '1, 2 or 3. Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan#pace-of-completion for details',
            'WCAG checkpoints this issue falls into.',
            'A, AA or AAA. WCAG level for this issue.',
            'Name of the accessibility test rule that detected this issue.',
            'Message describing the issue.',
            'Type of HTML element where the issue is found.',
            'Actual HTML element where the issue is found.',
            'Xpath of the HTML element where the issue is found.',
            'Link to a more detailed description of the issue and suggested solutions.'];

        return definition_sheet;
    }

    public static format_date(timestamp: string) {
        var date = new Date(timestamp);

        return date.getFullYear() + '-' + ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("00" + date.getDate()).slice(-2) + "-" +
            ("00" + date.getHours()).slice(-2) + "-" +
            ("00" + date.getMinutes()).slice(-2) + "-" +
            ("00" + date.getSeconds()).slice(-2);
    }
}