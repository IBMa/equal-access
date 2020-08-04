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
    MultiSelect, Button
} from 'carbon-components-react';

import { Reset16 } from '@carbon/icons-react';
// import { SettingsAdjust16 } from '@carbon/icons-react';
import { ReportData16 } from '@carbon/icons-react';

const BeeLogo = "/assets/Bee_logo.svg";
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";
import { Filter16 } from '@carbon/icons-react';
import ViolationsFiltered from "../../assets/ViolationsFiltered.svg";
import NeedsReviewFiltered from "../../assets/NeedsReviewFiltered.svg";
import RecommendationsFiltered from "../../assets/RecommendationsFiltered.svg";

interface IHeaderState {}

interface IHeaderProps {
    layout: "main" | "sub",
    startScan: () => void,
    collapseAll: () => void,
    reportHandler: () => void,
    showIssueTypeCallback: (type:string) => void,
    showIssueTypeMenuCallback: (type:string[]) => void,
    counts?: {
        "total": { [key: string]: number },
        "filtered": { [key: string]: number }
    } | null,
    dataFromParent: boolean[],
    scanning: boolean
}

export default class Header extends React.Component<IHeaderProps, IHeaderState> {
    state: IHeaderState = {};

    processSelectedIssueTypes (items:any) {
        let newItems = ["", "", ""];
        items.map((item:any) => {
            if (item.id === "Violations") {
                newItems[0] = "Violations";
            } else if (item.id === "NeedsReview") {
                newItems[1] = "NeedsReview";
            } else if (item.id === "Recommendations") {
                newItems[2] = "Recommendations";
            }
        })
        if (items.length == 0) {
            this.props.showIssueTypeMenuCallback(["Violations", "NeedsReview", "Recommendations"]);
        }
        if (items.length > 0) {
            this.props.showIssueTypeMenuCallback([newItems[0], newItems[1], newItems[2]]);
        }
    }
        
        
    sendShowIssueTypeData(type:string) {
        this.props.showIssueTypeCallback(type);
    }

