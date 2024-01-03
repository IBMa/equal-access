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
import ReactDOM from 'react-dom';
import { IIssue, IReport, UIIssue, eFilterLevel } from '../../interfaces/interfaces';
import { UtilIssue } from '../../util/UtilIssue';
import { UtilIssueReact } from '../../util/UtilIssueReact';
import { getDevtoolsController, ScanningState, ViewState } from '../devtoolsController';
import { getTabId } from '../../util/tabId';
import { getBGController, TabChangeType } from '../../background/backgroundController';
import { 
    Button,
    Column,
    ContentSwitcher,
    InlineLoading,
    Modal,
    Grid,
    OverflowMenu,
    OverflowMenuItem,
    Switch,
    Tooltip,
    Link,
} from "@carbon/react";
import {
    Keyboard,
    KeyboardOff
} from "@carbon/react/icons";
import { ListenerType } from '../../messaging/controller';
import { ChevronDown } from "@carbon/react/icons";
import "./scanSection.scss";
import { getDevtoolsAppController } from '../devtoolsAppController';
import { DefinitionTooltip } from '@carbon/react';
import { BrowserDetection } from "../../util/browserDetection";

let devtoolsController = getDevtoolsController();
let bgController = getBGController();

interface ScanSectionState {
    report: IReport | null,
    selectedPath: string | null,
    checked: {
        "Violation": boolean,
        "Needs review": boolean,
        "Recommendation": boolean,
        "Hidden": boolean
    }
    scanningState: ScanningState | "done"
    pageStatus: string
    viewState: ViewState
    reportContent: boolean
    scannedOnce: boolean
    storeReports: boolean,
    storedReportsCount: number,
    selectedElemPath: string,
    focusMode: boolean,
    confirmClearStored: boolean,
    canScan: boolean,
    ignoredIssues: UIIssue[]
}

type eLevel = eFilterLevel;

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
    "Hidden": {
        focused: number,
        total: number
    }
    "Pass": {
        focused: number,
        total: number
    }
}

export class ScanSection extends React.Component<{}, ScanSectionState> {
    state : ScanSectionState = {
        report: null,
        selectedPath: null,
        checked: {
            "Violation": true,
            "Needs review": true,
            "Recommendation": true,
            "Hidden": false
        },
        scanningState: "idle",
        pageStatus: "complete",
        viewState: {
            kcm: false
        },
        scannedOnce: false,
        reportContent: false,
        storeReports: false,
        storedReportsCount: 0,
        selectedElemPath: "html",
        focusMode: false,
        confirmClearStored: false,
        canScan: true,
        ignoredIssues: []
    }
    scanRef = React.createRef<HTMLButtonElement>();

    reportListener : ListenerType<IReport> = async (newReport) => {
        let self = this;
        let hasReportContent = false;
        if (newReport && newReport.results.length > 0) {
            // after the scan we have report aka newReport
            hasReportContent = true;
        }
        // If a scan never started, we can't be done
        self.setState( { 
            scanningState: this.state.scanningState !== "idle"? "done" : "idle",
            reportContent: hasReportContent,
            report: newReport
        });
        setTimeout(() => {
            self.setState( { scanningState: "idle" });
            if (newReport) {
                getDevtoolsAppController().setSecondaryView("summary");
            }
            setTimeout(() => {
                this.scanRef.current?.focus();
            }, 0);
        }, 500);
    }

    

