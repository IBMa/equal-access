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
    Column, Grid
} from '@carbon/react';

import { IReport, IReportItem, valueMap } from "./Report";
import ReportRow from "./ReportRow";

interface IReportRulesState {
}
interface IReportRulesProps {
    report: IReport;
    selectItem: (item: IReportItem) => void,
    getItem: (item: IReportItem) => void,
    getSelectedItem: (item: IReportItem) => void,
    learnItem: IReportItem | null,
    selectedIssue: IReportItem | null,
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

export default class ReportRules extends React.Component<IReportRulesProps, IReportRulesState> {
    state: IReportRulesState = {
    };
    
    render() {
        let itemIdx = 0;
        let groupMap : {
            [key: string]: IGroup
        } | null = {};
        for (const item of this.props.report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }
            item.itemIdx = itemIdx++;

            if (!(item.ruleId in groupMap)) {
                groupMap[item.ruleId] = {
                    // TODO: Change out for passive rule message
                    title: this.props.report.nls[item.ruleId][0] || item.ruleId,
                    counts: {},
                    fvCounts: {},
                    items: []
                }
            }
            let curGroup = groupMap[item.ruleId];
            curGroup.items.push(item);
            let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
            curGroup.counts[val] = (curGroup.counts[val] || 0) + 1;
            if (item.selected || item.selectedChild) {
                curGroup.fvCounts[val] = (curGroup.fvCounts[val] || 0) + 1;
            }
        }

        let groups : IGroup[] = [];
        for (const ruleId in groupMap) {
            groups.push(groupMap[ruleId]);
        }
        
        // to sort issue according to type in order Violations, Needs Review, Recommendations
        // at the group level
        const valPriority = ["Violation", "Needs review", "Recommendation"];
        groups.sort( function(a,b) {
            let aVal = valueMap[a.items[0].value[0]][a.items[0].value[1]] || a.items[0].value[0] + "_" + a.items[0].value[1];
            let bVal = valueMap[b.items[0].value[0]][b.items[0].value[1]] || b.items[0].value[0] + "_" + b.items[0].value[1];
            let aIndex = valPriority.indexOf(aVal);
            let bIndex = valPriority.indexOf(bVal);
            return aIndex - bIndex;
        })

        let idx=0;
        let scrollFirst = true;
        return <div className="report" role="table" style={{paddingLeft:"1rem", paddingRight:"0"}} aria-label="Issues grouped by rule">
            <div role="rowgroup">
                <Grid className="reportHeader" role="row">
                    <Column sm={{span: 2}} md={{span: 2}} lg={{span: 4}} role="columnheader">
                        Issues                    
                    </Column>
                    <Column sm={{span: 2}} md={{span: 6}} lg={{span: 12}} role="columnheader">
                        Rules
                    </Column>
                </Grid>
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
                        return <ReportRow key={idx}
                            idx={thisIdx} 
                            report={this.props.report} 
                            group={group}
                            getItem={this.props.getItem}
                            getSelectedItem={this.props.getSelectedItem}
                            learnItem={this.props.learnItem}
                            selectedIssue={this.props.selectedIssue}
                            selectItem={this.props.selectItem}
                            layout={this.props.layout}
                            dataFromParent={this.props.dataFromParent}
                            focusedViewFilter={this.props.focusedViewFilter}
                            breakType={"break-word"}
                        />                
                    })
                }
            </div>
        </div>
    }
}