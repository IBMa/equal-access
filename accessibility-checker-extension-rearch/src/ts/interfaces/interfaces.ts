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

export type eMessageSrcDst = "background" | "devtools" | "main" | "elements" | "options" | "popup" | "tab";

export interface IPolicyDefinition {
    id: string,
    name: string
    description: string
}

export interface IArchiveDefinition {
    id: string
    name: string
    path: string
    rulesets: {
        extension: IPolicyDefinition[]
        default: IPolicyDefinition[]
    }
    version: string
    latest?: true
    sunset?: boolean
    helpPath: string
    enginePath: string
}

export interface ISettings {
    selected_archive: IArchiveDefinition
    selected_ruleset: { id: string }
    tabStopLines: boolean
    tabStopOutlines: boolean
    tabStopAlerts: boolean
    tabStopFirstTime: boolean
}

export type MsgDestType = {
    type: "contentScript"
    tabId: number
    relay?: boolean
} | {
    type: "devTools"
    tabId: number
    relay?: boolean
} | {
    type: "background",
    tabId: -1,
    relay?: false
}

export interface IMessage<T> {
    type: string
    dest: MsgDestType
    content?: T
    blob_url?: string
}

export type IssueValue = [ 
    "VIOLATION" | "RECOMMENDATION"| "INFORMATION", 
    "FAIL" | "POTENTIAL" | "MANUAL" | "PASS" 
];

export interface IIssue {
    ruleId: string
    value: IssueValue
    node: Node
    path: {
        dom: string
        aria: string
    }
    ruleTime: number
    reasonId: string
    message: string
    messageArgs: string[]
    apiArgs: any[]
    bounds: {
        left: number,
        top: number,
        height: number
        width: number
    }
    snippet: string
    category: "Accessibility",
    help: string
}

export interface IBasicTableRowRecord {
    id: string
    isSelected?: boolean
}

export interface IStoredReportMeta extends IBasicTableRowRecord {
    timestamp: number
    label: string
    guidelines: string
    pageTitle: string
    pageURL: string
    screenshot: string
    counts: {
        "Violation": number
        "Needs review": number
        "Recommendation": number
        "Pass": number
        total: number
    }
    storedScanData: any
}

export interface IReport {
    results: IIssue[]
    numExecuted: number
    ruleTime: number
    totalTime: number
    nls : {
        [ruleId: string]: {
            [reasonCode: string]: string
        }
    }
    counts: {
        "Violation": number
        "Needs review": number
        "Recommendation": number
        "Pass": number
        total: number
    }
    passUniqueElements: string[]
    isSelected?: boolean
    reportDate?: string
}

export enum eToolkitLevel {
    LEVEL_ONE = "1",
    LEVEL_TWO = "2",
    LEVEL_THREE = "3",
    LEVEL_FOUR = "4"
}

export enum eRuleCategory {
    ACCESSIBILITY = "Accessibility",
    DESIGN = "Design",
    OTHER = "Other"
}

export enum eRulesetType {
    DEFAULT = "default",
    EXTENSION = "extension"
}

export enum eRulePolicy {
    VIOLATION = "VIOLATION",
    RECOMMENDATION = "RECOMMENDATION",
    INFORMATION = "INFORMATION"
}

export interface IRuleset {
    id: string,
    name: string,
    category: eRuleCategory,
    description: string,
    type?: eRulesetType,
    checkpoints: Array<{
        num: string,
        // See https://github.com/act-rules/act-tools/blob/main/src/data/sc-urls.json
        scId?: string,
        // JCH: add name of checkpoint and summary description
        name: string,
        wcagLevel: string,
        summary: string,
        rules?: Array<{ id: string, level: eRulePolicy, toolkitLevel: eToolkitLevel }>
    }>
}