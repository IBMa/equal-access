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

import XLSX from 'xlsx';
import EXCELJS from 'exceljs'
const stringHash = require("string-hash");

export default class SinglePageReport {

    public static async single_page_xlsx_download(xlsx_props: any) {

        //create workbook
        var report_workbook = SinglePageReport.create_report_workbook(xlsx_props);

        // write workbook back out
        console.log("write workbook back out");
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const fileExtension = '.xlsx';
        // const blob1 = new Blob([arrayBuffer], {type: fileType});
        // console.log("blob = ", blob1);
        // saveAs(blob1, 'export1' + fileExtension);

        const buffer = await report_workbook.xlsx.writeBuffer();
        console.log("buffer = ", buffer);
        const blob2 = new Blob([buffer], {type: 'application/octet-stream'} );
        console.log("blob2.arrayBuffer() = ", await blob2.arrayBuffer()); 
        console.log("blob2 = ", blob2);
        // saveAs(blob2, 'export2' + fileExtension);

        //write workbook into binary
        // var wbout = XLSX.write(report_workbook, { bookType: 'xlsx', type: 'binary' });

        //sheet to ArrayBuffer
        // var buf = this.s2ab(wbout);

        //create xlsx blob
        // const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const file_name = ReportUti.single_page_report_file_name(xlsx_props.tab_title);

        // ReportUti.download_file(blob, file_name);
    }

    public static s2ab(s: any) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    public static create_report_workbook(xlsx_props: any) {

        // var workbook = XLSX.utils.book_new();
        var workbook = new EXCELJS.Workbook();

        // workbook.Props = {
        //     Title: "Accessibility Checker Report",
        //     Subject: "xlsx report",
        //     Author: "IBM Equal Access",
        //     CreatedDate: new Date()
        // }

        // this.create_header_sheet(xlsx_props, workbook);
        // this.create_issues_sheet(xlsx_props, workbook);
        // this.create_definition_sheet(workbook);

        return workbook;
    }

    public static create_header_sheet(xlsx_props: any, workbook: any) {

        var report = xlsx_props.report;
        var tab_url = xlsx_props.tabURL;
        var summaryNumbers = ReportSummaryUtil.calcSummary(report);
        var element_no_failures = parseInt((((summaryNumbers[4] - summaryNumbers[3]) / summaryNumbers[4]) * 100).toFixed(0));
        var element_no_violations = parseInt((((summaryNumbers[4] - summaryNumbers[0]) / summaryNumbers[4]) * 100).toFixed(0));

        var violation = report?.counts.total.Violation;
        var needs_review = report?.counts.total["Needs review"];
        var recommendation = report?.counts.total.Recommendation;

        workbook.SheetNames.push("Header");

        var ws:any = {};
        ws["!ref"]="A1:G14";
        
        ws.A1 = {v: "Accessibility Scan Report", t: "s"};
        ws.A3 = {v: "Tool:", t: "s"}; 
        ws.B3 = {v: "IBM Equal Access Accessibility Checker", t: "s"};
        ws.A4 = {v: "Version:", t: "s"};
        ws.B4 = {v: chrome.runtime.getManifest().version, t: "s"};
        ws.A5 = {v: "Rule set:", t: "s"};
        ws.B5 = {v: report.option.deployment.name, t: "s"};
        ws.A6 = {v: "Guidelines:", t: "s"};
        ws.B6 = {v: report.option.guideline.name, t: "s"};
        ws.A7 = {v: "Scan date:", t: "s"};
        ws.B7 = {v: new Date(report.timestamp), t: "d"};

        ws.A9 = {v: "Scans:", t: "s"};
        ws.B9 = {v: "1", t: "s"};

        ws.A11 = {v: "Summary", t: "s"};

        ws.A13 = {v: "Page", t: "s"};
        ws.B13 = {v: "Scan Label", t: "s"};
        ws.C13 = {v: "% elements without violations", t: "s"};
        ws.D13 = {v: "% elements without violations or items to review", t: "s"};
        ws.E13 = {v: "# violations", t: "s"};
        ws.F13 = {v: "# needs review", t: "s"};
        ws.G13 = {v: "# recommendations", t: "s"};

        ws.A14 = {v: tab_url, t: "s"};
        ws.B14 = {v: this.format_date(report.timestamp), t: "s"};
        ws.C14 = {v: element_no_violations, t: "s"};
        ws.D14 = {v: element_no_failures, t: "s"};
        ws.E14 = {v: violation, t: "s"};
        ws.F14 = {v: needs_review, t: "s"};
        ws.G14 = {v: recommendation, t: "s"};

        workbook.Sheets["Header"] = ws;

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
                stringHash(item.ruleId + item.path.dom),
                valueMap[item.value[0]][item.value[1]],
                rule_map.get(item.ruleId).toolkitLevel,
                this.checkpoints_string(rule_checkpoints_map, item.ruleId),
                this.wcag_string(rule_checkpoints_map, item.ruleId),
                item.ruleId,
                item.message.substring(0, 32767), //max ength for MS Excel 32767 characters
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