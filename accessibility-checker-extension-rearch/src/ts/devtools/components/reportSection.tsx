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

import * as React from 'react';
import { getDevtoolsController } from '../devtoolsController';
import { IReport } from '../../interfaces/interfaces';
import { getTabId } from '../../util/tabId';
import { Column, Grid } from "@carbon/react";
import { ReportTreeGrid, IRowGroup } from './reportTreeGrid';
import { UtilIssue } from '../../util/UtilIssue';
import { ePanel } from '../devToolsApp';

let devtoolsController = getDevtoolsController();

class RoleReport extends React.Component<ReportSectionProps & ReportSectionState> {
    render() {
        let rowData : IRowGroup[] | null = null;
        if (this.props.report && this.props.report.results) {
            rowData = [];
            for (const result of this.props.report.results) {
                // let thisLabel = result.path.aria.replace(/\//g, "/ ").replace(/^\/ /, "/");
                let thisLabel = result.path.aria.replace(/\//g, " /");
                let curGroup = rowData.find(group => group.label === thisLabel);
                if (!curGroup) {
                    curGroup = {
                        id: ReportTreeGrid.cleanId(thisLabel),
                        label: thisLabel,
                        children: [result]
                    }
                    rowData.push(curGroup);
                } else {
                    curGroup.children.push(result);
                }
            }
            rowData.sort((groupA, groupB) => groupA.label.localeCompare(groupB.label));
            for (const group of rowData) {
                group.children.sort((a, b) => UtilIssue.valueToOrder(a.value)-UtilIssue.valueToOrder(b.value));
            }
        }
        return <ReportTreeGrid 
            panel={this.props.panel}
            emptyLabel="No report"
            headers={[
                { key: "issueCount", label: "Issues" },
                { key: "label", label: "Element Roles" }
            ]}
            rowData={rowData}
        />
    }
}

interface ReportSectionProps {
    panel: ePanel
}

interface ReportSectionState {
    report: IReport | null
}

export class ReportSection extends React.Component<ReportSectionProps, ReportSectionState> {
    state : ReportSectionState = {
        report: null
    }

    async componentDidMount(): Promise<void> {
        devtoolsController.addReportListener({
            callback: async (report) => {
                report!.results = report!.results.filter(issue => issue.value[1] !== "PASS");
                this.setState( { report });
            },
            callbackDest: {
                type: "devTools",
                tabId: getTabId()!
            }
        });
        let report = await devtoolsController.getReport();
        if (report) {
            report!.results = report!.results.filter(issue => issue.value[1] !== "PASS");
            this.setState( { report });
        }
    }

    render() {
        return (<>
            <Grid className="reportFilterSection">
                <Column sm={4} md={8} lg={8}>
                    <div style={{margin: "1rem 0rem" }}>Report filters....</div>
                </Column>
            </Grid>
            <Grid className="reportSection" style={{ overflowY: "auto", flex: "1"}}>
                <Column sm={4} md={8} lg={8}>
                    <RoleReport report={this.state.report} panel={this.props.panel} />
                </Column>
            </Grid>
        </>);
    }
}