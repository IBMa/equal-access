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
    Grid,
    Link
} from "@carbon/react";

import {
    ChevronDown,
    ChevronUp
} from "@carbon/react/icons";

import "./reportTreeGrid.scss";
import { IIssue } from '../../interfaces/interfaces';
import { getDevtoolsAppController } from '../devtoolsAppController';
import { ePanel, getDevtoolsController, ViewState } from '../devtoolsController';
import { UtilIssue } from '../../util/UtilIssue';
import { UtilIssueReact } from '../../util/UtilIssueReact';

export interface IRowGroup {
    id: string
    label: string | React.ReactNode
    children: IIssue[]
}

interface ReportTreeGridProps<RowType extends IRowGroup> {
    unfilteredCount: number
    panel: ePanel;
    headers: Array<{ key: string, label: string }>
    rowData?: RowType[] | null
    className?: string
    selectedPath: string | null;
    noScanMessage: React.ReactNode;
    onResetFilters: () => void
}


interface ReportTreeGridState {
    viewState?: ViewState
    expandedGroups: string[]
    selectedIssue: IIssue | null;
    tabRowId: string;
}

export class ReportTreeGrid<RowType extends IRowGroup> extends React.Component<ReportTreeGridProps<RowType>, ReportTreeGridState> {
    private static devtoolsAppController = getDevtoolsAppController();
    private static devtoolsController = getDevtoolsController();

