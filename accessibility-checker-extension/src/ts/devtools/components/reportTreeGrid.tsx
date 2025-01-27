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
    Link,
    Checkbox,
    TableToolbar,
    TableBatchActions,
    TableBatchAction
} from "@carbon/react";

import {
    ChevronDown,
    ChevronUp,
    ViewFilled,
    ViewOffFilled,
    ViewOff
} from "@carbon/react/icons";

import "./reportTreeGrid.scss";
import { IIssue, UIIssue } from '../../interfaces/interfaces';
import { getDevtoolsAppController } from '../devtoolsAppController';
import { AiElementXpathState, ePanel, getDevtoolsController, ViewState } from '../devtoolsController';
import { UtilIssue } from '../../util/UtilIssue';
import { UtilIssueReact } from '../../util/UtilIssueReact';
import { getBGController, issueBaselineMatch } from '../../background/backgroundController';

export interface IRowGroup {
    id: string;
    label: string | React.ReactNode;
    children: UIIssue[];
    checked: "none" | "some" | "all";
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
    onFilterToolbar: (val: boolean) => void
}


interface ReportTreeGridState {
    viewState?: ViewState
    expandedGroups: string[]
    selectedIssue: IIssue | null;
    tabRowId: string;
    checkedIssues: UIIssue[]
}

export class ReportTreeGrid<RowType extends IRowGroup> extends React.Component<ReportTreeGridProps<RowType>, ReportTreeGridState> {
    private devtoolsAppController = getDevtoolsAppController();
    private devtoolsController = getDevtoolsController(this.devtoolsAppController.toolTabId);
    private bgcontroller = getBGController();
    private treeGridRef = React.createRef<HTMLDivElement>();
    state: ReportTreeGridState = {
        expandedGroups: [],
        selectedIssue: null,
        tabRowId: "tableGridHeader",
        checkedIssues: []
    }

