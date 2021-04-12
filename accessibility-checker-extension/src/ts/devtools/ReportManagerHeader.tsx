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
        Button
    } from 'carbon-components-react';
    
    
    // const BeeLogo = "/assets/BE_for_Accessibility_darker.svg";
    // import { ArrowLeft16 } from '@carbon/icons-react';
    
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
           var button = document.getElementById('backToListView');
           if (button) {
               button.focus();
           }
        }
   
        render() {
            // console.log("Render Report Manager Header");
            let headerContent = (<div className="bx--grid" style={{paddingLeft:"1rem"}}>
                <div className="bx--row" style={{height: "2rem"}}>
                    <div className="bx--col-sm-2">
                        <div className="eaacTitle"><span style={{fontWeight:"bold"}}>IBM Equal Access Accessibility Checker</span></div>
                    </div>
                    <div className="bx--col-sm-2" style={{position: "relative", textAlign:"right", paddingRight:"0px", paddingTop:"2px"}}>
                        {/* <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" /> */}
                        <div>
                        <span>Status: </span>
                        <span>{this.props.scanStorage === true ? "storing, " : ""}</span>
                        <span>{this.props.actualStoredScansCount().toString() === "0" ? "no scans stored" : (this.props.actualStoredScansCount().toString() === "1" ? this.props.actualStoredScansCount().toString() + " scan stored" : this.props.actualStoredScansCount().toString() + " scans stored")}</span>
                    </div>
                    </div>
                </div>
                <div className="bx--row">
                    <div className="bx--col-sm-2">
                        <Button id='backToListView' onClick={this.props.reportManagerHelp} kind='tertiary' size="small" >Back to list view</Button>
                    </div>
                    <div className="bx--col-sm-2" style={{position: "relative"}}>
                        <div className="headerTools" >
               
                        </div>
                    </div>
                </div>
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