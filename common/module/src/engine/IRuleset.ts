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

import { eRuleCategory, eRulePolicy, eRulesetType, eToolkitLevel } from "./IReport.js"

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
