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

import { Rule as RuleV4, eRulePolicy } from "../api/IRule";
import { Engine } from "../../v2/common/Engine";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { StyleMapper } from "../../v2/style/StyleMapper";
import { a11yRulesets } from "../rulesets";
import * as checkRulesV4 from "../rules";
import { Guideline, eGuidelineCategory } from "../api/IGuideline";
import { IEngine } from "../api/IEngine";
import { Report } from "../api/IReport";
import { IChecker } from "../api/IChecker";

let checkRules = [];
let checkNls = {};
let checkHelp = {};

function _initialize() {
    const langs = JSON.parse(JSON.stringify(Engine.getLanguages()));
    // Default lang to en-US if nothing else specified is found
    langs.push("en-US");
    // Process V4 rules into the V2 format
    for (let rulename in checkRulesV4) {
        // Convert rule
        let v4Rule: RuleV4 = checkRulesV4[rulename];
        checkRules.push(v4Rule);
        // Go backwards because the first lang is the preferred, so
        // earlier languages will override later languages
        for (let idx=langs.length-1; idx >=0; --idx) {
            const langId = langs[idx];
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
            for (const rs of a11yRulesets as Guideline[]) {
                let checkRsIds : string[] = typeof rsSection.id === "string" ? [rsSection.id] : rsSection.id;
                if (checkRsIds.includes(rs.id)) {
                    for (const cp of rs.checkpoints) {
                        let checkCPIds : string[] = typeof rsSection.num === "string" ? [rsSection.num] : rsSection.num;
                        if (checkCPIds.includes(cp.num)) {
                            cp.rules = cp.rules || []
                            cp.rules.push({
                                id: v4Rule.id,
                                reasonCodes: rsSection.reasonCodes,
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

/**
 * @deprecated See ../api/IGuideline
 */
export type Ruleset = Guideline;

export class Checker implements IChecker {
    private guidelines: Guideline[] = [];

    engine: IEngine;
    /**
     * @deprecated Use getGuidelines().
     */
    rulesets: Guideline[] = this.guidelines;
    /**
     * @deprecated Use getGuidelineIds().
     */
    rulesetIds: string[] = [];
    rulesetRules: { [rsId: string]: string[] } = {};
    ruleLevels : { [ruleId: string]: { [rsId: string] : eRulePolicy }} = {};
    ruleReasonLevels : { [ruleId: string]: { [rsId: string] : {[reasonCodes: string] : eRulePolicy }}} = {};
    ruleCategory : { [ruleId: string]: { [rsId: string] : eGuidelineCategory }} = {};

    public constructor() {
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

    /**
     * Adds a guideline to the engine. If the id already exists, the previous guideline will be replaced.
     * @param guideline 
     */
    addGuideline(guideline: Guideline) {
        if (guideline.id in this.rulesetRules) {
            this.removeGuideline(guideline.id);
        }
        this.guidelines.push(guideline);
        this.rulesetIds.push(guideline.id);
        const ruleIds = [];
        for (const cp of guideline.checkpoints) {
            cp.rules = cp.rules || [];
            for (const rule of cp.rules) {
                if (rule.enabled !== false) {
                    ruleIds.push(rule.id);
                    //this.ruleLevels[rule.id] = this.ruleLevels[rule.id] || {};
                    //this.ruleLevels[rule.id][guideline.id] = rule.level;
                    this.ruleReasonLevels[rule.id] = this.ruleReasonLevels[rule.id] || {};
                    this.ruleReasonLevels[rule.id][guideline.id] = this.ruleReasonLevels[rule.id][guideline.id] || {};
                    const code = rule.reasonCodes ? rule.reasonCodes.join('--') : "None";
                    this.ruleReasonLevels[rule.id][guideline.id][code] = rule.level;
                    this.ruleCategory[rule.id] = this.ruleCategory[rule.id] || {};
                    this.ruleCategory[rule.id][guideline.id] = guideline.category;
                }
            }
        }
        this.rulesetRules[guideline.id] = ruleIds;
    }

    /**
     * Enable a rule for all guidelines
     * @param ruleId 
     */
    enableRule(ruleId: string) {
        for (const guideline of this.getGuidelines()) {
            let updated = false;
            for (const cp of guideline.checkpoints) {
                for (const rule of cp.rules) {
                    if (rule.enabled === false) {
                        updated = true;
                        delete rule.enabled;
                    }
                }
            }
            if (updated) {
                this.addGuideline(guideline);
            }
        }
    }

    /**
     * Disable a rule for all guidelines
     * @param ruleId 
     */
    disableRule(ruleId: string) {
        for (const guideline of this.getGuidelines()) {
            let updated = false;
            for (const cp of guideline.checkpoints) {
                for (const rule of cp.rules) {
                    if (rule.enabled !== false) {
                        updated = true;
                        rule.enabled = false;
                    }
                }
            }
            if (updated) {
                this.addGuideline(guideline);
            }
        }
    }

    /**
     * Remove a guideline from the engine
     * 
     * Generally, there isn't a good reason to do this. Users should just not select the guideline as an option in check
     * @param guidelineId
     */
    private removeGuideline(guidelineId: string) {
        if (guidelineId in this.rulesetRules) {
            delete this.rulesetRules[guidelineId];
            this.rulesets = this.guidelines = this.guidelines.filter(guideline => guideline.id !== guidelineId);
            this.rulesetIds = this.getGuidelineIds();
        }
    }

    /**
     * Get the guidelines available in the engine
     * @returns 
     */
    getGuidelines() : Guideline[] {
        return JSON.parse(JSON.stringify(this.guidelines));
    }

    /**
     * Get the ids of the guidelines available in the engine
     * @returns 
     */
    getGuidelineIds() : string[] {
        return this.guidelines.map(guideline => guideline.id);
    }

    /**
     * 
     * @deprecated See addGuideline
     */
    addRuleset(rs: Ruleset) {
        this.addGuideline(rs);
    }

    /**
     * Perform a check of the specified node/document
     * @param node DOMNode or Document on which to run the check
     * @param guidelineIds Guideline ids to check with to specify which rules to run
     * @returns 
     */
    check(node: Node | Document, guidelineIds?: string | string[]) : Promise<Report> {
        // Determine which rules to run
        let ruleIds : string[] = [];

        // Fix the input
        if (!guidelineIds) {
            ruleIds = this.engine.getRulesIds();
        } else{
            if (typeof guidelineIds === "string") {
                guidelineIds = [guidelineIds];
            }

            for (const rsId of guidelineIds) {
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
                    //result.value[0] = myThis.getLevel(guidelineIds as string[], result.ruleId);
                    let code = result.reasonId? result.reasonId as string : "None";
                    result.value[0] = myThis.getReasonLevel(guidelineIds as string[], result.ruleId, code);
                    result.category = myThis.getCategory(guidelineIds as string[], result.ruleId);
                    delete result.path.css;
                }
                return report;
            });
    }

   private getLevel(rsIds: string[], ruleId: string) : eRulePolicy {
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

    private getReasonLevel(rsIds: string[], ruleId: string, reasonCode?: string) : eRulePolicy {
        if (!rsIds) return eRulePolicy.INFORMATION; 
        let rsInfo = this.ruleReasonLevels[ruleId];
        let retVal = null;
        if (rsIds) {
            if (!(ruleId in this.ruleReasonLevels)) {
                throw new Error("Rule triggered for which we have no rule level information "+ruleId);
            }
            for (const rsId of rsIds) {
                if (rsId in rsInfo) {
                    Object.keys(rsInfo[rsId]).forEach(code => { 
                        let level = null;
                        if (code === 'None')
                            level = rsInfo[rsId]["None"];
                        else if ((code.includes("--") && (code.includes(reasonCode+"--") || code.includes("--"+reasonCode))) || (!code.includes("--") && code.includes(reasonCode)))
                            level = rsInfo[rsId][code];
                        if (level === eRulePolicy.VIOLATION) {
                            retVal = eRulePolicy.VIOLATION;
                        } else if (level === eRulePolicy.RECOMMENDATION && retVal === null) {
                            retVal = eRulePolicy.RECOMMENDATION;
                        } else if (retVal === null) {
                            retVal = eRulePolicy.INFORMATION;
                        }    
                    });          
                }
            }
        } 
        if (retVal === null) {
            throw new Error("Rule triggered for which we have no rule level information: "+ruleId);
        }
        return retVal;
    }

    private getCategory(rsIds: string[], ruleId?: string) : eGuidelineCategory {
        let rsInfo = this.ruleCategory[ruleId];
        let retVal = "";

        if (!(ruleId in this.ruleCategory)) {
            return eGuidelineCategory.OTHER;
        }
        if (!rsIds) {
            rsIds = this.getGuidelineIds();
        }
        for (const rsId of rsIds) {
            if (rsId in rsInfo) {
                return rsInfo[rsId];
            }
        }
        return eGuidelineCategory.OTHER;
    }
}
