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

import { eSecondaryView, getDevtoolsAppController } from './devtoolsAppController';

import { HeaderSection } from './components/headerSection';
import { ReportSection } from './components/reportSection';
import { ScanSection } from './components/scanSection';

import {
    Button,
    Column,
    ComposedModal,
    Grid,
    ModalBody,
    ModalHeader
} from "@carbon/react";

import "../styles/index.scss";
import "./devToolsApp.scss";
import Config from '../util/config';
import SplashScreen from './components/splashScreen';

interface DevToolsAppProps {
}

interface DevToolsAppState {
    secondaryView: eSecondaryView
    secondaryOpen: boolean
}

export class DevToolsApp extends React.Component<DevToolsAppProps, DevToolsAppState> {
    devtoolsAppController = getDevtoolsAppController();

    state : DevToolsAppState = {
        secondaryView: "splash",
        secondaryOpen: false
    }

    componentDidMount(): void {
        this.devtoolsAppController.addSecondaryOpenListener((open: boolean) => {
            this.setState({secondaryOpen: open});
        })
        this.devtoolsAppController.addSecondaryViewListener((view: eSecondaryView) => {
            this.setState({secondaryView: view});
        })
    }

    render() {
        let primaryPanel = <>
            <HeaderSection />
            <ScanSection />
            <ReportSection />
        </>

        let secondaryPanel = <>
            {this.state.secondaryView === "splash" && <SplashScreen />}
        </>;

        return <>
            <Grid fullWidth={true} narrow={true} style={{padding: "0rem", minHeight: "100%", maxHeight: "100%", height: "100%"}}>
                <Column sm={4} md={4} lg={8} style={{margin: "0rem", overflowY: "auto", maxHeight: "100%" }}>
                    <div style={{ width: "calc(100% - 1rem" }}>
                        {primaryPanel}
                    </div>
                </Column>
                <Column sm={0} md={4} lg={8} className="secondaryColumn" style={{margin: "0rem", overflowY: "auto", maxHeight: "100%" }}>
                    <div style={{ width: "calc(100% - 1rem", padding: "1rem 0rem" }}>
                        {secondaryPanel}
                    </div>
                </Column>
            </Grid>
            {typeof document === 'undefined'
                ? null
                : ReactDOM.createPortal(
                    <div className="secondaryDialog">
                        <ComposedModal 
                            open={this.state.secondaryOpen} 
                            onClose={() => {
                                this.devtoolsAppController.closeSecondary();
                            }}
                        >
                            { Config.SECONDARY_MODAL && <ModalHeader /> }
                            { !Config.SECONDARY_MODAL && <>
                                <div style={{
                                    backgroundColor: "white",
                                    padding: "1rem"
                                }}>
                                    <Button 
                                        size="sm"
                                        onClick={() => {
                                            this.devtoolsAppController.closeSecondary();
                                        }}
                                    >Back to list view</Button>
                                </div>
                            </>}
                            <ModalBody style={{paddingLeft: "0rem", paddingRight: "0rem", marginBottom: "0rem"}}>
                                {secondaryPanel}
                            </ModalBody>
                        </ComposedModal>
                    </div>,
                    document.body
                )
            }
        </>
    }
}
