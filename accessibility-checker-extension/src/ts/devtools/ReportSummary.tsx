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

export default class ReportSummary extends React.Component<IReportSummaryProps, IReportSummaryState> {
    render() {

        let counts = this.props.counts;
        counts= this.props.report && this.props.report.counts;

        // let isLatestArchive = this.isLatestArchive(this.props.selectedArchive, this.props.archives);

        counts.total["Violation"] = counts.total["Violation"] || 0;
        counts.total["Needs review"] = counts.total["Needs review"] || 0;
        counts.total["Recommendation"] = counts.total["Recommendation"] || 0;
        counts.total["All"] = counts.total["Violation"] + counts.total["Needs review"] + counts.total["Recommendation"];

        // JCH find unique elements that have violations and needs review issues
        let violations = this.props.report.results.filter((result: any) => {
            return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
        });

        let potentials = this.props.report.results.filter((result: any) => {
            return result.value[0] === "VIOLATION" && result.value[1] === "POTENTIAL";
        });

        let violationsPlusPotentials = violations.concat(potentials);
        let failXpaths: string[] = violationsPlusPotentials.map(result => result.path.dom);
        let failUniqueElements = Array.from(new Set(failXpaths));

        let vPlusNRPlusRxPaths = this.props.report.results.map(result => result.path.dom);
        let vPlusNRPlusR_Elements = Array.from(new Set(vPlusNRPlusRxPaths));
    
        let testedElements = this.props.report.passUniqueElements.length + vPlusNRPlusR_Elements.length;

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
        let currentStatus = (100 - ((failUniqueElements.length/testedElements)*100)).toFixed(0);

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
                            <div className="tile-description">Percentage of elements with no detected violations or items to review</div>
                            {/* <div className="tile-description">Elements with Violations or Needs review: {failUniqueElements.length} </div>
                            <div className="tile-description">Web page tested HTML elements: {testedElements}</div> */}
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