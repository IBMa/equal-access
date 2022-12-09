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
// import ReactTooltip from "react-tooltip";
import { IReportItem } from "./Report";

import {
    Column, Grid, Button, Checkbox, ContentSwitcher, Switch, OverflowMenu, OverflowMenuItem, Modal, Tooltip
} from '@carbon/react';
import { Information, ReportData, Renew, ChevronDown, Keyboard, KeyboardOff, Help, Settings } from '@carbon/react/icons/lib/index';
import { IArchiveDefinition } from '../background/helper/engineCache';
import OptionUtil from '../util/optionUtil';
import PanelMessaging from '../util/panelMessaging';

const BeeLogo = "/assets/BE_for_Accessibility_darker.svg";
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";
// import keyboard_off from "../../assets/keyboard_off.svg";
// import KCM_On from "../../assets/KCM_button_on.svg";
// import KCM_Off from "../../assets/KCM_button_on.svg";
// import KCM_disabled from "../../assets/KCM_button_disabled.svg";

interface IHeaderState {
    deleteModal: boolean,
    modalRulsetInfo: boolean,
    openKeyboardMode: boolean,
 }

interface IHeaderProps {
    badURL: boolean,
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
    setTabStopsShowHide: () => void,
    tabStopsResults: IReportItem[],
    tabStopsErrors: IReportItem[],
    showHideTabStops: boolean,
    // Keyboard Mode
    tabStopLines:boolean,
    tabStopOutlines: boolean,
    tabStopAlerts: boolean,
    tabStopFirstTime: boolean,
    tabStopsSetFirstTime: () => void,
}

export default class Header extends React.Component<IHeaderProps, IHeaderState> {
    infoButton1Ref: React.RefObject<HTMLButtonElement>;
    infoButton2Ref: React.RefObject<HTMLButtonElement>;
    helpButtonRef: React.RefObject<HTMLButtonElement>;
    settingsButtonRef: React.RefObject<HTMLButtonElement>;
    constructor(props:any) {
        super(props);
        this.infoButton1Ref = React.createRef();
        this.infoButton2Ref = React.createRef();
        this.helpButtonRef = React.createRef();
        this.settingsButtonRef = React.createRef();
    }
    
