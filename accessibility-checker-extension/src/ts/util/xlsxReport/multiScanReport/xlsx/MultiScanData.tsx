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

import { IReport, ISettings, StoredScanData } from "../../../../interfaces/interfaces";


const stringHash = require("string-hash");

interface XLSXProps {
    settings: ISettings,
    report: IReport,
    pageURL: string,
    pageTitle: string,
    timestamp: string,
    rulesets: any[]
}

export default class MultiScanData { 

    // this class barrows heavily from singlePageReport
    // however, our purpose here is just to generate the data
    // needed for a multiScanReport which will replace singlePageReport
    // also when saving scans we will be saving a reduced set of the 
    // scan data which is the smallest set of data needed for a 
    // multiScanReport

    // more specifically we will only store the data for the issue
    // sheet as all other data is either static or can be calculated
    // from the issue data

    public static issues_sheet_rows(xlsx_props: XLSXProps) : StoredScanData[] {

        let ret: any[] = [];

        let report = xlsx_props.report;
        let tab_url = xlsx_props.pageURL;
        let tab_title = xlsx_props.pageTitle;
        const rule_map = this.id_rule_map(xlsx_props);
        const rule_checkpoints_map = this.ruleId_checkpoints_map(xlsx_props);

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

        if (report == null) {
            return [];
        }

        for (const item of report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }

            let row = [
                tab_title,
                tab_url,
                this.format_date(xlsx_props.timestamp),
                stringHash(item.ruleId + item.path.dom),
                valueMap[item.value[0]][item.value[1]],
                parseInt(rule_map.get(item.ruleId).toolkitLevel), // make number instead of text for spreadsheet
                this.checkpoints_string(rule_checkpoints_map, item.ruleId, item.reasonId),
                this.wcag_string(rule_checkpoints_map, item.ruleId),
                item.ruleId,
                item.message.substring(0, 32767), //max ength for MS Excel 32767 characters
                this.get_element(item.snippet),
                item.snippet,
                item.path.dom,
                item.help
            ]

            ret.push(row);
        }

        return ret;
    }

    public static checkpoints_string(rule_checkpoints_map: any, rule_id: string, reasonId: string) {

        let checkpoint_string = '';

        let checkpoint_array = rule_checkpoints_map.get(rule_id);

        for (let checkpoint of checkpoint_array) {
            // console.log(checkpoint);
            let ruleInfo = checkpoint.rules.find((rule: any) => rule.id === rule_id);
            // console.log(ruleInfo);
            if (ruleInfo.reasonCodes && !ruleInfo.reasonCodes.includes(reasonId)) continue;
            if (checkpoint_string.length > 1) {
                checkpoint_string = checkpoint_string + '; ';
            }

            checkpoint_string = checkpoint_string + checkpoint.num + ' ' + checkpoint.name
        }

        return checkpoint_string;
    }

    public static wcag_string(rule_checkpoints_map: any, rule_id: string) {

        let wcag_string = '';

        let checkpoint_array = rule_checkpoints_map.get(rule_id);

        for (let checkpoint of checkpoint_array) {
            if (wcag_string.length > 0) {
                wcag_string = wcag_string + '; ';
            }

            wcag_string = wcag_string + checkpoint.wcagLevel;
        }

        return wcag_string;
    }

    public static id_rule_map(xlsx_props: XLSXProps) {
        const guideline_id = xlsx_props.settings.selected_ruleset.id;

        //ruleset used for scanning
        const ruleset = xlsx_props.rulesets.find((element: any) => element.id == guideline_id);

        const checkpoints = ruleset.checkpoints;

        let rule_map = new Map();

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

    public static ruleId_checkpoints_map(xlsx_props: XLSXProps) {
        const guideline_id = xlsx_props.settings.selected_ruleset.id;

        //ruleset used for scanning
        const ruleset = xlsx_props.rulesets.find((element: any) => element.id == guideline_id);

        const checkpoints = ruleset.checkpoints;

        let checkpoint_map = new Map();

        for (let checkpoint of checkpoints) {
            let rules = checkpoint.rules;

            if (rules && rules.length > 0) {
                for (let rule of rules) {

                    if (!checkpoint_map.get(rule.id)) {

                        checkpoint_map.set(rule.id, [checkpoint]);
                    } else {
                        let checkpoint_array = checkpoint_map.get(rule.id);
                        checkpoint_array.push(checkpoint);
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
        let date = new Date(timestamp);

        return date.getFullYear() + '-' + ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("00" + date.getDate()).slice(-2) + "-" +
            ("00" + date.getHours()).slice(-2) + "-" +
            ("00" + date.getMinutes()).slice(-2) + "-" +
            ("00" + date.getSeconds()).slice(-2);
    }
}