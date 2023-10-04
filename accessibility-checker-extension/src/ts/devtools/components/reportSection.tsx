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
import { ePanel, getDevtoolsController, ViewState } from '../devtoolsController';
import { IIssue, IReport } from '../../interfaces/interfaces';
import { Column, Grid } from "@carbon/react";
import { UtilIssue } from '../../util/UtilIssue';
import {
    Button,
    Checkbox,
    Link,
    Tabs,
    Tab,
    TabList,
    TabPanels,
    TabPanel,
    Tooltip
} from "@carbon/react";

import {
    Information
} from "@carbon/react/icons";

import "./reportSection.scss";
import { ReportRoles } from './reports/reportRoles';
import { ReportReqts } from './reports/reportReqts';
import { ReportRules } from './reports/reportRules';
import { ListenerType } from '../../messaging/controller';
import { UtilIssueReact } from '../../util/UtilIssueReact';
import { getDevtoolsAppController } from '../devtoolsAppController';
import { ReportTabs } from './reports/reportTabs';
import { UtilKCM } from '../../util/UtilKCM';
import { getBGController } from '../../background/backgroundController';
import { getTabId } from '../../util/tabId';

let devtoolsController = getDevtoolsController();

interface ReportSectionProps {
    panel: ePanel
}

interface ReportSectionState {
    report: IReport | null,
    checked: {
        "Violation": boolean,
        "Needs review": boolean,
        "Recommendation": boolean
    }
    selectedPath: string | null,
    focusMode: boolean,
    viewState?: ViewState,
    canScan: boolean
}

type eLevel = "Violation" | "Needs review" | "Recommendation";

type CountType = {
    "Violation": {
        focused: number,
        total: number
    },
    "Needs review": {
        focused: number,
        total: number
    },
    "Recommendation": {
        focused: number,
        total: number
    },
    "Pass": {
        focused: number,
        total: number
    }
}

let bgController = getBGController();

export class ReportSection extends React.Component<ReportSectionProps, ReportSectionState> {
    state: ReportSectionState = {
        report: null,
        checked: {
            "Violation": true,
            "Needs review": true,
            "Recommendation": true
        },
        selectedPath: null,
        focusMode: false,
        canScan: true
    }

    async componentDidMount(): Promise<void> {
        devtoolsController.addReportListener(this.reportListener);
        let report = await devtoolsController.getReport();
        this.setState({
            canScan: (await bgController.getTabInfo(getTabId()!)).canScan
        });
        this.reportListener(report!);

        devtoolsController.addSelectedElementPathListener(this.selectedElementListener);
        let path = await devtoolsController.getSelectedElementPath();
        this.setPath(path!);
        devtoolsController.addFocusModeListener(async (newValue: boolean) => {
            this.setState({ focusMode: newValue });
        })
        devtoolsController.addViewStateListener(async (viewState: ViewState) => {
            this.setState({ viewState });
        })
        this.setState({
            focusMode: await devtoolsController.getFocusMode(),
            viewState: (await devtoolsController.getViewState())!
        })
    }

    componentWillUnmount(): void {
        devtoolsController.removeReportListener(this.reportListener);
    }

    onResetFilters() {
        this.setState({
            checked: {
                "Violation": true,
                "Needs review": true,
                "Recommendation": true
            }
        })
    }

    reportListener: ListenerType<IReport> = async (report: IReport) => {
        if (report) {
            report!.results = report!.results.filter(issue => issue.value[1] !== "PASS" || issue.ruleId === "detector_tabbable");
        }
        this.setState({ 
            report,
            canScan: (await bgController.getTabInfo(getTabId()!)).canScan
        });
    }
    selectedElementListener: ListenerType<string> = async (path) => {
        this.setPath(path);
    }

    setPath(path: string) {
        this.setState({ selectedPath: path });
    }

    initCount() {
        return {
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
        }
    }