    async componentDidMount(): Promise<void> {
        devtoolsController.addReportListener(this.reportListener);
        devtoolsController.addScanningStateListener(async (newState) => {
            this.setState({scanningState: newState });
        });
        devtoolsController.addViewStateListener(async (newState) => {
            this.setState( { viewState: newState });
        })
        devtoolsController.addStoreReportsListener(async (newState) => {
            this.setState( { 
                storeReports: newState,
                storedReportsCount: (await devtoolsController.getStoredReportsMeta()).length
            });
        })
        devtoolsController.addStoredReportsMetaListener(async (newState) => {
            this.setState( { 
                storedReportsCount: newState.length
            });
        })
        devtoolsController.addSelectedElementPathListener(async (newPath) => {
            this.setState( { selectedElemPath: newPath });
        })
        devtoolsController.addFocusModeListener(async (newValue) => {
            this.setState({ focusMode: newValue })
        })
        bgController.addTabChangeListener(async (content: TabChangeType) => {
            if (content.changeInfo.status) {
                this.setState({ pageStatus: content.changeInfo.status, scannedOnce: false });
            }
            if (content.changeInfo.status === "complete") {
                this.setState({
                    canScan: (await bgController.getTabInfo(getTabId()!)).canScan
                });
            }
        });
        bgController.addIgnoreUpdateListener(async ({ url, issues }) => {
            if (url === (await bgController.getTabInfo(getTabId())).url) {
                this.setState({ ignoredIssues: issues });
            }
        })
        let url = (await bgController.getTabInfo(getTabId())).url!;
        let alreadyIgnored = await bgController.getIgnore(url);
        this.setState({ ignoredIssues: alreadyIgnored });
        this.reportListener((await devtoolsController.getReport())!);
        this.setState({ 
            viewState: (await devtoolsController.getViewState())!, 
            storeReports: (await devtoolsController.getStoreReports()),
            selectedElemPath: (await devtoolsController.getSelectedElementPath())! || "/html",
            focusMode: (await devtoolsController.getFocusMode()),
            storedReportsCount: (await devtoolsController.getStoredReportsMeta()).length,
            canScan: (await bgController.getTabInfo(getTabId()!)).canScan
        });
    }

    componentWillUnmount(): void {
        devtoolsController.removeReportListener(this.reportListener);
    }

    async scan() {
        this.setState( { scannedOnce: true });
        await bgController.requestScan(getTabId()!);
        // The scan is done here so can calc issues found and issue type counts
        // see newReport in reportListener
    }

    // START for issue type numbers especially for focussed view
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


    getCounts(issues: UIIssue[] | null) : CountType {
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
        if (this.state.ignoredIssues) {
            for (const ignoredIssue of this.state.ignoredIssues) {
                ++counts["Hidden" as eLevel].total;
                if (!this.state.selectedPath || ignoredIssue.path.dom.startsWith(this.state.selectedPath)) {
                    ++counts["Hidden" as eLevel].focused;
                }
                // remove from appropriate eLevel V, NR, R
                let sing = UtilIssue.valueToStringSingular(ignoredIssue.value);
                --counts[sing as eLevel].total;
                if (!this.state.selectedPath || ignoredIssue.path.dom.startsWith(this.state.selectedPath)) {
                    --counts[sing as eLevel].focused;
                }
            }
        }
        return counts;
    }

    // END for issue type numbers especially for focussed view

