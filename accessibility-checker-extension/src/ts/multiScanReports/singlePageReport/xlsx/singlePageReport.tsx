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
import { IReport } from '../../../devtools/Report';

var Excel = require('exceljs');

export default class SinglePageReport {

    public static async single_page_xlsx_download(report: IReport | null, tab_title: string) {

        var report_workbook = SinglePageReport.create_report_workbook(report);

        report_workbook.xlsx.writeBuffer().then(function (data: Blob) {

            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const file_name = ReportUti.single_page_report_file_name(tab_title);

            ReportUti.download_file(blob, file_name);
        });

    }

    public static create_report_workbook(report: IReport | null) {

        var workbook = new Excel.Workbook();

        workbook.creator = 'IBM Equal Access';
        workbook.created = new Date();

        var header_sheet = workbook.addWorksheet('Header');
        this.create_header_sheet(report, header_sheet);

        var issues_sheet = workbook.addWorksheet('Issues');
        this.create_issues_sheet(report, issues_sheet);

        var definition_sheet = workbook.addWorksheet('Definition of fields');
        this.create_definition_sheet(definition_sheet);

        return workbook;
    }

    public static create_header_sheet(report: IReport | null, header_sheet: any) {

        header_sheet.columns = [
            { header: 'Package', key: 'package_name' },
            { header: 'Author', key: 'author_name' }
        ];

        // Add row using key mapping to columns
        header_sheet.addRow(
            { package_name: "ABC", author_name: "Author 1" },
            { package_name: "XYZ", author_name: "Author 2" }
        );


        return header_sheet;
    }

    public static create_issues_sheet(report: IReport | null, issues_sheet: any) {
        return issues_sheet;
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




