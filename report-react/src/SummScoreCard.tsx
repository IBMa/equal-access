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
    
        let violations = results.filter((result: any) => {
            return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
        })
        summaryResults.push(violations.length);
    
        let potentials = results.filter((result: any) => {
            return result.value[0] === "VIOLATION" && result.value[1] === "POTENTIAL";
        })
        summaryResults.push(potentials.length);
    
        let recommendations = results.filter((result: any) => {
            return result.value[0] === "RECOMMENDATION";
        })
        summaryResults.push(recommendations.length);
    
        let failXpaths: string[] = [];
        results.map((result:any) => {
            failXpaths.push(result.path.dom);
            return null;
        })
        let failUniqueElements = Array.from(new Set(failXpaths));
        summaryResults.push(failUniqueElements.length);
    
        let passResults = report.results.filter((result: any) => {
            return result.value[1] === "PASS";
        })
        
        let passXpaths = passResults.map((result:any) => {
            return result.path.dom;
        })
        
        let passUniqueElements = Array.from(new Set(passXpaths));
        summaryResults[4] = passUniqueElements.length;
        return summaryResults;
    }

    render() {
        let summaryNumbers = this.calcSummary(this.props.report);
        let elementNoFailures:string = "";
        /** Calculate the score */
        elementNoFailures = (((summaryNumbers[4]-summaryNumbers[3])/summaryNumbers[4])*100).toFixed(0);

        return <div className="summScoreCard">
            <h2 className="title">{this.props.title}</h2>
            <div className="bx--row">
                <div className="bx--col scLeft">
                    <div className="score">{elementNoFailures}%</div>
                    <div>Percentage of elements with no detected violations or items to review</div>
                </div>
                <div className="bx--col">
                    <div>
                        This report summarizes automated tests. You have to perform additional manual 
                        tests to complete accessibility assessments. Use 
                        the <a href="https://ibm.com/able/toolkit" target="_blank" rel="noopener noreferrer" style={{color:'#002D9C'}}>IBM Equal Access Toolkit</a> to guide you.
                    </div>
                    <div>More resources:</div>
                    <div><a className="link" href="https://ibm.com/able/toolkit/develop/considerations/unit-testing" target="_blank" style={{color:'#002D9C'}}>Quick unit test for accessibility</a></div>
                    <div><a className="link" href="https://ibm.com/able/toolkit/verify" target="_blank" style={{color:'#002D9C'}}>Full accessibility test process</a></div>
                </div>
            </div>
        </div>
    }
}
