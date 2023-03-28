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

import { Column, Grid, Checkbox } from '@carbon/react';
import { ISettings } from "../../interfaces/interfaces";
import { getBGController } from "../../background/backgroundController";

import "./kcmOverviewScreen.scss";

import {
    Keyboard,
    KeyboardOff
} from "@carbon/react/icons";

interface IKCMOverviewScreenState {
    settings?: ISettings
}

interface IKCMOverviewScreenProps {
}
let count = 0;
export default class KCMOverviewScreen extends React.Component<IKCMOverviewScreenProps, IKCMOverviewScreenState> {
    private bgController = getBGController();
    state: IKCMOverviewScreenState = {
    }
    myCount = count++;
    async componentDidMount(): Promise<void> {
        this.bgController.addSettingsListener(async (settings) => {
            this.setState({ settings });
        })
        this.setState({
            settings: await this.bgController.getSettings()
        });
    }

    render() {
        let showAgainChecked: boolean = this.state.settings ? !this.state.settings?.tabStopAlerts : false;
        return <aside className="kcmOverview">
            {/* KCM Overview Title */}
            <Grid style={{marginTop: "1rem", marginBottom: "1rem"}}>
                <Column sm={{ span: 4 }} md={{ span: 8 }} lg={{ span: 8 }}>
                    <span className="kcmTitle">Keyboard tab stops </span>
                    <span style={{position:"relative", top:"5px" }}><Keyboard size={24} /></span>
                </Column>
            </Grid>
            {/* Left Column */}
            <Grid>
                <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                    <div className="kcmExplain">
                        <div style={{marginBottom:"1rem"}}>
                            This feature shows the existing keyboard tab order and flags potential accessibility issues that need your review.  
                            To use the visualization effectively do the following:
                        </div>

                        <div><span style={{fontWeight:"bold"}}>Step 1</span> Check for errors in the tab stop order</div>
                        <div><span style={{fontWeight:"bold"}}>Step 2</span> Look for extra tab stops</div>
                        <div style={{marginBottom:"1rem"}}><span style={{fontWeight:"bold"}}>Step 3</span> Identify missing tab stops</div>

                        <div style={{marginBottom:"1rem"}}>
                            The list view shows only keyboard tab stop access issues. 
                        </div>

                        <div style={{marginBottom:"1rem"}}>
                            Not all keyboard accessibility issues are detectable with this tool, manual testing is required. 
                            Refer to the <a className="link" href={chrome.runtime.getURL("quickGuideAC.html")} target="_blank">quick guide</a> for more information.
                        </div>

                        <div style={{marginBottom:"1rem"}}>
                            You can turn off connecting lines in <a className="link" href={chrome.runtime.getURL("options.html")} target="_blank">options</a> and read more in the <a className="link" href={chrome.runtime.getURL("usingAC.html")} target="_blank">user guide</a>. 
                        </div>

                        <div style={{marginBottom:"1rem"}}>
                            <Checkbox 
                                labelText="Do not show this again" 
                                id={`kcmAlertCheckbox_${this.myCount}`}
                                checked={ showAgainChecked }
                                onChange={(_evt: any, evtState: { checked: boolean, id: string }) => {
                                    if (this.state.settings !== undefined) {
                                        let newState = JSON.parse(JSON.stringify(this.state.settings));
                                        newState.tabStopAlerts = !evtState.checked;
                                        this.bgController.setSettings(newState); // App state
                                        this.setState({ settings: newState }); // internal state
                                    }
                                }} 

                            />
                            {/* <Toggle
                                aria-label="toggle button"
                                labelText="Do not show this again"
                                id="alertToggle"
                                toggled={this.state.settings?.tabStopAlerts}
                                onToggle={(value: any) => {
                                    console.log("tabStopAlerts value = ",value);
                                    // this.setState({ tabStopAlerts: value });
                                }} 
                            /> */}
                        </div>

                    </div>
                </Column>

                {/* Right Column */}

                <Column style={{marginLeft:"0", borderLeft:"double"}} sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                    
                    <Grid style={{marginBottom: "1rem"}}>
                        <Column sm={{ span: 1 }} md={{ span: 1 }} lg={{ span: 1 }}>
                            
                        </Column>
                        <Column sm={{ span: 3 }} md={{ span: 3 }} lg={{ span: 3 }}>
                            <div className="kcmExplain">
                                <span className="visualization-guide" style={{fontWeight:"bold", marginBottom:"2rem"}}>Visualization guide</span>
                            </div>
                        </Column>
                    </Grid>
                    
                    <Grid style={{marginBottom: "1rem"}}>
                        <Column sm={{ span: 1 }} md={{ span: 1 }} lg={{ span: 1 }}>
                            <svg height="50" width="50">
                                <circle cx="34" cy="20" r="13" stroke="#C6C6C6" stroke-width="3" fill="#525252" />
                                <text className="visualization-guide-text" fill="white" x="31" y="23">2</text>
                            </svg>
                        </Column>
                        <Column sm={{ span: 3 }} md={{ span: 3 }} lg={{ span: 3 }}>
                        <div className="kcmExplain">
                            <div style={{marginBottom:"1rem"}}>
                                Numbered tab stop with no detected issues. Clicking will show element in the DOM.
                            </div>
                        </div>
                        </Column>
                    </Grid>
                    
                    <Grid style={{marginBottom: "2rem"}}>
                        <Column sm={{ span: 1 }} md={{ span: 1 }} lg={{ span: 1 }}>
                            <svg height="50" width="50">
                                <circle cx="32" cy="25" r="16" stroke="#FF8389" stroke-width="3" fill="#525252" />
                                <text className="visualization-guide-text" fill="white" x="25" y="28">11</text>
                                <svg className="svgNotificationDot" xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 32 32" stroke="#525252" stroke-width="1">
                                    <circle cx="105" cy="25" stroke="black" stroke-width="1" r="12" fill="#FF8389"></circle>
                                </svg>
                            </svg>
                
                        </Column>
                        <Column sm={{ span: 3 }} md={{ span: 3 }} lg={{ span: 3 }}>
                            <div className="kcmExplain">
                                <div style={{marginBottom:"1rem"}}>
                                Numbered tab stop with detected issues. Click to learn about the issues.
                                </div>
                            </div>
                        </Column>
                    </Grid>

                    <Grid style={{marginBottom: "2rem"}}>
                        <Column sm={{ span: 1 }} md={{ span: 1 }} lg={{ span: 1 }}>
                            <svg height="50" width="50">
                                <circle cx="32" cy="25" r="16" stroke="#FF8389" stroke-width="3" fill="#525252" />
                                <text className="visualization-guide-text" fill="white" x="30" y="28">?</text>
                                <svg className="svgNotificationDot" xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 32 32" stroke="#525252" stroke-width="1">
                                    <circle cx="105" cy="25" stroke="black" stroke-width="1" r="12" fill="#FF8389"></circle>
                                </svg>
                            </svg>
                
                        </Column>
                        <Column sm={{ span: 3 }} md={{ span: 3 }} lg={{ span: 3 }}>
                            <div className="kcmExplain">
                                <div style={{marginBottom:"1rem"}}>
                                    Tab stops that are not in the tab order. Click to learn more.
                                </div>
                            </div>
                        </Column>
                    </Grid>

                    <Grid style={{marginBottom: "1rem"}}>
                        <Column sm={{ span: 1 }} md={{ span: 1 }} lg={{ span: 1 }}>
                            
                        </Column>
                        <Column sm={{ span: 3 }} md={{ span: 3 }} lg={{ span: 3 }}>
                            <div className="kcmExplain">
                                <span className="visualization-guide" style={{fontWeight:"bold", marginBottom:"2rem"}}>Exit</span>
                            </div>
                        </Column>
                    </Grid>
                    
                    <Grid style={{marginBottom: "1rem"}}>
                        <Column sm={{ span: 1 }} md={{ span: 1 }} lg={{ span: 1 }} style={{marginRight:"5px"}}>
                            <div style={{width:"30px", height:"30px", backgroundColor:"black", float:"right", position:"relative"}}>
                                <div style={{position:"absolute", width:"16px", height:"16px", top:"7px", right:"7px", backgroundColor:"white", filter:"invert(100%)"}}><KeyboardOff size={16} /></div>
                            </div>
                        </Column>
                        <Column sm={{ span: 3 }} md={{ span: 3 }} lg={{ span: 3 }}>
                        <div className="kcmExplain">
                            <div style={{marginBottom:"1rem"}}>
                                Click on the keyboard icon to return to the regular view.
                            </div>
                        </div>
                        </Column>
                    </Grid>
                    

                </Column>
            </Grid>
        </aside>;
    }
}