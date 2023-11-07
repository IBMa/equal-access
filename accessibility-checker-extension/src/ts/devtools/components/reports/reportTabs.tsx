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
import "../reportSection.scss";
import { ePanel } from '../../devtoolsController';

interface ReportProps {
    unfilteredCount: number
    panel: ePanel
    issues: IIssue[] | null
    tabbable: IIssue[] | null
    checked: {
        "Violation": boolean,
        "Needs review": boolean,
        "Recommendation": boolean
    }
    selectedPath: string | null;
    canScan: boolean;
    onResetFilters: () => void;
}

type RowProps = IRowGroup & {
    path: string
}

export class ReportTabs extends React.Component<ReportProps> {
    render() {
        let rowData : RowProps[] | null = null;
        if (this.props.issues && this.props.tabbable) {
            rowData = [];
            for (const result of this.props.issues) {
                let tabInfo = this.props.tabbable.find((issue => issue.path.dom === result.path.dom));
                // let thisLabel = result.path.aria.replace(/\//g, "/ ").replace(/^\/ /, "/");
                let id = `${(tabInfo && ""+tabInfo.apiArgs[0].tabOrder || "?")} ${result.path.aria.replace(/\//g, " /")}`;
                let thisLabel = tabInfo && ""+tabInfo.apiArgs[0].tabOrder || "?";
                let curGroup = rowData.find(group => group.id === ReportTreeGrid.cleanId(id));
                if (!curGroup) {
                    curGroup = {
                        id: ReportTreeGrid.cleanId(id),
                        label: thisLabel,
                        path: result.path.aria.replace(/\//g, " /"),
                        children: [result],
                        ignored: false,
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
            unfilteredCount={this.props.unfilteredCount}
            panel={this.props.panel}
            noScanMessage={this.props.canScan ? <>This page has not been scanned.</> : <>The browser has restricted IBM Equal Access Accesibility Checker from loading for this URL. Please go to a different page.</>}
            headers={[
                { key: "issueCount", label: "Issues" },
                { key: "label", label: "Tab stop" },
                { key: "path", label: "Element Roles"}
            ]}
            rowData={rowData}
            selectedPath={this.props.selectedPath}
            onResetFilters={this.props.onResetFilters}
        />
    }
}