    render() {
        let reportIssues : IIssue[] | null = null;
        let filterCounts: CountType = this.initCount();
        let quickTotalCount = 0;
        let totalCount = 0;
        if (this.state.report) {
            quickTotalCount = this.state.report.counts.Violation +
                         this.state.report.counts['Needs review'] +
                         this.state.report.counts.Recommendation - this.state.ignoredIssues.length;
            reportIssues = this.state.report ? JSON.parse(JSON.stringify(this.state.report.results)) : null;           
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

        {["Violation", "Needs review", "Recommendation"].map((levelStr) => {
            totalCount += filterCounts[levelStr as eLevel].total;
            {UtilIssueReact.valueSingToIcon(levelStr, "reportSecIcon")}
        })}

        let selectedElementStr = this.state.selectedElemPath;
    
        if (selectedElementStr) {
            selectedElementStr = selectedElementStr.split("/").pop()!;
            selectedElementStr = selectedElementStr.match(/([^[]*)/)![1];
        }

        let devtoolsAppController = getDevtoolsAppController();
        return (<div className="scanSection">
            <Grid> 
                <Column sm={4} md={8} lg={8}>
                    <div style={{display: "flex", flexWrap: "wrap", gap: "1rem"}}>
                        <div style={{flex: "0 1 8.75rem"}}>
                            <div style={{display: "flex"}}>
                                <div style={{flex: "1 1 8.75rem", maxWidth: "8.75rem" }}>
                                    {this.state.scanningState !== "idle" && <InlineLoading 
                                        className="inlineLoading"
                                        description={"Scanning"}
                                        style={{minWidth: "8.75rem", paddingLeft: ".5rem" }}
                                        status={this.state.scanningState !== "done" ? 'active' : 'finished'}
                                    />}
                                    <Button 
                                        ref={this.scanRef}
                                        style={{
                                            display: this.state.scanningState !== "idle" ? "none": undefined,
                                            minWidth: "8.75rem"
                                        }}
                                        accesskey="s"
                                        size="sm"
                                        disabled={this.state.pageStatus !== "complete" || !this.state.canScan} 
                                        onClick={() => { 
                                            this.scan(); 
                                        }
                                    }>Scan</Button>
                                </div>
                                <OverflowMenu 
                                    data-floating-menu-container
                                    size="sm" 
                                    ariaLabel="stored scans" 
                                    renderIcon={ChevronDown}
                                >
                                    <OverflowMenuItem
                                        disabled={!this.state.reportContent}
                                        itemText="Download current scan" 
                                        onClick={() => devtoolsController.exportXLS("last") }
                                    />
                                    <OverflowMenuItem 
                                        // if scanStorage false not storing scans, if true storing scans
                                        itemText= {this.state.storeReports ? "Stop storing scans" : "Start storing scans"}
                                        onClick={() => {
                                            devtoolsController.setStoreReports(!this.state.storeReports);
                                        }}
                                    />
                                    <OverflowMenuItem 
                                        disabled={this.state.storedReportsCount === 0} // disabled when no stored scans or 1 stored scan
                                        itemText="Download stored scans" 
                                        onClick={() => devtoolsController.exportXLS("all") }
                                    />
                                    <OverflowMenuItem 
                                        disabled={this.state.storedReportsCount === 0} // disabled when no stored scans or 1 stored scan
                                        itemText="View stored scans" 
                                        onClick={async () => {
                                            await devtoolsAppController.setSecondaryView("stored");
                                            devtoolsAppController.openSecondary(".cds--overflow-menu[aria-label='stored scans']");
                                        }}
                                    />
                                    <OverflowMenuItem 
                                        disabled={this.state.storedReportsCount === 0}
                                        isDelete={this.state.storedReportsCount > 0}
                                        hasDivider
                                        itemText="Delete stored scans" 
                                        onClick={() => {
                                            this.setState({ confirmClearStored: true });
                                        }}
                                    />
                                </OverflowMenu>
                            </div>
                        </div>
                        <div style={{flex: "1 1 8.75rem"}}>
                            <Tooltip
                                align="bottom"
                                label="Focus view"
                                style={{maxWidth: "20rem", marginLeft: "auto", width: "100%", display: "block" }} 
                                >
                                <ContentSwitcher data-tip data-for="focusViewTip"
                                    style={{maxWidth: "20rem", marginLeft: "auto", width: "100%" }} 
                                    size="sm" 
                                    selectionMode="manual"
                                    selectedIndex={this.state.focusMode ? 0 : 1}
                                    onChange={(newState: { index: string, name: "All" | "Focused", text: string }) => {
                                        devtoolsController.setFocusMode(newState.name === "Focused");
                                    }}
                                >
                                    <Switch
                                        name="Focused"
                                        text={`<${selectedElementStr || "html"}>`}
                                        disabled={!this.state.reportContent}
                                    />
                                    <Switch
                                        name="All"
                                        text="All"
                                        disabled={!this.state.reportContent}
                                    />
                                </ContentSwitcher>
                            </Tooltip>
                        </div>
                        <Button
                            id="kcmToggle"
                            style={{flex: "1 1 2rem"}}
                            hasIconOnly
                            renderIcon={this.state.viewState.kcm ? KeyboardOff : Keyboard} 
                            disabled={!this.state.reportContent}
                            iconDescription="Keyboard Checker Mode" tooltipPosition="left" 
                            onClick={async () => {
                                let settings = await bgController.getSettings();
                                let newState :ViewState = JSON.parse(JSON.stringify(this.state.viewState));                                
                                newState.kcm = !newState.kcm;
                                let devtoolsAppController = getDevtoolsAppController();
                                if (newState.kcm) {
                                    if (settings.tabStopAlerts) {
                                        devtoolsAppController.setSecondaryView("kcm_overview");
                                        devtoolsAppController.openSecondary("#kcmToggle");
                                    }
                                } else {
                                    if (devtoolsAppController.getSecondaryView() === "kcm_overview") {
                                        devtoolsAppController.setSecondaryView("summary");
                                        devtoolsAppController.closeSecondary();
                                    }
                                }
                                await devtoolsController.setViewState(newState);
                            }}
                            size="sm"
                            kind="secondary"
                        />
                    </div>
                </Column>
            </Grid>
            <Grid>
                <Column sm={4} md={8} lg={8}>
                    <div className="storedCount">
                        {this.state.storeReports && "Storing: "}
                        {this.state.storeReports && this.state.storedReportsCount === 0 && "No scans stored"}
                        {this.state.storedReportsCount > 0 && `${this.state.storedReportsCount} scans stored`}
                    </div>
               
                    <div className={totalCount === 0 ? "totalCountDisable" : "totalCountEnable"} >
                    {["Violation", "Needs review", "Recommendation"].map((levelStr) => {
                        totalCount += filterCounts[levelStr as eLevel].total;
                        return <>
                            <span className='scanFilterSection' data-tip style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px" }}>
                                <span className="countCol">
                                    <DefinitionTooltip openOnHover align="top-left" definition={levelStr}>
                                    {UtilIssueReact.valueSingToIcon(levelStr, "reportSecIcon")}</DefinitionTooltip>
                                    <span className="reportSecCounts" style={{ marginLeft: "4px" }}>
                                        {reportIssues && <>
                                            {(filterCounts[levelStr as eLevel].focused === filterCounts[levelStr as eLevel].total) ?
                                                filterCounts[levelStr as eLevel].total
                                            : <>
                                                {filterCounts[levelStr as eLevel].focused}/{filterCounts[levelStr as eLevel].total}
                                            </>}
                                        </>}
                                    </span>
                                    <span style={{ marginRight: "18px" }}></span>
                                </span>
                                {/* </Tooltip> */}
                            </span>
                        </>
                    })}
                    <span className='scanFilterSection' data-tip style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px" }}>
                        <span className="countCol">
                        <DefinitionTooltip openOnHover align="top-left" definition="Hidden">
                        {UtilIssueReact.valueSingToIcon(BrowserDetection.isDarkMode()?"ViewOn":"ViewOff", "reportSecIcon")}</DefinitionTooltip>
                            <span className="reportSecCounts" style={{ marginLeft: "4px" }}>
                                {reportIssues && <>
                                    {this.state.ignoredIssues.length}
                                </>}
                            </span>
                            <span style={{ marginRight: "18px" }}></span>
                        </span>
                    </span>
                    <Link 
                        id="totalIssuesCount" 
                        className= {totalCount === 0 ? "darkLink totalCountDisable" : "darkLink totalCountEnable"}
                        aria-disabled={totalCount === 0}
                        inline={true}
                        onClick={() => {
                            let appController = getDevtoolsAppController();
                            getDevtoolsAppController().setSecondaryView("summary");
                            appController.openSecondary("totalIssuesCount");
                    }}>{quickTotalCount} issues found</Link>
                    </div>
                </Column>
            </Grid>
            {typeof document === 'undefined'
                ? null
                : ReactDOM.createPortal(
                    <Modal
                        aria-label="Delete stored scans"
                        modalHeading="Delete stored scans"
                        size='sm'
                        danger={true}
                        open={this.state.confirmClearStored}
                        shouldSubmitOnEnter={false}
                        onRequestClose={(() => {
                            this.setState({ confirmClearStored: false });
                        }).bind(this)}
                        onRequestSubmit={(() => {
                            devtoolsController.clearStoredReports();
                            this.setState({
                                storedReportsCount: 0,
                                confirmClearStored: false
                            })
                        }).bind(this)}
                        selectorPrimaryFocus=".cds--modal-footer .cds--btn--secondary"
                        primaryButtonText="Delete"
                        secondaryButtonText="Cancel"
                        primaryButtonDisabled={false}
                        preventCloseOnClickOutside={true}
                        style={{ zIndex: 9050 }}
                    >
                        <p style={{ marginBottom: '1rem' }}>
                            Are you sure you want to delete selected scans?
                            This action is irreversible.
                        </p>
                    </Modal>,
                    document.body
                )
            }
        </div>
        );
    }
}