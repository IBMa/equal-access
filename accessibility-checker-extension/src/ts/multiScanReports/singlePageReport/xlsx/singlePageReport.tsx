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

//var Excel = require('exceljs');
import XLSX from 'xlsx';
const stringHash = require("string-hash");

export default class SinglePageReport {

    public static async single_page_xlsx_download(xlsx_props: any) {

        //create workbook
        var report_workbook = SinglePageReport.create_report_workbook(xlsx_props);

        //write workbook into binary
        var wbout = XLSX.write(report_workbook, { bookType: 'xlsx', type: 'binary' });

        //sheet to ArrayBuffer
        var buf = this.s2ab(wbout);

        //create xlsx blob
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const file_name = ReportUti.single_page_report_file_name(xlsx_props.tab_title);

        ReportUti.download_file(blob, file_name);
    }

    public static s2ab(s: any) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    public static create_report_workbook(xlsx_props: any) {

        var workbook = XLSX.utils.book_new();

        workbook.Props = {
            Title: "Accessibility Checker Report",
            Subject: "xlsx report",
            Author: "IBM Equal Access",
            CreatedDate: new Date()
        }

        this.create_header_sheet(xlsx_props, workbook);
        this.create_issues_sheet(xlsx_props, workbook);
        this.create_definition_sheet(workbook);

        return workbook;
    }

    // public static create_header_sheet(xlsx_props: any, header_sheet: any) {
    //     console.log('----report------', xlsx_props.report);
    //     var report = xlsx_props.report;
    //     var tab_url = xlsx_props.tabURL;


    //     var summaryNumbers = ReportSummaryUtil.calcSummary(report);
    //     var element_no_failures = parseInt((((summaryNumbers[4] - summaryNumbers[3]) / summaryNumbers[4]) * 100).toFixed(0));
    //     var element_no_violations = parseInt((((summaryNumbers[4] - summaryNumbers[0]) / summaryNumbers[4]) * 100).toFixed(0));

    //     var violation = report?.counts.total.Violation;
    //     var needs_review = report?.counts.total["Needs review"];
    //     var recommendation = report?.counts.total.Recommendation;
    //     //var pass = report?.counts.total.Pass;


    //     //set column width
    //     header_sheet.getColumn('A').width = 10;
    //     header_sheet.getColumn('B').width = 25;
    //     header_sheet.getColumn('C').width = 25;
    //     header_sheet.getColumn('D').width = 40;
    //     header_sheet.getColumn('E').width = 15;
    //     header_sheet.getColumn('F').width = 15;
    //     header_sheet.getColumn('G').width = 20;

    //     var report_title = header_sheet.getCell('A1');
    //     report_title.value = 'Accessibility Scan Report';
    //     report_title.font = {
    //         bold: true
    //     };

    //     var tool = header_sheet.getCell('A3');
    //     var tool_info = header_sheet.getCell('B3');
    //     tool.value = 'Tool:';
    //     tool_info.value = 'IBM Equal Access Accessibility Checker';

    //     var version = header_sheet.getCell('A4');
    //     var version_info = header_sheet.getCell('B4');
    //     version.value = 'Version:';
    //     version_info.value = chrome.runtime.getManifest().version;

    //     var rule_set = header_sheet.getCell('A5');
    //     var rule_set_info = header_sheet.getCell('B5');
    //     rule_set.value = 'Rule set:';
    //     rule_set_info.value = report.option.deployment.name;

    //     var guidelines = header_sheet.getCell('A6');
    //     var guidelines_info = header_sheet.getCell('B6');
    //     guidelines.value = 'Guidelines:';
    //     guidelines_info.value = report.option.guideline.name;

    //     var scan_date = header_sheet.getCell('A7');
    //     var scan_date_info = header_sheet.getCell('B7');
    //     scan_date.value = 'Scan date:';
    //     scan_date_info.value = new Date(report.timestamp);
    //     scan_date_info.alignment = { horizontal: 'left' };

    //     var scans = header_sheet.getCell('A9');
    //     var scans_info = header_sheet.getCell('B9');
    //     scans.value = 'Scans:';
    //     scans_info.value = '1';


    //     var summary = header_sheet.getCell('A11');
    //     summary.value = 'Summary';
    //     summary.font = {
    //         bold: true
    //     };

    //     var summary_row_header = header_sheet.getRow(13);
    //     summary_row_header.values = [
    //         'Page',
    //         'Scan Label',
    //         '% elements without violations',
    //         '% elements without violations or items to review',
    //         '# violations', '# needs review',
    //         '# recommendations'];

    //     var summary_row_info = header_sheet.getRow(14);
    //     summary_row_info.values = [
    //         tab_url,
    //         this.format_date(report.timestamp),
    //         element_no_violations,
    //         element_no_failures,
    //         violation,
    //         needs_review,
    //         recommendation
    //     ];

    //     return header_sheet;
    // }

    public static create_header_sheet(xlsx_props: any, workbook: any) {

        workbook.SheetNames.push("Header");

        var ws:any = {};
        ws["!ref"]="A1:B1";
        ws.A1 = {v: "Accessibility Scan Report", t: "s", s: "b"}


        workbook.Sheets["Header"] = ws;

/*

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
        */
    }
    
    public static create_issues_sheet(xlsx_props: any, workbook: any) {

        workbook.SheetNames.push("Issues");

        var ws_data: any = [];

        var ws_data_header: any = [
            'Page', 'Scan Label', 'Issue ID', 'Issue Type', 'Toolkit Level', 'Checkpoint', 'WCAG Level', 'Rule', 'Issue', 'Element', 'Code', 'Xpath', 'Help'
        ];

        ws_data.push(ws_data_header);

        var ws_data_rows = this.issues_sheet_rows(xlsx_props);

        ws_data.push.apply(ws_data, ws_data_rows);

        var ws = XLSX.utils.aoa_to_sheet(ws_data);
        workbook.Sheets["Issues"] = ws;



        // return issues_sheet;
    }