    render() {
        let counts = this.props.counts;
        let noScan = counts ? true : false;
        if (this.props.scanning == true) {
            noScan = true;
        }

        const items = [
            {
                id: 'Violations',
                label: 'Violations'
            },
            {
                id: 'NeedsReview',
                label: 'Needs Review'
            },
            {
                id: 'Recommendations',
                label: 'Recommendations'
            }
        ]


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

        let headerContent = (<div className="bx--grid" style={{paddingLeft:"1rem", paddingRight:"1rem"}}>
            <div className="bx--row" style={{ lineHeight: "1rem" }}>
                <div className="bx--col-sm-3">
                    <h1>IBM Equal Access Accessibility Checker</h1>
                </div>
                <div className="bx--col-sm-1" style={{ position: "relative", textAlign: "right" }}>
                    <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" />
                </div>
            </div>
            <div className="bx--row" style={{ marginTop: '10px' }}>
                <div className="bx--col-sm-2">
                    <Button disabled={this.props.scanning} onClick={this.props.startScan.bind(this)} size="small" className="scan-button">Scan</Button>
                </div>
                <div className="bx--col-sm-2" style={{ position: "relative" }}>
                    <div className="headerTools" style={{display:"flex", justifyContent:"flex-end"}}>
                        <div style={{width:210, paddingRight:"16px"}}>
                        <MultiSelect
                            items={items}
                            onChange={(value) => this.processSelectedIssueTypes(value.selectedItems)}
                            direction="bottom"
                            disabled={!this.props.counts}
                            id="Filter issues"
                            initialSelectedItems={[items[0], items[1], items[2]]}
                            invalidText="Invalid Selection"
                            label="Filter issues"
                            light={false}
                            locale="en"
                            open={false}
                            selectionFeedback="top-after-reopen"
                            size="sm"
                            type="default"
                        />
                        </div>
                        <Button
                            disabled={!this.props.counts}
                            onClick={this.props.collapseAll}
                            className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Reset selections" type="button"
                        >
                            <Reset16 className="my-custom-class" />
                        </Button>
                        <Button
                            disabled={!this.props.counts}
                            onClick={this.props.reportHandler}
                            className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Report" type="button"
                        >
                            <ReportData16 className="my-custom-class" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="countRow summary" role="region" arial-label='Issue count' style={{marginTop:"14px"}}>
                <div className="countItem" style={{paddingTop:"0", paddingLeft:"0", paddingBottom:"0", height: "34px", textAlign:"left", overflow:"visible"}}>
                    <img src={Violation16} style={{verticalAlign:"middle",paddingTop:"0px", marginRight:"4px"}} alt="Violations" />
                    <span
                        style={{lineHeight:"32px"}} className="summaryBarCounts" >
                        {noScan ? ((bDiff ? counts.filtered["Violation"] + "/" : "") + counts.total["Violation"]) : " "}
                        <span className="summaryBarLabels" style={{marginLeft:"4px"}}>Violations</span>
                    </span>
                    {/* <span className="filterButtons">
                        <Button
                            disabled={!this.props.counts}
                            style={{paddingTop:"0px", paddingBottom:"0px"}}
                            onClick={() => this.sendShowIssueTypeData("Violations")}
                            aria-pressed = {this.props.dataFromParent[1]}
                            aria-label={"Filter by violations"}
                            className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Filter" type="button"
                            >
                            {(!noScan || this.props.scanning) ? <Filter16/> : (this.props.dataFromParent[0] || this.props.dataFromParent[1] ? <img src={ViolationsFiltered}/> : <Filter16/>)}    
                        </Button>
                    </span> */}
                </div>
                <div className="countItem" style={{paddingTop:"0", paddingBottom:"0", height: "34px", textAlign:"left", overflow:"visible"}}>
                    <img src={NeedsReview16} style={{verticalAlign:"middle",paddingTop:"0px", marginRight:"4px"}} alt="Needs review" />
                    <span style={{lineHeight:"32px"}} className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Needs review"] + "/" : "") + counts.total["Needs review"]) : " "}
                        <span className="summaryBarLabels" style={{marginLeft:"4px"}}>Needs review</span>
                    </span>
                    {/* <span className="filterButtons">
                        <Button
                            disabled={!this.props.counts}
                            style={{paddingTop:"0px", paddingBottom:"0px"}}
                            onClick={() => this.sendShowIssueTypeData("NeedsReview")}
                            aria-pressed = {this.props.dataFromParent[2]}
                            aria-label={"Filter by Needs review"}
                            className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Filter" type="button"
                            >
                            {(!noScan || this.props.scanning) ? <Filter16/> : (this.props.dataFromParent[0] || this.props.dataFromParent[2] ? <img src={NeedsReviewFiltered}/> : <Filter16/>)}
                        </Button>
                    </span> */}
                </div>
                <div className="countItem" style={{paddingTop:"0", paddingBottom:"0", height: "34px", textAlign:"left", overflow:"visible"}}>
                    <img src={Recommendation16} style={{verticalAlign:"middle",paddingTop:"0px", marginRight:"4px"}} alt="Recommendation" />
                    <span style={{lineHeight:"32px"}} className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Recommendation"] + "/" : "") + counts.total["Recommendation"]) : " "}
                        <span className="summaryBarLabels" style={{marginLeft:"4px"}}>Recommendations</span>
                    </span>
                    {/* <span className="filterButtons">
                        <Button
                            disabled={!this.props.counts}
                            style={{paddingTop:"0px", paddingBottom:"0px"}}
                            onClick={() => this.sendShowIssueTypeData("Recommendations")}
                            aria-pressed = {this.props.dataFromParent[3]}
                            aria-label={"Filter by Recommendations"}
                            className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Filter" type="button"
                            >
                            {(!noScan || this.props.scanning) ? <Filter16/> : (this.props.dataFromParent[0] || this.props.dataFromParent[3] ? <img src={RecommendationsFiltered}/> : <Filter16/>)} 
                        </Button>
                    </span> */}
                </div>
                <div className="countItem" role="status" style={{paddingTop:"0", paddingBottom:"0", height: "34px", textAlign:"right", overflow:"visible"}}>
                    {/* <span className="summaryBarCounts" style={{ fontWeight: 400 }}>{noScan ? ((bDiff ? counts.filtered["All"] + "/" : "") + counts.total["All"]) : " "}&nbsp;Issues&nbsp;{(bDiff ? "selected" : "found")}</span> */}
                    <span className="summaryBarCounts" style={{fontWeight: 400,lineHeight:"32px" }}>{!noScan ? "Not Scanned" : (this.props.scanning ? "Scanning...": ((bDiff ? counts.filtered["All"] + "/" : "") + counts.total["All"] + " Issues " + (bDiff ? "selected" : "found")))}</span>
                </div>
            </div>
        </div>);

        if (this.props.layout === "main") {
            return <div className="fixed-header"
                style={{ zIndex: 1000, backgroundColor: "rgba(255, 255, 255, 1)", left: "50%", width: "50%" }}>
                {headerContent}
            </div>
        } else {
            return <div className="fixed-header" style={{ zIndex: 1000, backgroundColor: "rgba(255, 255, 255, 1)" }}>
                {headerContent}
            </div>
        }
    }
}