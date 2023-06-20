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

import { eRuleLevel } from "../config/IConfig"


export enum eRuleConfidence {
    PASS = "PASS",
    FAIL = "FAIL",
    POTENTIAL = "POTENTIAL",
    MANUAL = "MANUAL"
}

export enum eRulePolicy {
    VIOLATION = "VIOLATION",
    RECOMMENDATION = "RECOMMENDATION",
    INFORMATION = "INFORMATION"
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

export interface Bounds {
    left: number
    top: number
    width: number
    height: number
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

export interface IEngineReport {
    results: IEngineResult[],
    numExecuted: number,
    ruleTime: number,
    // This may be undefined for a filtered report
    totalTime?: number,
    screenshot?: string,
    nls?: {
        [ruleId: string]: {
            [reasonId: string]: string
        }
    }
}

export interface IEngineResult {
    category?: eRuleCategory,
    ruleId: string,
    value: [eRulePolicy, eRuleConfidence],
    reasonId?: number | string,
    messageArgs?: string[],
    apiArgs?: any[]
    node?: Node,
    path: { [ns: string] : string },
    ruleTime: number,
    message: string,
    bounds?: Bounds,
    snippet: string,
}

export interface IBaselineResult extends IEngineResult {
    ignored: boolean
    help: string
    level: eRuleLevel
}

export interface IBaselineReport {
    results: IBaselineResult[]
    numExecuted: number,
    nls: {
        [ruleId: string]: {
            [reasonId: string]: string
        }
    }
    summary: {
        counts: {
            violation: number,
            potentialviolation: number,
            recommendation: number,
            potentialrecommendation: number,
            manual: number,
            pass: number,
            ignored: number,
            elements: number,
            elementsViolation: number,
            elementsViolationReview: number
        }
        scanTime: number,
        ruleArchive: string
        policies: string[]
        reportLevels: string[]
        startScan: number,
        URL: string
    },
    scanID: string
    toolID: string
    label: string
}