    public static create_definition_sheet(workbook: any) {

        workbook.SheetNames.push("Definition of fields");

        var ws_data: any = [
            ['Field', 'Definition'],
            ['Page', 'Identifies the page or html file that was scanned.'],
            ['Scan Label', 'Label for the scan. Default value is date and time of scan but other values can be programmatically assigned in automated testing.'],
            ['IssueID', 'Identifier for this issue within this page.'],
            ['Issue Type', 'Violation, needs review, or recommendation'],
            ['Toolkit Level', '1, 2 or 3. Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan#pace-of-completion for details'],
            ['Checkpoint', 'Web Content Accessibility Guidelines (WCAG) checkpoints this issue falls into.'],
            ['WCAG Level', 'A, AA or AAA. WCAG level for this issue.'],
            ['Rule', 'Name of the accessibility test rule that detected this issue.'],
            ['Issue', 'Message describing the issue.'],
            ['Element', 'Type of HTML element where the issue is found.'],
            ['Code', 'Actual HTML element where the issue is found.',],
            ['Xpath', 'Xpath of the HTML element where the issue is found.'],
            ['Help', 'Link to a more detailed description of the issue and suggested solutions.']
        ];

        var ws = XLSX.utils.aoa_to_sheet(ws_data);
        workbook.Sheets["Definition of fields"] = ws;

        console.log('-----definition sheet ws data---', ws);
    }

    public static issues_sheet_rows(xlsx_props: any) {

        var ret: any = [];

        var report = xlsx_props.report;
        //var rulesets = xlsx_props.rulesets;
        var tab_url = xlsx_props.tabURL;
        const engine_end_point = process.env.engineEndpoint;
        const rule_map = this.id_rule_map(xlsx_props);
        const rule_checkpoints_map = this.ruleId_checkpoints_map(xlsx_props);

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
            return [];
        }

        for (const item of report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }

            var row = [
                tab_url,
                this.format_date(report.timestamp),
                stringHash(item.ruleId + item.path.aria),
                valueMap[item.value[0]][item.value[1]],
                rule_map.get(item.ruleId).toolkitLevel,
                this.checkpoints_string(rule_checkpoints_map, item.ruleId),
                this.wcag_string(rule_checkpoints_map, item.ruleId),
                item.ruleId,
                item.message,
                this.get_element(item.snippet),
                item.snippet,
                item.path.aria,
                engine_end_point + '/tools/help/' + item.ruleId
            ]

            ret.push(row);
        }

        return ret;
    }

    public static checkpoints_string(rule_checkpoints_map: any, rule_id: string) {

        var checkpoint_string = '';

        var checkpoint_array = rule_checkpoints_map.get(rule_id);

        for (let checkpoint of checkpoint_array) {
            if (checkpoint_string.length > 1) {
                checkpoint_string = checkpoint_string + '; ';
            }

            checkpoint_string = checkpoint_string + checkpoint.num + ' ' + checkpoint.name
        }

        return checkpoint_string;
    }

    public static wcag_string(rule_checkpoints_map: any, rule_id: string) {

        var wcag_string = '';

        var checkpoint_array = rule_checkpoints_map.get(rule_id);

        for (let checkpoint of checkpoint_array) {
            if (wcag_string.length > 0) {
                wcag_string = wcag_string + '; ';
            }

            wcag_string = wcag_string + checkpoint.wcagLevel;
        }

        return wcag_string;
    }

    public static id_rule_map(xlsx_props: any) {
        const guideline_id = xlsx_props.report.option.guideline.id;

        //ruleset used for scanning
        const ruleset = xlsx_props.rulesets.find((element: any) => element.id == guideline_id);

        const checkpoints = ruleset.checkpoints;

        var rule_map = new Map();

        for (let checkpoint of checkpoints) {
            let rules = checkpoint.rules;

            if (rules && rules.length > 0) {
                for (let rule of rules) {
                    if (!rule_map.get(rule.id)) {
                        rule_map.set(rule.id, rule);
                    }
                }
            }

        }

        return rule_map;
    }

    public static ruleId_checkpoints_map(xlsx_props: any) {
        const guideline_id = xlsx_props.report.option.guideline.id;

        //ruleset used for scanning
        const ruleset = xlsx_props.rulesets.find((element: any) => element.id == guideline_id);

        const checkpoints = ruleset.checkpoints;

        var checkpoint_map = new Map();

        for (let checkpoint of checkpoints) {

            var temp_checkpoint = {
                name: checkpoint.name,
                num: checkpoint.num,
                summary: checkpoint.summary,
                wcagLevel: checkpoint.wcagLevel
            }

            let rules = checkpoint.rules;

            if (rules && rules.length > 0) {
                for (let rule of rules) {

                    if (!checkpoint_map.get(rule.id)) {

                        checkpoint_map.set(rule.id, [temp_checkpoint]);
                    } else {
                        var checkpoint_array = checkpoint_map.get(rule.id);
                        checkpoint_array.push(temp_checkpoint);
                        checkpoint_map.set(rule.id, checkpoint_array);
                    }
                }
            }
        }

        return checkpoint_map;
    }

    public static get_element(code: string) {

        if (code) {
            const ind_s = code.indexOf(' ');
            const ind_br = code.indexOf('>');
            return (ind_s > 0 && ind_s < ind_br) ? code.substring(1, ind_s) : code.substring(1, ind_br)
        }

        return '';
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