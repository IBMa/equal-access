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
import "./SummScoreCard.scss";
import { IReport } from './IReport';

interface SummScoreCardProps {
    title: string,
    report: IReport
}

export default class SummScoreCard extends React.Component<SummScoreCardProps, {}> {
    calcSummary(report: IReport) {
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
        // console.log("totalElements = "+summaryResults[4]);
        // Note summaryNumbers [Violations,Needs review, Recommendations, elementsWithIssues, totalElements]
        return summaryResults;
    }

    render() {
        let summaryNumbers = this.calcSummary(this.props.report);

         // Calculate score
         let currentStatus = (100 - ((summaryNumbers[3]/summaryNumbers[4])*100)).toFixed(0);

        return <div className="scoreCard" style={{border: "1px solid #9E63FB", backgroundColor:'#E8DAFF'}}>
            
            <div className="bx--row">
                <div className="bx--col-sm-2 bx--col-md-4 bx--col-lg-4 scLeft">
                    <h2 className="title">{this.props.title}</h2>
                    <div className="score">{currentStatus}%</div>
                    <div>Percentage of elements with no detected violations or items to review</div>
                </div>
                <div className="bx--col-sm-4 bx--col-md-4 bx--col-lg-10" style={{paddingLeft:"6.5rem"}}>
                    <div>
                        This report summarizes automated tests. You have to perform additional manual 
                        tests to complete accessibility assessments. Use 
                        the <a href="https://ibm.com/able/toolkit" target="_blank" rel="noopener noreferrer" style={{color:'#002D9C'}}>IBM Equal Access Toolkit</a> to guide you.
                    </div>
                    <div style={{paddingTop:"36px"}}>More resources:</div>
                    <div><a className="link" href="https://ibm.com/able/toolkit/develop/considerations/unit-testing" target="_blank" rel="noopener noreferrer" style={{color:'#002D9C'}}>Quick unit test for accessibility</a></div>
                    <div><a className="link" href="https://ibm.com/able/toolkit/verify" target="_blank" rel="noopener noreferrer" style={{color:'#002D9C'}}>Full accessibility test process</a></div>
                </div>
                <div className="bx--col-sm-4 bx--col-md-4 bx--col-lg-2" style={{paddingLeft:"6.5rem"}}></div>
            </div>
        </div>
    }
}
