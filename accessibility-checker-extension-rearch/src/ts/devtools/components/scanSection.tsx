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
import { getDevtoolsController, ViewState } from '../devtoolsController';
import { getTabId } from '../../util/tabId';
import { getBGController, TabChangeType } from '../../background/backgroundController';
import { 
    Button,
    Column,
    InlineLoading,
    Grid 
} from "@carbon/react";
import {
    Keyboard,
    KeyboardOff,
    Renew
} from "@carbon/react/icons";
import { ListenerType } from '../../messaging/controller';
import { IReport } from '../../interfaces/interfaces';

let devtoolsController = getDevtoolsController();
let bgController = getBGController();

interface ScanSectionState {
    scanInProgress: number
    pageStatus: string
    viewState: ViewState
    reportContent: boolean
    scannedOnce: boolean
}

export class ScanSection extends React.Component<{}, ScanSectionState> {
    state : ScanSectionState = {
        scanInProgress: 0,
        pageStatus: "complete",
        viewState: {
            kcm: false
        },
        scannedOnce: false,
        reportContent: false
    }

    reportListener : ListenerType<IReport> = async (report) => {
        let self = this;
        let hasReportContent = false;
        if (report && report.results.length > 0) {
            hasReportContent = true;
        }
        self.setState( { scanInProgress: hasReportContent ? 2 : 0, reportContent: hasReportContent });
        setTimeout(() => {
            self.setState( { scanInProgress: 0 });
        }, 500);
    }

    async componentDidMount(): Promise<void> {
        devtoolsController.addReportListener(this.reportListener);
        devtoolsController.addViewStateListener(async (newState) => {
            this.setState( { viewState: newState });
        })
        bgController.addTabChangeListener(async (content: TabChangeType) => {
            if (content.changeInfo.status) {
                this.setState({ pageStatus: content.changeInfo.status, scannedOnce: false });
            }
        });
        let hasReportContent = false;
        let report = await devtoolsController.getReport();
        if (report && report.results.length > 0) {
            hasReportContent = true;
        }
        this.setState({ viewState: (await devtoolsController.getViewState())!, reportContent: hasReportContent });
    }

    componentWillUnmount(): void {
        devtoolsController.removeReportListener(this.reportListener);
    }

    async scan() {
        this.setState( { scanInProgress: 1, scannedOnce: true });
        await bgController.requestScan(getTabId()!);
    }

    render() {
        return (
            <Grid className="scanSection"> 
                <Column sm={3} md={6} lg={6}>
                    {this.state.scanInProgress > 0 && <InlineLoading 
                        description={"Scanning"}
                        status={this.state.scanInProgress === 1 ? 'active' : 'finished'}
                    />}
                    {this.state.scanInProgress === 0 && <Button 
                        size="sm"
                        style={{minWidth: "140px"}}
                        disabled={this.state.pageStatus !== "complete"} 
                        renderIcon={Renew} 
                        onClick={() => { 
                            this.scan(); 
                        }
                    }>Scan</Button>}
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