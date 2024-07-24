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
import { Guideline, eGuidelineCategory } from "./IGuideline";
import { Issue, eRulePolicy as eRulePolicyNew, eRuleConfidence as eRuleConfidenceNew } from "./IRule"
import { Bounds as BoundsNew } from "./IBounds";

/**
 * @deprecated See ./IRule
 */
export { eRuleConfidence } from "./IRule";

/**
 * @deprecated See ./IRule
 */
export { eRulePolicy } from "./IRule";

/**
 * @deprecated See ./IGuideline
 */
export { eToolkitLevel } from "./IGuideline";

/**
 * @deprecated See ./IGuideline::eGuidelineCategory
 */
export { eGuidelineCategory as eRuleCategory } from "./IGuideline";

/**
 * @deprecated See ./IGuideline::eGuidelineType
 */
export { eGuidelineType as eRuleType } from "./IGuideline";

/**
 * @deprecated See ./IBounds
 */
export type Bounds = BoundsNew;

/**
 * @deprecated See ./IGuidline
 */
export type IRuleset = Guideline;

export type IEngineReport = {
    results: Issue[],
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

export type IEngineResult = Issue;

export type IBaselineResult = IEngineResult & {
    ignored: boolean
    help: string
    level: eRuleLevel
}

export type IBaselineReport = {
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

export type CompressedReport = [
    number, // startScan
    string, // url
    string, // pagetitle
    string, // label
    string, // scanProfile
    number, // numExecuted
    number, // scanTime
    string, // ruleArchive
    string[], // policies
    string[], // reportLevels
    CompressedIssue[]
]

export type CompressedIssue = [ // results
    eGuidelineCategory | undefined, //category?
    string, // ruleId
    [eRulePolicyNew, eRuleConfidenceNew], // value
    number | string | undefined, // reasonId
    string[], // messageArgs
    { [ns: string] : string }, // path
    number, // ruleTime
    string, // snippet
    string, // help
    boolean, // ignored
    string // message
]