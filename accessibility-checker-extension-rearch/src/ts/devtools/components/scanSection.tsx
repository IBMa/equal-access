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
import { getTabController } from "../../tab/tabController";
import { getDevtoolsController, ViewState } from '../devtoolsController';
import { getTabId } from '../../util/tabId';
import { getBGController, TabChangeType } from '../../background/backgroundController';
import { 
    Button,
    Column,
    Grid 
} from "@carbon/react";
import {
    Keyboard,
    KeyboardOff,
    Renew
} from "@carbon/react/icons";

let devtoolsController = getDevtoolsController();
let bgController = getBGController();

interface ScanSectionState {
    scanInProgress: boolean
    pageStatus: string
    viewState: ViewState
    reportContent: boolean
    scannedOnce: boolean
}

export class ScanSection extends React.Component<{}, ScanSectionState> {
    state : ScanSectionState = {
        scanInProgress: false,
        pageStatus: "complete",
        viewState: {
            kcm: false
        },
        scannedOnce: false,
        reportContent: false
    }

    async componentDidMount(): Promise<void> {
        devtoolsController.addReportListener({
            callback: async (report) => {
                let hasReportContent = false;
                if (report && report.results.length > 0) {
                    hasReportContent = true;
                }
                this.setState( { scanInProgress: false, reportContent: hasReportContent });
            },
            callbackDest: {
                type: "devTools",
                tabId: getTabId()!
            }
        });
        devtoolsController.addViewStateListener( {
            callback: async (newState) => {
                this.setState( { viewState: newState });
            },
            callbackDest: {
                type: "devTools",
                tabId: getTabId()!
            }
        })
        bgController.addTabChangeListener( {
            callbackDest: { 
                type: "extension"
            },
            callback: async (content: TabChangeType) => {
                if (content.changeInfo.status) {
                    this.setState({ pageStatus: content.changeInfo.status, scannedOnce: false });
                }
            }
        });
        let hasReportContent = false;
        let report = await devtoolsController.getReport();
        if (report && report.results.length > 0) {
            hasReportContent = true;
        }
        this.setState({ viewState: (await devtoolsController.getViewState())!, reportContent: hasReportContent });
    }

    async scan() {
        this.setState( { scanInProgress: true, scannedOnce: true });
        let tabController = getTabController();
        await (await tabController).requestScan();
    }

    render() {
        return (
            <Grid className="scanSection"> 
                <Column sm={3} md={6} lg={6}>
                    <Button 
                        size="sm"
                        style={{minWidth: "140px"}}
                        disabled={this.state.pageStatus !== "complete" || this.state.scanInProgress} 
                        renderIcon={Renew} 
                        onClick={() => { 
                            this.scan(); 
                        }
                    }>Scan</Button>
                </Column>
                <Column sm={1} md={2} lg={2} style={{marginLeft:"auto"}}>
                    <Button
                        hasIconOnly
                        renderIcon={this.state.viewState.kcm ? KeyboardOff : Keyboard} 
                        disabled={!this.state.reportContent}
                        iconDescription="Keyboard Checker Mode" tooltipPosition="left" 
                        onClick={async () => {
                            let newState :ViewState = JSON.parse(JSON.stringify(this.state.viewState));
                            newState.kcm = !newState.kcm;
                            await devtoolsController.setViewState(newState);
                        }}
                        size="sm"
                        kind="secondary"
                    />
                </Column>
            </Grid>
        );
    }
}