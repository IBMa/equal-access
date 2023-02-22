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
import { ePanel } from '../devToolsApp';

export interface IRowGroup {
    id: string
    label: string
    children: IIssue[]
}

interface ReportTreeGridProps {
    panel: ePanel;
    emptyLabel: string
    headers: Array<{ key: string, label: string }>
    rowData?: IRowGroup[] | null
    className?: string
    // onRow?: (id: string) => Promise<void>
    // fieldMapper?: (rowId: string, cellId: string, cellValue: string) => any
}

interface ReportTreeGridState {
    expandedGroups: string[]
    selectedIssue: IIssue | null;
    selectedPath: string | null;
    tabRowId: string;
}

export class ReportTreeGrid extends React.Component<ReportTreeGridProps, ReportTreeGridState> {
    treeGridRef = React.createRef<HTMLDivElement>();

    /**
     * Clean an id of spaces for use in id attribute and active-descendant
     * @param id 
     * @returns 
     */
    public static cleanId(id: string) {
        return id.trim().replace(/ /g, "_");
    }

    public static getRowId(group:IRowGroup, child?: IIssue) {
        if (!child) {
            return group.id;
        } else {
            return `${group.id}^${ReportTreeGrid.cleanId(child.path.dom)}_${child.ruleId}_${child.reasonId}`;
        }
    }

    private static devtoolsAppController = getDevtoolsAppController();
    private static devtoolsController = getDevtoolsController();
    state: ReportTreeGridState = {
        expandedGroups: [],
        selectedIssue: null,
        selectedPath: null,
        tabRowId: ""
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
        ReportTreeGrid.devtoolsController.addSelectedElementPathListener({
            callback: async (path) => {
                this.setPath(path);
            },
            callbackDest: {
                type: "devTools",
                tabId: getTabId()!
            }
        });
        let path = await ReportTreeGrid.devtoolsController.getSelectedElementPath();
        this.setPath(path!);
        if (this.props.rowData && this.props.rowData.length > 0) {
            this.setState({ expandedGroups: this.props.rowData?.map(group => group.id), tabRowId: this.props.rowData[0].id });
        }
    }

    componentDidUpdate(prevProps: Readonly<ReportTreeGridProps>, prevState: Readonly<ReportTreeGridState>, _snapshot?: any): void {
        if (!prevProps.rowData && !!this.props.rowData) {
            this.setState({expandedGroups: this.props.rowData?.map(group => group.id), tabRowId: this.props.rowData[0].id });
        }
        if (prevState.tabRowId !== this.state.tabRowId && document) {
            let elem = document.getElementById(this.state.tabRowId);
            if (elem) {
                setTimeout(() => {
                    elem?.scrollIntoView({
                        // @ts-ignore
                        block: 'nearest',
                        inline: 'start'
                    });
                }, 0);
            }
        }
    }

    setIssue(issue: IIssue) {
        this.setState( { selectedIssue: issue });
    }

