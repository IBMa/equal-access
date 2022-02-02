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
         * Description: Trigger if on hover any content displayed is not persistent
         * Origin: Requirement 1.4.13
         */
        //
        // Trigger logic:
        //
        // First, logic for the sibling failures
        // 
        // 1. Find all hover selectors, [element1]:hover
        //    the hover selects and you can use it to style an element when you mouse over it
        //    e.g., a:hover, span:hover, etc...?
        //
        // 2. Find if the hover followed by either the + or ~ css combinators?
        //
        //    e.g., :hover+ or :hover~ (after triming spaces)
        //
        // 3. Determine if the element after the css combinator + or ~ followed by an element 
        //    with a display attribute with any value but none? e.g, 
        //
        //    [element1]:hover + [element2] {
        //       display: block;
        //
        //    [element1]:hover ~ [element2] {
        //       display: block;
        //
        // 4. if we found + and there is one sibling directly after [element1] in the body
        //    of type [element2]. 
        //    if 1-4 are true Trigger Failure 1
        //
        // 5. if we found ~ and there are two or more siblings directly after [element1] 
        //    in the body of type [element2] - note there cannot be other elements inbetween 
        //    the siblings. if 1-3 and 5 are true Trigger Failure 2
        //
        //
        // Logic for margin failure (or more generally any space between the bottom of 
        // [element1] and the top of [element2])
        //
        // 1. Do we have an element with a hover selector,
        //    e.g., a:hover, span:hover, etc...?
        //
        // 2. is the hover followed by any of the four css combinators?
        //
        //    descendant selector (space)
        //    child selector (>)
        //    adjacent sibling selector (+)
        //    general sibling selector (~)
        //
        //    e.g., [element1]:hover [element2], or [element1]:hover > [element2],
        //          [element1]:hover + [element2], [element1]:hover ~ [element2]
        //          Note: for the one with a space we cannot trim the space, the
        //                others may have spaces trimmed
        //
        // 3. does the element after [elemnent1]:hover contain one of the four
        //    css combinators followed by [element2] 
        //    with a display attribute with any value but none?? e.g, 
        //
        //    [element1]:hover [element2] {
        //       display: block;
        //
        //    [element1]:hover > [element2] {
        //       display: block;
        //
        //    [element1]:hover + [element2] {
        //       display: block;
        //
        //    [element1]:hover ~ [element2] {
        //       display: block;
        //
        // 4. if we found space for the css combinator [element1] must have one descendent
        //    of type [element2] in the body. 
        //
        // 5. if we found > for the css combinator [element1] must have one child
        //    of type [element2] in the body. 
        
        // 7. if we found + is there at one sibling directly after [element1] of type
        //    [element2] in the body. 
        //
        // 8. if we found ~ is there at two or more siblings directly after [element1] of type
        //    [element2] in the body - note there cannot be other elements inbetween the siblings. 
        //
        // 9. if either [element 1] or [element 2], contains a margin attribute with a positive value
        //    and 1-3 is true and one 1-4 is true then Trigger Failure 3.

        id: "style_hover_persistent",
        context: "dom:style, dom:*[style], dom:*",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            let passed = true;

            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let styleText = "";
            if (nodeName == "style") {
                console.log("RULE RUN ******************");
                styleText = RPTUtil.getInnerText(ruleContext).toLowerCase();
                // check import
                console.log("ruleContext.ownerDocument.styleSheets.length = "+ruleContext.ownerDocument.styleSheets.length);
                for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; sIndex++) {
                    let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                    if (sheet && sheet.ownerNode == ruleContext) {
                        try {
                            let styleRules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                            console.log("styleRules.length = "+styleRules.length);
                            for (let styleRuleIndex = 0; styleRuleIndex < styleRules.length; styleRuleIndex++) {
                                let foundHover = false;
                                let hoverElement = "";
                                let plusCombinator = false;
                                let tildeCombinator = false;
                                let afterCombinatorElement = "";
                                let afterCombinatorElementHover = false;
                                let adjacentSibling = false;
                                let styleRule = styleRules[styleRuleIndex];
                                let ruleText = styleRules[styleRuleIndex].cssText;
                                console.log("styleRules["+styleRuleIndex+"] = "+ruleText);
                                // Check for hover
                                if (ruleText.match(/:hover/g)) {
                                    foundHover = true;
                                    console.log("FOUND HOVER = "+ foundHover);
                                    hoverElement = ruleText.split(":")[0];
                                    console.log("hoverElement = "+hoverElement);
                                } else {
                                    console.log("NO HOVER");
                                    continue;
                                }
                                console.log("match = "+ruleText.match(/:hover \+/g));
                                // Check for css combinator +, adjacent sibling selector
                                if (ruleText.match(/:hover \+/g) || ruleText.match(/:hover\+/g)) {
                                    console.log("ruleText = "+ruleText);
                                    console.log("match = "+ruleText.match(/:hover \\+/g));
                                    plusCombinator = true;
                                    console.log("Found plusCombinator = "+ plusCombinator);
                                    let plusTempStr = ruleText.substring(ruleText.indexOf('+') + 1);
                                    plusTempStr = plusTempStr.trim();
                                    afterCombinatorElement = plusTempStr.split(" ")[0];
                                }
                                // Check for css combinator ~, general sibling selector
                                if (ruleText.match(/:hover \~/g) || ruleText.match(/:hover\~/g)) {
                                    console.log("match = "+ruleText.match(":hover \~"));
                                    tildeCombinator = true;
                                    console.log("Found tildeCombinator = "+ tildeCombinator);
                                    let plusTempStr = ruleText.substring(ruleText.indexOf('~') + 1);
                                    plusTempStr = plusTempStr.trim();
                                    afterCombinatorElement = plusTempStr.split(" ")[0];
                                }

                                // If we have afterCombinatorElement 
                                //    then does it have a :hover
                                //    then see if that element contains display property with any value but none 
                                //    (it can't be persistent if there is 
                                //    no display on hover)
                                
                                // First check the other css rules that start with a afterCombinatorElement
                                if (sheet && sheet.ownerNode == ruleContext) {
                                    try {
                                        let styleRules2 = sheet.cssRules ? sheet.cssRules : sheet.rules;
                                        console.log("styleRules2.length = "+styleRules2.length);
                                        for (let styleRuleIndex2 = 0; styleRuleIndex2 < styleRules2.length; styleRuleIndex2++) {
                                            // Check rule for afterCominatorElement:hover
                                            // If fine afterCombinatorElement:hover see if rule has display: value where 
                                            // value != none
                                            let ruleText2 = styleRules[styleRuleIndex2].cssText;
                                            console.log("ruleText2 = ", ruleText2);
                                            console.log(ruleText2.match(afterCombinatorElement+":hover"));
                                            if (ruleText2.match(afterCombinatorElement+":hover")) {
                                                afterCombinatorElementHover = true;
                                                console.log("Found afterCombinatorElementHover = "+ afterCombinatorElementHover);
                                                console.log("afterCombinatorElementHover = "+afterCombinatorElementHover);
                                            }
                                        }
                                    } catch (e) {
                                        // Silence css access issues
                                    }
                                }

                                // Get list of hover elements and next sibling for +
                                if (hoverElement !== "") {
                                    console.log("hoverElement.toUpperCase() = "+hoverElement.toUpperCase());
                                    let hoverElementList = ruleContext.ownerDocument.getElementsByTagName(hoverElement.toUpperCase());
                                    console.log("hoverElementList.length = "+hoverElementList.length);
                                    console.log("hoverElementList[0].tagName = "+hoverElementList[0].tagName);
                                    // Get adjacent sibling
                                    console.log("Adjacent sibling = "+hoverElementList[0].nextElementSibling.tagName);
                                    if (afterCombinatorElement.toUpperCase() === hoverElementList[0].nextElementSibling.tagName) {
                                        adjacentSibling = true;
                                        console.log("adjacentSibling = ", adjacentSibling);
                                    }
                                }

                                // + trigger
                                if (foundHover && plusCombinator && afterCombinatorElementHover && adjacentSibling) {
                                    console.log("+ trigger");
                                }
                                // ~ trigger
                                if (foundHover && tildeCombinator && afterCombinatorElementHover) {
                                    console.log("~ trigger");
                                }

                                let styleImportRule: CSSImportRule;
                                if (styleRule.type && styleRule.type === CSSRule.IMPORT_RULE && (styleImportRule = styleRule as CSSImportRule).styleSheet) {
                                    let importRules = styleImportRule.styleSheet.cssRules ? styleImportRule.styleSheet.cssRules : styleImportRule.styleSheet.rules;
                                    for (let rIndex = 0; rIndex < importRules.length; rIndex++) {
                                        console.log("importRules["+rIndex+"].cssText = "+importRules[rIndex].cssText);
                                        let iRule = importRules[rIndex];
                                        styleText += iRule.cssText; 
                                        let ruleText = styleRules[styleRuleIndex].cssText;
                                        console.log("styleRules["+styleRuleIndex+"].cssText = "+styleRules[styleRuleIndex].cssText);
                                        // ok I have rule now see if it contains anything of interest
                                        if (ruleText.match(":hover")) {
                                            console.log("Found hover");
                                        }
                                        console.log(styleText.split(" "));
                                    }
                                }
                            }
                        } catch (e) {
                            // Silence css access issues
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