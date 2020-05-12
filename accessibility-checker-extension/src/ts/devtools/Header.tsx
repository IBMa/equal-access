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

interface IHeaderState {
}

interface IHeaderProps {
    layout: "main" | "sub",
    startScan: () => void,
    collapseAll: () => void,
    reportHandler: () => void,
    counts?: { 
        "total": { [key: string]: number },
        "filtered": { [key: string]: number }
    } | null

}

export default class Header extends React.Component<IHeaderProps, IHeaderState> {
    state: IHeaderState = {};
    
    render() {
        let counts = this.props.counts;

        if (!counts) {
            counts = {
                "total": {},
                "filtered": {}
            }
        }
        counts.total["Violation"] = counts.total["Violation"] || 0;
        counts.total["Needs review"] = counts.total["Needs review"] || 0;
        counts.total["Recommendation"] = counts.total["Recommendation"] || 0;
        counts.total["All"] = counts.total["Violation"] + counts.total["Needs review"] + counts.total["Recommendation"];

        counts.filtered["Violation"] = counts.filtered["Violation"] || 0;
        counts.filtered["Needs review"] = counts.filtered["Needs review"] || 0;
        counts.filtered["Recommendation"] = counts.filtered["Recommendation"] || 0;
        counts.filtered["All"] = counts.filtered["Violation"] + counts.filtered["Needs review"] + counts.filtered["Recommendation"];

        let bDiff = counts.total["Violation"] !== counts.filtered["Violation"]
            || counts.total["Needs review"] !== counts.filtered["Needs review"]
            || counts.total["Recommendation"] !== counts.filtered["Recommendation"];

        let headerContent = (<div className="bx--grid">
            <div className="bx--row" style={{lineHeight: "1rem"}}>
                <div className="bx--col-sm-3">
                    <div className="eaacTitle"><span style={{fontWeight:"bold"}}>IBM Equal Access Accessibility Checker</span></div>
                </div>
                <div className="bx--col-sm-1" style={{position: "relative"}}>
                    <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" />
                </div>
            </div>
            <div className="bx--row" style={{marginTop:'16px'}}>
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
                    </div>
                </div>
            </div>
            
            <div className="bx--row summary">
                <div className="bx--col-sm-1">
                    <img src={Violation16} alt="Needs review" />
                    <span className="summaryBarCounts">{(bDiff?counts.filtered["Violation"]+"/":"")+counts.total["Violation"]}&nbsp;<span className="summaryBarLabels">Violations</span></span>
                </div>
                <div className="bx--col-sm-1">
                    <img src={NeedsReview16} alt="Needs review" />
                    <span className="summaryBarCounts">{(bDiff?counts.filtered["Needs review"]+"/":"")+counts.total["Needs review"]}&nbsp;<span className="summaryBarLabels">Needs&nbsp;review</span></span>
                </div>
                <div className="bx--col-sm-1">
                    <img src={Recommendation16} alt="Recommendation" />
                    <span className="summaryBarCounts">{(bDiff?counts.filtered["Recommendation"]+"/":"")+counts.total["Recommendation"]}&nbsp;<span className="summaryBarLabels">Recommendations</span></span>
                </div>
                <div className="bx--col-sm-1">
                    <span className="summaryBarCounts" style={{fontWeight:400}}>{(bDiff?counts.filtered["All"]+"/":"")+counts.total["All"]}&nbsp;Issues&nbsp;found</span>
                </div>
            </div>
        </div>);

        if (this.props.layout === "main") {
            return <div className="fixed-header" 
                style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)", left: "50%", width: "50%"}}>
                {headerContent}                        
            </div>
        } else {
            return <div className="fixed-header" style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)"}}>
                {headerContent}            
            </div>
        }
    }
}