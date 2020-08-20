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

var Excel = require('exceljs');

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

        var violation = report?.counts.total.Violation;
        var needs_review = report?.counts.total["Needs review"];
        var recommendation = report?.counts.total.Recommendation;
        //var pass = report?.counts.total.Pass;

        //set column width
        header_sheet.getColumn('A').width=10;
        header_sheet.getColumn('B').width=25;
        header_sheet.getColumn('C').width=25;
        header_sheet.getColumn('D').width=40;
        header_sheet.getColumn('E').width=15;
        header_sheet.getColumn('F').width=15;
        header_sheet.getColumn('G').width=20;

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
        scan_date_info.alignment = {horizontal: 'left'};

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
        summary_row_header.values = ['Scan',
            'Page',
            '% elements without violations',
            '% elements without violations or items to review',
            '# violations', '# needs review',
            '# recommendations'];

        var summary_row_info = header_sheet.getRow(14);
        summary_row_info.values = ['1',
            tab_url,
            '',
            '',
            violation,
            needs_review,
            recommendation
        ];

        return header_sheet;
    }

    public static create_issues_sheet(xlsx_props: any, issues_sheet: any) {

        issues_sheet.columns = [
            { header: 'Page', key: 'page', width: 20 },
            { header: 'IssueID', key: 'issue_id', width: 10 },
            { header: 'IssueType', key: 'issue_type', width: 15 },
            { header: 'ToolkitLevel', key: 'toolkit_level', width: 10 },
            { header: 'Checkpoint', key: 'checkpoint', width: 25 },
            { header: 'Standard', key: 'standard', width: 10 },
            { header: 'WCAGLevel', key: 'wcag_level', width: 10 },
            { header: 'RuleId', key: 'rule_id', width: 25 },
            { header: 'Issue', key: 'issue', width: 50 },
            { header: 'Element', key: 'element', width: 10 },
            { header: 'Code', key: 'code', width: 50 },
            { header: 'Xpath', key: 'xpath', width: 50 },
            { header: 'Line number', key: 'line_number', width: 11 },
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

        console.log('---create_issues_sheet---report', report, '---tab_url---', tab_url);

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
                issue_id: item.itemIdx,
                issue_type: valueMap[item.value[0]][item.value[1]],
                toolkit_level: '',
                checkpoint: '',
                standard: '',
                wcag_level: '',
                rule_id: item.ruleId,
                issue: item.message,
                element: this.get_element(item.snippet),
                code: item.snippet,
                xpath: item.path.aria,
                line_number: '',
                help: engine_end_point + '/tools/help/'+item.ruleId
            });
        }

    }

    public static get_element(code: string){

        if(code){
            const ind_s = code.indexOf(' ');
            const ind_br = code.indexOf('>');
            return (ind_s > 0 && ind_s< ind_br) ? code.substring(1, ind_s) : code.substring(1, ind_br) 
        }

        return '';
    }

    public static create_definition_sheet(definition_sheet: any) {
        definition_sheet.columns = [
            { header: 'Field', key: 'field', width: 15 },
            { header: 'Definition', key: 'definition', width: 50 },
            { header: 'Questions/Comments', key: 'qc', width: 50 }
        ];

        var field_col = definition_sheet.getColumn('field');
        var def_col = definition_sheet.getColumn('definition');
        var qc_col = definition_sheet.getColumn('qc');

        field_col.values = ['Field',
            'Page',
            'IssueID',
            'IssueType',
            'ToolkitLevel',
            'Checkpoint',
            'Standard',
            'WCAGLevel',
            'RuleId',
            'Issue',
            'Element',
            'Code',
            'Xpath',
            'Line number',
            'Help'];

        def_col.values = ['Definition',
            'Identifies the page or html file that was scanned',
            'Unique identifier for the issue',
            'Violation, Needs review, or Recommendation',
            'Our level 1-3',
            'WCAG/IBM checkpoint',
            'WCAG 2.1, WCAG 2.0, 508, EN501, IBM',
            'A, AA, AAA',
            'Numerical ID of the engine rule that fired',
            'Active message describing the issue',
            'Type of HTML element where the issue is found',
            'Actual HTML element where the issue is found',
            'Xpath of the element where the issue is found',
            'Line number in the source code where the issue is located',
            'Link to our checker help for the issue'];

        qc_col.values = ['Questions/Comments',
            '',
            'To support mapping to issues in a tracking system',
            'Any issues with replacing the old types? (violation, potentialviolation, etc)',
            'Serves as a quick way to prioritize',
            'Helps with mapping to our checklists',
            'Would this be a list or would it be WCAG 2.1 for everything required by that standard, and something else for other requirements not in 2.1?',
            'Some teams currently prioritize by WCAG level',
            'Hides the messy rule names from external users but allows easier reporting of issues with the rules (we\'d also include the same ID number in the help)',
            'Includes token values',
            'Allows for sorting by element type to address all issues with certain kinds of element, e.g. images',
            'Helps with identifying the element with the issue',
            '',
            'Is this feasible for static HTML files?',
            ''];

        return definition_sheet;
    }


}




