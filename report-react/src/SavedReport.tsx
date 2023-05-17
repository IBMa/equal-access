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
import "./SavedReport.scss";
import { ISavedReportData, IReportItem } from './IReport';
import ScoreCard from './ScoreCard';
import SummScoreCard from './SummScoreCard';
import ReportChecklist from './report/ReportChecklist';
import ReportRules from './report/ReportRules';
import { ComposedModal, ModalHeader, ModalBody, Grid, Column, Theme, Tabs, TabList, TabPanel, Tab, TabPanels } from '@carbon/react';

const Violation16 = <svg version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
    <rect style={{ fill: "none" }} width="16" height="16" />
    <path style={{ fill: "#A2191F" }} d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z" />
    <path style={{ fill: "#FFFFFF", fillOpacity: 0 }} d="M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z" />
</svg>

const NeedsReview16 = <svg version="1.1" x="0px" y="0px"
    width="16px" height="16px" viewBox="0 0 16 16">
    <rect style={{ fill: "none" }} width="16" height="16" />
    <path style={{ fill: "#F1C21B" }} d="M14.9,13.3l-6.5-12C8.3,1,8,0.9,7.8,1.1c-0.1,0-0.2,0.1-0.2,0.2l-6.5,12c-0.1,0.1-0.1,0.3,0,0.5
	C1.2,13.9,1.3,14,1.5,14h13c0.2,0,0.3-0.1,0.4-0.2C15,13.6,15,13.4,14.9,13.3z M7.4,4h1.1v5H7.4V4z M8,11.8c-0.4,0-0.8-0.4-0.8-0.8
	s0.4-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8S8.4,11.8,8,11.8z"/>
    <g>
        <g>
            <g>
                <rect x="7.45" y="4" width="1.1" height="5" />
            </g>
        </g>
        <g>
            <g>
                <circle cx="8" cy="11" r="0.8" />
            </g>
        </g>
    </g>
</svg>

const Recommendation16 = <svg version="1.1" x="0px" y="0px"
    width="16px" height="16px" viewBox="0 0 16 16">
    <rect style={{ fill: "none" }} width="16" height="16" />
    <path style={{ fill: "#0043CE" }} d="M14,15H2c-0.6,0-1-0.4-1-1V2c0-0.6,0.4-1,1-1h12c0.6,0,1,0.4,1,1v12C15,14.6,14.6,15,14,15z" />
    <text transform="matrix(1 0 0 1 5.9528 12.5044)" style={{ fill: "#FFFFFF", fontFamily: "IBMPlexSerif", fontSize: "12.9996px" }}>i</text>
</svg>

interface SavedReportProps {
    reportData: ISavedReportData | null
}

interface SavedReportState {
    selectedItem: IReportItem | null
}

export class SavedReport extends React.Component<SavedReportProps, SavedReportState> {
    state: SavedReportState = {
        selectedItem: null
    }

    selectItem(item: IReportItem) {
        this.setState({ selectedItem: item });
    }

    clearItem() {
        this.setState({ selectedItem: null });
    }

    render() {
        if (!this.props.reportData) {
            return <React.Fragment>Report Error</React.Fragment>
        }
        let rs = this.props.reportData.rulesets[0];
        for (const ruleset of this.props.reportData.rulesets) {
            if (ruleset.id === "IBM_Accessibility") {
                rs = ruleset;
            }
        }
        let violations = 0;
        let needReview = 0;
        let recommendation = 0;
        for (const issue of this.props.reportData.report.results) {
            if (issue.value[0] === "VIOLATION" && issue.value[1] === "FAIL") {
                ++violations;
            } else if (issue.value[0] === "VIOLATION" && (issue.value[1] === "POTENTIAL" || issue.value[1] === "MANUAL")) {
                ++needReview;
            } else if (issue.value[0] === "RECOMMENDATION") {
                ++recommendation;
            }
        }
        return <div
            role="main"
            id="main-content"
        >
            <Theme theme="g10">
                <div>
                    <Grid>
                        <Column sm={2} md={8} lg={4}>
                            <div className="summInfo">
                                <h1 className="prodName">
                                    IBM <strong>Accessibility</strong><br />
                                    Equal Access Toolkit:<br />
                                    Accessibility Checker Report<br />
                                </h1>
                                
                            </div>
                        </Column>
                        <Column sm={4} md={8} lg={12} role="region" aria-label="Report overview: current status">
                            <SummScoreCard title="Current status" report={this.props.reportData.report} />
                        </Column>
                    </Grid>
                    <section aria-label="Report overview: score cards">
                        <Grid>
                            <Column sm={2} md={4} lg={4}>
                                <div className="time" style={{paddingTop:"12px"}}>{new Date(this.props.reportData.report.timestamp).toLocaleString()}</div>
                                <div className="url"><strong>Scanned page:</strong> {this.props.reportData.tabURL}</div>
                            </Column>
                            <Column sm={2} md={4} lg={4}>
                                <ScoreCard count={violations} title="Violations" icon={Violation16}>
                                    Accessibility failures that need to be corrected
                                </ScoreCard>
                            </Column>
                            <Column sm={2} md={4} lg={4}>
                                <ScoreCard count={needReview} title="Needs review" icon={NeedsReview16}>
                                    Issues that may not be a violation; manual review is needed
                                </ScoreCard>
                            </Column>
                            <Column sm={2} md={4} lg={4}>
                                <ScoreCard count={recommendation} title="Recommendations" icon={Recommendation16}>
                                    Opportunities to apply best practices to further improve accessibility
                                </ScoreCard>
                            </Column>
                        </Grid>
                    </section>
                    <section>
                        <Grid>
                            <Column sm={4} md={8} lg={{offset: 4, span: 12}}>
                                <div className="summReport">
                                    <Tabs>
                                        <TabList aria-label="Report details">
                                            <Tab>Requirements</Tab>
                                            <Tab>Rules</Tab>
                                        </TabList>
                                        <TabPanels>
                                            <TabPanel>
                                                <div style={{margin: "0rem -1rem"}} role="table" aria-label="Issues grouped by checkpoint">
                                                    <ReportChecklist selectItem={this.selectItem.bind(this)} report={this.props.reportData.report} ruleset={rs} />
                                                </div>
                                            </TabPanel>
                                            <TabPanel>
                                                <div style={{margin: "0rem -1rem"}} role="table" aria-label="Issues grouped by checkpoint">
                                                    <ReportRules selectItem={this.selectItem.bind(this)} report={this.props.reportData.report} />
                                                </div>
                                            </TabPanel>
                                        </TabPanels>
                                    </Tabs>
                                </div>
                            </Column>
                        </Grid>
                    </section>
                </div>
                <ComposedModal
                    open={!!this.state.selectedItem}
                    onClose={this.clearItem.bind(this)}
                >
                    <div onClick={(evt) => { 
                        let tgt : HTMLElement | null = evt.target as HTMLElement;
                        while (tgt && tgt.nodeName.toLowerCase() !== "button") {
                            tgt = tgt.parentElement;
                        }
                        if (tgt && tgt.getAttribute("class") === "cds--modal-close") {
                            this.clearItem();
                            evt.preventDefault();
                            return false;
                        }
                    }}>
                        <ModalHeader onClose={this.clearItem.bind(this)} />
                    </div>
                    <ModalBody aria-label="This modal has scrolling content">
                        {this.state.selectedItem && <iframe title="Accessibility Checker Help" style={{position: "absolute", width: "calc(100% - 1rem)", height: "100%"}} src={this.state.selectedItem.help} />}
                    </ModalBody>
                </ComposedModal>
            </Theme>
        </div>
    }
}
