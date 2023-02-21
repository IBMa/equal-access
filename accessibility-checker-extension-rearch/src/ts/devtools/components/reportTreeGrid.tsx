/******************************************************************************
  Copyright:: 2023- IBM, Inc

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

import {
    Column,
    Link,
    Grid
} from "@carbon/react";

import {
    ChevronDown,
    ChevronUp
} from "@carbon/react/icons";

import "./reportTreeGrid.scss";
import { IIssue } from '../../interfaces/interfaces';
import { getDevtoolsAppController } from '../devtoolsAppController';
import { getDevtoolsController } from '../devtoolsController';
import { getTabId } from '../../util/tabId';
import { UtilIssue } from '../../util/UtilIssue';

export interface IRowGroup {
    id: string
    label: string
    children: IIssue[]
}

interface ReportTreeGridProps {
    emptyLabel: string
    headers: Array<{ key: string, label: string }>
    data?: IRowGroup[] | null
    className?: string
    // onRow?: (id: string) => Promise<void>
    // fieldMapper?: (rowId: string, cellId: string, cellValue: string) => any
}

interface ReportTreeGridState {
    expandedGroups: string[]
    selectedIssue: IIssue | null;
}

export class ReportTreeGrid extends React.Component<ReportTreeGridProps, ReportTreeGridState> {
    private static devtoolsAppController = getDevtoolsAppController();
    private static devtoolsController = getDevtoolsController();
    state: ReportTreeGridState = {
        expandedGroups: [],
        selectedIssue: null
    }

    async componentDidMount(): Promise<void> {
        ReportTreeGrid.devtoolsController.addSelectedIssueListener({
            callback: async (issue) => {
                this.setIssue(issue);
            },
            callbackDest: {
                type: "devTools",
                tabId: getTabId()!
            }
        });
        let issue = await ReportTreeGrid.devtoolsController.getSelectedIssue();
        this.setIssue(issue!);
        if (this.props.data) {
           this.setState({expandedGroups: this.props.data?.map(group => group.label)});
        }
    }

    componentDidUpdate(prevProps: Readonly<ReportTreeGridProps>, _prevState: Readonly<ReportTreeGridState>, _snapshot?: any): void {
        if (!prevProps.data && !!this.props.data) {
            this.setState({expandedGroups: this.props.data?.map(group => group.id)});
        }
    }

    setIssue(issue: IIssue) {
        this.setState( { selectedIssue: issue });
    }

    onGroup(groupId: string) {
        let newExpanded :string[] = JSON.parse(JSON.stringify(this.state.expandedGroups));
        if (newExpanded.includes(groupId)) {
            newExpanded = newExpanded.filter(s => s !== groupId);
        } else {
            newExpanded.push(groupId);
        }
        this.setState( { expandedGroups: newExpanded });
    }

    onRow(issue: IIssue) {
        ReportTreeGrid.devtoolsController.setSelectedIssue(issue);
        ReportTreeGrid.devtoolsAppController.setSecondaryView("help");
    }

    render() {
        let content = <></>;

        if (!this.props.data || this.props.data.length === 0) {
            content = <>{ this.props.emptyLabel }</>
        } else {
            let numLeft = 4;
            let headerContent = <Grid className="gridHeader">
                {this.props.headers.map((header, idx) => {
                    let smallCol = idx === this.props.headers.length-1 ? numLeft: 2;
                    let medCol = idx === this.props.headers.length-1 ? numLeft+4: 2;
                    numLeft -= 2;
                    return <Column sm={smallCol} md={medCol}>
                        {header.label}
                    </Column>
                })}
            </Grid>;

            let bodyContent : Array<React.ReactNode> = [];
            for (let idxGroup=0; idxGroup < this.props.data.length; ++idxGroup) {
                numLeft = 4;
                const group = this.props.data[idxGroup];
                const groupExpanded = this.state.expandedGroups.includes(group.id);
                const counts : {
                    [key: string]: number
                } = {};
                for (const child of group.children) {
                    counts[UtilIssue.valueToStringSingular(child.value)] = (counts[UtilIssue.valueToStringSingular(child.value)] || 0) + 1;
                }
                let childCounts = <span style={{marginLeft: ".5rem"}}>
                    { counts["Violation"] > 0 && <>{UtilIssue.valueSingToIcon("Violation", "levelIcon")}&nbsp;<span style={{marginRight:".25rem"}}>{counts["Violation"]}</span></> }
                    { counts["Needs review"] > 0 && <>{UtilIssue.valueSingToIcon("Needs review", "levelIcon")}&nbsp;<span style={{marginRight:".25rem"}}>{counts["Needs review"]}</span></> }
                    { counts["Recommendation"] > 0 && <>{UtilIssue.valueSingToIcon("Recommendation", "levelIcon")}&nbsp;<span style={{marginRight:".25rem"}}>{counts["Recommendation"]}</span></> }
                </span>;
                bodyContent.push(<Grid 
                    role="row" 
                    ariaLevel="1" 
                    ariaPosinset={idxGroup+1}
                    ariaSetsize={this.props.data.length}
                    ariaExpanded={groupExpanded}
                    className="gridBody" onClick={() => {
                        this.onGroup(group.id);
                    }}
                >
                    {this.props.headers.map((header, idx) => {
                        let smallCol = idx === this.props.headers.length-1 ? numLeft: 2;
                        let medCol = idx === this.props.headers.length-1 ? numLeft+4: 2;
                        numLeft -= 2;
                        return <Column role="gridcell" sm={smallCol} md={medCol} className={header.key}>
                            {idx === 0 && groupExpanded && <ChevronUp />}
                            {idx === 0 && !groupExpanded && <ChevronDown />}
                            { header.key === "label" && group.label }
                            { header.key === "issueCount" && childCounts }
                        </Column>
                    })}
                </Grid>);
                if (groupExpanded) {
                    for (let idxRow=0; idxRow < group.children.length; ++idxRow) {
                        const thisIssue = group.children[idxRow];
                        const rowId = `${thisIssue.path.dom}_${thisIssue.ruleId}_${thisIssue.reasonId}`;
                        let selectedIssue : boolean = !!this.state.selectedIssue 
                            && this.state.selectedIssue.path.dom === thisIssue.path.dom
                            && this.state.selectedIssue.reasonId === thisIssue.reasonId
                            && this.state.selectedIssue.ruleId === thisIssue.ruleId;
                        let selectedNode : boolean = !!this.state.selectedIssue 
                            && this.state.selectedIssue.path.dom === thisIssue.path.dom;
                        let selectedDescendant: boolean = !!this.state.selectedIssue 
                            && thisIssue.path.dom.startsWith(this.state.selectedIssue.path.dom);
                        bodyContent.push(<Grid 
                            role="row" 
                            ariaLevel="2" 
                            ariaPosinset={idxRow+1}
                            ariaSetsize={group.children.length}
                            className={{
                                gridBody: true,
                                selectedIssue,
                                selectedNode,
                                selectedDescendant
                            }} 
                            onClick={() => {
                                this.onRow(thisIssue);
                            }}
                        >
                            <Column id={rowId} className="gridChild" role="gridcell" sm={4} md={8} lg={8}>
                                {UtilIssue.valueToIcon(thisIssue.value, "levelIcon")} {thisIssue.message} <Link 
                                    className="hideLg"
                                    inline={true} 
                                    size="sm"
                                    role="link"
                                    onClick={() => {
                                        ReportTreeGrid.devtoolsController.setSelectedIssue(thisIssue);
                                        ReportTreeGrid.devtoolsAppController.setSecondaryView("help");
                                        ReportTreeGrid.devtoolsAppController.openSecondary(rowId);
                                    }}
                                >Learn more</Link>
                            </Column>
                        </Grid>);
                    }
                }
            }

            content = <div role="treegrid" className="reportTreeGrid">{headerContent}{bodyContent}</div>
        }
        return content;
    }
}
