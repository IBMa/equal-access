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

 import { IReport } from '../devtools/Report';

 export default class ReportSummaryUtil {

    public static  calcSummary = (report: IReport) => {

        let summaryResults: any = [];
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
        results.map((result: any) => {
            failXpaths.push(result.path.dom);
        })
        let failUniqueElements = Array.from(new Set(failXpaths));
        summaryResults.push(failUniqueElements.length);
    
        let passXpaths: any = [];
        let passResults = report.results.filter((result: any) => {
            return result.value[1] === "PASS";
        })
    
        passResults.map((result: any) => {
            passXpaths.push(result.path.dom);
        })
    
        let passUniqueElements = Array.from(new Set(passXpaths));
        summaryResults[4] = passUniqueElements.length;
    
        return summaryResults;
    }

}
