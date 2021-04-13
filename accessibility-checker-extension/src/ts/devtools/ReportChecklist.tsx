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
    learnItem: IReportItem | null,
    layout: string,
    dataFromParent: boolean[],
    focusedViewFilter: boolean
}

interface IGroup {
    title: string,
    counts: { [key: string]: number },
    fvCounts: { [key: string]: number },
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
                fvCounts: {},
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
                    if (item.selected || item.selectedChild) {
                        group.fvCounts[val] = (group.fvCounts[val] || 0) + 1;
                    }
                    
                }
            }
        }

        // to sort issue according to type in order Violations, Needs Review, Recommendations
        // within each group need to sort the items according to their value
        const valPriority = ["Violation", "Needs review", "Recommendation"];
        let groupVals = [];
        groups.map(group => {
            groupVals.length = 0;
            group.items.sort( function(a,b) {
                let aVal = valueMap[a.value[0]][a.value[1]] || a.value[0] + "_" + a.value[1];
                let bVal = valueMap[b.value[0]][b.value[1]] || b.value[0] + "_" + b.value[1];
                let aIndex = valPriority.indexOf(aVal);
                let bIndex = valPriority.indexOf(bVal);
                return aIndex - bIndex;
            })
        })

        let idx=0;
        groups = groups.filter(group => group.items.length > 0);
        let scrollFirst = true;

        return <div className="bx--grid report" role="table" style={{paddingLeft:"1rem", paddingRight:"0"}} aria-label="Issues grouped by checkpoint">
            <div role="rowgroup">
                <div className="bx--row reportHeader" role="row">
                    <div className="bx--col-sm-1" role="columnheader">
                        Issues                    
                    </div>
                    <div className="bx--col-sm-3" role="columnheader">
                        Requirement
                    </div>
                </div>
            </div>
            <div role="rowgroup">
                {this.props.focusedViewFilter === true && this.props.report.counts.filtered.All === 0 ?
                <div><br/>No accessibility issues for this HTML element or its children</div> : 
                    groups.map(group => {
                        let thisIdx = idx;
                        idx += group.items.length+1;
                        group.items.map(item => {
                            item.scrollTo = item.scrollTo && scrollFirst;
                            scrollFirst = scrollFirst && !item.scrollTo;
                        })
                        return <ReportRow 
                            idx={thisIdx} 
                            report={this.props.report} 
                            group={group}
                            getItem={this.props.getItem}
                            learnItem={this.props.learnItem}
                            selectItem={this.props.selectItem}
                            layout={this.props.layout} 
                            dataFromParent={this.props.dataFromParent} 
                            focusedViewFilter={this.props.focusedViewFilter}
                        />;
                    })
                }
            </div>
        </div>
    }
}