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
import { IIssue } from '../../../interfaces/interfaces';
import { ReportTreeGrid, IRowGroup } from '../reportTreeGrid';
import { UtilIssue } from '../../../util/UtilIssue';
import { ePanel } from '../../devToolsApp';
import "../reportSection.scss";

interface ReportProps {
    panel: ePanel
    issues: IIssue[] | null
    tabbable: IIssue[] | null
    checked: {
        "Violation": boolean,
        "Needs review": boolean,
        "Recommendation": boolean
    }
    selectedPath: string | null;
    onResetFilters: () => void
}

export class ReportTabs extends React.Component<ReportProps> {
    render() {
        let rowData : IRowGroup[] | null = null;
        if (this.props.issues && this.props.tabbable) {
            rowData = [];
            for (const result of this.props.issues) {
                let tabInfo = this.props.tabbable.find((issue => issue.path.dom === result.path.dom));
                // let thisLabel = result.path.aria.replace(/\//g, "/ ").replace(/^\/ /, "/");
                let id = `${(tabInfo && ""+tabInfo.apiArgs[0].tabOrder || "?")} ${result.path.aria.replace(/\//g, " /")}`;
                let thisLabel = <>{(tabInfo && ""+tabInfo.apiArgs[0].tabOrder || "?")} 
                <span style={{ color: "#c6c6c6" }}> &mdash; </span> 
                {result.path.aria.replace(/\//g, " /")}</>;
                let curGroup = rowData.find(group => group.id === id);
                if (!curGroup) {
                    curGroup = {
                        id: ReportTreeGrid.cleanId(id),
                        label: thisLabel,
                        children: [result]
                    }
                    rowData.push(curGroup);
                } else {
                    curGroup.children.push(result);
                }
            }
            rowData.sort((groupA, groupB) => {
                if (groupA.id === groupB.id) return 0;
                if (groupA.id.startsWith("?")) return -1;
                if (groupB.id.startsWith("?")) return 1;
                return parseInt(groupA.id) - parseInt(groupB.id);
            });
            for (const group of rowData) {
                group.children.sort((a, b) => UtilIssue.valueToOrder(a.value)-UtilIssue.valueToOrder(b.value));
            }
        }
        return <ReportTreeGrid 
            panel={this.props.panel}
            noScanMessage={<>This page has not been scanned.</>}
            headers={[
                { key: "issueCount", label: "Issues" },
                { key: "label", label: "Tab stop" }
            ]}
            rowData={rowData}
            selectedPath={this.props.selectedPath}
            onResetFilters={this.props.onResetFilters}
        />
    }
}
