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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass } from "../../../api/IEngine";
import { RPTUtil, NodeWalker } from "../util/legacy";

let a11yRulesStyle: Rule[] = [
    {
        /**
         * Description: Trigger on all pages containing CSS (trigger once)
         * Origin: RPT 5.6
         */
        id: "RPT_Style_Trigger2",
        context: "dom:style, dom:link, dom:*[style]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            if (nodeName === "link" &&
                (!ruleContext.hasAttribute("rel") || ruleContext.getAttribute("rel").toLowerCase() != "stylesheet"))
                return RulePass("Pass_0");
            if (nodeName != "style" && nodeName != "link" &&
                ruleContext.hasAttribute("style") && ruleContext.getAttribute("style").trim().length == 0)
                return RulePass("Pass_0");
            let triggered = RPTUtil.getCache(ruleContext.ownerDocument, "RPT_Style_Trigger2", false);
            let passed = triggered;
            //        Packages.java.lang.System.out.println(triggered);
            RPTUtil.setCache(ruleContext.ownerDocument, "RPT_Style_Trigger2", true);
            if (passed) return RulePass("Pass_0");
            if (!passed) return RuleManual("Manual_1");

        }
    },

    {
        /**
         * Description: Trigger for use of CSS background images
         * Origin: RPT 5.6 G456
         */
        id: "RPT_Style_BackgroundImage",
        context: "dom:style, dom:*[style]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let passed = true;
            if (nodeName == "link" && ruleContext.hasAttribute("rel") &&
                ruleContext.getAttribute("rel").toLowerCase() == "stylesheet") {
                // External stylesheet - trigger
                passed = RPTUtil.triggerOnce(ruleContext, "RPT_Style_BackgroundImage", false);
            }
            if (passed && nodeName == "style" || ruleContext.hasAttribute("style")) {
                let styleText;
                if (nodeName == "style")
                    styleText = RPTUtil.getInnerText(ruleContext);
                else
                    styleText = ruleContext.getAttribute("style");
                let bgMatches = styleText.match(/background:[^;]*/g);
                if (bgMatches != null) {
                    for (let i = 0; passed && i < bgMatches.length; ++i)
                        passed = bgMatches[i].indexOf("url(") == -1;
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger when color is used, but has no semantic meaning.
         * Origin: RPT 5.6 G466 Error
         */
        id: "RPT_Style_ColorSemantics1",
        context: "dom:style, dom:*[style], dom:font[color], dom:link",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let styleText = "";
            if (nodeName == "style") {
                styleText = RPTUtil.getInnerText(ruleContext).toLowerCase();
                // check import
                for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                    let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                    if (sheet && sheet.ownerNode == ruleContext) {
                        try {
                            let styleRules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                            for (let styleRuleIndex = 0; styleRuleIndex < styleRules.length; styleRuleIndex++) {
                                let styleRule = styleRules[styleRuleIndex];
                                let styleImportRule: CSSImportRule;
                                if (styleRule.type && styleRule.type === CSSRule.IMPORT_RULE && (styleImportRule = styleRule as CSSImportRule).styleSheet) {
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
            else if (nodeName == "link" && //check external styles
                ruleContext.hasAttribute("rel") &&
                ruleContext.getAttribute("rel").toLowerCase() == "stylesheet" &&
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
                    RPTUtil.getAncestor(ruleContext, goodTagNames) != null;
                if (!passed && ruleContext.hasChildNodes()) {
                    let nw = new NodeWalker(ruleContext);
                    while (!passed && nw.nextNode() && nw.node != ruleContext) {
                        passed = nw.node.nodeName.toLowerCase() in goodTagNames;
                    }
                }
            }
            // Trigger only once
            if (!passed) {
                let triggered = RPTUtil.getCache(ruleContext.ownerDocument, "RPT_Style_ColorSemantics1", false);
                passed = triggered;
                RPTUtil.setCache(ruleContext.ownerDocument, "RPT_Style_ColorSemantics1", true);
            }

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger when color is used, but has no semantic meaning.
         * Origin: Various
         */
        id: "RPT_Style_ExternalStyleSheet",
        context: "dom:link[rel], dom:style",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = true;
            let nodeName = ruleContext.nodeName.toLowerCase();
            if (nodeName == "style") {
                passed = RPTUtil.getInnerText(ruleContext).indexOf("@import url") == -1;
            } else if (nodeName == "link") {
                passed = !ruleContext.hasAttribute("rel") ||
                    ruleContext.getAttribute("rel").toLowerCase() != "stylesheet";
            }
            return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
        }
    },
    {
        /**
         * Description: Trigger on CSS that affects the focus box
         * Origin: RPT 5.6 G506 Error
         */
        id: "RPT_Style_HinderFocus1",
        context: "dom:style, dom:*[style]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                skipNodes: {
                    value: ["table"],
                    type: "[string]"
                },
                regex1: {
                    value: /(^|})([^{]*){[^}]*(outline|border)[ \t]*\:/gi,
                    type: "regex"
                },
                regex2: {
                    value: /([a-z]+)[ \t]*(,|$)/gi,
                    type: "regex"
                }
            }
            const ruleContext = context["dom"].node as Element;
            let skipNodes = validateParams.skipNodes.value;

            let passed = true;
            // Note: link to be handled by RPT_Style_ExternalStyleSheet
            let nodeName = ruleContext.nodeName.toLowerCase();
            if (nodeName == "style") {
                let textValue = RPTUtil.getInnerText(ruleContext);
                let r = validateParams.regex1.value;
                r.lastIndex = 0;
                let m; let m2;
                while (passed && (m = r.exec(textValue)) != null) {
                    let selector = m[2];
                    let r2 = validateParams.regex2.value;
                    r2.lastIndex = 0;
                    while (passed && (m2 = r2.exec(selector)) != null) {
                        passed = skipNodes.includes(m2[1].trim().toLowerCase());
                    }
                }
            } else if (!ruleContext.hasAttribute("disabled") ||
                ruleContext.getAttribute("disabled").toLowerCase() == "false") {
                let textValue = ruleContext.getAttribute('style');
                passed = skipNodes.includes(nodeName) ||
                    !(/(outline|border)[ \t]*\:/.test(textValue));
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger if :before and :after are used in CSS (Internal and External) with content
         * Origin: WCAG 2.0 F87
         */
        id: "WCAG20_Style_BeforeAfter",
        context: "dom:style, dom:link",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = true;
            //check Internal styles        
            if (ruleContext.nodeName.toLowerCase() == "style") {
                let css = RPTUtil.CSS(ruleContext);
                for (let i = 0; passed && i < css.length; ++i) {
                    // Guard against bad CSS
                    if (css[i].selector) {
                        passed = (css[i].selector.indexOf(":before") == -1 && css[i].selector.indexOf(":after") == -1) ||
                            !("content" in css[i].values) || css[i].values["content"].trim().length == 0 || css[i].values["content"].trim() == "\"\""
                            || css[i].values["content"].trim() == "\'\'" || css[i].values["content"].trim() == "none" || css[i].values["content"].trim() == "attr(x)"
                            || css[i].values["content"].trim() == "attr(y)";
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
                                        let styleMediaRule: CSSMediaRule;
                                        let styleImportRule: CSSImportRule;
                                        if (styleRule.type && styleRule.type === CSSRule.MEDIA_RULE) {
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
                                        else if (styleRule.type && styleRule.type === CSSRule.IMPORT_RULE && (styleImportRule = styleRule as CSSImportRule).styleSheet) {
                                            let rules = styleImportRule.styleSheet.cssRules ?
                                                styleImportRule.styleSheet.cssRules :
                                                styleImportRule.styleSheet.rules;
                                            if (rules) {
                                                for (let rIndex = 0; passed && rIndex < rules.length; rIndex++) {
                                                    let importedRule = rules[rIndex];
                                                    // check @media rules 
                                                    if (importedRule.type && importedRule.type === CSSRule.MEDIA_RULE) {
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
            if (ruleContext.nodeName.toLowerCase() == "link" && ruleContext.hasAttribute("rel") &&
                ruleContext.getAttribute("rel").toLowerCase() == "stylesheet" &&
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
                                    if (ruleFromLink.type && ruleFromLink.type === CSSRule.MEDIA_RULE) {
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
    },

    {
        /**
         * Description: Trigger when viewport units are used for font size.
         * Origin: Various
         */
        id: "WCAG21_Style_Viewport",
        context: "dom:link, dom:style, dom:*[style]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = true;
            let thePattern = /\d+(vw|vh|vmin|vmax)/gi;
            let nodeName = ruleContext.nodeName.toLowerCase();
            if (nodeName == "style") {
                for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                    let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet
                    if (sheet.ownerNode === ruleContext) {
                        try {
                            let styleRules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                            if (styleRules) {
                                for (let styleRuleIndex = 0; passed && styleRuleIndex < styleRules.length; styleRuleIndex++) {
                                    let rule = styleRules[styleRuleIndex];
                                    if (rule.type && rule.type === CSSRule.STYLE_RULE) {
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
                                    else if (rule.type && rule.type === CSSRule.IMPORT_RULE && (rule as CSSImportRule).styleSheet) {
                                        let importRule = rule as CSSImportRule;
                                        let rules = importRule.styleSheet.cssRules ? importRule.styleSheet.cssRules : importRule.styleSheet.rules;
                                        if (rules) {
                                            for (let rIndex = 0; passed && rIndex < rules.length; rIndex++) {
                                                let importedRule = rules[rIndex] as any
                                                if (importedRule.type && importedRule.type === CSSRule.STYLE_RULE) {
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
            } else if (nodeName == "link") {
                for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                    let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                    if (sheet && sheet.ownerNode === ruleContext) {
                        try {
                            let rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                            if (rules) {
                                for (let rIndex = 0; passed && rIndex < rules.length; rIndex++) {
                                    let ruleFromLink = rules[rIndex] as any;
                                    // check rules 
                                    if (ruleFromLink.type && ruleFromLink.type === CSSRule.STYLE_RULE) {
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

]
export { a11yRulesStyle }