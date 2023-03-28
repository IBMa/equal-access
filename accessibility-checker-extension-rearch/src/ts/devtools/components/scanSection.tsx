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
import { getDevtoolsController, ViewState } from '../devtoolsController';
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
    Theme,
    Tooltip
} from "@carbon/react";
import {
    Keyboard,
    KeyboardOff
} from "@carbon/react/icons";
import { ListenerType } from '../../messaging/controller';
import { IReport } from '../../interfaces/interfaces';
import { ChevronDown } from "@carbon/react/icons";
import "./scanSection.scss";
import { getDevtoolsAppController } from '../devtoolsAppController';

let devtoolsController = getDevtoolsController();
let bgController = getBGController();

interface ScanSectionState {
    scanInProgress: number
    pageStatus: string
    viewState: ViewState
    reportContent: boolean
    scannedOnce: boolean
    storeReports: boolean,
    storedReportsCount: number,
    selectedElemPath: string,
    focusMode: boolean,
    confirmClearStored: boolean
}

export class ScanSection extends React.Component<{}, ScanSectionState> {
    state : ScanSectionState = {
        scanInProgress: 0,
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
        confirmClearStored: false
    }

    reportListener : ListenerType<IReport> = async (report) => {
        let self = this;
        let hasReportContent = false;
        if (report && report.results.length > 0) {
            hasReportContent = true;
        }
        devtoolsController.setFocusMode(false);
        self.setState( { 
            scanInProgress: hasReportContent ? 2 : 0, 
            reportContent: hasReportContent
        });
        setTimeout(() => {
            self.setState( { scanInProgress: 0 });
            if (report) {
                getDevtoolsAppController().setSecondaryView("summary");
            }
        }, 500);
    }

    async componentDidMount(): Promise<void> {
        devtoolsController.addReportListener(this.reportListener);
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
        });
        this.reportListener((await devtoolsController.getReport())!);
        this.setState({ 
            viewState: (await devtoolsController.getViewState())!, 
            storeReports: (await devtoolsController.getStoreReports()),
            selectedElemPath: (await devtoolsController.getSelectedElementPath())! || "/html",
            focusMode: (await devtoolsController.getFocusMode()),
            storedReportsCount: (await devtoolsController.getStoredReportsMeta()).length
        });
    }

    componentWillUnmount(): void {
        devtoolsController.removeReportListener(this.reportListener);
    }

    async scan() {
        this.setState( { scanInProgress: 1, scannedOnce: true });
        await bgController.requestScan(getTabId()!);
    }

    render() {
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
                                <div style={{flex: "1 1 8.75rem" }}>
                                    {this.state.scanInProgress > 0 && <InlineLoading 
                                        description={"Scanning"}
                                        style={{minWidth: "8.75rem", paddingLeft: ".5rem", backgroundColor: "#e0e0e0" }}
                                        status={this.state.scanInProgress === 1 ? 'active' : 'finished'}
                                    />}
                                    {this.state.scanInProgress === 0 && <Button 
                                        size="sm"
                                        style={{minWidth: "8.75rem"}}
                                        disabled={this.state.pageStatus !== "complete"} 
                                        onClick={() => { 
                                            this.scan(); 
                                        }
                                    }>Scan</Button>}
                                </div>
                                <Theme theme="g100" style={{flex: "0 1 2rem"}}>
                                    <OverflowMenu 
                                        size="sm" 
                                        ariaLabel="stored scans" 
                                        align="bottom" 
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
                                </Theme>
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