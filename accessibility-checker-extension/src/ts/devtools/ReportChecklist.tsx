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

import {
} from 'carbon-components-react';

import { IReport, IReportItem, valueMap, IRuleset } from "./Report";
import ReportRow from "./ReportRow";

interface IReportChecklistState {
}
interface IReportChecklistProps {
    ruleset: IRuleset,
    report: IReport,
    selectItem: (item: IReportItem) => void,
    getItem: (item: IReportItem) => void,
    layout: string
}

interface IGroup {
    title: string,
    counts: { [key: string]: number }
    items: IReportItem[]
}

export default class ReportChecklist extends React.Component<IReportChecklistProps, IReportChecklistState> {
    state: IReportChecklistState = {
    };

    render() {
        let itemIdx = 0;
        let ruleToGroups : {
            [key: string]: IGroup[]
        } = {};
        let groups : IGroup[] = [];

        for (const checkpoint of this.props.ruleset.checkpoints) {
            let cpGroup = {
                // TODO: Change out for passive rule message
                title: `${checkpoint.num} ${checkpoint.name}`,
                checkpoint: checkpoint,
                counts: {},
                items: []
            }
            groups.push(cpGroup);
            for (const rule of checkpoint.rules) {
                ruleToGroups[rule.id] = ruleToGroups[rule.id] || []
                ruleToGroups[rule.id].push(cpGroup);
            }
        }

        for (const item of this.props.report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }
            item.itemIdx = itemIdx++;

            if (item.ruleId in ruleToGroups) {
                let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
                for (const group of ruleToGroups[item.ruleId]) {
                    group.items.push(item);
                    group.counts[val] = (group.counts[val] || 0) + 1;
                }
            }
        }

        // this.props.report.sort((a,b) => {
        //     return a.path.aria.localeCompare(b.path.aria);
        // })
        let idx=0;
        groups = groups.filter(group => group.items.length > 0);
        return <div className="bx--grid report">
            <div role="rowgroup">
                <div className="bx--row reportHeader" role="row">
                    <div className="bx--col-sm-1" role="columnheader">
                        Issues                    
                    </div>
                    <div className="bx--col-sm-3" role="columnheader">
                        Checkpoint
                    </div>
                </div>
            </div>
            <div role="rowgroup">
                {console.log("Checklist: this.props.layout = ",this.props.layout)}
                {groups.map(group => {
                    let thisIdx = idx;
                    idx += group.items.length+1;
                    return <ReportRow 
                        idx={thisIdx} 
                        report={this.props.report} 
                        group={group}
                        getItem={this.props.getItem}
                        selectItem={this.props.selectItem}
                        layout={this.props.layout} 
                    />;
                })}
            </div>
        </div>
    }
}