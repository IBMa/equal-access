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

import { IReport } from './Report';
import { Column, Grid, Tile } from '@carbon/react';
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";

interface IReportSummaryState {
}

interface IReportSummaryProps {
    report: IReport,
    tabURL: string,
    counts?: {
        "total": { [key: string]: number },
        "filtered": { [key: string]: number }
    } | null,
}

function calcSummary(report: IReport) {

    let summaryResults:any = [];
    let results = report.results.filter((result: any) => {
        return result.value[1] !== "PASS";
    })
    // console.log("report.results.length = "+report.results.length);
    // console.log("all issues = "+results.length);

    let violations = results.filter((result: any) => {
        return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
    })
    summaryResults.push(violations.length);
    // console.log("Violations = "+summaryResults[0]);
    // console.log(violations);

    let potentials = results.filter((result: any) => {
        return result.value[0] === "VIOLATION" && result.value[1] === "POTENTIAL";
    })
    summaryResults.push(potentials.length);
    // console.log("summaryPotential = "+summaryResults[1]);
    // console.log(potentials);
    

    let recommendations = results.filter((result: any) => {
        return result.value[0] === "RECOMMENDATION";
    })
    summaryResults.push(recommendations.length);
    // console.log("summaryRecommendation = "+summaryResults[2]);

    let violationsPlusPotentials = violations.concat(potentials);
    // console.log("violationsPlusPotentials = ", violationsPlusPotentials)

    let failXpaths: string[] = violationsPlusPotentials.map(result => result.path.dom);
   
    let failUniqueElements = Array.from(new Set(failXpaths));
    summaryResults.push(failUniqueElements.length);
    // console.log("elementsWithIssues = "+summaryResults[3]);
    
    let passUniqueElements = report.passUniqueElements;
    summaryResults[4] = passUniqueElements.length;
    console.log("totalElements = "+summaryResults[4]);
    // Note summaryNumbers [Violations,Needs review, Recommendations, elementsWithIssues, totalElements]
    return summaryResults;
}

export default class ReportSummary extends React.Component<IReportSummaryProps, IReportSummaryState> {
    render() {

        let counts = this.props.counts;
        counts= this.props.report && this.props.report.counts;

        // let isLatestArchive = this.isLatestArchive(this.props.selectedArchive, this.props.archives);

        counts.total["Violation"] = counts.total["Violation"] || 0;
        counts.total["Needs review"] = counts.total["Needs review"] || 0;
        counts.total["Recommendation"] = counts.total["Recommendation"] || 0;
        counts.total["All"] = counts.total["Violation"] + counts.total["Needs review"] + counts.total["Recommendation"];

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

        // Note summaryNumbers [Violations,Needs review, Recommendations, elementsWithIssues, totalElements]
        let summaryNumbers:any = [];
        summaryNumbers = calcSummary(this.props.report);

        console.log("summaryNumbers[0] = ", summaryNumbers[0]);
        console.log("summaryNumbers[1] = ", summaryNumbers[1]);
        console.log("summaryNumbers[2] = ", summaryNumbers[2]);
        console.log("summaryNumbers[3] = ", summaryNumbers[3]);
        console.log("summaryNumbers[4] = ", summaryNumbers[4]);
        
        // Calculate score
        let currentStatus = (100 - ((summaryNumbers[3]/summaryNumbers[4])*100)).toFixed(0);

        return <aside className="reportSummary" aria-labelledby="summaryTitle">
            <div style={{ margin: "2rem -1rem 0rem 0rem" }}>
                <Grid>
                <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}}>
                        <h2 id="summaryTitle" className="summaryTitle">Scan summary</h2>
                        
                        <div className="summaryTitleDetail">{time}</div>
                        <div className="summaryTitleDetail"><span style={{ fontWeight: 600 }}>Scanned page:</span> {this.props.tabURL}</div>
                    </Column>
                    <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}}>
                    </Column>
                </Grid>
                <Grid>
                <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}}>
                        <Tile className="tile status-score-tile">
                            <div>
                                <h3 className="tile-title" >Current Status</h3>
                            </div>
                            <div className="tile-score">{currentStatus}%</div>
                            <div className="tile-description" style={{ marginBottom: "16px" }}>Percentage of elements with no detected violations or items to review</div>
                            <div className="tile-description">Elements with Violations or Needs review: {summaryNumbers[3]} </div>
                            <div className="tile-description">Web page Total HTML Elements: {summaryNumbers[4]}</div>
                        </Tile>
                    </Column>
                    <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}}>
                        <Tile className="tile count-tile">
                            <div>
                                <h3 className="tile-title" style={{ display: "inline" }}>Violations</h3>
                                <span><img src={Violation16} style={{ verticalAlign: "top", float: "right" }} alt="Violation" /></span>
                            </div>
                            <div className="tile-score">{counts.total["Violation"]}</div>
                            <div className="tile-description">Accessibility failures that need to be corrected</div>
                        </Tile>
                    </Column>
                </Grid>
                <Grid>
                <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}}>
                        <Tile className="tile count-tile">
                            <div>
                                <h3 className="tile-title" style={{ display: "inline" }}>Needs review</h3>
                                <span><img src={NeedsReview16} style={{ verticalAlign: "top", float: "right" }} alt="Needs review" /></span>
                            </div>
                            <div className="tile-score">{counts.total["Needs review"]}</div>
                            <div className="tile-description2">Issues that may not be a violation; manual review is needed</div>
                        </Tile>
                    </Column>
                    <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}}>
                        <Tile className="tile count-tile">
                            <div>
                                <h3 className="tile-title" style={{ display: "inline" }}>Recommendations</h3>
                                <span><img src={Recommendation16} style={{ verticalAlign: "top", float: "right" }} alt="Recommendation" /></span>
                            </div>
                            <div className="tile-score">{counts.total["Recommendation"]}</div>
                            <div className="tile-description2">Opportunities to apply best practices to further improve accessibility</div>
                        </Tile>
                    </Column>
                </Grid>
            </div>
        </aside>;
    }
}