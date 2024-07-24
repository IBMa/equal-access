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

export interface ISavedReportData {
    report: IReport,
    rulesets: IRuleset[],
    tabURL: string
}

export interface IReport {
    timestamp: number,
    nls: {
        [ruleId: string]: {
            [reasonCode: string]: string
        }
    }
    results: IReportItem[],
    counts: {
        total: { [key: string]: number }
    }
    passUniqueElements?: string[]
    testedUniqueElements?: number
}

export interface IReportItem {
    ruleId: string,
    reasonId?: number | string,
    path: {
        aria: string,
        dom: string
    },
    value: string[],
    message: string,
    snippet: string,
    help: string
}

export interface ICheckpoint {
    num: string,
    name: string,
    summary: string,
    rules: Array<{ 
        id: string, 
        // (optional) Reason codes that this ruleset mapping applies to, 
        // or all if not specified
        reasonCodes?: string[],
        level: string, 
        toolkitLevel: string,
        enabled?: boolean
    }>
}

export interface IRuleset {
    id: string,
    name: string,
    category: string,
    checkpoints: ICheckpoint[]
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