    getCounts(issues: IIssue[] | null) : CountType {
        let counts = this.initCount();
        if (issues) {
            for (const issue of issues) {
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
        let reportIssues : IIssue[] | null = null;
        let tabbableDetectors: IIssue[] | null = null;
        let filterCounts: CountType = this.initCount();
        let tabCount = 0;
        let missingTabCount = 0;

        if (this.state.report) {
            if (this.state.viewState && this.state.viewState.kcm) {
                let { tabbable, tabbableErrors } = UtilKCM.processIssues(this.state.report);
                tabbableDetectors = tabbable;
                reportIssues = tabbableErrors;
                let allSet = new Set(reportIssues.map(iss => iss.path.dom));
                let tabSet = new Set(tabbableDetectors.map(iss => iss.path.dom));
                tabCount = tabSet.size;
                missingTabCount = Array.from(allSet).filter(key => !tabSet.has(key)).length;
            } else {
                // console.log("Focus Mode:",this.state.focusMode)
                reportIssues = this.state.report ? JSON.parse(JSON.stringify(this.state.report.results)) : null;
            }
        }
        if (reportIssues) {
            filterCounts = this.getCounts(reportIssues);
            reportIssues = reportIssues.filter((issue: IIssue) => {
                let retVal = (this.state.checked[UtilIssue.valueToStringSingular(issue.value) as eLevel]
                    && (!this.state.focusMode
                        || !this.state.selectedPath
                        || issue.path.dom.startsWith(this.state.selectedPath)
                    )
                );
                return retVal;
            });
        }

        let totalCount = 0;
        let filterSection = <>
            <div className="reportFilterBorder" />
            <Grid className="reportFilterSection">
                {["Violation", "Needs review", "Recommendation"].map((levelStr) => {
                    totalCount += filterCounts[levelStr as eLevel].total;
                    return <>
                        <Column sm={1} md={2} lg={2} style={{ marginRight: "0px" }}>
                            <span data-tip style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px" }}>
                                <Tooltip
                                    align="right"
                                    label={`Filter by ${UtilIssue.singToStringPlural(levelStr)}`}
                                >
                                    <Checkbox
                                        className="checkboxLabel"
                                        disabled={filterCounts[levelStr as eLevel].total === 0}
                                        // title="Filter by violations" // used react tooltip so all tooltips the same
                                        aria-label={`Filter by ${UtilIssue.singToStringPlural(levelStr)}`}
                                        checked={this.state.checked[levelStr as eLevel]}
                                        id={levelStr.replace(/ /g, "")}
                                        indeterminate={false}
                                        labelText={<span className="countCol">
                                            {UtilIssueReact.valueSingToIcon(levelStr, "reportSecIcon")}
                                            <span className="reportSecCounts" style={{ marginLeft: "4px" }}>
                                                {reportIssues && <>
                                                    {(filterCounts[levelStr as eLevel].focused === filterCounts[levelStr as eLevel].total) ?
                                                        filterCounts[levelStr as eLevel].total
                                                    : <>
                                                        {filterCounts[levelStr as eLevel].focused}/{filterCounts[levelStr as eLevel].total}
                                                    </>}
                                                </>}
                                            </span>
                                            <span className="summaryBarLabels" style={{ marginLeft: "4px" }}>
                                                {UtilIssue.singToStringPlural(levelStr)}
                                            </span>
                                        </span>}
                                        // hideLabel
                                        onChange={(_evt: any, value: { checked: boolean, id: string }) => {
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
                    </>
                })}
                
                <Column sm={1} md={2} lg={2} className={totalCount === 0 ? "totalCountDisable" : "totalCountEnable"} >
                    <Link 
                        id="totalIssuesCount" 
                        className= {totalCount === 0 ? "darkLink totalCountDisable" : "darkLink totalCountEnable"}
                        aria-disabled={totalCount === 0}
                        inline={true}
                        onClick={() => {
                            let appController = getDevtoolsAppController();
                            getDevtoolsAppController().setSecondaryView("summary");
                            appController.openSecondary("totalIssuesCount");
                    }}>{totalCount} issues found</Link>
                </Column>
            </Grid>
        </>;

        return (<>
            <Grid className="reportSection" style={{ overflowY: "auto", flex: "1" }}>
                <Column sm={4} md={8} lg={8} className="reportSectionColumn">
                    {!this.state.viewState || !this.state.viewState!.kcm && <Tabs
                        // ariaLabel="Report options"
                        role="navigation"
                        tabContentClassName="tab-content"
                    >
                        <TabList>
                            <Tab>Element roles</Tab>
                            <Tab>Requirements</Tab>
                            <Tab>Rules</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                { filterSection }
                                <ReportRoles 
                                    unfilteredCount={totalCount}
                                    issues={reportIssues}
                                    panel={this.props.panel} 
                                    checked={this.state.checked} 
                                    selectedPath={this.state.selectedPath} 
                                    onResetFilters={this.onResetFilters.bind(this)}
                                    canScan={this.state.canScan}
                                />
                            </TabPanel>
                            <TabPanel>
                                { filterSection }
                                <ReportReqts 
                                    unfilteredCount={totalCount}
                                    issues={reportIssues} 
                                    panel={this.props.panel} 
                                    checked={this.state.checked} 
                                    selectedPath={this.state.selectedPath} 
                                    onResetFilters={this.onResetFilters.bind(this)}
                                    canScan={this.state.canScan}
                                />
                            </TabPanel>
                            <TabPanel>
                                { filterSection }
                                <ReportRules 
                                    unfilteredCount={totalCount}
                                    report={this.state.report}
                                    issues={reportIssues} 
                                    panel={this.props.panel} 
                                    checked={this.state.checked} 
                                    selectedPath={this.state.selectedPath} 
                                    onResetFilters={this.onResetFilters.bind(this)}
                                    canScan={this.state.canScan}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>}
                    {this.state.viewState && this.state.viewState.kcm && <div>
                        <div style={{ display: "flex" }}>
                            <div style={{flex: "1 1 auto"}} className="visHeading">
                                <span style={{     
                                    margin: ".75rem 0rem",
                                    display: "inline-block"
                                }}>Keyboard tab stops</span>
                                <span style={{
                                    verticalAlign: "top"
                                }}>
                                    <Button
                                        id="kcmInfo"
                                        renderIcon={Information}
                                        kind="ghost"
                                        hasIconOnly iconDescription="Keyboard Checker Mode information" tooltipPosition="top"
                                        onClick={(() => {
                                            getDevtoolsAppController().setSecondaryView("kcm_overview");
                                            getDevtoolsAppController().openSecondary("#kcmInfo");
                                        }).bind(this)}>
                                    </Button>
                                </span>
                            </div>
                            <div className="visScore" style={{flex: "1 1 auto"}}>
                                Tab stops: {tabCount} existing, {missingTabCount} missing
                            </div>
                        </div>
                        <div>
                            { filterSection }
                            <ReportTabs 
                                unfilteredCount={totalCount}
                                issues={reportIssues}
                                tabbable={tabbableDetectors}
                                panel={this.props.panel} 
                                checked={this.state.checked} 
                                selectedPath={this.state.selectedPath} 
                                onResetFilters={this.onResetFilters.bind(this)}
                                canScan={this.state.canScan}
                            />
                        </div>
                    </div>}
                </Column>
            </Grid>
        </>);
    }
}