    /**
     * Clean an id of spaces for use in id attribute and active-descendant
     * @param id 
     * @returns 
     */
    public static cleanId(id: string) {
        return id.trim().replace(/ /g, "").replace(/[[\]]/g, "").replace(/\//g, ":").replace(/[^A-Za-z0-9\-_:.]/g, "_");
    }

    public static getRowId(group:IRowGroup, child?: IIssue) {
        if (!child) {
            return group.id;
        } else {
            return `${group.id}:::::${ReportTreeGrid.cleanId(child.path.dom)}_${child.ruleId}_${child.reasonId}`;
        }
    }

    state: ReportTreeGridState = {
        expandedGroups: [],
        selectedIssue: null,
        tabRowId: ""
    }
    treeGridRef = React.createRef<HTMLDivElement>();

    async componentDidMount(): Promise<void> {
        ReportTreeGrid.devtoolsController.addSelectedIssueListener(async (issue) => {
            for (const group of this.props.rowData!) {
                for (const groupIssue of group.children) {
                    if (groupIssue.path.dom === issue.path.dom
                        && groupIssue.reasonId === issue.reasonId
                        && groupIssue.ruleId === issue.ruleId
                    ) {
                        this.setState({ tabRowId: ReportTreeGrid.getRowId(group, groupIssue) });                        
                    }
                }
            }
        });
        let issue = await ReportTreeGrid.devtoolsController.getSelectedIssue();
        this.setIssue(issue!);

        if (this.props.rowData && this.props.rowData.length > 0) {
            this.setState({ expandedGroups: this.props.rowData?.map(group => group.id), tabRowId: this.props.rowData[0].id });
        }
        ReportTreeGrid.devtoolsController.addViewStateListener(async (viewState: ViewState) => {
            this.setState({ viewState });
        })
        this.setState({
            viewState: (await ReportTreeGrid.devtoolsController.getViewState())!
        })

    }

    componentDidUpdate(prevProps: Readonly<ReportTreeGridProps<RowType>>, prevState: Readonly<ReportTreeGridState>, _snapshot?: any): void {
        if (!prevProps.rowData && !!this.props.rowData) {
            // First time creating the report tree
            this.setState({expandedGroups: this.props.rowData?.map(group => group.id), tabRowId: this.props.rowData && this.props.rowData.length > 0 ? this.props.rowData[0].id : ""});
        } else if (prevProps.rowData && this.props.rowData && JSON.stringify(prevProps.rowData) !== JSON.stringify(this.props.rowData)) {
            // Report tree changed
            let found = false;
            if (this.state.tabRowId) {
                // Try to find the same issue in the new scan
                for (const group of this.props.rowData) {
                    for (const issue of group.children) {
                        if (ReportTreeGrid.getRowId(group, issue) === this.state.tabRowId) {
                            found = true;
                            setTimeout(async () => {
                                await this.onRow(group, issue);
                                
                                this.scrollToRowId(this.state.tabRowId);
                            }, 0);
                            break;
                        }
                    }
                    if (found) break;
                }
            }    
            if (!found) {
                // getDevtoolsController().setFocusMode(false); // turn off focus view when scan
                this.setState({expandedGroups: this.props.rowData?.map(group => group.id), tabRowId: this.props.rowData && this.props.rowData.length > 0 ? this.props.rowData[0].id : ""});
            }
        } else if (prevState.tabRowId !== this.state.tabRowId && document) {
            // Report tree is the same, but the row changed
            if (this.props.rowData && this.props.rowData.length > 0) {
                this.scrollToRowId(this.state.tabRowId);
            }
        }
    }

    scrollToRowId(rowId: string) {
        let elem = document.getElementById(rowId);
        if (elem) {
            setTimeout(() => {
                elem?.scrollIntoView({
                    // @ts-ignore
                    block: 'nearest',
                    inline: 'start'
                });
                if (this.state.tabRowId === this.props.rowData![0].id) {
                    setTimeout(() => {
                        this.treeGridRef.current!.firstElementChild!.scrollIntoView({
                            // @ts-ignore
                            block: 'nearest',
                            inline: 'start',
                            behavior: 'smooth'
                        });
                    }, 0);
                }
            }, 0);
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

    async onRow(_group: IRowGroup, issue: IIssue) {
        await ReportTreeGrid.devtoolsController.setSelectedIssue(issue);
        if (this.props.panel === "elements") {
            // this.setState({ tabRowId: ReportTreeGrid.getRowId(group, issue) });
            await ReportTreeGrid.devtoolsController.inspectPath(issue.path.dom, this.treeGridRef.current);
        } else {
            await ReportTreeGrid.devtoolsController.setSelectedElementPath(issue.path.dom);
        }
        this.setState({ tabRowId: ReportTreeGrid.getRowId(_group, issue) });
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
                case "Home":
                    this.onGroupHome(evt, focusedGroup);
                    evt.preventDefault();
                    break;
                case "End":
                    this.onGroupEnd(evt, focusedGroup);
                    evt.preventDefault();
                    break;
            }
        } else {
            let [focusedGroupId, _focusedChildId] = focusedElemId.split(/:::::/);
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
                        case "Home":
                            this.onGroupHome(evt, focusedGroup);
                            evt.preventDefault();
                            break;
                        case "End":
                            this.onGroupEnd(evt, focusedGroup);
                            evt.preventDefault();
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
            this.setState( { expandedGroups: newExpanded });
        } else {
            // already expanded, go to the first row child
            let firstChild = focusedGroup.children[0];
            this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup, firstChild)});
        }
    }

    onGroupEnter(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        this.onGroup(focusedGroup.id);
    }

    onGroupArrowUp(evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        if (evt.metaKey) {
            this.onGroupHome(evt, focusedGroup);
        } else {
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
    }

    onGroupArrowDown(evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        if (evt.metaKey) {
            this.onGroupEnd(evt, focusedGroup);
        } else {
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
    }

    onGroupHome(_evt: React.KeyboardEvent, _focusedGroup: IRowGroup) {
        if (this.props.rowData && this.props.rowData.length > 0) {
            this.setState({ tabRowId: ReportTreeGrid.getRowId(this.props.rowData[0]) });
        }
    }

    onGroupEnd(_evt: React.KeyboardEvent, _focusedGroup: IRowGroup) {
        if (this.props.rowData && this.props.rowData.length > 0) {
            let lastGroup = this.props.rowData[this.props.rowData.length-1];
            if (this.state.expandedGroups.includes(ReportTreeGrid.getRowId(lastGroup))) {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(lastGroup, lastGroup.children[lastGroup.children.length-1]) });                
            } else {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(lastGroup) });
            }
        }
    }

    ///////////////// Row keyboard events ////////////
    onRowArrowLeft(_evt: React.KeyboardEvent, focusedGroup: IRowGroup, _focusedRow: IIssue) {
        this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup) });
    }

    onRowArrowUp(evt: React.KeyboardEvent, focusedGroup: IRowGroup, focusedRow: IIssue) {
        if (evt.metaKey) {
            this.onGroupHome(evt, focusedGroup);
        } else {
            let focusedRowId = ReportTreeGrid.getRowId(focusedGroup, focusedRow);
            let idx = focusedGroup.children.findIndex((value: IIssue) => ReportTreeGrid.getRowId(focusedGroup, value) === focusedRowId);
            if (idx === 0) {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup) });
            } else {
                --idx;
                this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[idx]) });
                if ((evt.target as HTMLElement).nodeName.toLowerCase() === "a") {
                    this.treeGridRef.current?.focus();
                    // let id = ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[idx]);
                    // let row = document.getElementById(id);
                    // if (row) {
                    //     let link = row.querySelector(`a`) as HTMLAnchorElement;
                    //     if (link) {
                    //         evt.preventDefault();
                    //         link.focus();
                    //     }
                    // }
                }
            }
        }
    }

    onRowArrowDown(evt: React.KeyboardEvent, focusedGroup: IRowGroup, focusedRow: IIssue) {
        if (evt.metaKey) {
            this.onGroupEnd(evt, focusedGroup);
        } else {
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
                    this.treeGridRef.current?.focus();
                    // let id = ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[rowIdx]);
                    // let row = document.getElementById(id);
                    // if (row) {
                    //     let link = row.querySelector(`a`) as HTMLAnchorElement;
                    //     if (link) {
                    //         evt.preventDefault();
                    //         link.focus();
                    //     }
                    // }                
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
        let content : React.ReactNode = <></>;

        if (!this.props.rowData) {
            content = <div className="reportTreeGridEmptyText">{this.props.noScanMessage}</div>;
        } else if (this.props.unfilteredCount === 0) {
            if (this.state.viewState && this.state.viewState.kcm) {
                content = <div className="reportTreeGridEmptyText">
                    No keyboard issues detected.
                </div>
            } else {
                content = <div className="reportTreeGridEmptyText">
                    No issues detected.
                </div>
            }
        } else if (this.props.rowData.length === 0) {
            content = <div className="reportTreeGridEmptyText">
                No issues detected for the chosen filter criteria. To see all issues, <Link
                    inline={true}
                    onClick={() => {
                        getDevtoolsController().setFocusMode(false);
                    }}
                >turn off focus view</Link> and <Link
                    inline={true}
                    onClick={() => {
                        this.props.onResetFilters;
                    }}
                >select all issue types</Link>
            </div>
        } else {
            let numColumns = this.props.headers.length;
            // Generate the header
            let headerContent = <Grid className="gridHeader">
                {this.props.headers.map((header, idx) => {
                    let smallCol = 0;
                    let medCol = 0;
                    if (numColumns === 2) {
                        // Two column layout
                        smallCol = 2;
                        medCol = 2;
                        if (idx === this.props.headers.length -1) {
                            medCol = 6;
                        }
                    } else if (numColumns === 3) {
                        // Three column layout
                        smallCol = 1;
                        medCol = 2;
                        if (idx === this.props.headers.length -1) {
                            smallCol = 2;
                            medCol = 4;
                        }
                    }
                    return <Column sm={smallCol} md={medCol}>
                        <div className="gridHeaderCell">
                            {header.label}
                        </div>
                    </Column>
                })}
            </Grid>;

            // Generate the body
            let bodyContent : Array<React.ReactNode> = [];
            for (let idxGroup=0; idxGroup < this.props.rowData.length; ++idxGroup) {
                const group = this.props.rowData[idxGroup];
                const groupExpanded = this.state.expandedGroups.includes(group.id);
                const counts : {
                    [key: string]: number
                } = {};
                for (const child of group.children) {
                    counts[UtilIssue.valueToStringSingular(child.value)] = (counts[UtilIssue.valueToStringSingular(child.value)] || 0) + 1;
                }
                let childCounts = <span style={{marginLeft: ".5rem"}}>
                    { counts["Violation"] > 0 && <span style={{whiteSpace: "nowrap"}}>{UtilIssueReact.valueSingToIcon("Violation", "levelIcon")} <span style={{marginRight:".25rem"}}>{counts["Violation"]}</span></span> }
                    { counts["Needs review"] > 0 && <span style={{whiteSpace: "nowrap"}}>{UtilIssueReact.valueSingToIcon("Needs review", "levelIcon")} <span style={{marginRight:".25rem"}}>{counts["Needs review"]}</span></span> }
                    { counts["Recommendation"] > 0 && <span style={{whiteSpace: "nowrap"}}>{UtilIssueReact.valueSingToIcon("Recommendation", "levelIcon")} <span style={{marginRight:".25rem"}}>{counts["Recommendation"]}</span></span> }
                </span>;
                bodyContent.push(<Grid 
                    id={group.id}
                    role="row" 
                    aria-level="1" 
                    aria-posinset={idxGroup+1}
                    aria-setsize={this.props.rowData.length}
                    aria-expanded={groupExpanded}
                    className={{
                        gridBody: true,
                        focused: group.id === this.state.tabRowId
                    }} 
                    onClick={() => {
                        this.onGroup(group.id);
                    }}
                >
                    {this.props.headers.map((header, idx) => {
                        let smallCol = 0;
                        let medCol = 0;
                        if (numColumns === 2) {
                            // Two column layout
                            smallCol = 2;
                            medCol = 2;
                            if (idx === this.props.headers.length -1) {
                                medCol = 6;
                            }
                        } else if (numColumns === 3) {
                            // Three column layout
                            smallCol = 1;
                            medCol = 2;
                            if (idx === this.props.headers.length -1) {
                                smallCol = 2;
                                medCol = 4;
                            }
                        }
                        return <Column role="columnheader" sm={smallCol} md={medCol} className={header.key}>
                            <div className="gridGroupCell">
                                {idx === 0 && groupExpanded && <ChevronUp />}
                                {idx === 0 && !groupExpanded && <ChevronDown />}
                                { header.key === "issueCount" && childCounts }
                                { header.key !== "issueCount" && (group as any)[header.key] }
                            </div>
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
                        let selectedNode : boolean = !!this.props.selectedPath 
                            && this.props.selectedPath === thisIssue.path.dom;
                        let selectedDescendant: boolean = !!this.props.selectedPath 
                            && thisIssue.path.dom.startsWith(this.props.selectedPath);
                        let focused: boolean = this.state.tabRowId === rowId
                        bodyContent.push(<Grid 
                            id={rowId}
                            role="row" 
                            aria-level="2" 
                            aria-posinset={idxRow+1}
                            aria-setsize={group.children.length}
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
                            <Column className="gridChild" role="gridcell" aria-selected={selectedIssue} sm={4} md={8} lg={8}>
                                <div className="gridDataCell">
                                    {UtilIssueReact.valueToIcon(thisIssue.value, "levelIcon")} {thisIssue.message} <a 
                                        className="hideLg cds--link hideLg cds--link--inline cds--link--sm"
                                        role="link"
                                        tabIndex={focused? 0 : -1}
                                        onClick={() => {
                                            this.onRow(group, thisIssue);
                                            ReportTreeGrid.devtoolsAppController.openSecondary(`#${rowId} a`);
                                        }}
                                        onKeyDown={(evt: React.KeyboardEvent) => {
                                            if (evt.key === "Enter" || evt.key === "Return") {
                                                this.onRow(group, thisIssue);
                                                ReportTreeGrid.devtoolsAppController.openSecondary(`#${rowId} a`);
                                                }
                                        }}
                                    >Learn more</a>
                                </div>
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
