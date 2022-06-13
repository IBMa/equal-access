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

import { IEngine, eRulePolicy, Report, eRuleCategory, eToolkitLevel, eRulesetType, Rule as RuleV2 } from "../../v2/api/IEngine";
import { Rule as RuleV4 } from "../api/IRule";
import { Engine } from "../../v2/common/Engine";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { StyleMapper } from "../../v2/style/StyleMapper";
import { a11yRulesets } from "../rulesets";
import * as checkRulesV4 from "../rules";

let checkRules = [];
let checkNls = {};
let checkHelp = {};

function _initialize() {
    const langs = Engine.getLanguages();
    // Process V4 rules into the V2 format
    for (let rulename in checkRulesV4) {
        // Convert rule
        let v4Rule: RuleV4 = checkRulesV4[rulename];
        checkRules.push(v4Rule);
        for (const langId of langs) {
            if (langId in v4Rule.messages) {
                checkNls[v4Rule.id] = v4Rule.messages[langId];
                checkNls[v4Rule.id][0] = checkNls[v4Rule.id].group;
            }
            if (langId in v4Rule.help) {
                checkHelp[v4Rule.id] = {};
                for (const reasonId in v4Rule.help[langId]) {
                    checkHelp[v4Rule.id][reasonId] = `/${langId}/${v4Rule.help[langId][reasonId]}`;
                }
                checkNls[v4Rule.id][0] = checkNls[v4Rule.id].group;
            }
        }
        // Convert RS
        for (const rsSection of v4Rule.rulesets) {
            for (const rs of a11yRulesets as Ruleset[]) {
                let checkRsIds : string[] = typeof rsSection.id === "string" ? [rsSection.id] : rsSection.id;
                if (checkRsIds.includes(rs.id)) {
                    for (const cp of rs.checkpoints) {
                        let checkCPIds : string[] = typeof rsSection.num === "string" ? [rsSection.num] : rsSection.num;
                        if (checkCPIds.includes(cp.num)) {
                            cp.rules = cp.rules || []
                            cp.rules.push({
                                id: v4Rule.id,
                                level: rsSection.level,
                                toolkitLevel: rsSection.toolkitLevel
                            })
                        }
                    }
                }
            }
        }
    }
}
_initialize();

export type Ruleset = {
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

export class Checker {
    engine: IEngine;
    rulesets: Ruleset[] = [];
    rulesetIds: string[] = [];
    rulesetRules: { [rsId: string]: string[] } = {};
    ruleLevels : { [ruleId: string]: { [rsId: string] : eRulePolicy }} = {};
    ruleCategory : { [ruleId: string]: { [rsId: string] : eRuleCategory }} = {};

    constructor() {
        let engine = this.engine = new Engine();

        engine.addMapper(new ARIAMapper());
        engine.addMapper(new StyleMapper());

        engine.addRules(checkRules);
        engine.addNlsMap(checkNls);
        engine.addHelpMap(checkHelp);

        for (const rs of a11yRulesets) {
            this.addRuleset(rs);
        }
    }

    addRuleset(rs: Ruleset) {
        this.rulesets.push(rs);
        this.rulesetIds.push(rs.id);
        const ruleIds = [];
        for (const cp of rs.checkpoints) {
            cp.rules = cp.rules || [];
            for (const rule of cp.rules) {
                ruleIds.push(rule.id);
                this.ruleLevels[rule.id] = this.ruleLevels[rule.id] || {};
                this.ruleLevels[rule.id][rs.id] = rule.level;
                this.ruleCategory[rule.id] = this.ruleCategory[rule.id] || {};
                this.ruleCategory[rule.id][rs.id] = rs.category;
            }
        }
        this.rulesetRules[rs.id] = ruleIds;
    }

    check(node: Node | Document, rsIds?: string | string[]) : Promise<Report> {
        // Determine which rules to run
        let ruleIds : string[] = [];

        // Fix the input
        if (!rsIds) {
            ruleIds = this.engine.getRulesIds();
        } else{
            if (typeof rsIds === "string") {
                rsIds = [rsIds];
            }

            for (const rsId of rsIds) {
                if (rsId in this.rulesetRules) {
                    ruleIds = ruleIds.concat(this.rulesetRules[rsId]);
                }
            }
        }

        this.engine.enableRules(ruleIds);

        // Add the report levels
        let myThis = this;
        return this.engine.run(node)
            .then(function (report) {
                report.nls = {}

                for (const result of report.results) {
                    if (result.ruleId in checkNls) {
                        report.nls[result.ruleId] = report.nls[result.ruleId] || {
                            0: checkNls[result.ruleId][0]
                        }
                        if (result.reasonId in checkNls[result.ruleId]) {
                            report.nls[result.ruleId][result.reasonId] = checkNls[result.ruleId][result.reasonId];
                        }
                    }
                    result.value[0] = myThis.getLevel(rsIds as string[], result.ruleId);
                    result.category = myThis.getCategory(rsIds as string[], result.ruleId);
                    delete result.path.css;
                }
                return report;
            });
    }

    getLevel(rsIds: string[], ruleId: string) : eRulePolicy {
        if (!rsIds) return eRulePolicy.INFORMATION;
        let rsInfo = this.ruleLevels[ruleId];
        let retVal = null;
        if (rsIds) {
            if (!(ruleId in this.ruleLevels)) {
                throw new Error("Rule triggered for which we have no rule level information: "+ruleId);
            }
            for (const rsId of rsIds) {
                if (rsId in rsInfo) {
                    if (rsInfo[rsId] === eRulePolicy.VIOLATION) {
                        retVal = eRulePolicy.VIOLATION;
                    } else if (rsInfo[rsId] === eRulePolicy.RECOMMENDATION && retVal === null) {
                        retVal = eRulePolicy.RECOMMENDATION;
                    } else if (retVal === null) {
                        retVal = eRulePolicy.INFORMATION;
                    }
                }
            }
        }
        if (retVal === null) {
            throw new Error("Rule triggered for which we have no rule level information: "+ruleId);
        }
        return retVal;
    }

    getCategory(rsIds: string[], ruleId: string) : eRuleCategory {
        let rsInfo = this.ruleCategory[ruleId];
        let retVal = "";

        if (!(ruleId in this.ruleCategory)) {
            return eRuleCategory.OTHER;
        }
        if (!rsIds) {
            rsIds = this.rulesetIds;
        }
        for (const rsId of rsIds) {
            if (rsId in rsInfo) {
                return rsInfo[rsId];
            }
        }
        return eRuleCategory.OTHER;
    }
}