    state: IHeaderState = {
        deleteModal: false,
        modalRulsetInfo: false,
        openKeyboardMode: false,
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

    processFilterCheckBoxes(_evt: any, { checked: value, id} : { checked: boolean, id: string } ) {
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

    keyboardModalHandler() {
        this.setState({ 
            openKeyboardMode: true, 
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

        let headerContent = (<div>
            {this.props.layout === "sub" ?
            // checker view 
            <Grid style={{ lineHeight: "1rem", padding: "0rem" }}> 
                <Column sm={{span: 3}} md={{span: 6}} lg={{span: 12}}>
                    <h1>IBM Equal Access Accessibility Checker</h1>
                </Column>
                <Column sm={{span: 1}} md={{span: 2}} lg={{span: 4}} style={{marginLeft:"auto"}}>
                    <Button 
                        ref={this.helpButtonRef}
                        renderIcon={Help} 
                        kind="ghost"   
                        hasIconOnly iconDescription="Help" tooltipPosition="left" 
                        style={{
                            color:"black", border:"none", paddingTop:"0px", paddingRight:"0px", 
                            verticalAlign:"text-top", minHeight:"16px"}}
                        onClick={(() => {
                            this.props.readOptionsData();
                            let url = chrome.runtime.getURL("quickGuideAC.html");
                            window.open(url, "_blank");
                        }).bind(this)}>
                    </Button>
                    <Button 
                        ref={this.settingsButtonRef}
                        renderIcon={Settings} 
                        kind="ghost"   
                        hasIconOnly iconDescription="Settings" tooltipPosition="left" 
                        style={{color:"black", border:"none", paddingTop:"0px", paddingLeft:"8px", paddingRight:"0px", 
                                verticalAlign:"text-top", minHeight:"16px"}}
                        onClick={(() => {
                            this.props.readOptionsData();
                            let url = chrome.runtime.getURL("options.html");
                            window.open(url, "_blank");
                        }).bind(this)}>
                    </Button>
                </Column>
            </Grid>
            : 
            // accessment view
            <Grid style={{ lineHeight: "1rem", padding: "0rem" }}> 
                <Column sm={{span: 3}} md={{span: 6}} lg={{span: 12}}>
                    <h1>IBM Equal Access Accessibility Checker</h1>
                </Column>
                <Column sm={{span: 1}} md={{span: 2}} lg={{span: 4}} style={{ position: "relative", textAlign: "right", paddingTop:"2px" }}>
                    <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" />
                </Column>
            </Grid>
            }
            {/* Content for Checker Tab */}
            {this.props.layout === "sub" ?
                <React.Fragment>
                    
                <Grid style={{ marginTop: '10px', padding: "0rem" }}>
                    <Column sm={{span: 2}} md={{span: 4}} lg={{span: 8}} style={{ display: 'flex', alignContent: 'center' }}>

                        <Button id="scanButton" style={{marginRight:"3px"}} disabled={this.props.scanning} renderIcon={Renew} onClick={this.props.startScan.bind(this)} size="sm" className="scan-button">Scan</Button>
                        <Tooltip
                            align="right"
                            label="Scan options"

                        >
                            <OverflowMenu 
                                className="rendered-icon svg"
                                style={{backgroundColor: "black", height:"32px", width:"32px"}} 
                                // iconDescription="Open and close report scan options"
                                renderIcon={ChevronDown}
                                ariaLabel="Report menu" 
                                // size="xl"
                                id="reportMenu"
                            >
                                <OverflowMenuItem
                                    style={{maxWidth:"13rem", width:"13rem"}}
                                    disabled={this.props.storedScans.length == 0 ? true : false}
                                    itemText="Download current scan" 
                                    onClick={() => this.props.reportHandler("current")}
                                />
                                <OverflowMenuItem 
                                    style={{maxWidth:"13rem", width:"13rem"}}
                                    // if scanStorage false not storing scans, if true storing scans
                                    itemText= {this.props.scanStorage ? "Stop storing scans" : "Start storing scans"}
                                    onClick={this.props.startStopScanStoring}
                                />
                                <OverflowMenuItem 
                                    style={{maxWidth:"13rem", width:"13rem"}}
                                    disabled={this.props.actualStoredScansCount() == 0 ? true : false}
                                    itemText="Delete stored scans" 
                                    // onClick={() => this.props.clearStoredScans(true) }
                                    onClick={() => this.deleteModalHandler() }
                                />
                                <OverflowMenuItem 
                                    style={{maxWidth:"13rem", width:"13rem"}}
                                    disabled={this.props.actualStoredScansCount() == 0 ? true : false} // disabled when no stored scans or 1 stored scan
                                    itemText="Download stored scans" 
                                    onClick={() => this.props.reportHandler("all")}
                                />
                                <OverflowMenuItem 
                                    style={{maxWidth:"13rem", width:"13rem"}}
                                    disabled={this.props.actualStoredScansCount() == 0 ? true : false} // disabled when no stored scans or 1 stored scan
                                    itemText="View stored scans" 
                                    onClick={this.props.reportManagerHandler} // need to pass selected as scanType
                                />
                            </OverflowMenu>
                        </Tooltip>
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
                            selectorPrimaryFocus=".cds--modal-footer .cds--btn--secondary"
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
                    </Column>
                    {/* <Column sm={{span: 0}} md={{span: 2}} lg={{span: 4}} style={{ height: "28px" }}></Column> */}

                    <Column sm={{span: 2}} md={{span: 4}} lg={{span: 8}} style={{ display: 'flex', justifyContent: 'right'}}>
                        <Tooltip
                            align="bottom"
                            label="Focus view"
                        >
                            <ContentSwitcher data-tip data-for="focusViewTip"
                                style={{height: "30px", width:"307px"}}
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
                        </Tooltip>
                        
                        <Button 
                            renderIcon={this.props.showHideTabStops ? Keyboard : KeyboardOff} 
                            disabled={!this.props.counts}
                            hasIconOnly iconDescription="Keyboard Checker Mode" tooltipPosition="left" 
                            style={{background:"black", border:"none", verticalAlign:"baseline", minHeight:"28px", 
                            paddingTop:"7px", paddingLeft:"7px", paddingRight:"7px", paddingBottom:"7px", marginLeft: "8px"}}
                            onClick={ async() => {
                                try {
                                    // console.log("onClick showHideTabStops = ", this.props.showHideTabStops);
                                    if (this.props.showHideTabStops) {
                                        // console.log("1");
                                        // console.log("tabID = ",this.props.tabId,"   tabURL = ",this.props.tabURL, 
                                        //             "   tabStopsResults = ", this.props.tabStopsResults, "   tabStopsErrors = ",this.props.tabStopsErrors,"   tabStopLines = ", this.props.tabStopLines,
                                        //             "   tabStopOutlines = ", this.props.tabStopOutlines);
                                        await PanelMessaging.sendToBackground("DRAW_TABS_TO_BACKGROUND", 
                                        { tabId: this.props.tabId, tabURL: this.props.tabURL, tabStopsResults: this.props.tabStopsResults, tabStopsErrors: this.props.tabStopsErrors, 
                                            tabStopLines: this.props.tabStopLines, tabStopOutlines: this.props.tabStopOutlines });
                                            // console.log("2");
                                            setTimeout(() => {
                                                // console.log("3");
                                                this.props.setTabStopsShowHide();
                                            }, 1000);
                                            this.keyboardModalHandler();
                                    } else {
                                        // console.log("4");
                                        await PanelMessaging.sendToBackground("DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS", { tabId: this.props.tabId, tabURL: this.props.tabURL });
                                        this.props.setTabStopsShowHide();
                                    }
                                    
                                } catch (error) {
                                    console.log("My error stack",(error as any).stack);
                                }
                            }}>
                        </Button>
                        {this.state.openKeyboardMode && this.props.tabStopFirstTime ?
                            
                               <Modal
                                    size="xs"
                                    aria-label="Keyboard checker mode"
                                    modalHeading="Keyboard checker mode"
                                    passiveModal={true}
                                    open={this.state.openKeyboardMode}
                                    onRequestClose={(() => {
                                        this.setState({ openKeyboardMode: false });
                                        this.props.tabStopsSetFirstTime();
                                    }).bind(this)}
                                >
                                    <div>
                                        <br></br>
                                        <p style={{ marginBottom: '1rem', fontSize:"14px" }}>
                                            Shows current tab stops. Click any marker or tab through the page for element information.
                                            <br></br><br></br>
                                            You can customize this feature in options and read more in the user guide. 
                                        </p>
                                        <p style={{ marginBottom: '1rem', fontSize:"14px" }}>
                                            <span>
                                            <a
                                            href={chrome.runtime.getURL("options.html")}
                                            target="_blank"
                                            rel="noopener noreferred"
                                            style={{marginRight:"30px"}}
                                            >
                                            Options
                                            </a>
                                            <a
                                            href={chrome.runtime.getURL("usingAC.html")}
                                            target="_blank"
                                            rel="noopener noreferred"
                                            >
                                            User guide
                                            </a>
                                            </span>
                                        </p>
                                    </div>
                                </Modal>
                            
                        : ""}
                    </Column>
                </Grid>
                <Grid style={{ marginTop: '10px', padding: "0rem" }}>
                    <Column sm={{span: 2}} md={{span: 4}} lg={{span: 8}}>
                        <div>
                            <span>Status: </span>
                            <span>{this.props.scanStorage === true ? "storing, " : ""}</span>
                            <span>{this.props.actualStoredScansCount().toString() === "0" ? "no scans stored" : (this.props.actualStoredScansCount().toString() === "1" ? this.props.actualStoredScansCount().toString() + " scan stored" : this.props.actualStoredScansCount().toString() + " scans stored")}</span>
                        </div>
                    </Column>
                    <Column sm={{span: 2}} md={{span: 4}} lg={{span: 8}}>
                    </Column>
                </Grid>
                </React.Fragment>
                // Content for the Assessment Tab
                :
                <React.Fragment>
                
                    
                <Grid style={{ marginTop: '10px', padding: "0rem" }}>
                    <Column sm={{span: 3}} md={{span: 6}} lg={{span: 12}} style={{ display: 'flex', alignContent: 'center' }}>
                        <Button disabled={this.props.scanning} renderIcon={Renew} onClick={this.props.startScan.bind(this)} size="sm" className="scan-button">Scan</Button>
                        <Button 
                            ref={this.infoButton2Ref}
                            renderIcon={Information} 
                            kind="ghost"   
                            hasIconOnly iconDescription="Rule set info" tooltipPosition="top" 
                            style={{color:"black", border:"none", verticalAlign:"baseline", minHeight:"28px", 
                                    paddingTop:"8px", paddingLeft:"8px", paddingRight:"8px"}}
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
                                Get started with the &nbsp;
                                <a
                                href={chrome.runtime.getURL("usingAC.html")}
                                target="_blank"
                                rel="noopener noreferred"
                                >
                                User guide
                                </a>
                                .
                            </p>
                            <br></br>
                            <p>
                            Currently active rule set: {'"'+OptionUtil.getRuleSetDate(this.props.selectedArchive, this.props.archives)+'"'}
                                <span>{<br/>}</span>
                                Most recent rule set: {'"'+OptionUtil.getRuleSetDate('latest', this.props.archives)+'"'}
                                <br/><br/>
                                Currently active guidelines: {'"'+this.props.selectedPolicy+'"'}
                            </p>
                            <br></br>
                            <div>
                                <a
                                    href={chrome.runtime.getURL("options.html")}
                                    target="_blank"
                                    className={`cds--link`}
                                    
                                >
                                    Change rule set
                                </a>
                            </div>       
                        </Modal>
                    </Column>
                    <Column sm={{span: 1}} md={{span: 2}} lg={{span: 4}} style={{ position: "relative" }}>
                        <div className="headerTools" style={{ display: "flex", justifyContent: "flex-end" }}>
                            <div style={{ width: 210, paddingRight: "16px" }}>
                            </div>
                            
                            <Button
                                disabled={!this.props.counts}
                                onClick={() => this.props.reportHandler("current")}
                                className="settingsButtons" 
                                size="sm" 
                                hasIconOnly 
                                kind="ghost" 
                                tooltipAlignment="center" 
                                tooltipPosition="top"
                                iconDescription="Reports" 
                                type="button"
                            >
                                <ReportData size={16}/>
                            </Button>
                        </div>
                    </Column>
                </Grid>
                </React.Fragment>
            }
            {/* Counts row uses same code for both Assessment and Checker Tabs */}
            <Grid style={{padding: "0rem"}}>
                <Column sm={4} md={8} lg={16}>
                    <div className={this.props.layout === "main"?"countRow summary mainPanel":"countRow summary subPanel"} role="region" aria-label='Issue count' style={{ marginTop: "14px" }}>
                        <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                            <span data-tip data-for="filterViolationsTip" style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                                <Tooltip
                                    align="right"
                                    label="Filter by Violations"
                                >
                                    <Checkbox 
                                        className="checkboxLabel"
                                        disabled={!this.props.counts}
                                        // title="Filter by violations" // used react tooltip so all tooltips the same
                                        aria-label="Filter by violations"
                                        checked={this.props.dataFromParent[1]}
                                        id="Violations"
                                        indeterminate={false}
                                        labelText={<React.Fragment><img src={Violation16} style={{ verticalAlign: "middle", paddingTop: "0px", marginRight: "4px" }} alt="Violations" /><span className="summaryBarCounts" >{noScan ? ((bDiff ? counts.filtered["Violation"] + "/" : "") + counts.total["Violation"]) : " "}<span className="summaryBarLabels" style={{ marginLeft: "4px" }}>Violations</span></span></React.Fragment>}
                                        // hideLabel
                                        onChange={(value: any, id: any) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                                        wrapperClassName="checkboxWrapper"
                                    />
                                </Tooltip>
                                {/* <ReactTooltip id="filterViolationsTip" place="top" effect="solid">
                                    Filter by Violations
                                </ReactTooltip> */}
                            </span>
                        </div>
                        <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                            <span data-tip data-for="filterNeedsReviewTip" style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                                <Tooltip
                                    align="right"
                                    label="Filter by Needs Review"
                                >
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
                                    onChange={(value: any, id: any) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                                    wrapperClassName="checkboxWrapper"
                                />
                                </Tooltip>
                                {/* <ReactTooltip id="filterNeedsReviewTip" place="top" effect="solid">
                                    Filter by Needs Review
                                </ReactTooltip> */}
                            </span>
                        </div>
                        <div className="countItem" style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0", height: "34px", textAlign: "left", overflow: "visible" }}>
                            <span data-tip data-for="filterRecommendationTip" style={{ display: "inline-block", verticalAlign: "middle", paddingTop: "4px", paddingRight: "8px" }}>
                                <Tooltip
                                    align="right"
                                    label="Filter by Recommendations"
                                >
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
                                    onChange={(value: any, id: any) => this.processFilterCheckBoxes(value, id)} // Receives three arguments: true/false, the checkbox's id, and the dom event.
                                    wrapperClassName="checkboxWrapper"
                                />
                                </Tooltip>
                                {/* <ReactTooltip id="filterRecommendationTip" place="top" effect="solid">
                                    Filter by Recommendations
                                </ReactTooltip> */}
                            </span>
                        </div>
                        <div className="countItem" role="status" style={{ paddingTop: "0", paddingBottom: "0", height: "34px", textAlign: "right", overflow: "visible" }}>
                            {/* <span className="summaryBarCounts" style={{ fontWeight: 400 }}>{noScan ? ((bDiff ? counts.filtered["All"] + "/" : "") + counts.total["All"]) : " "}&nbsp;Issues&nbsp;{(bDiff ? "selected" : "found")}</span> */}
                            <span className="summaryBarCounts" style={{ fontWeight: 400, lineHeight: "32px" }}>{!noScan ? "Not Scanned" : (this.props.scanning ? "Scanning..." : ((bDiff ? counts.filtered["All"] + "/" : "") + counts.total["All"] + " Issues " + (bDiff ? "selected" : "found")))}</span>
                        </div>
                    </div>
                </Column>
            </Grid>
            {this.props.badURL ? 
                    <React.Fragment>
                    <div style={{marginTop: 16, marginLeft: 16}}>IBM Equal Access Accesibility Check cannot run on this URL.
                        Please go to a different page.</div>
                            </React.Fragment>
                    : ""
                    }
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