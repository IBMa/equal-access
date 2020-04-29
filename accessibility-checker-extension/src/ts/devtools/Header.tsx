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

import { Reset16 } from '@carbon/icons-react';
// import { SettingsAdjust16 } from '@carbon/icons-react';
import { ReportData16 } from '@carbon/icons-react';

const BeeLogo = "/assets/Bee_logo.svg";
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";
// const Violation16 = "/assets/Violation16.png";

interface IHeaderState {
}

interface IHeaderProps {
    layout: "main" | "sub",
    startScan: () => void,
    collapseAll: () => void,
    reportHandler: () => void,
    counts?: { [key: string]: number } | null;
}

export default class Header extends React.Component<IHeaderProps, IHeaderState> {
    state: IHeaderState = {};
    
    render() {
        let counts = this.props.counts;

        if (!counts) {
            counts = {}
        }

        let headerContent = (<div className="bx--grid">
            <div className="bx--row" style={{height: "2rem"}}>
                <div className="bx--col-sm-3">
                    <div className="eaacTitle"><span style={{fontWeight:"bold"}}>IBM Equal Access </span>Accessibility Checker</div>
                </div>
                <div className="bx--col-sm-1" style={{position: "relative"}}>
                    <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" />
                </div>
            </div>
            <div className="bx--row">
                <div className="bx--col-sm-2">
                    <Button onClick={this.props.startScan.bind(this)} size="small" className="scan-button">Scan</Button>
                </div>
                <div className="bx--col-sm-2" style={{position: "relative"}}>
                    <div className="headerTools" >
                        <Button 
                            disabled={!this.props.counts}
                            onClick={this.props.collapseAll}
                            className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Reset selections" type="button" 
                            >
                            <Reset16 aria-label="Reset selections" className="my-custom-class" />
                        </Button>
                        {/* <Button 
                            disabled={!this.props.counts}
                            className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Filter" type="button" 
                            >
                            <SettingsAdjust16 aria-label="Filter" className="my-custom-class" />
                        </Button> */}
                        <Button 
                            disabled={!this.props.counts}
                            onClick={this.props.reportHandler} 
                            className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Report" type="button" 
                            >
                            <ReportData16 aria-label="Report" className="my-custom-class" />
                        </Button>
                {/* <Button className="settingsButtons" size="small" hasIconOnly kind="primary" iconDescription="Report" type="button" style={{ color: "black", backgroundColor: "white"}}>
                    <Settings16 aria-label="Report" className="my-custom-class" />
                </Button> */}
                    </div>
                </div>
            </div>
            
            <div className="bx--row summary">
                <div className="bx--col-sm-1">
                    <img src={Violation16} style={{verticalAlign:"middle",marginBottom:"4px"}} alt="Needs review" />
                    <span className="summaryBarCounts">{counts["Violation"] || 0}&nbsp;<span className="summaryBarLabels">Violations</span></span>
                </div>
                <div className="bx--col-sm-1">
                    <img src={NeedsReview16} style={{verticalAlign:"middle",marginBottom:"4px"}} alt="Needs review" />
                    <span className="summaryBarCounts">{counts["Needs review"] || 0}&nbsp;<span className="summaryBarLabels">Needs&nbsp;review</span></span>
                </div>
                <div className="bx--col-sm-1">
                    <img src={Recommendation16} style={{verticalAlign:"middle",marginBottom:"2px"}} alt="Recommendation" />
                    <span className="summaryBarCounts">{counts["Recommendation"] || 0}&nbsp;<span className="summaryBarLabels">Recommendations</span></span>
                </div>
                <div className="bx--col-sm-1">
                    <span className="summaryBarCounts" style={{fontWeight:400}}>{(counts["Violation"] || 0)+(counts["Needs review"] || 0)+(counts["Recommendation"] || 0)}&nbsp;Issues&nbsp;found</span>
                </div>
            </div>
        </div>);

        if (this.props.layout === "main") {
            return <div className="fixed-header" 
                    style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)", left: "50%", width: "50%", top: "1rem"}}>
                {headerContent}                        
            </div>
        } else {
            return <div className="fixed-header" style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)"}}>
                {headerContent}            
            </div>
        }
    }
}