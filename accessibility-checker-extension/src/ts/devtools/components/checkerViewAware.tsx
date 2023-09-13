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

import React from "react";

import { Grid, Column, Button } from '@carbon/react';
import { getBGController } from "../../background/backgroundController";
import { getDevtoolsAppController } from '../devtoolsAppController';
import { BrowserDetection } from '../../util/browserDetection';
import "./checkerViewAware.scss";
import chromeImg from "../../../assets/img/Chrome.svg";
import firefoxImg from "../../../assets/img/Firefox.svg";
import edgeImg from "../../../assets/img/Edge.svg";


interface CheckerViewAwareState {
}

interface CheckerViewAwareProps {
}
let count = 0;
export default class CheckerViewAware extends React.Component<CheckerViewAwareProps, CheckerViewAwareState> {
    private bgController = getBGController();
    state: CheckerViewAwareState = {
    }
    
    myCount = count++;
    async componentDidMount(): Promise<void> {
        this.bgController.addSettingsListener(async (settings) => {
            this.setState({ settings });
        });
        let settings = await this.bgController.getSettings(); 
        this.setState({ settings });
        settings.checkerViewAwareFirstTime = false;
        await this.bgController.setSettings(settings);
    }

    

    render() {
        BrowserDetection.setDarkLight();
        let usrAgent = navigator.userAgent;
        let elementTabImg: string | undefined;
        if (usrAgent.include("Edg/") {
            elementTabImg = edgeImg;
        } else if (usrAgent.includes("Firefox/")) {
            elementTabImg = firefoxImg;
        } else {
            elementTabImg = chromeImg;
        }
        return <aside className="checkerViewAware">
            {/* CheckerViewAware Title */}
            <Grid style={{marginTop: "1rem", marginBottom: "1rem"}}>
                <Column sm={{ span: 4 }} md={{ span: 8 }} lg={{ span: 8 }}>
                    <span className="modalHeading">Accessibility Assessment panel</span>
                </Column>
            </Grid>
            {/* Left Column */}
            <Grid>
                <Column sm={{ span: 4 }} md={{ span: 8 }} lg={{ span: 8 }}>
                    <div className="modalContent">
                        <div style={{marginBottom:"1rem"}}>
                            You are in the <b>Accessibility Assessment</b> panel of the Checker.
                        </div>
                        <div style={{marginBottom:"1rem"}}>
                            For code scanning functionality, navigate to the Accessibility Checker 
                            panel within the Elements panel in the Dev Tools. Be aware that this 
                            +panel can be nested within the dev tools navigation bar.
                        </div>
                        <div style={{marginBottom:"1rem"}}>
                            <img src ={elementTabImg} alt="Checker view on Elements Tab"></img>
                        </div>
                    </div>
                    <div>
                    <Button
                            id="checkerViewAwareButton"
                            kind="primary"
                            iconDescription="Dismiss one time info" tooltipPosition="left" 
                            onClick={async () => {
                                let devtoolsAppController = getDevtoolsAppController();
                                if (devtoolsAppController.getSecondaryView() === "checkerViewAware") {
                                    devtoolsAppController.setSecondaryView("splash");
                                    devtoolsAppController.closeSecondary();
                                }
                            }}
                            size="sm"
                        >Dismiss</Button>
                    </div>
                </Column>
            </Grid>
        </aside>
    }
}