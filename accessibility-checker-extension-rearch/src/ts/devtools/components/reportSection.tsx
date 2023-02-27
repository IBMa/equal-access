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
import { ePanel } from '../devToolsApp';
import { 
    Checkbox,
    Tooltip
} from "@carbon/react";

import "./reportSection.scss";

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
            emptyLabel="No issues detected for the chosen filter criteria"
            noScanMessage={<>This page has not been scanned.</>}
            headers={[
                { key: "issueCount", label: "Issues" },
                { key: "label", label: "Element Roles" }
            ]}
            rowData={rowData}
            selectedPath={this.props.selectedPath}
        />
    }
}

interface ReportSectionProps {
    panel: ePanel
}

interface ReportSectionState {
    report: IReport | null
    checked: {
        "Violation": boolean,
        "Needs review": boolean,
        "Recommendation": boolean
    }
    selectedPath: string | null;
}

type eLevel = "Violation" | "Needs review" | "Recommendation";

export class ReportSection extends React.Component<ReportSectionProps, ReportSectionState> {
    state : ReportSectionState = {
        report: null,
        checked: {
            "Violation": true,
            "Needs review": true,
            "Recommendation": true
        },
        selectedPath: null,
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

        devtoolsController.addSelectedElementPathListener({
            callback: async (path) => {
                this.setPath(path);
            },
            callbackDest: {
                type: "devTools",
                tabId: getTabId()!
            }
        });
        let path = await devtoolsController.getSelectedElementPath();
        this.setPath(path!);
    }

    setPath(path: string) {
        this.setState( { selectedPath: path });
    }

    getCounts() {
        let counts = {
            "Violation": { 
                focused: 0,
                total: 0
            },
            "Needs review": { 
                focused: 0,
                total: 0
            },
            "Recommendation": { 
                focused: 0,
                total: 0
            },
            "Pass": { 
                focused: 0,
                total: 0
            }
        };
        if (this.state.report) {
            for (const issue of this.state.report.results) {
                let sing = UtilIssue.valueToStringSingular(issue.value);
                ++counts[sing as eLevel].total;
                if (!this.state.selectedPath || issue.path.dom.startsWith(this.state.selectedPath)) {
                    ++counts[sing as eLevel].focused;
                }
            }
        }
        return counts;
    }

    render() {
        let counts = this.getCounts();
        let filtReport : IReport = this.state.report ? JSON.parse(JSON.stringify(this.state.report)) : null;
        if (filtReport) {
            filtReport.results = filtReport.results.filter((issue: IIssue) => {
                return this.state.checked[UtilIssue.valueToStringSingular(issue.value) as eLevel];
            });
        }
        let totalCount = 0;
        return (<>
            <Grid className="reportFilterSection">
                {["Violation", "Needs review", "Recommendation"].map((levelStr) => {
                    totalCount += counts[levelStr as eLevel].total;
                    return <>
                        <Column sm={1} md={2} lg={2}>
                            <span data-tip style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px" }}>
                                <Tooltip
                                    align="right"
                                    label={`Filter by ${UtilIssue.singToStringPlural(levelStr)}`}
                                >
                                    <Checkbox 
                                        className="checkboxLabel"
                                        disabled={counts[levelStr as eLevel].total === 0}
                                        // title="Filter by violations" // used react tooltip so all tooltips the same
                                        aria-label={`Filter by ${UtilIssue.singToStringPlural(levelStr)}`}
                                        checked={this.state.checked[levelStr as eLevel]}
                                        id={levelStr.replace(/ /g, "")}
                                        indeterminate={false}
                                        labelText={<React.Fragment>
                                            {UtilIssue.valueSingToIcon(levelStr, "reportSecIcon")}
                                            <span className="reportSecCounts">
                                                <span className="summaryBarLabels" style={{ marginLeft: "4px" }}>
                                                    {filtReport && <>
                                                        {(counts[levelStr as eLevel].focused === counts[levelStr as eLevel].total && 
                                                            counts[levelStr as eLevel].total
                                                        ) || <>
                                                            {counts[levelStr as eLevel].focused}/{counts[levelStr as eLevel].total}
                                                        </>}
                                                    </>}
                                                </span>
                                            </span>
                                        </React.Fragment>}
                                        // hideLabel
                                        onChange={(_evt: any, value: { checked: boolean, id: string}) => {
                                            // Receives three arguments: true/false, the checkbox's id, and the dom event.
                                            let checked = JSON.parse(JSON.stringify(this.state.checked));
                                            checked[levelStr as eLevel] = value.checked;
                                            this.setState({ checked });
                                        }}
                                        wrapperClassName="checkboxWrapper"
                                    />
                                </Tooltip>
                                {/* <ReactTooltip id="filterViolationsTip" place="top" effect="solid">
                                    Filter by Violations
                                </ReactTooltip> */}
                            </span>
                        </Column>
                </>})}
                <Column sm={1} md={2} lg={2} className="totalCount">
                    {totalCount} issues found
                </Column>
            </Grid>
            <Grid className="reportSection" style={{ overflowY: "auto", flex: "1"}}>
                <Column sm={4} md={8} lg={8}>
                    <RoleReport report={filtReport} panel={this.props.panel} checked={this.state.checked} selectedPath={this.state.selectedPath} />
                </Column>
            </Grid>
        </>);
    }
}