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

import { eRulePolicy } from "./IRule.js"

export enum eToolkitLevel {
    LEVEL_ONE = "1",
    LEVEL_TWO = "2",
    LEVEL_THREE = "3",
    LEVEL_FOUR = "4"
}

export enum eGuidelineCategory {
    ACCESSIBILITY = "Accessibility",
    DESIGN = "Design",
    OTHER = "Other"
}

export enum eGuidelineType {
    DEFAULT = "default",
    EXTENSION = "extension"
}

export type Checkpoint = {
    num: string,
    // See https://github.com/act-rules/act-tools/blob/main/src/data/sc-urls.json
    scId?: string,
    // JCH: add name of checkpoint and summary description
    name: string,
    wcagLevel: string,
    summary: string,
    rules?: Array<{ 
        id: string, 
        // (optional) Reason codes that this ruleset mapping applies to, 
        // or all if not specified
        reasonCodes?: string[],
        level: eRulePolicy, 
        toolkitLevel: eToolkitLevel,
        enabled?: boolean
    }>
}

export type Guideline = {
    id: string,
    name: string,
    category: eGuidelineCategory,
    description: string,
    type?: eGuidelineType,
    checkpoints: Array<Checkpoint>
}
