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

    import { Column, Grid, Tile, SelectableTile, } from '@carbon/react';
    import Violation16 from "../../../assets/Violation16.svg";
    import NeedsReview16 from "../../../assets/NeedsReview16.svg";
    import Recommendation16 from "../../../assets/Recommendation16.svg";
    import { IReport, IStoredReportMeta, UIIssue } from "../../interfaces/interfaces";
    import { getDevtoolsController } from "../devtoolsController";
    import { getBGController } from '../../background/backgroundController';
    import { getDevtoolsAppController } from '../devtoolsAppController';
    import { BrowserDetection } from '../../util/browserDetection';
    import { getTabId } from '../../util/tabId';
    import "./summaryScreen.scss";
    
    interface ISummaryScreenState {
        report?: IReport,
        reportMeta?: IStoredReportMeta,
        ignoredIssues: UIIssue[]
    }
    
    interface ISummaryScreenProps {
        
    }
    
    let bgController = getBGController();
    let appController = getDevtoolsAppController();
    export default class SummaryScreen extends React.Component<ISummaryScreenProps, ISummaryScreenState> {
        private devtoolsController = getDevtoolsController();
        state: ISummaryScreenState = {
            ignoredIssues: []
        }
        async componentDidMount(): Promise<void> {
            let self = this;
            this.devtoolsController.addReportListener(async (newState) => {
                self.setState({
                    report: newState,
                    reportMeta: await self.devtoolsController.getReportMeta() || undefined
                });
            })
            appController.addLevelFilterListener(() => {
                this.setState({});
            })
            bgController.addIgnoreUpdateListener(async ({ url, issues }) => {
                if (url === (await bgController.getTabInfo(getTabId())).url) {
                    this.setState({ ignoredIssues: issues });
                }
            })
            let url = (await bgController.getTabInfo(getTabId())).url!;
            let alreadyIgnored = await bgController.getIgnore(url);
            this.setState({ ignoredIssues: alreadyIgnored });
            this.setState({
                report: await self.devtoolsController.getReport() || undefined,
                reportMeta: await self.devtoolsController.getReportMeta() || undefined
            })
        }
    
        
    
        render() {
            let ignoredTotal = this.state.ignoredIssues.length;
            // JCH find unique elements that have violations and needs review issues
            let violations = this.state.report && this.state.report.results.filter((result: any) => {
                return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
            }) || [];
            let ignoredViolations = this.state.ignoredIssues && this.state.ignoredIssues.filter((result: any) => {
                return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
            }) || [];
            
    
            let potentials = this.state.report && this.state.report.results.filter((result: any) => {
                return result.value[0] === "VIOLATION" && (result.value[1] === "POTENTIAL" || result.value[1] === "MANUAL");
            }) || [];
            let ignoredNeedsReview = this.state.ignoredIssues && this.state.ignoredIssues.filter((result: any) => {
                return result.value[0] === "VIOLATION" && (result.value[1] === "POTENTIAL" || result.value[1] === "MANUAL");
            }) || [];
    
            let recommendations = this.state.report && this.state.report.results.filter((result: any) => {
                return result.value[0] === "RECOMMENDATION";
            }) || [];
    
            let ignoredRecommendations = this.state.ignoredIssues && this.state.ignoredIssues.filter((result: any) => {
                return result.value[0] === "RECOMMENDATION";
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
                            <div className="summaryTitleDetail"><span style={{ textDecorationLine: "underline" }}>{ignoredTotal} hidden issues</span></div>
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
                            <SelectableTile 
                                className="tile count-tile"
                                selected={appController.getLevelFilter("Violation")}
                                onChange={async () => {
                                    let checked = appController.getLevelFilters();
                                    checked["Violation"] = !checked["Violation"];
                                    appController.setLevelFilters(checked);
                                }}
                                >
                                <div>
                                    <h3 className="tile-title" style={{ display: "inline" }}>Violations</h3>
                                    <span>&nbsp;<img src={Violation16} style={{ verticalAlign: "top" }} alt="Violation" /></span>
                                </div>
                                <div className="tile-score">{violations.length - ignoredViolations.length}</div>
                                <div className="tile-description">Accessibility failures that need to be corrected</div>
                            </SelectableTile>
                        </Column>
                    </Grid>
                    <Grid style={{margin: "0rem"}}>
                        <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                            <SelectableTile className="tile count-tile"
                                selected={appController.getLevelFilter("Needs review")}
                                onChange={async () => {
                                    let checked = appController.getLevelFilters();
                                    checked["Needs review"] = !checked["Needs review"];
                                    appController.setLevelFilters(checked);
                                }}
                                >
                                <div>
                                    <h3 className="tile-title" style={{ display: "inline" }}>Needs review</h3>
                                    <span>&nbsp;<img src={NeedsReview16} style={{ verticalAlign: "top" }} alt="Needs review" /></span>
                                </div>
                                <div className="tile-score">{potentials.length - ignoredNeedsReview.length}</div>
                                <div className="tile-description2">Issues that may not be a violation; manual review is needed</div>
                            </SelectableTile>
                        </Column>
                        <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }}>
                            <SelectableTile className="tile count-tile"
                                selected={appController.getLevelFilter("Recommendation")}
                                onChange={async () => {
                                    let checked = appController.getLevelFilters();
                                    checked["Recommendation"] = !checked["Recommendation"];
                                    appController.setLevelFilters(checked);
                                }}
                            >
                                <div>
                                    <h3 className="tile-title" style={{ display: "inline" }}>Recommendations</h3>
                                    <span>&nbsp;<img src={Recommendation16} style={{ verticalAlign: "top" }} alt="Recommendation" /></span>
                                </div>
                                <div className="tile-score">{recommendations.length - ignoredRecommendations.length}</div>
                                <div className="tile-description2">Opportunities to apply best practices to further improve accessibility</div>
                            </SelectableTile>
                        </Column>
                    </Grid>
                </div>
            </aside>
        }
    }
    