    setPath(path: string) {
        this.setState( { selectedPath: path });
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

    onRow(group: IRowGroup, issue: IIssue) {
        ReportTreeGrid.devtoolsController.setSelectedIssue(issue);
        ReportTreeGrid.devtoolsAppController.setSecondaryView("help");
        if (this.props.panel === "elements") {
            this.setState({ tabRowId: ReportTreeGrid.getRowId(group, issue) });
            ReportTreeGrid.devtoolsController.inspectPath(issue.path.dom, this.treeGridRef.current);
        }
    }

    onKeyDown(evt: React.KeyboardEvent) {
        let focusedElemId = this.state.tabRowId;
        let focusedGroup = this.props.rowData?.find((value: IRowGroup) => value.id === focusedElemId);
        if (focusedGroup) {
            switch (evt.key) {
                case "ArrowLeft":
                    this.onGroupArrowLeft(evt, focusedGroup);
                    evt.preventDefault();
                    break;
                case "ArrowRight":
                    this.onGroupArrowRight(evt, focusedGroup);
                    evt.preventDefault();
                    break;
                case "ArrowUp":
                    this.onGroupArrowUp(evt, focusedGroup);
                    evt.preventDefault();
                    break;
                case "ArrowDown":
                    this.onGroupArrowDown(evt, focusedGroup);
                    evt.preventDefault();
                    break;
                case "Enter":
                    this.onGroupEnter(evt, focusedGroup);
                    evt.preventDefault();
                    break;
            }
        } else {
            let [focusedGroupId, _focusedChildId] = focusedElemId.split("^");
            let focusedGroup = this.props.rowData?.find((group: IRowGroup) => ReportTreeGrid.getRowId(group) === focusedGroupId);
            if (focusedGroup) {
                let focusedChild = focusedGroup.children.find((issue: IIssue) => ReportTreeGrid.getRowId(focusedGroup!, issue) === focusedElemId);
                if (focusedChild) {
                    switch (evt.key) {
                        case "ArrowLeft":
                            this.onRowArrowLeft(evt, focusedGroup, focusedChild);
                            evt.preventDefault();
                            break;
                        case "ArrowUp":
                            this.onRowArrowUp(evt, focusedGroup, focusedChild);
                            evt.preventDefault();
                            break;
                        case "ArrowDown":
                            this.onRowArrowDown(evt, focusedGroup, focusedChild);
                            evt.preventDefault();
                            break;
                        case "Enter":
                            this.onRowEnter(evt, focusedGroup, focusedChild);
                            break;
                        case "Tab":
                            this.onRowTab(evt, focusedGroup, focusedChild);
                            break;
                    }
                }
            }
        }
    }

    ///////////////// Group keyboard events ////////////
    onGroupArrowLeft(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        let newExpanded :string[] = JSON.parse(JSON.stringify(this.state.expandedGroups));
        if (newExpanded.includes(focusedGroup.id)) {
            newExpanded = newExpanded.filter(s => s !== focusedGroup.id);
        }
        this.setState( { expandedGroups: newExpanded });
    }

    onGroupArrowRight(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        let newExpanded :string[] = JSON.parse(JSON.stringify(this.state.expandedGroups));
        if (!newExpanded.includes(focusedGroup.id)) {
            newExpanded.push(focusedGroup.id);
        }
        this.setState( { expandedGroups: newExpanded });
    }

    onGroupEnter(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        this.onGroup(focusedGroup.id);
    }

    onGroupArrowUp(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        let idx = this.props.rowData?.findIndex((value: IRowGroup) => value.id === focusedGroup.id);
        if (idx && idx > 0) {
            --idx;
            let newGroup = this.props.rowData![idx];
            // If expanded, focus the last child of the group
            if (this.state.expandedGroups.includes(ReportTreeGrid.getRowId(newGroup))) {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(newGroup, newGroup.children[newGroup.children.length-1]) });
            } else {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(newGroup) });
            }
        }
    }

    onGroupArrowDown(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        let idx = this.props.rowData?.findIndex((value: IRowGroup) => value.id === focusedGroup.id);
        // If expanded, focus the first child of the group
        if (this.state.expandedGroups.includes(ReportTreeGrid.getRowId(focusedGroup))) {
            this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[0]) });
        } else if (typeof idx !== "undefined" && idx < this.props.rowData!.length-1) {
            ++idx;
            let newGroup = this.props.rowData![idx];
            this.setState({ tabRowId: ReportTreeGrid.getRowId(newGroup) });
        }
    }

    ///////////////// Row keyboard events ////////////
    onRowArrowLeft(_evt: React.KeyboardEvent, focusedGroup: IRowGroup, _focusedRow: IIssue) {
        this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup) });
    }

    onRowArrowUp(evt: React.KeyboardEvent, focusedGroup: IRowGroup, focusedRow: IIssue) {
        let focusedRowId = ReportTreeGrid.getRowId(focusedGroup, focusedRow);
        let idx = focusedGroup.children.findIndex((value: IIssue) => ReportTreeGrid.getRowId(focusedGroup, value) === focusedRowId);
        if (idx === 0) {
            this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup) });
        } else {
            --idx;
            this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[idx]) });
            if ((evt.target as HTMLElement).nodeName.toLowerCase() === "a") {
                let id = ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[idx]);
                let row = document.getElementById(id);
                if (row) {
                    let link = row.querySelector(`a`) as HTMLAnchorElement;
                    if (link) {
                        evt.preventDefault();
                        link.focus();
                    }
                }
            }
        }
    }

    onRowArrowDown(evt: React.KeyboardEvent, focusedGroup: IRowGroup, focusedRow: IIssue) {
        let focusedRowId = ReportTreeGrid.getRowId(focusedGroup, focusedRow);
        let rowIdx = focusedGroup.children.findIndex((value: IIssue) => ReportTreeGrid.getRowId(focusedGroup, value) === focusedRowId);
        if (rowIdx === focusedGroup.children.length-1) {
            let groupIdx = this.props.rowData?.findIndex((value: IRowGroup) => value.id === focusedGroup.id);
            if (typeof groupIdx !== "undefined" && groupIdx < this.props.rowData!.length-1) {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(this.props.rowData![groupIdx+1]) });
            }
        } else {
            ++rowIdx;
            this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[rowIdx]) });
            if ((evt.target as HTMLElement).nodeName.toLowerCase() === "a") {
                let id = ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[rowIdx]);
                let row = document.getElementById(id);
                if (row) {
                    let link = row.querySelector(`a`) as HTMLAnchorElement;
                    if (link) {
                        evt.preventDefault();
                        link.focus();
                    }
                }                
            }
        }
    }

    onRowEnter(evt: React.KeyboardEvent, focusedGroup: IRowGroup, focusedRow: IIssue) {
        if ((evt.target as HTMLElement).nodeName.toLowerCase() !== "a") {
            evt.preventDefault();
            this.onRow(focusedGroup, focusedRow);
        }
    }

    onRowTab(evt: React.KeyboardEvent, focusedGroup: IRowGroup, focusedRow: IIssue) {
        if (evt.shiftKey) return;
        if (document) {
            if ((evt.target as HTMLElement).nodeName.toLowerCase() !== "a") {
                let id = ReportTreeGrid.getRowId(focusedGroup, focusedRow);
                let row = document.getElementById(id);
                if (row) {
                    let link = row.querySelector(`a`) as HTMLAnchorElement;
                    if (link) {
                        evt.preventDefault();
                        link.focus();
                    }
                }
            }
        }
    }

    ///////////////// Render ////////////
    render() {
        let content = <></>;

        if (!this.props.rowData || this.props.rowData.length === 0) {
            content = <>{ this.props.emptyLabel }</>
        } else {
            // Generate the header
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

            // Generate the body
            let bodyContent : Array<React.ReactNode> = [];
            for (let idxGroup=0; idxGroup < this.props.rowData.length; ++idxGroup) {
                numLeft = 4;
                const group = this.props.rowData[idxGroup];
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
                    id={group.id}
                    role="row" 
                    ariaLevel="1" 
                    ariaPosinset={idxGroup+1}
                    ariaSetsize={this.props.rowData.length}
                    ariaExpanded={groupExpanded}
                    className={{
                        gridBody: true,
                        focused: group.id === this.state.tabRowId
                    }} 
                    onClick={() => {
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

                // If the group is expanded, show the issues of that group
                if (groupExpanded) {
                    for (let idxRow=0; idxRow < group.children.length; ++idxRow) {
                        const thisIssue = group.children[idxRow];
                        const rowId = ReportTreeGrid.getRowId(group, thisIssue);
                        let selectedIssue : boolean = !!this.state.selectedIssue 
                            && this.state.selectedIssue.path.dom === thisIssue.path.dom
                            && this.state.selectedIssue.reasonId === thisIssue.reasonId
                            && this.state.selectedIssue.ruleId === thisIssue.ruleId;
                        let selectedNode : boolean = !!this.state.selectedPath 
                            && this.state.selectedPath === thisIssue.path.dom;
                        let selectedDescendant: boolean = !!this.state.selectedPath 
                            && thisIssue.path.dom.startsWith(this.state.selectedPath);
                        let focused: boolean = this.state.tabRowId === rowId
                        bodyContent.push(<Grid 
                            id={rowId}
                            role="row" 
                            ariaLevel="2" 
                            ariaPosinset={idxRow+1}
                            ariaSetsize={group.children.length}
                            className={{
                                gridBody: true,
                                selectedIssue,
                                selectedNode,
                                selectedDescendant,
                                focused
                            }} 
                            onClick={() => {
                                this.onRow(group, thisIssue);
                            }}
                        >
                            <Column className="gridChild" role="gridcell" sm={4} md={8} lg={8}>
                                {UtilIssue.valueToIcon(thisIssue.value, "levelIcon")} {thisIssue.message} <Link 
                                    className="hideLg"
                                    inline={true} 
                                    size="sm"
                                    role="link"
                                    tabIndex={focused? 0 : -1}
                                    onClick={() => {
                                        ReportTreeGrid.devtoolsController.setSelectedIssue(thisIssue);
                                        ReportTreeGrid.devtoolsAppController.setSecondaryView("help");
                                        ReportTreeGrid.devtoolsAppController.openSecondary(`#${rowId} a`);
                                    }}
                                    onKeyDown={(evt: React.KeyboardEvent) => {
                                        if (evt.key === "Enter" || evt.key === "Return") {
                                            ReportTreeGrid.devtoolsController.setSelectedIssue(thisIssue);
                                            ReportTreeGrid.devtoolsAppController.setSecondaryView("help");
                                            ReportTreeGrid.devtoolsAppController.openSecondary(`#${rowId} a`);
                                        }
                                    }}
                                >Learn more</Link>
                            </Column>
                        </Grid>);
                    }
                }
            }

            content = <>
                <div role="treegrid" 
                    ref={this.treeGridRef}
                    tabIndex={0} 
                    aria-activedescendant={this.state.tabRowId} 
                    className="reportTreeGrid"
                    onKeyDown={this.onKeyDown.bind(this)}
                >
                    {headerContent}
                    {bodyContent}
                </div>
            </>
        }
        return content;
    }
}
