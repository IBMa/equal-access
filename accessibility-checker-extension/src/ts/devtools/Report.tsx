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
    Column, Grid, Tabs,
    Tab, TabList, TabPanels, TabPanel
} from '@carbon/react';

import ReportElements from "./ReportElements";
import ReportRules from "./ReportRules";
import ReportChecklist from "./ReportChecklist";

export interface IReport {
    nls: {
        [ruleId: string] : {
            [reasonCode: string]: string
        }
    }
    timestamp: number,
    filterstamp: number,
    results: IReportItem[],
    passUniqueElements: string[],
    counts: { 
        "total": { [key: string]: number },
        "filtered": { [key: string]: number }
    }
}

export interface IReportItem {
    ruleId: string,
    node: any,
    path: {
        aria: string,
        dom: string
    },
    itemIdx?: number
    value: string[],
    message: string,
    selected: boolean,
    selectedChild: boolean,
    scrollTo: boolean,
    snippet: string,
    help?: string
}

export interface ICheckpoint {
    num: string,
    name: string,
    summary: string,
    rules: { id: string, level: string}[]
}

export interface IRuleset {
    id: string,
    name: string,
    category: string,
    checkpoints: ICheckpoint[]
}

interface IReportState {
    renderFromTabCircleClick: boolean
}

interface IReportProps {
    rulesets: any,
    report: IReport,
    selectedTab: "checklist" | "element" | "rule",
    tabs: ("checklist" | "element" | "rule")[],
    selectItem: (item: IReportItem) => void,
    getItem: (item: IReportItem) => void,
    getSelectedItem: (item: IReportItem) => void,
    learnItem: IReportItem | null,
    selectedIssue: IReportItem | null,
    layout: string,
    dataFromParent: boolean[],
    focusedViewFilter: boolean
}

export const valueMap: { [key: string]: { [key2: string]: string } } = {
    "VIOLATION": {
        "POTENTIAL": "Needs review",
        "FAIL": "Violation",
        "PASS": "Pass",
        "MANUAL": "Needs review"
    },
    "RECOMMENDATION": {
        "POTENTIAL": "Recommendation",
        "FAIL": "Recommendation",
        "PASS": "Pass",
        "MANUAL": "Recommendation"
    },
    "INFORMATION": {
        "POTENTIAL": "Needs review",
        "FAIL": "Violation",
        "PASS": "Pass",
        "MANUAL": "Recommendation"
    }
};

/**
 * Check report against filters and set the selections / scroll position
 * @param report 
 * @param filter Filter to use
 * @param scroll If true, will set a scroll position on the report. If false, will not scroll.
 */
export function preprocessReport(report: IReport, filter: string | null, scroll: boolean) {
    if (scroll === true) {
        // this is just to keep the scroll variable without TS no use error
        // in case want to turn scrolling back on (see below: item.scrollTo = false)
    }
    report.counts = {
        "total": {},
        "filtered": {}
    };
    for (const item of report.results) {
        let filtVal = "";
        item.selected = false;
        item.selectedChild = false;
        item.scrollTo = false;
        if (!filter) {
            filtVal = "X";
        } else {
            let xpath = item.path.dom;
            if (xpath === filter) {
                filtVal = "=";
                item.selected = true;
                if (item.value[1] !== "PASS") {
                    // item.scrollTo = scroll;
                    item.scrollTo = false;  // no scrolling to selected.
                }
            } else if (xpath.startsWith(filter)) {
                item.selectedChild = true;
                filtVal = "^";
                if (item.value[1] !== "PASS") {
                    // item.scrollTo = scroll;
                    item.scrollTo = false;  // no scrolling to selected.
                }
            }
        }
        let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
        report.counts.total[val] = (report.counts.total[val] || 0) + 1;
        if (filtVal !== "") {
            report.counts.filtered[val] = (report.counts.filtered[val] || 0) + 1;
        }
    }
    return report;
}

export default class Report extends React.Component<IReportProps, IReportState> {
    state: IReportState = {
        renderFromTabCircleClick: false
    };
    
    render() {
        const tabLabels : { [key: string] : string }= {
            element: "Element roles",
            rule: "Rules",
            checklist: "Requirements"
        }

        let ruleset : IRuleset | null = null;
        for (const rs of this.props.rulesets) {
            if (rs.id === "IBM_Accessibility") {
                ruleset = rs;
            }
        }

        return <React.Fragment>
             <div style={{backgroundColor: "white"}}>
                <Grid fullWidth style={{padding: "0rem"}}>
                    <Column sm={{span: 4}} md={{span: 8}} lg={{span: 16}}>
                        <Tabs
                            // ariaLabel="Report options"
                            role="navigation"
                            selected={this.props.tabs.indexOf(this.props.selectedTab)}
                            tabContentClassName="tab-content"
                        >
                            <TabList>
                                {this.props.tabs.map(tabId => (
                                    <Tab key={tabId}>{tabLabels[tabId]}</Tab>
                                ))}
                            </TabList>
                            <TabPanels>
                                {this.props.tabs.map(tabId => (
                                    <TabPanel>
                                        <div>
                                            {tabId === 'element' && <div className="reportContainer">
                                                <ReportElements layout={this.props.layout} getItem={this.props.getItem} getSelectedItem={this.props.getSelectedItem} learnItem={this.props.learnItem} selectItem={this.props.selectItem} selectedIssue={this.props.selectedIssue} report={this.props.report} dataFromParent={this.props.dataFromParent} focusedViewFilter={this.props.focusedViewFilter}/>
                                            </div>}
                                            {tabId === 'rule' && <div className="reportContainer">
                                                <ReportRules layout={this.props.layout} getItem={this.props.getItem} getSelectedItem={this.props.getSelectedItem} learnItem={this.props.learnItem}  selectItem={this.props.selectItem} selectedIssue={this.props.selectedIssue} report={this.props.report} dataFromParent={this.props.dataFromParent} focusedViewFilter={this.props.focusedViewFilter}/>
                                            </div>}
                                            {tabId === 'checklist' && ruleset && <div className="reportContainer">
                                            <ReportChecklist layout={this.props.layout} getItem={this.props.getItem} getSelectedItem={this.props.getSelectedItem} learnItem={this.props.learnItem} selectItem={this.props.selectItem} selectedIssue={this.props.selectedIssue} report={this.props.report} ruleset={ruleset} dataFromParent={this.props.dataFromParent} focusedViewFilter={this.props.focusedViewFilter}/>
                                            </div>}
                                        </div>

                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>
                    </Column>
                </Grid>
            </div>
        </React.Fragment>
    }
}
