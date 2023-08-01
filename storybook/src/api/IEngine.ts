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

import { IMapResult } from "./IMapper";

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

export function RulePass(reasonId: number | string, messageArgs? : string[], apiArgs? : any[]) : RuleResult {
    if (typeof reasonId === "undefined" || reasonId === null) throw new Error("Reason ID must be defined");
    return {
        value: [eRulePolicy.INFORMATION, eRuleConfidence.PASS],
        reasonId: reasonId,
        messageArgs: messageArgs || [],
        apiArgs: apiArgs || []
    }
}

export function RuleRender(reasonId: number | string, messageArgs? : string[], apiArgs? : any[]) : RuleResult {
    if (typeof reasonId === "undefined" || reasonId === null) throw new Error("Reason ID must be defined");
    return {
        value: [eRulePolicy.INFORMATION, eRuleConfidence.PASS],
        reasonId: 0,
        messageArgs: messageArgs || [],
        apiArgs: apiArgs || []
    }
}
export function RuleFail(reasonId: number | string, messageArgs? : string[], apiArgs? : any[]) : RuleResult {
    if (typeof reasonId === "undefined" || reasonId === null) throw new Error("Reason ID must be defined");
    return {
        value: [eRulePolicy.INFORMATION, eRuleConfidence.FAIL],
        reasonId: reasonId,
        messageArgs: messageArgs || [],
        apiArgs: apiArgs || []
    }
}

export function RulePotential(reasonId: number | string, messageArgs? : string[], apiArgs? : any[]) : RuleResult {
    if (typeof reasonId === "undefined" || reasonId === null) throw new Error("Reason ID must be defined");
    return {
        value: [eRulePolicy.INFORMATION, eRuleConfidence.POTENTIAL],
        reasonId: reasonId,
        messageArgs: messageArgs || [],
        apiArgs: apiArgs || []
    }
}

export function RuleManual(reasonId: number | string, messageArgs? : string[], apiArgs? : any[]) : RuleResult {
    if (typeof reasonId === "undefined" || reasonId === null) throw new Error("Reason ID must be defined");
    return {
        value: [eRulePolicy.INFORMATION, eRuleConfidence.MANUAL],
        reasonId: reasonId,
        messageArgs: messageArgs || [],
        apiArgs: apiArgs || []
    }
}

export type RuleResult = {
    value: [eRulePolicy, eRuleConfidence],
    reasonId?: number | string,
    messageArgs?: string[],
    apiArgs?: any[]
}

export type RuleDetails = RuleResult & {
    ruleId: string,

    node: Node,
    // namespace: string,
    category?: eRuleCategory,
    path: { [ns: string] : string },

    ruleTime: number,
    message: string,
    bounds?: {
        top: number,
        left: number,
        width: number,
        height: number
    },
    snippet: string
}

export type RuleContextHierarchy = { [namespace: string] : IMapResult[] };

export type RuleContext = {
    [namespace: string] : IMapResult
}

export type Rule = {
    // Unique string identifier for this rule (should be human understandable)
    // NLS codes and help sources will be based off of this id
    id: string;

    // See src/v2/common/Context.ts for valid contexts
    context: string;

    // Array of rules that must pass to allow this validate to run - they must have the same context property
    dependencies?: string[]
    prereqs?: string[]

    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy) => RuleResult | RuleResult[]

    enabled?: boolean
}


export type Report = {
    results: RuleDetails[],
    numExecuted: number,
    ruleTime: number,
    // This may be undefined for a filtered report
    totalTime?: number,
    nls?: {
        [ruleId: string]: {
            [reasonId: string]: string
        }
    }
}

export type NlsMap = {
    [key: string]: string[]
}

export type HelpMap = {
    [key: string]: string[]
}

export interface IEngine {
    /**
     * Perform a scan on a document or subtree
     * @param rulesetIds Array of ruleset ids of rulesets to use for this scan
     * @param root Document or subtree to scan
     */
    run(root: Document | Node, options?: {}) : Promise<Report>;

    enableRules(ruleIds: string[]): void;

    getRule(ruleId: string): Rule;

    getRulesIds() : string[];

    getMessage(ruleId: string, ruleIdx: number | string, msgArgs?: string[]): string;

    getHelp(ruleId: string, ruleIdx: number | string): string;

    addRules(rule: Rule[]): void;

    addRule(rule: Rule): void;

    addNlsMap(map: NlsMap): void;

    addHelpMap(map: NlsMap): void;
}