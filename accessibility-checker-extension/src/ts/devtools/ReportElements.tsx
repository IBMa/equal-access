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

import { IReport, IReportItem, valueMap } from "./Report";
import ReportRow from "./ReportRow";

interface IReportElementsState {
}
interface IReportElementsProps {
    report: IReport;
    selectItem: (item: IReportItem) => void,
    getItem: (item: IReportItem) => void,
    learnItem: IReportItem | null,
    layout: string
}

interface IGroup {
    title: string,
    counts: { [key: string]: number }
    items: IReportItem[]
};

export default class ReportElements extends React.Component<IReportElementsProps, IReportElementsState> {
    state: IReportElementsState = {
    };
    
    render() {
        let itemIdx = 0;
        let groups : IGroup[] = []
        let groupMap : {
            [key: string]: IGroup
        } | null = {};
        for (const item of this.props.report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }
            item.itemIdx = itemIdx++;

            let thisGroup = groupMap[item.path.aria];
            if (!thisGroup) {
                thisGroup = {
                    title: item.path.aria,
                    counts: {},
                    items: []
                }
                groupMap[item.path.aria] = thisGroup;
                groups.push(thisGroup);
            }
            thisGroup.items.push(item);
            let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
            thisGroup.counts[val] = (thisGroup.counts[val] || 0) + 1;
        }

        // this.props.report.sort((a,b) => {
        //     return a.path.aria.localeCompare(b.path.aria);
        // })
        let idx=0;
        let scrollFirst = true;
        return <div className="bx--grid report" role="table" aria-label="Issues grouped by element role">
            <div role="rowgroup">
                <div className="bx--row reportHeader" role="row">
                    <div className="bx--col-sm-1" role="columnheader">
                        Issues                    
                    </div>
                    <div className="bx--col-sm-3" role="columnheader">
                        Element Roles
                    </div>
                </div>
            </div>
            <div role="rowgroup">  
                {groups.map(group => {
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
                    />
                })}
            </div>
        </div>
    }
}