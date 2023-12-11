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
import { IIssue, IReport, UIIssue } from '../../interfaces/interfaces';
import { Column, Grid } from "@carbon/react";
import { UtilIssue } from '../../util/UtilIssue';
import {
    Button,
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
import { getBGController, issueBaselineMatch } from '../../background/backgroundController';
import { getTabId } from '../../util/tabId';

let devtoolsController = getDevtoolsController();

interface ReportSectionProps {
    panel: ePanel;
}

interface ReportSectionState {
    report: IReport | null,
    checked: {
        "Violation": boolean,
        "Needs review": boolean,
        "Recommendation": boolean,
        "Hidden": boolean
    }
    selectedPath: string | null,
    reportViewState: string | null,
    reportFilterState: [{id:string;text:string}] | null,
    focusMode: boolean,
    viewState?: ViewState,
    canScan: boolean,
    filterShown: boolean,
    ignoredIssues: UIIssue[]
}

type eLevel = "Violation" | "Needs review" | "Recommendation";

let bgController = getBGController();

export class ReportSection extends React.Component<ReportSectionProps, ReportSectionState> {
    state: ReportSectionState = {
        report: null,
        checked: {
            "Violation": true,
            "Needs review": true,
            "Recommendation": true,
            "Hidden": false
        },
        selectedPath: null,
        reportViewState: "Element roles",
        reportFilterState: null,
        focusMode: false,
        canScan: true,
        filterShown: true,
        ignoredIssues: []
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
        bgController.addIgnoreUpdateListener(async ({ url, issues }) => {
            if (url === (await bgController.getTabInfo(getTabId())).url) {
                this.setState({ ignoredIssues: issues });
            }
        })
        let url = (await bgController.getTabInfo(getTabId())).url!;
        let alreadyIgnored = await bgController.getIgnore(url);
        this.setState({ ignoredIssues: alreadyIgnored });
    }

    componentWillUnmount(): void {
        devtoolsController.removeReportListener(this.reportListener);
    }

    onResetFilters() {
        this.setState({
            checked: {
                "Violation": false,
                "Needs review": false,
                "Recommendation": false,
                "Hidden": true
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
            "Hidden": {
                focused: 0,
                total: 0
            },
            "Pass": {
                focused: 0,
                total: 0
            }
        }
    }


    render() {
        let reportIssues : UIIssue[] | null = null;
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
            reportIssues = reportIssues.filter((issue: UIIssue) => {
                issue.ignored = this.state.ignoredIssues.some(ignoredIssue => issueBaselineMatch(ignoredIssue, issue));
                let retVal = ( ((this.state.checked["Hidden"] && issue.ignored) || this.state.checked[UtilIssue.valueToStringSingular(issue.value) as eLevel]) 
                    && (!this.state.focusMode
                        || !this.state.selectedPath
                        || issue.path.dom.startsWith(this.state.selectedPath)
                    ) 
                );
                if (!this.state.checked["Hidden"] && issue.ignored) {
                    return false; // JCH is this an override
                }
                return retVal;
            });
        }
        let totalCount = 0;
        if (this.state.report) {
            totalCount = this.state.report!.counts.total;
        } 
        const viewItems = ["Element roles", "Requirements","Rules"];
        const filterItems = [
            { id: '0', text: 'Violations' },
            { id: '1', text: 'Needs review' },
            { id: '2', text: 'Recommendations' },
            { id: '3', text: 'Hidden' },
        ]
        let levelSelectedItems: Array<{id: string, text: string}> = [];
        for (const key in this.state.checked) {
            if ((this.state.checked as any)[key]) {
                levelSelectedItems.push(filterItems.find(filtItem => filtItem.text === key)!)
            }
        }

        let viewFilterSection = <>
             <div className="reportFilterBorder" />
             {this.state.filterShown && <Grid className="reportViewFilterSection">
                
                <Column sm={4} md={8} lg={8} style={{ marginRight: "0px" }}>
                    <div style={{display: "flex", flexWrap: "wrap", gap: "1rem", float: "right"}}>
                            <div style={{flex: "0 1 8.75rem"}}>
                                <div style={{display: "flex"}}>
                                    <div style={{flex: "1 1 8.75rem", maxWidth: "8.75rem", marginRight: "8px" }}>
                                        {!this.state.viewState || !this.state.viewState!.kcm && 
                                            <Dropdown
                                                className="viewMulti"
                                                ariaLabel="Select report view"
                                                disabled={totalCount === 0}
                                                id="reportView"
                                                size="sm" 
                                                items={viewItems}
                                                light={false}
                                                type="default"
                                                style={{width:"160px"}}
                                                selectedItem={this.state.reportViewState}
                                                onChange={async (evt: any) => {
                                                    // set state
                                                    this.setState({ reportViewState: evt.selectedItem });
                                                }}
                                            />
                                        }
                                    </div>
                                    <div style={{flex: "1 1 8.75rem"}}>
                                        {!this.state.viewState || !this.state.viewState!.kcm && 
                                            <MultiSelect
                                                className="viewMulti"
                                                ariaLabel="Issue type filter"
                                                label="Filter"
                                                size="sm" 
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
                                                        } else if (item && item.id === "3") {
                                                            return <span>{UtilIssueReact.valueSingToIcon("ViewOff", "reportSecIcon")} {item.text}</span>
                                                        }
                                                        return <></>
                                                    }
                                                }
                                                light={false}
                                                type="default"
                                                style={{ float: "right" }}
                                                selecteditems={levelSelectedItems}
                                                initialSelectedItems={[filterItems[0], filterItems[1], filterItems[2]]}
                                                onChange={async (evt: any) => {
                                                    let checked = JSON.parse(JSON.stringify(this.state.checked));
                                                    if (evt.selectedItems != undefined) {
                                                        checked["Violation"] = false;
                                                        for (let i = 0; i < evt.selectedItems.length; i++) {
                                                            if (evt.selectedItems[i].text === "Violations") {
                                                                checked["Violation"] = true;
                                                            } 
                                                        }
                                                        checked["Needs review"] = false;
                                                        for (let i = 0; i < evt.selectedItems.length; i++) {
                                                            if (evt.selectedItems[i].text === "Needs review") {
                                                                checked["Needs review"] = true;
                                                            }
                                                        }
                                                        checked["Recommendation"] = false;
                                                        for (let i = 0; i < evt.selectedItems.length; i++) {
                                                            if (evt.selectedItems[i].text === "Recommendations") {
                                                                checked["Recommendation"] = true;
                                                            }
                                                        }
                                                        checked["Hidden"] = false;
                                                        for (let i = 0; i < evt.selectedItems.length; i++) {
                                                            if (evt.selectedItems[i].text === "Hidden") {
                                                                checked["Hidden"] = true;
                                                            }
                                                        }
                                                    }
                                                    this.setState({ checked: checked });
                                                }}
                                            />
                                        }
                                    </div>
                                    <div style={{flex: "1 1 8.75rem"}}>
                                        <div>
                                            <Button
                                                kind="tertiary"
                                                disabled={totalCount === 0}
                                                style={{ float: "right", marginRight: "16px", minHeight: "18px", maxHeight: "32px" }}
                                                onClick={() => devtoolsController.exportXLS("last") }
                                            >Export XLS</Button>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </Column>
             </Grid>}
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
                                            onFilterToolbar={(val) => this.setState({filterShown: val})}
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
                                        onFilterToolbar={(val) => this.setState({filterShown: val})}
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
                                        onFilterToolbar={(val) => this.setState({filterShown: val})}
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
                                onFilterToolbar={(val) => this.setState({filterShown: val})}
                            />
                        </div>
                    </div>}
                </Column>
            </Grid>
        </>);
    }
}