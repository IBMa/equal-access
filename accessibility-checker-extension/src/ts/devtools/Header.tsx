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
import ReactTooltip from "react-tooltip";
import { IReportItem } from "./Report";

import {
    Button, Checkbox, ContentSwitcher, Switch, OverflowMenu, OverflowMenuItem, Modal
} from 'carbon-components-react';
import { settings } from 'carbon-components';
import { Information16, ReportData16, Renew16, ChevronDown16 } from '@carbon/icons-react';
import { IArchiveDefinition } from '../background/helper/engineCache';
import OptionUtil from '../util/optionUtil';
import PanelMessaging from '../util/panelMessaging';


const BeeLogo = "/assets/BE_for_Accessibility_darker.svg";
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";


const { prefix } = settings;
interface IHeaderState {
    deleteModal: boolean,
    modalRulsetInfo: boolean,
    showHideTabStops: boolean
}

interface IHeaderProps {
    layout: "main" | "sub",
    startScan: () => void,
    collapseAll: () => void,
    actualStoredScansCount: () => number,
    clearStoredScans: (fromMenu: boolean) => void,
    reportHandler: (scanType: string) => void,
    xlsxReportHandler: (scanType: string) => void,
    startStopScanStoring: () => void,
    reportManagerHandler: () => void,
    showIssueTypeCheckBoxCallback: (checked: boolean[]) => void,
    counts?: {
        "total": { [key: string]: number },
        "filtered": { [key: string]: number }
    } | null,
    dataFromParent: boolean[],
    storedScans: {
        actualStoredScan: boolean;  // denotes actual stored scan vs a current scan that is kept when scans are not being stored
        isSelected: boolean; // stored scan is selected in the Datatable
        url: string;
        pageTitle: string;
        dateTime: number | undefined;
        scanLabel: string;
        userScanLabel: string;
        ruleSet: any;
        guidelines: any;
        reportDate: Date;
        violations: any;
        needsReviews: any;
        recommendations: any;
        elementsNoViolations: number;
        elementsNoFailures: number;
        storedScan: string;
        screenShot: string;
        storedScanData: string;
    }[],
    scanning: boolean,
    scanStorage: boolean,
    archives: IArchiveDefinition[] | null,
    selectedArchive: string | null,
    selectedPolicy: string | null
    focusedViewCallback: (focus: boolean) => void,
    focusedViewFilter: boolean,
    focusedViewText: string,
    getCurrentSelectedElement: () => void,
    readOptionsData: () => void,
    tabURL: string,
    tabId: number,
    tabStopsShow: () => void,
    tabStopsResults: IReportItem[],
    tabStopsErrors: IReportItem[]
}

export default class Header extends React.Component<IHeaderProps, IHeaderState> {
    infoButton1Ref: React.RefObject<HTMLButtonElement>;
    infoButton2Ref: React.RefObject<HTMLButtonElement>;
    constructor(props: any) {
        super(props);
        this.infoButton1Ref = React.createRef();
        this.infoButton2Ref = React.createRef();
    }

    state: IHeaderState = {
        deleteModal: false,
        modalRulsetInfo: false,
        showHideTabStops: true
    };

    focusInfoButton1() {
        setTimeout(() => {
            this.infoButton1Ref.current?.focus();
        }, 0);
    }

    focusInfoButton2() {
        setTimeout(() => {
            this.infoButton2Ref.current?.focus();
        }, 0);
    }

    onLinkClick = () => {
        this.setState({ modalRulsetInfo: false });
        this.focusInfoButton1();
    };

