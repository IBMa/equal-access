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
    // Tabs,
    // Tab,
    // TabList,
    // TabPanels,
    // TabPanel,
    Dropdown,
    MultiSelect
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
    reportViewState: string | null,
    reportFilterState: [{id:string;text:string}] | null,
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
        reportViewState: "Element roles",
        reportFilterState: null,
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
                reportIssues = this.state.report ? JSON.parse(JSON.stringify(this.state.report.results)) : null;
            }
        }
        if (reportIssues) {
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
        console.log("this.state.checked = ",this.state.checked);
        let totalCount = 0;
        if (this.state.report) {
            totalCount = this.state.report!.counts.total;
        } 
        const viewItems = ["Element roles", "Requirements","Rules"];
        const filterItems = [
            { id: '0', text: 'Violations' },
            { id: '1', text: 'Needs review' },
            { id: '2', text: 'Recommendations' },
        ]

        let viewFilterSection = <>
             <div className="reportFilterBorder" />
             <Grid className="reportViewFilterSection">
                <Column sm={1} md={2} lg={2} style={{ marginRight: "0px" }}>
                    {!this.state.viewState || !this.state.viewState!.kcm && 
                        <Dropdown
                            ariaLabel="Select report view"
                            disabled={totalCount === 0}
                            id="reportView"
                            items={viewItems}
                            light={false}
                            type="default"
                            style={{width:"180px"}}
                            selectedItem={this.state.reportViewState}
                            onChange={async (evt: any) => {
                                // set state
                                this.setState({ reportViewState: evt.selectedItem });
                            }}
                        />
                    }
                </Column>
                <Column sm={2} md={4} lg={4} style={{ marginRight: "0px" }}>
                    {!this.state.viewState || !this.state.viewState!.kcm && 
                        <MultiSelect
                            ariaLabel="Issue type filter"
                            label="Filter"
                            hideLabel={true}
                            disabled={totalCount === 0}
                            id="filterSelection"
                            items={filterItems}
                            itemToString={(item:any) => (item ? item.text : '')}
                            itemToElement={(item:any) => {
                                    if (item && item.id === "0") {
                                        return <span>{UtilIssueReact.valueSingToIcon("Violation", "reportSecIcon")} {item.text}</span>
                                    } else if (item && item.id === "1") {
                                        return <span>{UtilIssueReact.valueSingToIcon("Needs review", "reportSecIcon")} {item.text}</span>
                                    } else if (item && item.id === "2") {
                                        return <span>{UtilIssueReact.valueSingToIcon("Recommendation", "reportSecIcon")} {item.text}</span>
                                    }
                                    return <></>
                                }
                            }
                            light={false}
                            type="default"
                            style={{width:"180px"}}
                            selecteditems={this.state.reportFilterState}
                            onChange={async (evt: any) => {
                                console.log("Multiselect onChange START");
                                console.log("evt = ", evt);
                                // ok we have one of two cases 
                                // 1. there are selected 
                                let checked = JSON.parse(JSON.stringify(this.state.checked));
                                console.log("onChanged checked = ", checked);
                                if (evt.selectedItems[0] != undefined) {
                                    console.log("evt.selectedItems defined!");
                                    if (evt.selectedItems.length > 0) {
                                        console.log("At least 1 selectedItems");
                                        for (let i = 0; i < evt.selectedItems.length; i++) {
                                            if (evt.selectedItems[i].text === "Violations") {
                                                console.log("checked['Violation'] = ", checked['Violation']);
                                                checked["Violation"] = false;
                                                break;
                                            } else {
                                                console.log("checked['Violation'] = true");
                                                checked["Violation"] = true;
                                            }
                                        }
                                        for (let i = 0; i < evt.selectedItems.length; i++) {
                                            if (evt.selectedItems[i].text === "Needs review") {
                                                console.log("Needs review checked");
                                                checked["Needs review"] = false;
                                                break;
                                            } else {
                                                console.log("checked['Needs review'] = true");
                                                checked["Needs review"] = true;
                                            }
                                        }
                                        for (let i = 0; i < evt.selectedItems.length; i++) {
                                            if (evt.selectedItems[i].text === "Recommendations") {
                                                console.log("Recommendations checked");
                                                checked["Recommendation"] = false;
                                            } else {
                                                console.log("checked['Recommendation'] = true");
                                                checked["Recommendation"] = true;
                                            }
                                        } 
                                    }
                                }
                                // set state
                                this.setState({ checked: checked });
                                console.log("Multiselect onChange END");
                                // 2. there are none selected
                                if (evt.selectedItems.length == 0) {
                                    console.log("RESET filters");
                                    this.onResetFilters();
                                }
                                console.log("Final select: ", this.state.checked);
                            }}
                        />
                    }
                </Column>
                <Column sm={1} md={2} lg={2} style={{ marginRight: "0px" }}>
                    <div>
                        <Button 
                            disabled={totalCount === 0}
                            style={{ float: "right", marginRight: "16px", minHeight: "18px" }}
                            onClick={() => devtoolsController.exportXLS("last") }
                        >Export XLS</Button>
                    </div>
                </Column>
             </Grid>
        </>


        

        return (<>
            {viewFilterSection}
            <Grid className="reportSection" style={{ overflowY: "auto", flex: "1" }}>
                <Column sm={4} md={8} lg={8} className="reportSectionColumn">
                {!this.state.viewState || !this.state.viewState!.kcm && this.state.reportViewState && <div>
                            <div>
                                {this.state.reportViewState === "Element roles" && <>
                                    <div>
                                        <ReportRoles 
                                            unfilteredCount={totalCount}
                                            issues={reportIssues}
                                            panel={this.props.panel} 
                                            checked={this.state.checked} 
                                            selectedPath={this.state.selectedPath} 
                                            onResetFilters={this.onResetFilters.bind(this)}
                                            canScan={this.state.canScan}
                                        />
                                    </div>
                                </>}
                                {this.state.reportViewState === "Requirements" && <>
                                    <div>
                                    <ReportReqts 
                                        unfilteredCount={totalCount}
                                        issues={reportIssues} 
                                        panel={this.props.panel} 
                                        checked={this.state.checked} 
                                        selectedPath={this.state.selectedPath} 
                                        onResetFilters={this.onResetFilters.bind(this)}
                                        canScan={this.state.canScan}
                                    />
                                    </div>
                                </>}
                                {this.state.reportViewState === "Rules" && <>
                                    <div>
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
                                    </div>
                                </>}
                            </div>
                        </div>
                    }
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