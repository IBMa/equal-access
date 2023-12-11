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

import * as React from 'react';
import { IIssue, IReport } from '../../../interfaces/interfaces';
import { ReportTreeGrid, IRowGroup } from '../reportTreeGrid';
import { UtilIssue } from '../../../util/UtilIssue';
import "../reportSection.scss";
import { ePanel } from '../../devtoolsController';

interface ReportProps {
    unfilteredCount: number
    panel: ePanel
    report: IReport | null
    issues: IIssue[] | null
    checked: {
        "Violation": boolean,
        "Needs review": boolean,
        "Recommendation": boolean,
        "Hidden": boolean
    }
    selectedPath: string | null;
    canScan: boolean;
    onResetFilters: () => void;
    onFilterToolbar: (val: boolean) => void

}

export class ReportRules extends React.Component<ReportProps> {
    render() {
        let rowData : IRowGroup[] | null = null;
        if (this.props.report && this.props.issues) {
            rowData = [];
            for (const result of this.props.issues) {
                // let thisLabel = result.path.aria.replace(/\//g, "/ ").replace(/^\/ /, "/");
                let thisLabel = this.props.report.nls[result.ruleId][0] || result.ruleId;
                let curGroup = rowData.find(group => group.label === thisLabel);
                if (!curGroup) {
                    curGroup = {
                        id: ReportTreeGrid.cleanId(thisLabel),
                        label: thisLabel,
                        children: [result],
                        checked: "none"
                    }
                    rowData.push(curGroup);
                } else {
                    curGroup.children.push(result);
                }
            }
            rowData.sort((groupA, groupB) => {
                const countsA : {
                    [key: string]: number
                } = {};
                for (const child of groupA.children) {
                    countsA[UtilIssue.valueToStringSingular(child.value)] = (countsA[UtilIssue.valueToStringSingular(child.value)] || 0) + 1;
                }
                const countsB : {
                    [key: string]: number
                } = {};
                for (const child of groupB.children) {
                    countsB[UtilIssue.valueToStringSingular(child.value)] = (countsB[UtilIssue.valueToStringSingular(child.value)] || 0) + 1;
                }
                return ((countsB["Violation"] || 0) - (countsA["Violation"] || 0))
                 || ((countsB["Needs review"] || 0) - (countsA["Needs review"] || 0))
                 || ((countsB["Recommendation"] || 0) - (countsA["Recommendation"] || 0))
                 || 0;
            });
            for (const group of rowData) {
                group.children.sort((a, b) => UtilIssue.valueToOrder(a.value)-UtilIssue.valueToOrder(b.value));
            }
        }
        console.log("rowData = ",rowData);
        return <ReportTreeGrid 
            unfilteredCount={this.props.unfilteredCount}
            panel={this.props.panel}
            noScanMessage={this.props.canScan ? <>This page has not been scanned.</> : <>The browser has restricted IBM Equal Access Accesibility Checker from loading for this URL. Please go to a different page.</>}
            headers={[
                { key: "issueCount", label: "Issues" },
                { key: "label", label: "Rules" }
            ]}
            rowData={rowData}
            selectedPath={this.props.selectedPath}
            onResetFilters={this.props.onResetFilters}
            onFilterToolbar={this.props.onFilterToolbar}
        />
    }
}