    /**
     * Clean an id of spaces for use in id attribute and active-descendant
     * @param id 
     * @returns 
     */
    public static cleanId(id: string) {
        return id.trim().replace(/ /g, "").replace(/[[\]]/g, "").replace(/\//g, ":").replace(/[^A-Za-z0-9\-_:.]/g, "_");
    }

    public static getRowId(group: IRowGroup, child?: IIssue) {
        if (!child) {
            return group.id;
        } else {
            return `${group.id}:::::${ReportTreeGrid.cleanId(child.path.dom)}_${child.ruleId}_${child.reasonId}`;
        }
    }

    async componentDidMount(): Promise<void> {
        this.devtoolsController.addSelectedIssueListener(async (issue) => {
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
        let issue = await this.devtoolsController.getSelectedIssue();
        this.setIssue(issue!);

        if (this.props.rowData && this.props.rowData.length > 0) {
            this.setState({ expandedGroups: this.props.rowData?.map(group => group.id), tabRowId: "tableGridHeader" });
        }
        this.devtoolsController.addViewStateListener(async (viewState: ViewState) => {
            this.setState({ viewState });
        })
        this.setState({
            viewState: (await this.devtoolsController.getViewState())!
        })
    }

    componentDidUpdate(prevProps: Readonly<ReportTreeGridProps<RowType>>, prevState: Readonly<ReportTreeGridState>, _snapshot?: any): void {
        const simpData = (rowData: any) => {
            if (!rowData) return [];
            return rowData.map((row: any) => ({
                id: row.id,
                children: row.children.map((childRow: any) => ({
                    ruleId: childRow.ruleId,
                    reasonId: childRow.reasonId,
                    path: childRow.path
                }))
            }))
        }

        if (!prevProps.rowData && !!this.props.rowData) {
            // First time creating the report tree
            this.setState({ expandedGroups: this.props.rowData?.map(group => group.id), tabRowId: this.props.rowData && this.props.rowData.length > 0 ? this.props.rowData[0].id : "tableGridHeader" });
        } else if (prevProps.rowData) {
            if (this.props.rowData && (JSON.stringify(simpData(prevProps.rowData)) !== JSON.stringify(simpData(this.props.rowData)))) {
                // Report tree changed
                let found = false;
                let newCheckedIssues: IIssue[] = []
                if (this.state.tabRowId) {
                    // Try to find the same issue in the new scan
                    for (const group of this.props.rowData) {
                        for (const issue of group.children) {
                            if (!found && ReportTreeGrid.getRowId(group, issue) === this.state.tabRowId) {
                                found = true;
                                setTimeout(async () => {
                                    await this.onRow(group, issue);
                                    this.scrollToRowId(this.state.tabRowId);
                                }, 0);
                            }
                            if (this.state.checkedIssues.some(checkedIssue => issueBaselineMatch(issue, checkedIssue))
                                && !newCheckedIssues.some(newCheckedIssue => issueBaselineMatch(issue, newCheckedIssue))) {
                                newCheckedIssues.push(issue);
                            }
                        }
                    }
                }
                if (!found) {
                    // Reset the issue selection since we can't find that same issue
                    this.props.onFilterToolbar(newCheckedIssues.length === 0);
                    this.setState({ checkedIssues: newCheckedIssues, expandedGroups: this.props.rowData?.map(group => group.id), tabRowId: this.props.rowData && this.props.rowData.length > 0 ? this.props.rowData[0].id : "tableGridHeader" });
                } else {
                    // If we didn't change the checked issues, scroll
                    if (JSON.stringify(this.state.checkedIssues) !== JSON.stringify(newCheckedIssues)) {
                        this.setState({ checkedIssues: newCheckedIssues });
                    }
                }
            } else if (prevState.tabRowId !== this.state.tabRowId && document) {
                // Report tree is the same, but the row changed
                if (this.props.rowData && this.props.rowData.length > 0) {
                    this.scrollToRowId(this.state.tabRowId);
                }
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
        this.setState({ selectedIssue: issue });
    }

    private async aiProcessIssueData(issue: IIssue) {
        // get help file
        const str = issue.help;
        const splitWord = "html";
        const index = str.indexOf(splitWord);
        let before = "";
        if (index !== -1) {
            before = str.substring(0, index + splitWord.length);
        }
        let helpURL = before; // string before splitWord
       
        let helpHTML = '';
        await fetch(helpURL)
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.text(); // Assuming the URL returns text content
            })
            .then(data => {
                // 'data' now contains the content from the URL
                helpHTML = data; 
            })
            .catch(error => {
                console.error('There was a problem fetching the data:', error);
            });
        
        const cheerio = require('cheerio');
        const $ = cheerio.load(helpHTML);
        const scripts = $('mark-down script[type="text/plain"]');

        let whatToDo = '';
        let aboutThisRequirement = '';

        scripts.each((_index:any, script:any) => {
            
            const text = $(script).text();
            const sections = text.split('###');

             sections.forEach((section:any) => {
                if (section.trim().startsWith('What to do')) {
                whatToDo = section.trim(); // here is the What to do section
                } else if (section.trim().startsWith('About this requirement')) {
                aboutThisRequirement = section.trim(); // About this requirement section
                }
            });
        });

        let settings = await this.bgcontroller.getSettings();
        let rulesets = await this.bgcontroller.getRulesets(this.devtoolsAppController.contentTabId!);
        let ruleset = rulesets.find(policy => policy.id === settings.selected_ruleset.id);

        let issueCheckpoints = [];
        for (const checkpoint of ruleset!.checkpoints) {
            // see if issue ruleId in checkpoint
            for (const rule of checkpoint.rules!) {
                if (issue.ruleId === rule.id) {
                    issueCheckpoints.push(checkpoint);
                }
            }
        }
        // get the specific rule in each Checkpoint
        let checkpointNumber = "";
        for (const checkpoint of issueCheckpoints) {
            checkpointNumber += checkpoint.num;
        }
        let checkpointRule;
        for (const rule of issueCheckpoints[0].rules!) {
            if (issue.ruleId === rule.id) {
                checkpointRule = rule;
            }
        }
        let checkpointWcagLevel = "";
        for (const checkpoint of issueCheckpoints) {
            checkpointWcagLevel += checkpoint.wcagLevel;
        }
        
        // AI Prompt Data
        console.log("\nAI PROMPT DATA\n");
        console.log("Issue type = ", UtilIssue.valueToStringSingular(issue.value));
        console.log("Toolkit level = ", checkpointRule?.toolkitLevel);
        console.log("Checkpoint = ", checkpointNumber);
        console.log("WCAG level = ", checkpointWcagLevel);
        console.log("Rule ID/name = ", issue.ruleId);
        console.log("Rule message: ", issue.message);
        console.log("Rule reason code: ", issue.reasonId);
        console.log("Rule specific message: ");
        console.log("Element where issue found", issue.path.dom);
        let x: any = issue.path.dom;
        let path: AiElementXpathState = x;
        console.log("JOHO path: ",path);
        await this.devtoolsController.setAiElementXpathState(path);
        await this.devtoolsController.getAiElementXpathState();
        
        console.log("Code where issue is found: ", issue.snippet);
        console.log("(from Help)\n", whatToDo);
        console.log("(from Help)\n", aboutThisRequirement);
    }

    onGroup(groupId: string) {
        let newExpanded: string[] = JSON.parse(JSON.stringify(this.state.expandedGroups));
        if (newExpanded.includes(groupId)) {
            newExpanded = newExpanded.filter(s => s !== groupId);
        } else {
            newExpanded.push(groupId);
        }
        this.setState({ expandedGroups: newExpanded });
    }

    async onRow(_group: IRowGroup, issue: IIssue, inspect?: boolean) {
        await this.devtoolsController.setSelectedIssue(issue);
        if (this.props.panel === "elements" && inspect !== false) {
            // this.setState({ tabRowId: ReportTreeGrid.getRowId(group, issue) });
            let focusTarget: HTMLElement | null = this.treeGridRef.current;
            if (this.devtoolsAppController.getSecondaryOpen()) {
                let secondaryPanel = document.querySelector(".secondaryDialog") as HTMLElement;
                if (window.getComputedStyle(secondaryPanel).display !== "none") {
                    focusTarget = secondaryPanel.querySelector(".cds--modal-close")
                }
            }
            await this.devtoolsController.inspectPath(issue.path.dom, focusTarget);
        } else {
            await this.devtoolsController.setSelectedElementPath(issue.path.dom);
        }
        this.setState({ tabRowId: ReportTreeGrid.getRowId(_group, issue) });
    }

    onKeyDown(evt: React.KeyboardEvent) {
        if (evt.key === "Escape") {
            evt.stopPropagation();
            this.devtoolsController.clearInspectOverlay();
        }
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
                case "Tab":
                    this.onGroupTab(evt, focusedGroup);
                    break;
                case "Enter":
                    this.onGroupEnter(evt, focusedGroup);
                    evt.preventDefault();
                    break;
                case "Home":
                    this.onGroupHome(evt);
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
                            this.onGroupHome(evt);
                            evt.preventDefault();
                            break;
                        case "End":
                            this.onGroupEnd(evt, focusedGroup);
                            evt.preventDefault();
                            break;
                    }
                }
            } else {
                switch (evt.key) {
                    case "ArrowDown":
                        this.treeGridRef.current?.focus();
                        this.onGroupHome(evt);
                        break;
                    case "Tab":
                        this.onHeaderTab(evt);
                        break;
                }
            }
        }
    }

    ///////////////// Group keyboard events ////////////
    onGroupArrowLeft(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        let newExpanded: string[] = JSON.parse(JSON.stringify(this.state.expandedGroups));
        if (newExpanded.includes(focusedGroup.id)) {
            newExpanded = newExpanded.filter(s => s !== focusedGroup.id);
        }
        this.setState({ expandedGroups: newExpanded });
    }

    onGroupArrowRight(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        let newExpanded: string[] = JSON.parse(JSON.stringify(this.state.expandedGroups));
        if (!newExpanded.includes(focusedGroup.id)) {
            newExpanded.push(focusedGroup.id);
            this.setState({ expandedGroups: newExpanded });
        } else {
            // already expanded, go to the first row child
            let firstChild = focusedGroup.children[0];
            this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup, firstChild) });
        }
    }

    onGroupEnter(_evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        this.onGroup(focusedGroup.id);
    }

    onGroupArrowUp(evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        if (evt.metaKey) {
            this.onGroupHome(evt);
        } else {
            let idx = this.props.rowData?.findIndex((value: IRowGroup) => value.id === focusedGroup.id);
            if (idx && idx > 0) {
                --idx;
                let newGroup = this.props.rowData![idx];
                // If expanded, focus the last child of the group
                if (this.state.expandedGroups.includes(ReportTreeGrid.getRowId(newGroup))) {
                    this.setState({ tabRowId: ReportTreeGrid.getRowId(newGroup, newGroup.children[newGroup.children.length - 1]) });
                } else {
                    this.setState({ tabRowId: ReportTreeGrid.getRowId(newGroup) });
                }
            } else {
                this.goHeader();
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
            } else if (typeof idx !== "undefined" && idx < this.props.rowData!.length - 1) {
                ++idx;
                let newGroup = this.props.rowData![idx];
                this.setState({ tabRowId: ReportTreeGrid.getRowId(newGroup) });
            }
        }
    }

    onGroupTab(evt: React.KeyboardEvent, focusedGroup: IRowGroup) {
        const selectCheckbox = () => {
            let id = ReportTreeGrid.getRowId(focusedGroup);
            let row = document.getElementById(id);
            if (row) {
                let chkbox = row.querySelector(`input`) as HTMLInputElement;
                if (chkbox) {
                    evt.preventDefault();
                    chkbox.focus();
                }
            }
        }
        if (document) {
            if (!["input"].includes((evt.target as HTMLElement).nodeName.toLowerCase()) && !evt.shiftKey) {
                selectCheckbox();
            } else if (document.activeElement?.nodeName.toLowerCase() === "a" && evt.shiftKey) {
                selectCheckbox();
            }
        }
    }

    onGroupHome(_evt: React.KeyboardEvent) {
        if (this.props.rowData && this.props.rowData.length > 0) {
            this.setState({ tabRowId: ReportTreeGrid.getRowId(this.props.rowData[0]) });
        }
    }

    onGroupEnd(_evt: React.KeyboardEvent, _focusedGroup: IRowGroup) {
        if (this.props.rowData && this.props.rowData.length > 0) {
            let lastGroup = this.props.rowData[this.props.rowData.length - 1];
            if (this.state.expandedGroups.includes(ReportTreeGrid.getRowId(lastGroup))) {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(lastGroup, lastGroup.children[lastGroup.children.length - 1]) });
            } else {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(lastGroup) });
            }
        }
    }

    goHeader() {
        this.setState({ tabRowId: "tableGridHeader" });
    }
    onHeaderTab(evt: React.KeyboardEvent) {
        const selectCheckbox = () => {
            let row = document.getElementById("tableGridHeader");
            if (row) {
                let chkbox = row.querySelector(`input`) as HTMLInputElement;
                if (chkbox) {
                    evt.preventDefault();
                    chkbox.focus();
                }
            }
        }
        if (document) {
            if (!["input"].includes((evt.target as HTMLElement).nodeName.toLowerCase()) && !evt.shiftKey) {
                selectCheckbox();
            }
        }
    }

    ///////////////// Row keyboard events ////////////
    onRowArrowLeft(_evt: React.KeyboardEvent, focusedGroup: IRowGroup, _focusedRow: IIssue) {
        this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup) });
    }

    onRowArrowUp(evt: React.KeyboardEvent, focusedGroup: IRowGroup, focusedRow: IIssue) {
        if (["a", "input"].includes((evt.target as HTMLElement).nodeName.toLowerCase())) {
            this.treeGridRef.current?.focus();
        }
        if (evt.metaKey) {
            this.onGroupHome(evt);
        } else {
            let focusedRowId = ReportTreeGrid.getRowId(focusedGroup, focusedRow);
            let idx = focusedGroup.children.findIndex((value: IIssue) => ReportTreeGrid.getRowId(focusedGroup, value) === focusedRowId);
            if (idx === 0) {
                this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup) });
            } else {
                --idx;
                this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[idx]) });
            }
        }
    }

    onRowArrowDown(evt: React.KeyboardEvent, focusedGroup: IRowGroup, focusedRow: IIssue) {
        if (["a", "input"].includes((evt.target as HTMLElement).nodeName.toLowerCase())) {
            this.treeGridRef.current?.focus();
        }
        if (evt.metaKey) {
            this.onGroupEnd(evt, focusedGroup);
        } else {
            let focusedRowId = ReportTreeGrid.getRowId(focusedGroup, focusedRow);
            let rowIdx = focusedGroup.children.findIndex((value: IIssue) => ReportTreeGrid.getRowId(focusedGroup, value) === focusedRowId);
            if (rowIdx === focusedGroup.children.length - 1) {
                let groupIdx = this.props.rowData?.findIndex((value: IRowGroup) => value.id === focusedGroup.id);
                if (typeof groupIdx !== "undefined" && groupIdx < this.props.rowData!.length - 1) {
                    this.setState({ tabRowId: ReportTreeGrid.getRowId(this.props.rowData![groupIdx + 1]) });
                }
            } else {
                ++rowIdx;
                this.setState({ tabRowId: ReportTreeGrid.getRowId(focusedGroup, focusedGroup.children[rowIdx]) });
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
        const selectCheckbox = () => {
            let id = ReportTreeGrid.getRowId(focusedGroup, focusedRow);
            let row = document.getElementById(id);
            if (row) {
                let chkbox = row.querySelector(`input`) as HTMLInputElement;
                if (chkbox) {
                    evt.preventDefault();
                    chkbox.focus();
                }
            }
        }
        const selectHelp = () => {
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
        if (document) {
            if (!["a", "input"].includes((evt.target as HTMLElement).nodeName.toLowerCase()) && !evt.shiftKey) {
                selectCheckbox();
            } else if (document.activeElement?.nodeName.toLowerCase() === "input" && !evt.shiftKey) {
                selectHelp();
            } else if (document.activeElement?.nodeName.toLowerCase() === "a" && evt.shiftKey) {
                selectCheckbox();
            }
        }
    }


    /**
     * Toggle checked
     */
    public async setChecked(issues: IIssue[], bCheck: boolean): Promise<void> {
        let modifyList: UIIssue[] = JSON.parse(JSON.stringify(this.state.checkedIssues));
        for (const issue of issues) {
            let idx = modifyList.findIndex(baselineIssue => issueBaselineMatch(baselineIssue, issue));
            if (bCheck && idx === -1) {
                // We want to set it and it's not there, so add it
                modifyList.push(issue);
            } else if (!bCheck && idx !== -1) {
                // We want to clear it and it is there, so remove it
                modifyList.splice(idx, 1);
            } // else, it's already in the right state, so skip
        }
        this.props.onFilterToolbar(modifyList.length === 0);
        this.setState({ checkedIssues: modifyList });
    }



    ///////////////// Render ////////////
    render() {
        let content: React.ReactNode = <></>;

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
                        this.devtoolsController.setFocusMode(false);
                    }}
                >turn off focus view</Link>, <Link
                    inline={true}
                    onClick={() => {
                        this.props.onResetFilters;
                    }}
                >select all issue types</Link>, and do not filter hidden issues.
            </div>
        } else {
            // Calculate all of the show/hide/checked states
            let numColumns = this.props.headers.length;
            let allIssues: IIssue[] = [];
            let allChecked: "all" | "none" | "some" = "none";
            let allIssuesChecked = true;
            let ignoreAction: "Hide" | "Show" = "Show";
            for (const row of this.props.rowData) {
                let allRowChecked = true;
                row.checked = "none";
                for (const issue of row.children) {
                    issue.checked = this.state.checkedIssues.some(checkedIssue => issueBaselineMatch(checkedIssue, issue));
                    if (issue.checked && !issue.ignored) { // issue check but not ignored yet
                        ignoreAction = "Hide"
                    }
                    if (!allIssues.some(prevIssue => issueBaselineMatch(prevIssue, issue))) {
                        allIssues.push(issue);
                    }
                    if (!issue.ignored) {
                        // no action
                    }
                    if (!issue.checked) {
                        allRowChecked = false;
                        allIssuesChecked = false;
                    } else {
                        row.checked = "some"
                        allChecked = "some";
                    }
                }
                if (allRowChecked) {
                    row.checked = "all";
                }
            }
            if (allIssuesChecked) {
                allChecked = "all";
            }

            // Generate the header
            let headerContent = <Grid id="tableGridHeader" className={{
                gridHeader: true,
                focused: "tableGridHeader" === this.state.tabRowId
            }}>
                {this.props.headers.map((header, idx) => {
                    let smallCol = 0;
                    let medCol = 0;
                    if (numColumns === 2) {
                        // Two column layout
                        smallCol = 2;
                        medCol = 2;
                        if (idx === this.props.headers.length - 1) {
                            medCol = 6;
                        }
                    } else if (numColumns === 3) {
                        // Three column layout
                        smallCol = 1;
                        medCol = 2;
                        if (idx === this.props.headers.length - 1) {
                            smallCol = 2;
                            medCol = 4;
                        }
                    }
                    return <Column sm={smallCol} md={medCol} style={{ marginBottom: "8px" }}>
                        <div>
                            {header.label === "Issues" ?
                                <span className="gridHeaderCell">
                                    {allChecked === "some" && <Checkbox
                                        id="allchkbox"
                                        hideLabel
                                        indeterminate={true}
                                        tabIndex={this.state.tabRowId === "tableGridHeader" ? 0 : -1}
                                        onChange={async (_evt: any, value: { checked: boolean, id: string }) => {
                                            // Receives three arguments: the DOM event, true/false, checkbox id
                                            this.setChecked(allIssues, value.checked);
                                        }}
                                    />}
                                    {allChecked !== "some" && <Checkbox
                                        id="allchkbox"
                                        hideLabel
                                        checked={allChecked === "all"}
                                        tabIndex={this.state.tabRowId === "tableGridHeader" ? 0 : -1}
                                        onChange={async (_evt: any, value: { checked: boolean, id: string }) => {
                                            // Receives three arguments: the DOM event, true/false, checkbox id
                                            this.setChecked(allIssues, value.checked);
                                        }}
                                    />}
                                    <span style={{ marginLeft: "10px" }}>{header.label}</span>
                                </span>
                                : <span className="gridHeaderCell">{header.label}</span>
                            }
                        </div>
                    </Column>
                })}
            </Grid>;

            // Generate the body
            let bodyContent: Array<React.ReactNode> = [];
            for (let idxGroup = 0; idxGroup < this.props.rowData.length; ++idxGroup) {
                const group = this.props.rowData[idxGroup];
                const groupExpanded = this.state.expandedGroups.includes(group.id);
                const counts: {
                    [key: string]: number
                } = {};
                for (const child of group.children) {
                    counts[UtilIssue.valueToStringSingular(child.value)] = (counts[UtilIssue.valueToStringSingular(child.value)] || 0) + 1;
                }
                let focused: boolean = this.state.tabRowId === group.id;
                let childCounts = <span style={{ marginLeft: ".5rem" }}>
                    {/* JCH put group checkbox here */}
                    <div
                        style={{ display: "inline-block", marginLeft: "12px" }}
                        onClick={async (evt: any) => {
                            this.setChecked(group.children, group.checked !== "all");
                            // this.onGroup(group.id);
                            evt.preventDefault();
                        }}
                        onKeyDown={async (evt: React.KeyboardEvent) => {
                            if (evt.key === "Enter" || evt.key === "Return" || evt.key === "Space") {
                                this.setChecked(group.children, group.checked !== "all");
                                // this.onGroup(group.id);
                                evt.preventDefault();
                                evt.stopPropagation();
                            }
                        }}
                    >
                        {group.checked === "some" && <Checkbox
                            id={group.id.toString()}
                            hideLabel
                            indeterminate={true}
                            title={group.checked}
                            tabIndex={focused ? 0 : -1}
                        />}
                        {group.checked !== "some" && <Checkbox
                            id={group.id.toString()}
                            hideLabel
                            checked={group.checked === "all"}
                            title={group.checked}
                            tabIndex={focused ? 0 : -1}
                        />}
                    </div>
                    {counts["Violation"] > 0 && <span style={{ whiteSpace: "nowrap" }}>{UtilIssueReact.valueSingToIcon("Violation", "levelIcon")} <span style={{ marginRight: ".25rem" }}>{counts["Violation"]}</span></span>}
                    {counts["Needs review"] > 0 && <span style={{ whiteSpace: "nowrap" }}>{UtilIssueReact.valueSingToIcon("Needs review", "levelIcon")} <span style={{ marginRight: ".25rem" }}>{counts["Needs review"]}</span></span>}
                    {counts["Recommendation"] > 0 && <span style={{ whiteSpace: "nowrap" }}>{UtilIssueReact.valueSingToIcon("Recommendation", "levelIcon")} <span style={{ marginRight: ".25rem" }}>{counts["Recommendation"]}</span></span>}
                </span>;
                bodyContent.push(<Grid
                    id={group.id}
                    role="row"
                    aria-level="1"
                    aria-posinset={idxGroup + 1}
                    aria-setsize={this.props.rowData.length}
                    aria-expanded={groupExpanded}
                    className={{
                        gridBody: true,
                        focused: group.id === this.state.tabRowId
                    }}
                    onClick={(evt: any) => {
                        if (evt.target.getAttribute("class") !== "cds--checkbox-label") {
                            this.onGroup(group.id);
                        }
                    }}
                >
                    {this.props.headers.map((header, idx) => {
                        let smallCol = 0;
                        let medCol = 0;
                        if (numColumns === 2) {
                            // Two column layout
                            smallCol = 2;
                            medCol = 2;
                            if (idx === this.props.headers.length - 1) {
                                medCol = 6;
                            }
                        } else if (numColumns === 3) {
                            // Three column layout
                            smallCol = 1;
                            medCol = 2;
                            if (idx === this.props.headers.length - 1) {
                                smallCol = 2;
                                medCol = 4;
                            }
                        }
                        return <Column role="columnheader" sm={smallCol} md={medCol} className={header.key}>
                            <div className="gridGroupCell">
                                {idx === 0 && groupExpanded && <ChevronUp />}
                                {idx === 0 && !groupExpanded && <ChevronDown />}
                                {header.key === "issueCount" && childCounts}
                                {header.key !== "issueCount" && (group as any)[header.key]}
                            </div>
                        </Column>
                    })}
                </Grid>);

                // If the group is expanded, show the issues of that group
                if (groupExpanded) {
                    for (let idxRow = 0; idxRow < group.children.length; ++idxRow) {
                        const thisIssue = group.children[idxRow];
                        const rowId = ReportTreeGrid.getRowId(group, thisIssue);
                        let selectedIssue: boolean = !!this.state.selectedIssue
                            && this.state.selectedIssue.path.dom === thisIssue.path.dom
                            && this.state.selectedIssue.reasonId === thisIssue.reasonId
                            && this.state.selectedIssue.ruleId === thisIssue.ruleId;
                        let selectedNode: boolean = !!this.props.selectedPath
                            && this.props.selectedPath === thisIssue.path.dom;
                        let selectedDescendant: boolean = !!this.props.selectedPath
                            && thisIssue.path.dom.startsWith(this.props.selectedPath);
                        let focused: boolean = this.state.tabRowId === rowId
                        bodyContent.push(
                            <Grid
                                id={rowId}
                                role="row"
                                aria-level="2"
                                aria-posinset={idxRow + 1}
                                aria-setsize={group.children.length}
                                className={{
                                    gridBody: true,
                                    selectedIssue,
                                    selectedNode,
                                    selectedDescendant,
                                    focused
                                }}
                                onClick={(evt: any) => {
                                    if (evt.target.getAttribute("class") !== "cds--checkbox-label") {
                                        this.onRow(group, thisIssue);
                                    }
                                }}
                            >

                                <Column className="gridChild" role="gridcell" aria-selected={selectedIssue} sm={4} md={8} lg={8}>
                                    <div className="gridDataCell">
                                        <div
                                            style={{ display: "inline-block" }}
                                            onClick={async (evt: any) => {
                                                this.setChecked([thisIssue], !thisIssue.checked);
                                                // this.onRow(group, thisIssue, false);
                                                evt.preventDefault();
                                            }}
                                            onKeyDown={async (evt: React.KeyboardEvent) => {
                                                if (evt.key === "Enter" || evt.key === "Return" || evt.key === "Space") {
                                                    this.setChecked([thisIssue], !thisIssue.checked);
                                                    // this.onRow(group, thisIssue, false);
                                                    evt.preventDefault();
                                                }
                                            }}
                                        >
                                            <Checkbox
                                                id={rowId.toString()}
                                                hideLabel
                                                checked={thisIssue.checked}
                                                tabIndex={-1}
                                            />
                                        </div>
                                        {UtilIssueReact.valueToIcon(thisIssue.value, "levelIcon")} {thisIssue.ignored && <ViewOff size={16} />}{<span style={{paddingRight:"4px"}}></span>}{thisIssue.message} 
                                        {" "}<Link
                                            className="hideLg cds--link hideLg cds--link--inline cds--link--sm"
                                            role="link"
                                            href="#0"
                                            id={rowId}
                                            // tabIndex={focused ? 0 : -1}
                                            onClick={(evt: any) => {
                                                evt.stopPropagation();
                                                console.log("Trigger the collection of AI data for prompt.");
                                                console.log("thisIssue: ", thisIssue);
                                                // when user as for learn more give them AI enhanced help
                                                this.aiProcessIssueData(thisIssue);
                                                this.onRow(group, thisIssue);
                                                this.devtoolsAppController.setSecondaryView("help");
                                                this.devtoolsAppController.openSecondary(`#${rowId} a`);
                                                evt.preventDefault();
                                            }}
                                            // onKeyDown={(evt: React.KeyboardEvent) => {
                                            //     if (evt.key === "Enter" || evt.key === "Return") {
                                            //         this.onRow(group, thisIssue);
                                            //         this.devtoolsAppController.openSecondary(`#${rowId} a`);
                                            //     }
                                            // }}
                                        >Learn more</Link>
                                    </div>
                                </Column>
                            </Grid>
                        );
                    }
                }
            }

            let batchActions = <div className="gridActions" style={{visibility: allChecked !== "none" ? "visible" : "hidden", marginTop: allChecked !== "none" ? undefined : "-2rem"}}>
                <TableToolbar size="sm" aria-label="Issue actions" className="gridActions">
                    <TableBatchActions totalSelected={this.state.checkedIssues.length} shouldShowBatchActions={allChecked !== "none"} 
                        onCancel={async () => { 
                            this.setChecked(this.state.checkedIssues, false);
                        }}
                    >
                        <TableBatchAction
                            tabIndex={0}
                            renderIcon={ignoreAction === "Show" ? ViewFilled : ViewOffFilled }
                            onClick={async () => {
                                let url = (await this.bgcontroller.getTabInfo(this.devtoolsAppController.contentTabId!)).url!;
                                this.bgcontroller.setIgnore(url, this.state.checkedIssues, ignoreAction !== "Show");
                                this.setState({checkedIssues: []});
                                let report = await this.devtoolsController.getReport();
                                await this.devtoolsController.setReport(report);
                                this.props.onFilterToolbar(true);
                            }}
                        >{ignoreAction}</TableBatchAction>

                    </TableBatchActions>
                </TableToolbar>
            </div>;

            content = <>
                <div role="treegrid"
                    ref={this.treeGridRef}
                    tabIndex={0}
                    aria-activedescendant={this.state.tabRowId}
                    className="reportTreeGrid"
                    onKeyDown={this.onKeyDown.bind(this)}
                >
                    {batchActions}
                    {headerContent}
                    {bodyContent}
                </div>
            </>
        }
        return content;
    }
}
