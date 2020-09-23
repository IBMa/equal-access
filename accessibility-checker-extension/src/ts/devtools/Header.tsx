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
    Button, Checkbox, ContentSwitcher, Switch, Tooltip
} from 'carbon-components-react';
import { settings } from 'carbon-components';
import { Reset16, ReportData16, Renew16 } from '@carbon/icons-react';
import { IArchiveDefinition } from '../background/helper/engineCache';
import OptionUtil from '../util/optionUtil';

const BeeLogo = "/assets/BE_for_Accessibility_darker.svg";
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";

const { prefix } = settings;
interface IHeaderState { }

interface IHeaderProps {
    layout: "main" | "sub",
    startScan: () => void,
    collapseAll: () => void,
    reportHandler: () => void,
    xlsxReportHandler: () => void,
    // showIssueTypeCallback: (type:string) => void,
    // showIssueTypeMenuCallback: (type:string[]) => void,
    showIssueTypeCheckBoxCallback: (checked: boolean[]) => void,
    counts?: {
        "total": { [key: string]: number },
        "filtered": { [key: string]: number }
    } | null,
    dataFromParent: boolean[],
    scanning: boolean,
    archives: IArchiveDefinition[] | null,
    selectedArchive: string | null,
    selectedPolicy: string | null
    focusedViewCallback: (focus: boolean) => void,
    focusedViewFilter: boolean,
    focusedViewText: string,
    getCurrentSelectedElement: () => void
}

export default class Header extends React.Component<IHeaderProps, IHeaderState> {
    state: IHeaderState = {};

    processFilterCheckBoxes(value: boolean, id: string) {
        console.log("In processFilterCheckBoxes - dataFromParent", this.props.dataFromParent);
        let newItems = this.props.dataFromParent;
        if (id === "Violations") {
            newItems[1] = value;
        } else if (id === "NeedsReview") {
            newItems[2] = value;
        } else if (id === "Recommendations") {
            newItems[3] = value;
        }
        if (newItems[1] == true && newItems[2] == true && newItems[3] == true) {
            console.log("All true");
            newItems[0] = true;
            this.setState({ showIssueTypeFilter: newItems });
        } else if (newItems[1] == false && newItems[2] == false && newItems[3] == false) {
            console.log("All false");
            newItems[0] = true;
            this.setState({ showIssueTypeFilter: newItems });
        } else {
            console.log("Mixed");
            newItems[0] = false;
            this.setState({ showIssueTypeFilter: newItems });
        }
        console.log("After process: ", newItems);
        this.props.showIssueTypeCheckBoxCallback(newItems);
    }

    flipSwitch(index: number) {
        let focusValue = false;
        if (index === 0) {
            focusValue = true;
        } else {
            focusValue = false;
        }
        this.props.focusedViewCallback(focusValue);
    }

    onKeyDown(e: any) {
        if (e.keyCode === 13) {
            e.target.click();
        }
    }


    isLatestArchive(selectedArchive: string | null, archives: IArchiveDefinition[] | null) {

        let archive = archives?.filter((archive: any) => archive.id === selectedArchive)[0];

        if (selectedArchive == 'latest' || archive?.latest == true) {
            return true
        } else {
            return false;
        }
    }

