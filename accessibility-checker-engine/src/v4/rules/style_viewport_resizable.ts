/******************************************************************************
    Copyright:: 2022- IBM, Inc
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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

/**
 * Description: Trigger when viewport units are used for font size.
 * Origin: Various
 */
export let style_viewport_resizable: Rule = {
    id: "style_viewport_resizable",
    context: "dom:link, dom:style, dom:*[style]",
    refactor: {
        "WCAG21_Style_Viewport": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "group": `style_viewport_resizable.html`,
            "Pass_0": `style_viewport_resizable.html`,
            "Potential_1": `style_viewport_resizable.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Text must scale up to 200% without loss of content or functionality",
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that text sized using viewport units can be resized up to 200%"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "1.4.4", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = true;
        let thePattern = /\d+(vw|vh|vmin|vmax)/gi;
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (nodeName === "style") {
            for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet
                if (sheet.ownerNode === ruleContext) {
                    try {
                        let styleRules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                        if (styleRules) {
                            for (let styleRuleIndex = 0; passed && styleRuleIndex < styleRules.length; styleRuleIndex++) {
                                let rule = styleRules[styleRuleIndex];
                                if (rule.type && rule.type === 1 /* CSSRule.STYLE_RULE */) {
                                    let styleRule = rule as CSSStyleRule;
                                    if (styleRule.style['fontSize']) {
                                        let fontSize = styleRule.style['fontSize'].trim();
                                        let found = fontSize.match(thePattern);
                                        if (fontSize.length && found) {
                                            passed = false;
                                        }
                                    }
                                }
                                // check import rules
                                else if (rule.type && rule.type === 3 /* CSSRule.IMPORT_RULE */ && (rule as CSSImportRule).styleSheet) {
                                    let importRule = rule as CSSImportRule;
                                    let rules = importRule.styleSheet.cssRules ? importRule.styleSheet.cssRules : importRule.styleSheet.rules;
                                    if (rules) {
                                        for (let rIndex = 0; passed && rIndex < rules.length; rIndex++) {
                                            let importedRule = rules[rIndex] as any
                                            if (importedRule.type && importedRule.type === 1 /* CSSRule.STYLE_RULE */) {
                                                if (importedRule.style['fontSize']) {
                                                    let fontSize = importedRule.style['fontSize'].trim();
                                                    let found = fontSize.match(thePattern);
                                                    if (fontSize.length && found) {
                                                        passed = false;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        // Ignore css access issues
                    }
                }
            }
        } else if (nodeName === "link") {
            for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                if (sheet && sheet.ownerNode === ruleContext) {
                    try {
                        let rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                        if (rules) {
                            for (let rIndex = 0; passed && rIndex < rules.length; rIndex++) {
                                let ruleFromLink = rules[rIndex] as any;
                                // check rules 
                                if (ruleFromLink.type && ruleFromLink.type === 1 /* CSSRule.STYLE_RULE */) {
                                    if (ruleFromLink.style['fontSize']) {
                                        let fontSize = ruleFromLink.style['fontSize'].trim();
                                        let found = fontSize.match(thePattern);
                                        if (fontSize.length && found) {
                                            passed = false;
                                        }
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        // Ignore css access issues
                    }
                }
            }
        } else {
            let styleValue = ruleContext.getAttribute('style');
            if (styleValue) {
                let stylePattern = /font-size:\s*\d+(vw|vh|vmin|vmax)/gi;
                let found = styleValue.match(stylePattern);
                if (found) {
                    passed = false;
                }
            }
        }

        return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
    }
}
