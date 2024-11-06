
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

import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { CSSUtil } from "../util/CSSUtil";

/**
 * Description: Trigger if :before and :after are used in CSS (Internal and External) with content
 * Origin: WCAG 2.0 F87
 */
export const style_before_after_review: Rule = {
    id: "style_before_after_review",
    context: "dom:style, dom:link",
    refactor: {
        "WCAG20_Style_BeforeAfter": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "group": `style_before_after_review.html`,
            "Pass_0": `style_before_after_review.html`,
            "Potential_1": `style_before_after_review.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Do not use CSS '::before' and '::after' pseudo-elements to insert non-decorative content",
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify the '::before' and '::after' pseudo-elements do not insert non-decorative content"
        }
    },
    rulesets: [{
        // Turn off the rule due to the obsolete requirement
        //id: ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        id: [],
        num: "1.3.1", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = true;
        //check Internal styles        
        if (ruleContext.nodeName.toLowerCase() === "style") {
            let css = CSSUtil.getCSSStyle(ruleContext);
            for (let i = 0; passed && i < css.length; ++i) {
                // Guard against bad CSS
                if (css[i].selector) {
                    passed = (css[i].selector.indexOf(":before") === -1 && css[i].selector.indexOf(":after") === -1) ||
                        !("content" in css[i].values) || css[i].values["content"].trim().length === 0 || css[i].values["content"].trim() === "\"\""
                        || css[i].values["content"].trim() === "\'\'" || css[i].values["content"].trim() === "none" || css[i].values["content"].trim() === "attr(x)"
                        || css[i].values["content"].trim() === "attr(y)";
                }
            }

            // check special rules in the stylesheets
            if (passed) {
                for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                    let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                    if (sheet.ownerNode === ruleContext) {
                        try {
                            let styleRules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                            if (styleRules) {
                                for (let styleRuleIndex = 0; passed && styleRuleIndex < styleRules.length; styleRuleIndex++) {
                                    let styleRule = styleRules[styleRuleIndex];

                                    // check @media rules 
                                    //
                                    // The check 'if (styleRule instanceof CSSMediaRule)' doesn't work when run in Karma(but works in DAP) 
                                    // so let's access the type directly as a workaround
                                    let styleImportRule: CSSImportRule;
                                    if (styleRule.type && styleRule.type === 4 /* CSSRule.MEDIA_RULE */) {
                                        let styleMediaRule = styleRule as CSSMediaRule;
                                        let mediaRules = styleMediaRule.cssRules;
                                        if (mediaRules) {
                                            for (let rIndex = 0; passed && rIndex < mediaRules.length; rIndex++) {
                                                let mRule = mediaRules[rIndex] as any; // selectorText not recognized
                                                if (mRule.selectorText !== null && mRule.selectorText !== undefined) {
                                                    let rule = mRule.selectorText.toLowerCase();
                                                    if (rule.indexOf(":before") !== -1 || rule.indexOf(":after") !== -1) {
                                                        let content = mRule.style['content'];
                                                        if (content && content.trim().length) {
                                                            if (content.trim() !== "\"\"" &&
                                                                content.trim() !== "\'\'" &&
                                                                content.trim() !== "none" &&
                                                                content.trim() !== "attr(x)" &&
                                                                content.trim() !== "attr(y)") {
                                                                passed = false;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    // check import rules
                                    else if (styleRule.type && styleRule.type === 3 /* CSSRule.IMPORT_RULE */ && (styleImportRule = styleRule as CSSImportRule).styleSheet) {
                                        let rules = styleImportRule.styleSheet.cssRules ?
                                            styleImportRule.styleSheet.cssRules :
                                            styleImportRule.styleSheet.rules;
                                        if (rules) {
                                            for (let rIndex = 0; passed && rIndex < rules.length; rIndex++) {
                                                let importedRule = rules[rIndex];
                                                // check @media rules 
                                                if (importedRule.type && importedRule.type === 4 /* CSSRule.MEDIA_RULE */) {
                                                    let mediaRules = (importedRule as CSSMediaRule).cssRules;
                                                    if (mediaRules) {
                                                        for (let mIndex = 0; mIndex < mediaRules.length; mIndex++) {
                                                            let mRule = mediaRules[mIndex] as any; // selectorText not recognized
                                                            if (mRule.selectorText !== null && mRule.selectorText !== undefined) {
                                                                let rule = mRule.selectorText.toLowerCase();
                                                                if (rule.indexOf(":before") !== -1 || rule.indexOf(":after") !== -1) {
                                                                    let content = mRule.style['content'];
                                                                    if (content && content.trim().length) {
                                                                        if (content.trim() !== "\"\"" &&
                                                                            content.trim() !== "\'\'" &&
                                                                            content.trim() !== "none" &&
                                                                            content.trim() !== "attr(x)" &&
                                                                            content.trim() !== "attr(y)") {
                                                                            passed = false;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else if ((importedRule as any).selectorText !== null && (importedRule as any).selectorText !== undefined) {
                                                    let rule = (importedRule as any).selectorText.toLowerCase();
                                                    //support both single colon (:) and double colon (::) pseudo                        
                                                    if (rule.indexOf(":before") !== -1 || rule.indexOf(":after") !== -1) {
                                                        let content = (importedRule as any).style['content'];
                                                        if (content && content.trim().length) {
                                                            if (content.trim() !== "\"\"" &&
                                                                content.trim() !== "\'\'" &&
                                                                content.trim() !== "none" &&
                                                                content.trim() !== "attr(x)" &&
                                                                content.trim() !== "attr(y)") {
                                                                passed = false;
                                                            }
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
            }
        }

        //check external styles 
        if (ruleContext.nodeName.toLowerCase() === "link" && ruleContext.hasAttribute("rel") &&
            ruleContext.getAttribute("rel").toLowerCase() === "stylesheet" &&
            ruleContext.hasAttribute("href") && ruleContext.getAttribute("href").trim().length !== 0) {

            for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                if (sheet && sheet.ownerNode === ruleContext) {
                    try {
                        let rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                        if (rules) {
                            for (let rIndex = 0; passed && rIndex < rules.length; rIndex++) {
                                let ruleFromLink = rules[rIndex];
                                // check @media rules 
                                if (ruleFromLink.type && ruleFromLink.type === 4 /* CSSRule.MEDIA_RULE */) {
                                    let mediaRules = (ruleFromLink as CSSMediaRule).cssRules;
                                    if (mediaRules) {
                                        for (let mIndex = 0; passed && mIndex < mediaRules.length; mIndex++) {
                                            let mRule = mediaRules[mIndex] as any;
                                            if (mRule.selectorText !== null && mRule.selectorText !== undefined) {
                                                let ruleSelTxt = mRule.selectorText.toLowerCase();
                                                if (ruleSelTxt.indexOf(":before") !== -1 || ruleSelTxt.indexOf(":after") !== -1) {
                                                    let content = mRule.style['content'];
                                                    if (content && content.trim().length) {
                                                        if (content.trim() !== "\"\"" &&
                                                            content.trim() !== "\'\'" &&
                                                            content.trim() !== "none" &&
                                                            content.trim() !== "attr(x)" &&
                                                            content.trim() !== "attr(y)") {
                                                            passed = false;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                else if ((rules[rIndex] as any).selectorText !== null && (rules[rIndex] as any).selectorText !== undefined) {
                                    let rule = (rules[rIndex] as any).selectorText.toLowerCase();
                                    //support both single colon (:) and double colon (::) pseudo                        
                                    if (rule.indexOf(":before") !== -1 || rule.indexOf(":after") !== -1) {
                                        let content = (rules[rIndex] as any).style['content'];
                                        if (content && content.trim().length) {
                                            if (content.trim() !== "\"\"" &&
                                                content.trim() !== "\'\'" &&
                                                content.trim() !== "none" &&
                                                content.trim() !== "attr(x)" &&
                                                content.trim() !== "attr(y)") {
                                                passed = false;
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
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");
    }
}