    processFilterCheckBoxes(value: boolean, id: string) {
        // console.log("In processFilterCheckBoxes - dataFromParent", this.props.dataFromParent);
        let newItems = this.props.dataFromParent;
        if (id === "Violations") {
            newItems[1] = value;
        } else if (id === "NeedsReview") {
            newItems[2] = value;
        } else if (id === "Recommendations") {
            newItems[3] = value;
        }
        if (newItems[1] == true && newItems[2] == true && newItems[3] == true) {
            // console.log("All true");
            newItems[0] = true;
            // this.setState({ showIssueTypeFilter: newItems });
        } else if (newItems[1] == false && newItems[2] == false && newItems[3] == false) {
            // console.log("All false");
            newItems[0] = true;
            // this.setState({ showIssueTypeFilter: newItems });
        } else {
            // console.log("Mixed");
            newItems[0] = false;
            // this.setState({ showIssueTypeFilter: newItems });
        }
        // console.log("After process: ", newItems);
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

    deleteModalHandler() {
        this.setState({
            deleteModal: true,
        });
    }



    render() {
        let counts = this.props.counts;
        let noScan = counts ? true : false;
        if (this.props.scanning == true) {
            noScan = true;
        }

        // let isLatestArchive = this.isLatestArchive(this.props.selectedArchive, this.props.archives);

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
            {this.props.layout === "sub" ?
                <div className="bx--row" style={{ lineHeight: "1rem" }}>
                    <div className="bx--col-sm-4">
                        <h1>IBM Equal Access Accessibility Checker</h1>
                    </div>
                    {/* <div className="bx--col-sm-2" style={{ position: "relative", textAlign: "right", paddingTop:"2px" }}>
                    <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" />
                    <div>
                        <span>Status: </span>
                        <span>{this.props.scanStorage === true ? "storing, " : ""}</span>
                        <span>{this.props.actualStoredScansCount().toString() === "0" ? "no scans stored" : (this.props.actualStoredScansCount().toString() === "1" ? this.props.actualStoredScansCount().toString() + " scan stored" : this.props.actualStoredScansCount().toString() + " scans stored")}</span>
                    </div>
                </div> */}
                </div>
                : <div className="bx--row" style={{ lineHeight: "1rem" }}>
                    <div className="bx--col-sm-3">
                        <h1>IBM Equal Access Accessibility Checker</h1>
                    </div>
                    <div className="bx--col-sm-1" style={{ position: "relative", textAlign: "right", paddingTop: "2px" }}>
                        <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" />
                        {/* <div>
                        <span>Status: </span>
                        <span>{this.props.scanStorage === true ? "storing, " : ""}</span>
                        <span>{this.props.actualStoredScansCount().toString() === "0" ? "no scans stored" : (this.props.actualStoredScansCount().toString() === "1" ? this.props.actualStoredScansCount().toString() + " scan stored" : this.props.actualStoredScansCount().toString() + " scans stored")}</span>
                    </div> */}
                    </div>
                </div>
            }
            {/* Content for Checker Tab */}
            {this.props.layout === "sub" ?
                <React.Fragment>
                    <div className="bx--row" style={{ marginTop: '10px' }}>
                        <div className="bx--col-md-3 bx--col-sm-2" style={{ display: 'flex', alignContent: 'center' }}>
                            <Button disabled={this.props.scanning} renderIcon={Renew16} onClick={this.props.startScan.bind(this)} size="small" className="scan-button">Scan</Button>
                            <OverflowMenu
                                className="rendered-icon svg"
                                style={{ backgroundColor: "black", height: "32px", width: "32px" }}
                                iconDescription="Open and close report scan options"
                                renderIcon={ChevronDown16}
                                ariaLabel="Report menu"
                                // size="xl"
                                id="reportMenu"
                            >
                                <OverflowMenuItem
                                    style={{ maxWidth: "13rem", width: "13rem" }}
                                    disabled={this.props.storedScans.length == 0 ? true : false}
                                    itemText="Download current scan"
                                    onClick={() => this.props.reportHandler("current")}
                                />
                                <OverflowMenuItem
                                    style={{ maxWidth: "13rem", width: "13rem" }}
                                    // if scanStorage false not storing scans, if true storing scans
                                    itemText={this.props.scanStorage ? "Stop storing scans" : "Start storing scans"}
                                    onClick={this.props.startStopScanStoring}
                                />
                                <OverflowMenuItem
                                    style={{ maxWidth: "13rem", width: "13rem" }}
                                    disabled={this.props.actualStoredScansCount() == 0 ? true : false}
                                    itemText="Delete stored scans"
                                    // onClick={() => this.props.clearStoredScans(true) }
                                    onClick={() => this.deleteModalHandler()}
                                />
                                <OverflowMenuItem
                                    style={{ maxWidth: "13rem", width: "13rem" }}
                                    disabled={this.props.actualStoredScansCount() == 0 ? true : false} // disabled when no stored scans or 1 stored scan
                                    itemText="Download stored scans"
                                    onClick={() => this.props.reportHandler("all")}
                                />
                                <OverflowMenuItem
                                    style={{ maxWidth: "13rem", width: "13rem" }}
                                    disabled={this.props.actualStoredScansCount() == 0 ? true : false} // disabled when no stored scans or 1 stored scan
                                    itemText="View stored scans"
                                    onClick={this.props.reportManagerHandler} // need to pass selected as scanType
                                />
                            </OverflowMenu>
                            <Modal
                                aria-label="Delete stored scans"
                                modalHeading="Delete stored scans"
                                open={this.state.deleteModal}
                                shouldSubmitOnEnter={false}
                                onRequestClose={(() => {
                                    this.setState({ deleteModal: false });
                                }).bind(this)}
                                onRequestSubmit={(() => {
                                    this.setState({ deleteModal: false });
                                    this.props.clearStoredScans(true);
                                }).bind(this)}
                                danger={true}
                                size='sm'
                                selectorPrimaryFocus=".bx--modal-footer .bx--btn--secondary"
                                primaryButtonText="Delete"
                                secondaryButtonText="Cancel"
                                primaryButtonDisabled={false}
                                preventCloseOnClickOutside={true}
                            >
                                <p style={{ marginBottom: '1rem' }}>
                                    Are you sure you want to delete stored scans?
                                    This action is irreversible.
                                </p>
                            </Modal>
                            <Button
                                ref={this.infoButton1Ref}
                                renderIcon={Information16}
                                kind="ghost"
                                hasIconOnly iconDescription="Rule set info" tooltipPosition="top"
                                style={{
                                    color: "black", border: "none", verticalAlign: "baseline", minHeight: "28px",
                                    paddingTop: "8px", paddingLeft: "8px", paddingRight: "8px"
                                }}
                                onClick={(() => {
                                    this.props.readOptionsData();
                                    this.setState({ modalRulsetInfo: true });
                                }).bind(this)}>
                            </Button>
                            <Modal
                                aria-label="Rule set information"
                                modalHeading="Rule set information"
                                size='xs'
                                passiveModal={true}
                                open={this.state.modalRulsetInfo}
                                onRequestClose={(() => {
                                    this.setState({ modalRulsetInfo: false });
                                    this.focusInfoButton1();
                                }).bind(this)}
                            >
                                <p>
                                    You are using a rule set from {OptionUtil.getRuleSetDate(this.props.selectedArchive, this.props.archives)}.
                                    <span>{<br />}</span>
                                    The latest rule set is {OptionUtil.getRuleSetDate('latest', this.props.archives)}
                                    <br /><br />
                                    You are using the guidelines from {this.props.selectedPolicy}
                                </p>
                                <br></br>
                                <div>
                                    <a
                                        onClick={this.onLinkClick}
                                        href={chrome.runtime.getURL("options.html")}
                                        target="_blank"
                                        className={`${prefix}--link`}
                                    >
                                        Change rule set
                                    </a>
                                </div>
                            </Modal>




                        </div>
                        <div className="bx--col-md-2 bx--col-sm-0" style={{ height: "28px" }}></div>

                        <div className="bx--col-md-0 bx--col-sm-0" style={{ paddingRight: 0 }}></div>

                        <div className="bx--col-md-3 bx--col-sm-2">
                            <ContentSwitcher data-tip data-for="focusViewTip"
                                // title="Focus View"
                                style={{ height: "30px" }}
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

                            <ReactTooltip id="focusViewTip" place="top" effect="solid">
                                Focus view
                            </ReactTooltip>

                        </div>
                    </div>
                    <div className="bx--row" style={{ marginTop: '10px' }}>
                        <div className="bx--col-sm-2">
                            <div>
                                <span>Status: </span>
                                <span>{this.props.scanStorage === true ? "storing, " : ""}</span>
                                <span>{this.props.actualStoredScansCount().toString() === "0" ? "no scans stored" : (this.props.actualStoredScansCount().toString() === "1" ? this.props.actualStoredScansCount().toString() + " scan stored" : this.props.actualStoredScansCount().toString() + " scans stored")}</span>
                            </div>
                        </div >
                        <div className="bx--col-sm-2">
                            {this.state.showHideTabStops ? 
                                <a href="#" style={{ display: !this.props.counts ? "none" : ""}} onClick={() => {
                                    this.setState({ showHideTabStops: false });
                                    PanelMessaging.sendToBackground("DRAW_TABS_TO_BACKGROUND", { tabId: this.props.tabId, tabURL: this.props.tabURL, tabStopsResults: this.props.tabStopsResults, tabStopsErrors: this.props.tabStopsErrors });
                                    // this.props.tabStopsShow(); // old code that we should keep
                                }}>Show tab stops</a>
                            :   <a href="#" style={{ display: !this.props.counts ? "none" : ""}} onClick={() => {
                                PanelMessaging.sendToBackground("DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS", { tabId: this.props.tabId, tabURL: this.props.tabURL });
                                    this.setState({ showHideTabStops: true });
                                }}>Hide tab stops</a>
                            }
                        </div>
                    </div>
                </React.Fragment>
                // Content for the Assessment Tab
                :
                <div className="bx--row" style={{ marginTop: '10px' }}>
                    <div className="bx--col-sm-3" style={{ display: 'flex', alignContent: 'center' }}>
                        <Button disabled={this.props.scanning} renderIcon={Renew16} onClick={this.props.startScan.bind(this)} size="small" className="scan-button">Scan</Button>
                        <Button
                            ref={this.infoButton2Ref}
                            renderIcon={Information16}
                            kind="ghost"
                            hasIconOnly iconDescription="Rule set info" tooltipPosition="top"
                            style={{
                                color: "black", border: "none", verticalAlign: "baseline", minHeight: "28px",
                                paddingTop: "8px", paddingLeft: "8px", paddingRight: "8px"
                            }}
                            onClick={(() => {
                                this.props.readOptionsData();
                                this.setState({ modalRulsetInfo: true });
                            }).bind(this)}>
                        </Button>
                        <Modal
                            aria-label="Rule set information"
                            modalHeading="Rule set Information"
                            passiveModal={true}
                            open={this.state.modalRulsetInfo}
                            onRequestClose={(() => {
                                this.setState({ modalRulsetInfo: false });
                                this.focusInfoButton2();
                            }).bind(this)}
                        >
                            <p>
                                You are using a rule set from {OptionUtil.getRuleSetDate(this.props.selectedArchive, this.props.archives)}.
                                <span>{<br />}</span>
                                The latest rule set is {OptionUtil.getRuleSetDate('latest', this.props.archives)}
                            </p>
                            <br></br>
                            <div>
                                <a
                                    href={chrome.runtime.getURL("options.html")}
                                    target="_blank"
                                    className={`${prefix}--link`}

                                >
                                    Change rule set
                                </a>
                            </div>
                        </Modal>
                    </div>
                    <div className="bx--col-sm-1" style={{ position: "relative" }}>
                        <div className="headerTools" style={{ display: "flex", justifyContent: "flex-end" }}>
                            <div style={{ width: 210, paddingRight: "16px" }}>
                            </div>

                            <Button
                                disabled={!this.props.counts}
                                onClick={() => this.props.reportHandler("current")}
                                className="settingsButtons"
                                size="small"
                                hasIconOnly
                                kind="ghost"
                                tooltipAlignment="center"
                                tooltipPosition="top"
                                iconDescription="Reports"
                                type="button"
                            >
                                <ReportData16 />
                            </Button>
                        </div>
                    </div>
                </div>
            }
            {/* Counts row uses same code for both Assessment and Checker Tabs */}
            <div className={this.props.layout === "main" ? "countRow summary mainPanel" : "countRow summary subPanel"} role="region" aria-label='Issue count' style={{ marginTop: "14px" }}>
                <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                    <span data-tip data-for="filterViolationsTip" style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                        <Checkbox 
                            className="checkboxLabel"
                            disabled={!this.props.counts}
                            // title="Filter violations" // used react tooltip so all tooltips the same
                            aria-label="Filter by violations"
                            checked={this.props.dataFromParent[1]}
                            id="Violations"
                            indeterminate={false}
                            labelText={<React.Fragment><img src={Violation16} style={{ verticalAlign: "middle", paddingTop: "0px", marginRight: "4px" }} alt="Violations" /><span className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Violation"] + "/" : "") + counts.total["Violation"]) : " "}<span className="summaryBarLabels" style={{ marginLeft: "4px" }}>Violations</span></span></React.Fragment>}
                            // hideLabel
                            onChange={(value, id) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                            wrapperClassName="checkboxWrapper"
                        />
                        <ReactTooltip id="filterViolationsTip" place="top" effect="solid">
                            Filter by Violations
                        </ReactTooltip>
                    </span>
                </div>
                <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                    <span data-tip data-for="filterNeedsReviewTip" style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                        <Checkbox
                            className="checkboxLabel"
                            disabled={!this.props.counts}
                            // title="Filter needs review"
                            aria-label="Filter by needs review"
                            checked={this.props.dataFromParent[2]}
                            id="NeedsReview"
                            indeterminate={false}
                            labelText={<React.Fragment><img src={NeedsReview16} style={{ verticalAlign: "middle", paddingTop: "0px", marginRight: "4px" }} alt="Needs review" /><span className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Needs review"] + "/" : "") + counts.total["Needs review"]) : " "}<span className="summaryBarLabels" style={{ marginLeft: "4px" }}>Needs review</span></span></React.Fragment>}
                            // hideLabel
                            onChange={(value, id) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                            wrapperClassName="checkboxWrapper"
                        />
                        <ReactTooltip id="filterNeedsReviewTip" place="top" effect="solid">
                            Filter by Needs Review
                        </ReactTooltip>
                    </span>
                </div>
                <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                    <span data-tip data-for="filterRecommendationTip" style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                        <Checkbox
                            className="checkboxLabel"
                            disabled={!this.props.counts}
                            // title="Filter recommendations"
                            aria-label="Filter by recommendations"
                            checked={this.props.dataFromParent[3]}
                            id="Recommendations"
                            indeterminate={false}
                            labelText={<React.Fragment><img src={Recommendation16} style={{ verticalAlign: "middle", paddingTop: "0px", marginRight: "4px" }} alt="Recommendations" /><span className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Recommendation"] + "/" : "") + counts.total["Recommendation"]) : " "}<span className="summaryBarLabels" style={{ marginLeft: "4px" }}>Recommendations</span></span></React.Fragment>}
                            // hideLabel
                            onChange={(value, id) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                            wrapperClassName="checkboxWrapper"
                        />
                        <ReactTooltip id="filterRecommendationTip" place="top" effect="solid">
                            Filter by Recommendations
                        </ReactTooltip>
                    </span>
                </div>
                <div className="countItem" role="status" style={{ paddingTop: "0", paddingBottom: "0", height: "34px", textAlign: "right", overflow: "visible" }}>
                    {/* <span className="summaryBarCounts" style={{ fontWeight: 400 }}>{noScan ? ((bDiff ? counts.filtered["All"] + "/" : "") + counts.total["All"]) : " "}&nbsp;Issues&nbsp;{(bDiff ? "selected" : "found")}</span> */}
                    <span className="summaryBarCounts" style={{ fontWeight: 400, lineHeight: "32px" }}>{!noScan ? "Not Scanned" : (this.props.scanning ? "Scanning..." : ((bDiff ? counts.filtered["All"] + "/" : "") + counts.total["All"] + " Issues " + (bDiff ? "selected" : "found")))}</span>
                </div>
            </div>
        </div>); // end of headerContent

        if (this.props.layout === "main") { // Checker Tab
            return <div className="fixed-header"
                style={{ zIndex: 1000, backgroundColor: "rgba(255, 255, 255, 1)", width: "50%" }}>
                {headerContent}
            </div>
        } else { // Assessment Tab
            return <div className="fixed-header"
                style={{ zIndex: 1000, backgroundColor: "rgba(255, 255, 255, 1)", width: "100%" }}>
                {headerContent}
            </div>
        }
    }
}