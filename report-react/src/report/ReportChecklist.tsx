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

import React from "react";
import "./report.scss";

import { IReport, IReportItem, valueMap, IRuleset, ICheckpoint } from "../IReport.js";
import ReportRow from "./ReportRow.js";
import { Grid, Column } from "@carbon/react";

interface IReportChecklistState {
}
interface IReportChecklistProps {
    ruleset: IRuleset,
    report: IReport,
    selectItem: (item: IReportItem) => void
}

export default class ReportChecklist extends React.Component<IReportChecklistProps, IReportChecklistState> {
    state: IReportChecklistState = {};

    render() {

        let ruleToGroups: {
            [key: string]: {
                title: string,
                checkpoint: ICheckpoint,
                counts: { [key: string]: number }
                items: IReportItem[]
            }[]
        } = {};
        let groups = [];

        for (const checkpoint of this.props.ruleset.checkpoints) {
            let cpGroup = {
                // TODO: Change out for passive rule message
                title: `${checkpoint.num} ${checkpoint.name}`,
                checkpoint: checkpoint,
                counts: {},
                items: []
            }
            groups.push(cpGroup);
            for (const rule of checkpoint.rules) {
                ruleToGroups[rule.id] = ruleToGroups[rule.id] || []
                ruleToGroups[rule.id].push(cpGroup);
            }
        }

        for (const item of this.props.report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }

            if (item.ruleId in ruleToGroups) {
                let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
                for (const group of ruleToGroups[item.ruleId]) {
                    let ruleInfo = group.checkpoint.rules.find(rule => rule.id === item.ruleId);
                    if (ruleInfo?.reasonCodes) {
                        console.log(ruleInfo, item);
                    }
                    if (!ruleInfo?.reasonCodes || ruleInfo.reasonCodes.includes(""+item.reasonId!)) {
                        group.items.push(item);
                        group.counts[val] = (group.counts[val] || 0) + 1;
                    }
                }
            }
        }

        return <div className="report" role="rowgroup">
            <Grid className="reportHeader">
                <Column sm={1} md={2} lg={4}>
                    <div className="label" style={{ marginLeft: "2rem" }}>Issues</div>
                </Column>
                <Column sm={3} md={6} lg={8}>
                    <div className="label">Requirements</div>
                </Column>
            </Grid>
            {groups.map(group => {
                if (group.items.length > 0) {
                    return <ReportRow report={this.props.report} selectItem={this.props.selectItem} group={group} />;
                } else {
                    return null;
                }
            })}
        </div>
    }
}