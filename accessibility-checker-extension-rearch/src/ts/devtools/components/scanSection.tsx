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
import { getDevtoolsController } from '../devtoolsController';
import { getTabId } from '../../util/tabId';
import { getBGController, TabChangeType } from '../../background/backgroundController';
import { 
    Button,
    Column,
    Grid 
} from "@carbon/react";
import {
    Renew
} from "@carbon/react/icons";

let devtoolsController = getDevtoolsController();
let bgController = getBGController();

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
        bgController.addTabChangeListener( {
            callbackDest: { 
                type: "extension"
            },
            callback: async (content: TabChangeType) => {
                if (content.changeInfo.status) {
                    this.setState({ pageStatus: content.changeInfo.status });
                }
            }
        });
    }

    async scan() {
        this.setState( { scanInProgress: true });
        let tabController = getTabController();
        await (await tabController).requestScan();
    }

    render() {
        return (
            <Grid className="scanSection"> 
                <Column sm={4} md={8} lg={8}>
                    <Button 
                        size="sm"
                        disabled={this.state.pageStatus !== "complete" || this.state.scanInProgress} 
                        renderIcon={Renew} 
                        onClick={() => { 
                            this.scan(); 
                        }
                    }>Scan</Button>
                </Column>
            </Grid>
        );
    }
}