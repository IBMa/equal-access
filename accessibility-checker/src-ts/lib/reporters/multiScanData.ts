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


import * as stringHash from "string-hash";
import { IConfigUnsupported } from "../api/IChecker.js";
// Some circular loading problem
let ACEngineManager;
(async () => {
    ACEngineManager = (await import("../ACEngineManager")).ACEngineManager;
})();

export class MultiScanData { 
    Config: IConfigUnsupported;
    constructor(config: IConfigUnsupported) {
        this.Config = config;
    }    

    // this class barrows heavily from singlePageReport
    // however, our purpose here is just to generate the data
    // needed for a multiScanReport which will replace singlePageReport
    // also when saving scans we will be saving a reduced set of the 
    // scan data which is the smallest set of data needed for a 
    // multiScanReport

    // more specifically we will only store the data for the issue
    // sheet as all other data is either static or can be calculated
    // from the issue data

    public issues_sheet_rows(xlsx_props: any) {
        var ret: any = [];

        var report = xlsx_props.report;
        var tab_url = xlsx_props.tabURL;
        var tab_title = xlsx_props.tabTitle;
        var engine_end_point = xlsx_props.helpPath;
        // const engine_end_point = "process.env.engineEndpoint";
        const rule_map = MultiScanData.id_rule_map(xlsx_props);
        const rule_checkpoints_map = MultiScanData.ruleId_checkpoints_map(xlsx_props);

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
            let test = MultiScanData.checkpoints_string(rule_checkpoints_map, item.ruleId)
            let test2 = MultiScanData.wcag_string(rule_checkpoints_map, item.ruleId)
            MultiScanData.get_element(item.snippet)
            MultiScanData.format_date(report.timestamp)
            stringHash(item.ruleId + item.path.dom)
            parseInt(rule_map.get(item.ruleId).toolkitLevel) 
            let snipTrunc = item.snippet;
            if (snipTrunc && snipTrunc.length > 32000) {
                snipTrunc = snipTrunc.substring(0, 32000-3)+"...";
            }

            var row = [
                tab_title,
                tab_url,
                MultiScanData.format_date(report.timestamp),
                stringHash(item.ruleId + item.path.dom),
                valueMap[item.value[0]][item.value[1]],
                parseInt(rule_map.get(item.ruleId).toolkitLevel), // make number instead of text for spreadsheet
                MultiScanData.checkpoints_string(rule_checkpoints_map, item.ruleId),
                MultiScanData.wcag_string(rule_checkpoints_map, item.ruleId),
                item.ruleId,
                item.message.substring(0, 32767), //max ength for MS Excel 32767 characters
                MultiScanData.get_element(item.snippet),
                snipTrunc,
                item.path.aria,
                ACEngineManager.getHelpURL(item)
                // engine_end_point + '/tools/help/' + item.ruleId
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
        const ruleset = xlsx_props.report.ruleset;

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
        // const guideline_id = xlsx_props.report.option.guideline.id;

        //ruleset used for scanning
        // const ruleset = xlsx_props.rulesets.find((element: any) => element.id == guideline_id);
        const ruleset = xlsx_props.report.ruleset;

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