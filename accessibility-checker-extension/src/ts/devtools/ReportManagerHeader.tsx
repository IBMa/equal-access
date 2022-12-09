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

    import {
        Column, Grid, Button
    } from '@carbon/react';
    
    
    // const BeeLogo = "/assets/BE_for_Accessibility_darker.svg";
    // import { ArrowLeft16 } from '@carbon/react/icons/lib/index';
    
    interface IReportManagerHeaderState {
    }
    
    interface IReportManagerHeaderProps {
        layout: "main" | "sub",
        reportManagerHelp: () => void,
        actualStoredScansCount: () => number,
        scanStorage: boolean,
    }
    
    export default class ReportManagerHeader extends React.Component<IReportManagerHeaderProps, IReportManagerHeaderState> {
        state: IReportManagerHeaderState = {};
        
        componentDidMount(){
        }

        componentDidUpdate() {
            let button = document.getElementById('backToListView1');
            if (button) {
                button.focus();
            }
        }
   
        render() {
            // console.log("Render Report Manager Header");
            let headerContent = (
                <div style={{paddingTop:"8px"}}>
                    <Grid style={{padding: "0rem"}}>
                        <Column sm={{span: 2}} md={{span: 4}} lg={{span: 8}}>
                            <Button id='backToListView1' onClick={this.props.reportManagerHelp} kind='tertiary' size="sm" >Back to list view</Button>
                        </Column>
                        <Column sm={{span: 2}} md={{span: 4}} lg={{span: 8}} style={{position: "relative", textAlign:"right", paddingRight:"0px", paddingTop:"2px"}}>
                            <div>
                            <span>Status: </span>
                            <span>{this.props.scanStorage === true ? "storing, " : ""}</span>
                            <span>{this.props.actualStoredScansCount().toString() === "0" ? "no scans stored" : (this.props.actualStoredScansCount().toString() === "1" ? this.props.actualStoredScansCount().toString() + " scan stored" : this.props.actualStoredScansCount().toString() + " scans stored")}</span>
                            </div>
                        </Column>
                    </Grid>
                </div>);
    
            if (this.props.layout === "main") {
                return <div className="fixed-header" 
                        style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)", left: "50%", width: "50%", top: "1rem"}}>
                    {headerContent}                        
                </div>
            } else {
                return <div className="fixed-header" style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)", width: "100%"}}>
                    {headerContent}            
                </div>
            }
        }
    }