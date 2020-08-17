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

    public static create_header_sheet(report: IReport | null, header_sheet: any){

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

    public static create_issues_sheet(report: IReport | null, issues_sheet: any){
        return issues_sheet;
    }

    public static create_definition_sheet(definition_sheet: any){
        return definition_sheet;
    }


}




