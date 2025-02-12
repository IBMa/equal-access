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

import { IReport, IReportItem, valueMap } from "../IReport.js";
import ReportRow from "./ReportRow.js";
import { Grid, Column } from "@carbon/react";
import { UtilIssue } from "../util/UtilIssue.js";
import { IssueValue } from "../util/UtilIssueReact.js";

interface IReportElementsState {
}
interface IReportElementsProps {
    report: IReport;
    selectItem: (item: IReportItem) => void
}

export default class ReportElements extends React.Component<IReportElementsProps, IReportElementsState> {
    state: IReportElementsState = {};

    render() {

        let groups = []
        let groupMap: {
            [key: string]: {
                title: string,
                counts: { [key: string]: number }
                items: IReportItem[]
            }
        } | null = {};
        for (const item of this.props.report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }

            let thisGroup = groupMap[item.path.aria];
            if (!thisGroup) {
                thisGroup = {
                    title: (item.path.aria),
                    counts: {},
                    items: []
                }
                groupMap[item.path.aria] = thisGroup;
                groups.push(thisGroup);
            }
            thisGroup.items.push(item);
            let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
            thisGroup.counts[val] = (thisGroup.counts[val] || 0) + 1;
            
        }
        groups.sort((groupA, groupB) => groupA.title.localeCompare(groupB.title));
        for (const group of groups) {
            group.items.sort((a, b) => UtilIssue.valueToOrder(a.value as  IssueValue)-UtilIssue.valueToOrder(b.value as  IssueValue));
        }


        return <div className="report" role="rowgroup">
            <Grid className="reportHeader">
                <Column sm={1} md={2} lg={4}>
                    <div className="label" style={{ marginLeft: "2rem" }}>Issues</div>
                </Column>
                <Column sm={3} md={6} lg={8}>
                    <div className="label">Element Roles</div>
                </Column>
            </Grid>
            {groups.map(group => {
                return <ReportRow report={this.props.report} selectItem={this.props.selectItem} group={group} />;
            })}
        </div>
    }
}