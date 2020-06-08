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
import { Tile } from 'carbon-components-react';

// import { Launch16 } from '@carbon/icons-react';
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";

interface IReportSummaryState {
}

interface IReportSummaryProps {
    report: IReport
    tabURL: string
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

    let potentials = results.filter((result: any) => {
        return result.value[0] === "VIOLATION" && result.value[1] === "POTENTIAL";
    })
    summaryResults.push(potentials.length);
    // console.log("summaryPotential = "+summaryResults[1]);

    let recommendations = results.filter((result: any) => {
        return result.value[0] === "RECOMMENDATION";
    })
    summaryResults.push(recommendations.length);
    // console.log("summaryRecommendation = "+summaryResults[2]);

    let failXpaths: string[] = [];
    results.map((result:any) => {
        failXpaths.push(result.path.dom);
    })
    let failUniqueElements = Array.from(new Set(failXpaths));
    summaryResults.push(failUniqueElements.length);
    // console.log("elementsWithIssues = "+summaryResults[3]);

    let passXpaths: any = [];
    let passResults = report.results.filter((result: any) => {
        return result.value[1] === "PASS";
    })
    
    passResults.map((result:any) => {
        passXpaths.push(result.path.dom);
    })
    
    let passUniqueElements = Array.from(new Set(passXpaths));
    summaryResults[4] = passUniqueElements.length;
    // console.log("totalElements = "+summaryResults[4]);
    return summaryResults;
}

export default class ReportSummary extends React.Component<IReportSummaryProps, IReportSummaryState> {
    render() {
        let summaryNumbers = calcSummary(this.props.report);

        let d = new Date();
        let options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        let time = d.toLocaleString('en-us', options); 

        // Note summaryNumbers [Violations,Needs review, Recommendations, elementsWithIssues, totalElements]

        let elementNoFailures:string = "";
        /** Calculate the score */
        elementNoFailures = (((summaryNumbers[4]-summaryNumbers[3])/summaryNumbers[4])*100).toFixed(0);
            
        

        return <div className="reportSummary">
            <div className="bx--grid" style={{ margin: "2rem -1rem 0rem 0rem"}}>
                <div className="bx--row">
                    <div className="bx--col-lg-8 bx--col-md-8 box--col-sm-4">
                        <div className="summaryTitle">Scan summary</div>
                        <div className="summaryTitleDetail">{time}</div>
                        <div className="summaryTitleDetail"><span style={{fontWeight:600}}>Scanned page:</span> {this.props.tabURL}</div>
                    </div>
                    <div className="bx--col-lg-8 bx--col-md-8 box--col-sm-4">
                        {/* <div className="reportButton">
                            <Button size="small" kind="tertiary" renderIcon={Launch16}>View full report</Button>
                        </div> */}
                    </div>
                </div>
                <div className="bx--row">
                    <div className="bx--col-lg-8 bx--col-md-8 box--col-sm-4">
                        <Tile className="tile score-tile">
                            <div>
                                <span className="tile-title">Current Status</span>
                                {/* <span><CheckmarkFilled16 aria-label="Checkmark" className="icon-status-checkmark-filled" /></span> */}
                            </div>
                                <div className="tile-score">{elementNoFailures}%</div>
                            <div className="tile-description">Percentage of elements with no detected violations or items to review</div>
                        </Tile>
                    </div>
                    <div className="bx--col-lg-8 bx--col-md-8 box--col-sm-4">
                        <Tile className="tile count-tile">
                            <div>
                                <span className="tile-title">Violations</span>
                                <span><img src={Violation16} style={{verticalAlign:"top",float:"right"}} alt="Violation" /></span>
                            </div>
                                <div className="tile-score">{summaryNumbers[0]}</div>
                            <div className="tile-description">Accessibility failures that need to be corrected</div>
                        </Tile>
                    </div>
                </div>
                <div className="bx--row">
                    <div className="bx--col-lg-8 bx--col-md-8 box--col-sm-4">
                        <Tile className="tile count-tile">
                            <div>
                                <span className="tile-title">Needs review</span>
                                <span><img src={NeedsReview16} style={{verticalAlign:"top",float:"right"}} alt="Needs review" /></span>
                            </div>
                                <div className="tile-score">{summaryNumbers[1]}</div>
                            <div className="tile-description2">Issues that may not be a violation; manual review is needed</div>
                        </Tile>
                    </div>
                    <div className="bx--col-lg-8 bx--col-md-8 box--col-sm-4">
                        <Tile className="tile count-tile">
                            <div>
                                <span className="tile-title">Recommendations</span>
                                <span><img src={Recommendation16} style={{verticalAlign:"top",float:"right"}} alt="Recommendation" /></span>
                            </div>
                                <div className="tile-score">{summaryNumbers[2]}</div>
                            <div className="tile-description2">Opportunities to apply best practices to further improve accessibility</div>
                        </Tile>
                    </div>
                </div>
            </div>
        </div>;
    }
}