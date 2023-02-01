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
import { Button } from "@carbon/react";
import { getDevtoolsController } from '../devtoolsController';
import { getTabId } from '../../util/tabId';

let tabController = getTabController();
let devtoolsController = getDevtoolsController();

interface ScanSectionState {
    scanInProgress: boolean
    pageStatus: string
}

export class ScanSection extends React.Component<{}, ScanSectionState> {
    state : ScanSectionState = {
        scanInProgress: false,
        pageStatus: "complete"
    }

    componentDidMount(): void {
        devtoolsController.addReportListener({
            callback: async (_report) => {
                this.setState( { scanInProgress: false });
            },
            callbackDest: {
                type: "devTools",
                tabId: getTabId()!
            }
        });
        chrome.tabs.onUpdated.addListener((_changedTabId, changeInfo, _tab) => {
            if (changeInfo.status) {
                this.setState({ pageStatus: changeInfo.status });
            }
        });
    }

    async scan() {
        this.setState( { scanInProgress: true });
        await (await tabController).requestScan();
    }

    render() {
        return <Button disabled={this.state.pageStatus !== "complete" || this.state.scanInProgress} onClick={() => { this.scan(); }}>Scan</Button>
    }
}