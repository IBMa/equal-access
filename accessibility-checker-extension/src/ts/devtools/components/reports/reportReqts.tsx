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
import { IIssue, IRuleset } from '../../../interfaces/interfaces';
import { ReportTreeGrid, IRowGroup } from '../reportTreeGrid';
import { UtilIssue } from '../../../util/UtilIssue';

import "../reportSection.scss";
import { getBGController } from '../../../background/backgroundController';
import { getTabId } from '../../../util/tabId';
import { ePanel } from '../../devtoolsController';

interface ReportProps {
    unfilteredCount: number
    panel: ePanel
    issues: IIssue[] | null
    checked: {
        "Violation": boolean,
        "Needs review": boolean,
        "Recommendation": boolean
    }
    selectedPath: string | null;
    canScan: boolean;
    onResetFilters: () => void
}

interface ReportState {
    ruleset?: IRuleset
}


export class ReportReqts extends React.Component<ReportProps, ReportState> {
    state : ReportState = {};

    async componentDidMount(): Promise<void> {
        let bgController = getBGController();
        let settings = await bgController.getSettings();
        let rulesets = await bgController.getRulesets(getTabId()!);
        let ruleset = rulesets.find(policy => policy.id === settings.selected_ruleset.id);
        if (ruleset) {
            this.setState({ ruleset });
        }
    }

    render() {
        let rowData : IRowGroup[] | null = null;
        if (this.state.ruleset && this.props.issues) {
            rowData = [];
            for (const checkpoint of this.state.ruleset.checkpoints) {
                let curGroup : { 
                    id: string
                    label: string
                    children: IIssue[]
                } = {
                    id: ReportTreeGrid.cleanId(checkpoint.num),
                    label: `${checkpoint.num} ${checkpoint.name}`,
                    children: []
                };
                for (const result of this.props.issues) {
                    if (checkpoint.rules?.find(rule => (
                        rule.id === result.ruleId
                        && (!rule.reasonCodes || rule.reasonCodes.includes(result.reasonId))
                    ))) {
                        curGroup.children.push(result);
                    }
                }
                rowData.push(curGroup);
            }
            rowData = rowData.filter(row => row.children.length > 0);
            rowData.sort((groupA, groupB) => groupA.id.localeCompare(groupB.id));
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
                { key: "label", label: "Requirements" }
            ]}
            rowData={rowData}
            selectedPath={this.props.selectedPath}
            onResetFilters={this.props.onResetFilters}
        />
    }
}
