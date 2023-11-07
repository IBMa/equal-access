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
import { BrowserDetection } from '../util/browserDetection';
import {
    Column,
    ComposedModal,
    Grid,
    ModalBody,
    ModalHeader,
    Theme
} from "@carbon/react";

import "../styles/index.scss";
import "./devToolsApp.scss";
import SplashScreen from './components/splashScreen';
import HelpScreen from "./components/helpScreen";
import StoredScreen from './components/storedScreen';
import SummaryScreen from './components/summaryScreen';
import KCMOverviewScreen from './components/kcmOverviewScreen';
import { ePanel } from './devtoolsController';
import CheckerViewAware from './components/checkerViewAware';
import { getBGController } from "../background/backgroundController";
import { ISettings } from '../interfaces/interfaces';


interface DevToolsAppProps {
    panel: ePanel;
}

interface DevToolsAppState {
    secondaryView: eSecondaryView
    secondaryOpen: boolean
}

export class DevToolsApp extends React.Component<DevToolsAppProps, DevToolsAppState> {
    bgController = getBGController();
    devtoolsAppController = getDevtoolsAppController();
    
    state : DevToolsAppState = {
        secondaryView: "checkerViewAware",
        secondaryOpen: true
    }

    

    componentDidMount(): void {
        this.bgController.getSettings().then((settings: ISettings) => {
            if (this.props.panel === "main" && settings.checkerViewAwareFirstTime) {
                this.setState({ secondaryView: "checkerViewAware" });
            } else {
                this.setState({ secondaryOpen: false});
                this.setState({ secondaryView: "splash" });
            }
        });
        this.devtoolsAppController.addSecondaryOpenListener((open: boolean) => {
            this.setState({secondaryOpen: open});
        })
        this.devtoolsAppController.addSecondaryViewListener((view: eSecondaryView) => {
            this.setState({secondaryView: view});
        })
        if (this.props.panel === "elements") {
            this.devtoolsAppController.hookSelectionChange();
        }
    }

    
    displayVersion() {
        let manifest = chrome.runtime.getManifest();
        let extVersion = manifest.version;
        if (extVersion.endsWith(".9999")) {
            return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1");
        } else {
            return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1-rc.$2");
        }
    }

    render() {
        
        let primaryPanel = <div style={{display: "flex", flexFlow: "column", height: "100%"}}>
            <HeaderSection />
            <ScanSection />
            <ReportSection panel={this.props.panel}/>
        </div>

        let secondaryPanel = <>
            {this.state.secondaryView === "checkerViewAware" && <CheckerViewAware />}
            {this.state.secondaryView === "splash" && <SplashScreen />}
            {this.state.secondaryView === "help" && <HelpScreen />}
            {this.state.secondaryView === "stored" && <StoredScreen /> }
            {this.state.secondaryView === "summary" && <SummaryScreen /> }
            {this.state.secondaryView === "kcm_overview" && <KCMOverviewScreen /> }
        </>;
        let secondaryPanelModal = <>
            {this.state.secondaryView === "checkerViewAware" && <CheckerViewAware />}
            {this.state.secondaryView === "splash" && <SplashScreen />}
            {this.state.secondaryView === "help" && <HelpScreen />}
            {this.state.secondaryView === "stored" && <StoredScreen /> }
            {this.state.secondaryView === "summary" && <SummaryScreen /> }
            {this.state.secondaryView === "kcm_overview" && <KCMOverviewScreen /> }
        </>;

        return <Theme theme={BrowserDetection.isDarkMode()?"g100":"white"} style={{padding: "0rem", minHeight: "100%", maxHeight: "100%", height: "100%"}}>
        <Grid fullWidth={true} narrow={true} className="primaryColumn" style={{padding: "0rem", minHeight: "100%", maxHeight: "100%", height: "100%"}}>
                
                <Column className="primaryPanelColumn" sm={4} md={8} lg={8} style={{margin: "0rem", minHeight: "100%", maxHeight: "100%", height: "100%" }}>
                    <div style={{ width: "calc(100% - 1rem", minHeight: "100%", maxHeight: "100%", height: "100%" }}>
                        {primaryPanel}
                    </div>
                </Column>
                    
                <Column sm={0} md={0} lg={8} className={`secondaryColumn ${BrowserDetection.isDarkMode()?"cds--g90":"cds--g10"}`} style={{margin: "0rem", overflowY: "auto", maxHeight: "100%" }}>
                        {secondaryPanel}
                </Column>
            </Grid>
            {typeof document === 'undefined'
                ? null
                : ReactDOM.createPortal(
                    
                    <div className={`secondaryDialog ${BrowserDetection.isDarkMode()?"cds--g90":"cds--g10"}`}>
                        <ComposedModal 
                            open={this.state.secondaryOpen} 
                            onClose={() => {
                                let devtoolsAppController = getDevtoolsAppController();
                                if (devtoolsAppController.getSecondaryView() === "checkerViewAware") {
                                    devtoolsAppController.closeSecondary();
                                    setTimeout(() => {
                                        devtoolsAppController.setSecondaryView("splash");
                                    }, 1500);
                                } else {
                                    this.devtoolsAppController.closeSecondary();
                                }
                            }}
                            style={{height: "100%"}}
                            isFullWidth={true}
                            size="lg"
                            selectorPrimaryFocus=".secondaryDialog button"
                        >

                            <ModalHeader style={{marginBottom: "2rem"}}/>
                            <ModalBody style={{paddingLeft: "0rem", paddingRight: "0rem", marginBottom: "0rem", height: "100%"}}>
                                    {secondaryPanelModal}
                            </ModalBody>
                        </ComposedModal>
                    </div>,
                    document.body
                )
            }
        </Theme>  
    }
    
    
}
