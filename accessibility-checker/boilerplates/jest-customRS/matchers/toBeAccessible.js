/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const aChecker = require("accessibility-checker");
let customInit = (async () => {
    let skipIds = [
        "WCAG20_Html_HasLang",
        "WCAG20_Doc_HasTitle",
        "WCAG20_Body_FirstASkips_Native_Host_Sematics",
        "RPT_Html_SkipNav"
    ]
    let ruleset = await aChecker.getRuleset("IBM_Accessibility");
    let rulesetCopy = JSON.parse(JSON.stringify(ruleset));
    rulesetCopy.id = "CUSTOM";
    rulesetCopy.checkpoints = rulesetCopy.checkpoints.map((checkpoint) => {
        checkpoint.rules = checkpoint.rules.filter((rule) => {
            return !skipIds.includes(rule.id);
        });
        return checkpoint;
    });
    aChecker.addRuleset(rulesetCopy);
})()

async function toBeAccessible(node, label) {
    await customInit;
    let results = await aChecker.getCompliance(node, label);
    if (aChecker.assertCompliance(results.report) === 0) {
        return {
            pass: true
        }
    } else {
        return {
            pass: false,
            message: () => aChecker.stringifyResults(results.report)
        }
    }
}

module.exports = toBeAccessible;