import { eRuleCategory, eRulePolicy, eRulesetType, eToolkitLevel } from "./IReport"

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
