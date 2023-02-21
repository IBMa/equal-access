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
import { IIssue, IReport } from '../../interfaces/interfaces';
import { getTabId } from '../../util/tabId';
import { Column, Grid } from "@carbon/react";
import { ReportTreeGrid, IRowGroup } from './reportTreeGrid';
import { UtilIssue } from '../../util/UtilIssue';

let devtoolsController = getDevtoolsController();

class RoleReport extends React.Component<ReportSectionState> {
    render() {
        let data : IRowGroup[] | null = null;
        if (this.props.report && this.props.report.results) {
            data = [];
            let curGroup : IRowGroup | null = null;
            let issues : IIssue[] = [];
            for (const issue of this.props.report.results) {
                issues.push(issue);
            }

            for (const result of issues) {
                let thisLabel = result.path.aria.replace(/\//g, "/ ").replace(/^\/ /, "/");
                if (!curGroup || thisLabel !== curGroup.label) {
                    if (curGroup) {
                        curGroup!.children.sort((a, b) => UtilIssue.valueToOrder(a.value)-UtilIssue.valueToOrder(b.value));
                    }
                    curGroup = {
                        id: thisLabel+" "+data.length,
                        label: thisLabel,
                        children: [result]
                    }
                    data.push(curGroup);
                } else {
                    curGroup.children.push(result);
                }
            }
            if (curGroup) {
                curGroup!.children.sort((a, b) => UtilIssue.valueToOrder(a.value)-UtilIssue.valueToOrder(b.value));
            }
        }
        return <ReportTreeGrid 
            emptyLabel="No report"
            headers={[
                { key: "issueCount", label: "Issues" },
                { key: "label", label: "Element Roles" }
            ]}
            data={data}
        />
    }
}

interface ReportSectionState {
    report: IReport | null
}

export class ReportSection extends React.Component<{}, ReportSectionState> {
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
        report!.results = report!.results.filter(issue => issue.value[1] !== "PASS");
        this.setState( { report });
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
                    <RoleReport report={this.state.report} />
                </Column>
            </Grid>
        </>);
    }
}