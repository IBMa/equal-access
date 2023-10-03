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

import { Rule } from "./IRule";

export interface IEngine {
    /**
     * Perform a scan on a document or subtree
     * @param rulesetIds Array of ruleset ids of rulesets to use for this scan
     * @param root Document or subtree to scan
     */
    run(root: Document | Node, options?: {}) : Promise<Report>;

    enableRules(ruleIds: string[]);

    getRule(ruleId: string): Rule;

    getRulesIds() : string[];

    getMessage(ruleId: string, ruleIdx: number | string, msgArgs?: string[]): string;

    getHelp(ruleId: string, ruleIdx: number | string): string;

    addRules(rule: Rule[]);

    addRule(rule: Rule);

    addNlsMap(map: NlsMap);

    addHelpMap(map: NlsMap);
}

export type NlsMap = {
    [key: string]: string[]
}
    
export type HelpMap = {
    [key: string]: string[]
}