    render() {
        let counts = this.props.counts;
        let noScan = counts ? true : false;
        if (this.props.scanning == true) {
            noScan = true;
        }

        let isLatestArchive = this.isLatestArchive(this.props.selectedArchive, this.props.archives);

        // const items = [
        //     {
        //         id: 'Violations',
        //         label: 'Violations'
        //     },
        //     {
        //         id: 'NeedsReview',
        //         label: 'Needs Review'
        //     },
        //     {
        //         id: 'Recommendations',
        //         label: 'Recommendations'
        //     }
        // ]


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

        let focusText = this.props.focusedViewText;

        let headerContent = (<div className="bx--grid" style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
            <div className="bx--row" style={{ lineHeight: "1rem" }}>
                <div className="bx--col-sm-3">
                    <h1>IBM Equal Access Accessibility Checker</h1>
                </div>
                <div className="bx--col-sm-1" style={{ position: "relative", textAlign: "right" }}>
                    <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" />
                </div>
            </div>

            {this.props.layout === "sub" ?
                <div className="bx--row" style={{ marginTop: '10px' }}>
                    <div className="bx--col-md-1" style={{ display: 'flex', alignContent: 'center' }}>
                        <Button disabled={this.props.scanning} renderIcon={Renew16} onClick={this.props.startScan.bind(this)} size="small" className="scan-button">Scan</Button>
                        {isLatestArchive ? "" : (
                            <Tooltip>
                                <p id="tooltip-body">
                                    You are usig a rule set from {OptionUtil.getRuleSetDate(this.props.selectedArchive, this.props.archives)}. The latest rule set is {OptionUtil.getRuleSetDate('latest', this.props.archives)}
                                </p>
                                <div className={`${prefix}--tooltip__footer`}>
                                    <a
                                        href={chrome.runtime.getURL("options.html")}
                                        target="_blank"
                                        className={`${prefix}--link`}
                                    >
                                        Change rule set
                                    </a>
                                </div>
                            </Tooltip>
                        )}
                    </div>
                    <div className="bx--col-md-3" style={{ height: "28px" }}>

                    </div>

                    <div className="bx--col-md-1" style={{paddingRight:0}}>
                        <div className="headerTools" style={{ display: "flex", justifyContent: "flex-end" }}>
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
                                className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Reports" type="button"
                            >
                                <ReportData16 className="my-custom-class" />
                            </Button>
                        </div>
                    </div>

                    <div className="bx--col-md-3">
                        <ContentSwitcher
                            title="Focused View"
                            style={{height: "30px"}}
                            selectionMode="manual"
                            selectedIndex={1}
                            onChange={((obj: any) => {
                                // console.log("the index: ",obj.index);
                                this.flipSwitch(obj.index);
                            })}
                        >
                            <Switch
                                disabled={!this.props.counts}
                                text={focusText}
                                onClick={() => {
                                    //this.props.getCurrentSelectedElement();
                                }}
                                onKeyDown={this.onKeyDown.bind(this)}
                            />
                            <Switch
                                disabled={!this.props.counts}
                                text="All"
                                onClick={() => {
                                    // console.log('All click');
                                }}
                                onKeyDown={this.onKeyDown.bind(this)}
                            />
                        </ContentSwitcher>

                    </div>
                </div>
                :
                <div className="bx--row" style={{ marginTop: '10px' }}>

                    <div className="bx--col-sm-2" style={{ display: 'flex', alignContent: 'center' }}>
                        <Button disabled={this.props.scanning} renderIcon={Renew16} onClick={this.props.startScan.bind(this)} size="small" className="scan-button">Scan</Button>
                        {isLatestArchive ? "" : (
                            <Tooltip>
                                <p id="tooltip-body">
                                    You are usig a rule set from {OptionUtil.getRuleSetDate(this.props.selectedArchive, this.props.archives)}. The latest rule set is {OptionUtil.getRuleSetDate('latest', this.props.archives)}
                                </p>
                                <div className={`${prefix}--tooltip__footer`}>
                                    <a
                                        href={chrome.runtime.getURL("options.html")}
                                        target="_blank"
                                        className={`${prefix}--link`}
                                    >
                                        Change rule set
                                    </a>
                                </div>
                            </Tooltip>
                        )}
                    </div>
                    <div className="bx--col-sm-2" style={{ position: "relative" }}>
                        <div className="headerTools" style={{ display: "flex", justifyContent: "flex-end" }}>
                            <div style={{ width: 210, paddingRight: "16px" }}>
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
                                className="settingsButtons" size="small" hasIconOnly kind="ghost" iconDescription="Reports" type="button"
                            >
                                <ReportData16 className="my-custom-class" />
                            </Button>
                        </div>
                    </div>
                </div>
            }

            <div className="countRow summary" role="region" arial-label='Issue count' style={{ marginTop: "14px" }}>
                <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                    <span style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                        <Checkbox
                            className="checkboxLabel"
                            disabled={!this.props.counts}
                            title="Filter violations"
                            aria-label="Filter violations"
                            defaultChecked
                            id="Violations"
                            indeterminate={false}
                            labelText={<React.Fragment><img src={Violation16} style={{ verticalAlign: "middle", paddingTop: "0px", marginRight: "4px" }} alt="Violations" /><span className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Violation"] + "/" : "") + counts.total["Violation"]) : " "}<span className="summaryBarLabels" style={{ marginLeft: "4px" }}>Violations</span></span></React.Fragment>}
                            // hideLabel
                            onChange={(value, id) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                            wrapperClassName="checkboxWrapper"
                        />
                    </span>
                </div>
                <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                    <span style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                        <Checkbox
                            className="checkboxLabel"
                            disabled={!this.props.counts}
                            title="Filter needs review"
                            aria-label="Filter needs review"
                            defaultChecked
                            id="NeedsReview"
                            indeterminate={false}
                            labelText={<React.Fragment><img src={NeedsReview16} style={{ verticalAlign: "middle", paddingTop: "0px", marginRight: "4px" }} alt="Needs review" /><span className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Needs review"] + "/" : "") + counts.total["Needs review"]) : " "}<span className="summaryBarLabels" style={{ marginLeft: "4px" }}>Needs review</span></span></React.Fragment>}
                            // hideLabel
                            onChange={(value, id) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                            wrapperClassName="checkboxWrapper"
                        />
                    </span>
                </div>
                <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                    <span style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                        <Checkbox
                            className="checkboxLabel"
                            disabled={!this.props.counts}
                            title="Filter recommendations"
                            aria-label="Filter recommendations"
                            defaultChecked
                            id="Recommendations"
                            indeterminate={false}
                            labelText={<React.Fragment><img src={Recommendation16} style={{ verticalAlign: "middle", paddingTop: "0px", marginRight: "4px" }} alt="Recommendations" /><span className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Recommendation"] + "/" : "") + counts.total["Recommendation"]) : " "}<span className="summaryBarLabels" style={{ marginLeft: "4px" }}>Recommendations</span></span></React.Fragment>}
                            // hideLabel
                            onChange={(value, id) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                            wrapperClassName="checkboxWrapper"
                        />
                    </span>
                </div>
                <div className="countItem" role="status" style={{ paddingTop: "0", paddingBottom: "0", height: "34px", textAlign: "right", overflow: "visible" }}>
                    {/* <span className="summaryBarCounts" style={{ fontWeight: 400 }}>{noScan ? ((bDiff ? counts.filtered["All"] + "/" : "") + counts.total["All"]) : " "}&nbsp;Issues&nbsp;{(bDiff ? "selected" : "found")}</span> */}
                    <span className="summaryBarCounts" style={{ fontWeight: 400, lineHeight: "32px" }}>{!noScan ? "Not Scanned" : (this.props.scanning ? "Scanning..." : ((bDiff ? counts.filtered["All"] + "/" : "") + counts.total["All"] + " Issues " + (bDiff ? "selected" : "found")))}</span>
                </div>
            </div>
        </div>);

        if (this.props.layout === "main") {
            return <div className="fixed-header"
                style={{ zIndex: 1000, backgroundColor: "rgba(255, 255, 255, 1)", width: "50%" }}>
                {headerContent}
            </div>
        } else {
            return <div className="fixed-header" style={{ zIndex: 1000, backgroundColor: "rgba(255, 255, 255, 1)", width: "100%" }}>
                {headerContent}
            </div>
        }
    }
}