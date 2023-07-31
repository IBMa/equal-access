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

import { Column, Grid, Tile, } from '@carbon/react';
import Violation16 from "../../../assets/Violation16.svg";
import NeedsReview16 from "../../../assets/NeedsReview16.svg";
import Recommendation16 from "../../../assets/Recommendation16.svg";
import { IReport, IStoredReportMeta } from "../../interfaces/interfaces";
import { getDevtoolsController } from "../devtoolsController";
import { BrowserDetection } from '../../util/browserDetection';
import "./summaryScreen.scss";

interface ISummaryScreenState {
    report?: IReport,
    reportMeta?: IStoredReportMeta
}

interface ISummaryScreenProps {
}

export default class SummaryScreen extends React.Component<ISummaryScreenProps, ISummaryScreenState> {
    private devtoolsController = getDevtoolsController();
    state: ISummaryScreenState = {
    }
    async componentDidMount(): Promise<void> {
        let self = this;
        this.devtoolsController.addReportListener(async (newState) => {
            self.setState({
                report: newState,
                reportMeta: await self.devtoolsController.getReportMeta() || undefined
            });
        })
        this.setState({
            report: await self.devtoolsController.getReport() || undefined,
            reportMeta: await self.devtoolsController.getReportMeta() || undefined
        })
    }

    render() {
        // JCH find unique elements that have violations and needs review issues
        let violations = this.state.report && this.state.report.results.filter((result: any) => {
            return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
        }) || [];

        let potentials = this.state.report && this.state.report.results.filter((result: any) => {
            return result.value[0] === "VIOLATION" && (result.value[1] === "POTENTIAL" || result.value[1] === "MANUAL");
        }) || [];

        let violationsPlusPotentials = violations.concat(potentials);
        let failXpaths: string[] = violationsPlusPotentials.map(result => result.path.dom);
        let failUniqueElements = Array.from(new Set(failXpaths));

        let testedElements = (this.state.report && this.state.report.testedUniqueElements || 0);

        let d = new Date();
        let options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        //@ts-ignore
        let time = d.toLocaleString('en-us', options);

        // Calculate score
        let currentStatus = (100 - ((failUniqueElements.length / testedElements) * 100)).toFixed(0);

        return <aside className={`reportSummary ${BrowserDetection.isDarkMode()?"cds--g90":"cds--g10"}`} aria-labelledby="summaryTitle">
            <div style={{ margin: "1rem -1rem 0rem 0rem" }}>
                <Grid style={{margin: "0rem"}}>
                    <Column sm={{ span: 4 }} md={{ span: 6 }} lg={{ span: 6 }}>
                        <h2 id="summaryTitle" className="summaryTitle">Scan summary</h2>

                        <div className="summaryTitleDetail">{time}</div>
                        <div className="summaryTitleDetail"><span style={{ fontWeight: 600 }}>Scanned page:</span> {this.state.reportMeta && this.state.reportMeta.pageURL || ""}</div>
                    </Column>
                </Grid>
                <Grid style={{margin: "0rem"}}>
                    <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                        <Tile className="tile status-score-tile">
                            <div>
                                <h3 className="tile-title" >Current Status</h3>
                            </div>
                            <div className="tile-score">{currentStatus}%</div>
                            <div className="tile-description">Percentage of elements with no detected violations or items to review</div>
                        </Tile>
                    </Column>
                    <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                        <Tile className="tile count-tile">
                            <div>
                                <h3 className="tile-title" style={{ display: "inline" }}>Violations</h3>
                                <span><img src={Violation16} style={{ verticalAlign: "top", float: "right" }} alt="Violation" /></span>
                            </div>
                            <div className="tile-score">{this.state.report && this.state.report.counts["Violation"] || "?"}</div>
                            <div className="tile-description">Accessibility failures that need to be corrected</div>
                        </Tile>
                    </Column>
                </Grid>
                <Grid style={{margin: "0rem"}}>
                    <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                        <Tile className="tile count-tile">
                            <div>
                                <h3 className="tile-title" style={{ display: "inline" }}>Needs review</h3>
                                <span><img src={NeedsReview16} style={{ verticalAlign: "top", float: "right" }} alt="Needs review" /></span>
                            </div>
                            <div className="tile-score">{this.state.report && this.state.report.counts["Needs review"] || "?"}</div>
                            <div className="tile-description2">Issues that may not be a violation; manual review is needed</div>
                        </Tile>
                    </Column>
                    <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                        <Tile className="tile count-tile">
                            <div>
                                <h3 className="tile-title" style={{ display: "inline" }}>Recommendations</h3>
                                <span><img src={Recommendation16} style={{ verticalAlign: "top", float: "right" }} alt="Recommendation" /></span>
                            </div>
                            <div className="tile-score">{this.state.report && this.state.report.counts["Recommendation"] || "?"}</div>
                            <div className="tile-description2">Opportunities to apply best practices to further improve accessibility</div>
                        </Tile>
                    </Column>
                </Grid>
            </div>
        </aside>
    }
}