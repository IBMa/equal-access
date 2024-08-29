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

import { NodeWalker, RPTUtil } from "../util/AriaUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { getCache, setCache } from "../util/CacheUtil";

export let style_color_misuse: Rule = {
    id: "style_color_misuse",
    context: "dom:style, dom:*[style], dom:font[color], dom:link",
    refactor: {
        "RPT_Style_ColorSemantics1": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "group": `style_color_misuse.html`,
            "Pass_0": `style_color_misuse.html`,
            "Potential_1": `style_color_misuse.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Combine color and descriptive markup to convey information",
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify color is not used as the only visual means of conveying information"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "1.4.1", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        let styleText = "";
        if (nodeName === "style") {
            styleText = RPTUtil.getInnerText(ruleContext).toLowerCase();
            // check import
            for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                if (sheet && sheet.ownerNode === ruleContext) {
                    try {
                        let styleRules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                        for (let styleRuleIndex = 0; styleRuleIndex < styleRules.length; styleRuleIndex++) {
                            let styleRule = styleRules[styleRuleIndex];
                            let styleImportRule: CSSImportRule;
                            if (styleRule.type && styleRule.type === 3 /* CSSRule.IMPORT_RULE */ && (styleImportRule = styleRule as CSSImportRule).styleSheet) {
                                let importRules = styleImportRule.styleSheet.cssRules ? styleImportRule.styleSheet.cssRules : styleImportRule.styleSheet.rules;
                                for (let rIndex = 0; rIndex < importRules.length; rIndex++) {
                                    let iRule = importRules[rIndex];
                                    styleText += iRule.cssText;
                                }
                            }
                        }
                    } catch (e) {
                        // Silence css access issues
                    }
                }
            }
        }
        else if (ruleContext.hasAttribute("style")) {
            styleText = ruleContext.getAttribute("style").toLowerCase();
        }
        else if (nodeName === "link" && //check external styles
            ruleContext.hasAttribute("rel") &&
            ruleContext.getAttribute("rel").toLowerCase() === "stylesheet" &&
            ruleContext.hasAttribute("href") &&
            ruleContext.getAttribute("href").trim().length !== 0) {
            for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                if (sheet && sheet.ownerNode === ruleContext) {
                    try {
                        let rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                        for (let rIndex = 0; rIndex < rules.length; rIndex++) {
                            styleText += rules[rIndex].cssText;
                        }
                    } catch (e) {
                        // Silence css access issues
                    }
                }
            }
        }
        let passed = true;

        // Defect 1022: Find uses of 'color' and '*background*' only
        let isBgUsed = styleText.match(/\bbackground\b/i);

        let theColorStyleToCheck = styleText.replace(/-color/g, "");
        let isColorUsed = theColorStyleToCheck.match(/\bcolor\b/i);

        if (ruleContext.hasAttribute("color") || isColorUsed || isBgUsed) {
            let goodTagNames = {
                "em": "", "strong": "", "cite": "", "dfn": "",
                "code": "", "samp": "", "kbd": "", "var": "", "abbr": "", "acronym": ""
            }
            // Color used � are there semantics involved?
            passed = nodeName in goodTagNames ||
                RPTUtil.getAncestor(ruleContext, goodTagNames) !== null;
            if (!passed && ruleContext.hasChildNodes()) {
                let nw = new NodeWalker(ruleContext);
                while (!passed && nw.nextNode() && nw.node !== ruleContext) {
                    passed = nw.node.nodeName.toLowerCase() in goodTagNames;
                }
            }
        }
        // Trigger only once
        if (!passed) {
            let triggered = getCache(ruleContext.ownerDocument, "style_color_misuse", false);
            passed = triggered;
            setCache(ruleContext.ownerDocument, "style_color_misuse", true);
        }

        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");
    }
}