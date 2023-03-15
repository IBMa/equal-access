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
import { 
    Button,
    Column,
    Grid
} from "@carbon/react";

import {
    Help,
    Settings
} from "@carbon/react/icons";

import "./headerSection.scss";

export class HeaderSection extends React.Component {
    render() {
        return (
            <Grid className="headerSection"> 
                <Column sm={4} md={8} lg={8}>
                    <div style={{ display: "flex" }}>
                        <h1 style={{ flex: "1 1 10rem"}}>IBM Equal Access Accessibility Checker</h1>
                        <div style={{ flex: "0 1 5rem"}}>
                            <Button 
                                renderIcon={Help} 
                                kind="ghost"   
                                hasIconOnly iconDescription="Help" tooltipPosition="left" 
                                onClick={(() => {
                                    let url = chrome.runtime.getURL("quickGuideAC.html");
                                    window.open(url, "_blank");
                                }).bind(this)}>
                            </Button>
                            <Button 
                                renderIcon={Settings} 
                                kind="ghost"   
                                hasIconOnly iconDescription="Settings" tooltipPosition="left" 
                                style={{marginRight: "-1rem"}}
                                onClick={(() => {
                                    let url = chrome.runtime.getURL("options.html");
                                    window.open(url, "_blank");
                                }).bind(this)}>
                            </Button>
                        </div>
                    </div>
                </Column>
            </Grid>
        )
    }
}