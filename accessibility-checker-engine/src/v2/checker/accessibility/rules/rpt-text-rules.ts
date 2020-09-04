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
import { RPTUtil } from "../util/legacy";

let a11yRulesText: Rule[] = [

    {
        /**
         * Description: Trigger for possible uses of sensory text
         * Origin: RPT 5.6 G502
         */
        id: "RPT_Text_SensoryReference",
        context: "dom:body, dom:body dom:*",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                sensoryText: {
                    value: ["top-left", "top-right", "bottom-right", "bottom-left",
                        "round", "square", "shape", "rectangle", "triangle",
                        "right", "left", "above", "below", "top", "bottom",
                        "upper", "lower", "corner", "beside"],
                    type: "[string]"
                }
            }
            const ruleContext = context["dom"].node as Element;
            if (RPTUtil.hiddenByDefaultElements.includes(ruleContext.nodeName.toLowerCase())) {
                return null;
            } 

            // Extract the nodeName of the context node
            let nodeName = ruleContext.nodeName.toLowerCase();

            // In the case this is a style or link element, skip triggering rule as we do not want to scan
            // CSS for sensory words, as there can be CSS keys which contain theses sensory text that is matching.
            if (nodeName === "style" || nodeName === "link") {
                return RulePass(1);
            }

            let violatedtextArray = null;
            let violatedtext = null;
            let sensoryRegex = RPTUtil.getCache(ruleContext.ownerDocument, "RPT_Text_SensoryReference", null);
            if (sensoryRegex == null) {
                let sensoryText = validateParams.sensoryText.value;
                let regexStr = "(" + sensoryText[0];
                for (let j = 1; j < sensoryText.length; ++j)
                    regexStr += "|" + sensoryText[j];
                regexStr += ")\\W";
                sensoryRegex = new RegExp(regexStr, "gi");
                RPTUtil.setCache(ruleContext.ownerDocument, "RPT_Text_SensoryReference", sensoryRegex);
            }
            let passed = true;
            let walkNode = ruleContext.firstChild as Node;
            while (passed && walkNode) {
                // Comply to the Check Hidden Content setting will be done by default as this rule triggers on each element
                // and for each element it only checks that single elements text nodes and nothing else. So all inner elements will be
                // covered on their own. Currently for this rule by default Check Hidden Content will work, as we are doing
                // a node walk only on siblings so it would not get text nodes from other siblings at all.
                // In the case in the future something chnges, just need to add && !RPTUtil.shouldNodeBeSkippedHidden(walkNode) to the below
                // if.
                if (walkNode.nodeName == "#text") {
                    let txtVal = walkNode.nodeValue.trim();
                    if (txtVal.length > 0) {
                        violatedtextArray = txtVal.match(sensoryRegex);
                        if (violatedtextArray != null) {
                            let hash = {}, result = [];
                            let exemptWords = ["right-click", "left-click", "right-clicking", "right-clicks", "left-clicking", "left-clicks"];

                            // Note: split(/[\n\r ]+/) will spread the string into group of words using space, 
                            // carriage return or linefeed as separators.
                            let counts = txtVal.split(/[\n\r ]+/).reduce(function (map, word) {
                                let sensoryTextArr = validateParams.sensoryText.value;
                                let wordWoTrailingPunc = word.replace(/[.?!:;()'",`\]]+$/, "");
                                let lcWordWoPunc = word.toLowerCase().replace(/[.?!:;()'",`\]]/g, "");

                                for (let counter = 0; counter < sensoryTextArr.length; counter++) {
                                    let a = lcWordWoPunc.indexOf(sensoryTextArr[counter]);
                                    let b = exemptWords.indexOf(lcWordWoPunc);
                                    let sensoryWordLen = sensoryTextArr[counter].length;
                                    let charFollowSensoryText = lcWordWoPunc.charAt(sensoryWordLen + a);

                                    // If the word does not contains substring of sensoryTextArr[counter]
                                    // proceed to the next loop iteration for next sensoryText.
                                    if (a < 0) { continue; }

                                    let isPuncfollowing = ((charFollowSensoryText == '\-') ||
                                        (charFollowSensoryText == '\.') ||
                                        (charFollowSensoryText == '\?') || (charFollowSensoryText == '\!') ||
                                        (charFollowSensoryText == '\:') || (charFollowSensoryText == '\;') ||
                                        (charFollowSensoryText == '\(') || (charFollowSensoryText == '\)') ||
                                        (charFollowSensoryText == '\'') || (charFollowSensoryText == '\"') ||
                                        (charFollowSensoryText == '\,') || (charFollowSensoryText == '.\`') ||
                                        (charFollowSensoryText == '\\') || (charFollowSensoryText == '\]'));

                                    let isPuncPreceding = false;
                                    if (a > 0) {
                                        let charPrecedeSensoryText = lcWordWoPunc.charAt(a - 1);
                                        isPuncPreceding = ((charPrecedeSensoryText == '\-') ||
                                            (charPrecedeSensoryText == '\.') ||
                                            (charPrecedeSensoryText == '\?') || (charPrecedeSensoryText == '\!') ||
                                            (charPrecedeSensoryText == '\:') || (charPrecedeSensoryText == '\;') ||
                                            (charPrecedeSensoryText == '\(') || (charPrecedeSensoryText == '\)') ||
                                            (charPrecedeSensoryText == '\'') || (charPrecedeSensoryText == '\"') ||
                                            (charPrecedeSensoryText == '\,') || (charPrecedeSensoryText == '.\`') ||
                                            (charPrecedeSensoryText == '\\') || (charPrecedeSensoryText == '\]'));

                                    }

                                    if (((lcWordWoPunc.length == sensoryWordLen) || (isPuncfollowing == true) || (isPuncPreceding == true)) && (b < 0)) {
                                        passed = false;
                                        if (!hash.hasOwnProperty(wordWoTrailingPunc)) {
                                            hash[wordWoTrailingPunc] = true;
                                            result.push(wordWoTrailingPunc);
                                        }
                                        counter = sensoryTextArr.length;
                                    }
                                }
                                map[wordWoTrailingPunc] = (map[wordWoTrailingPunc] || 0) + 1;
                                return map;
                            }, Object.create(null));
                            violatedtext = result.join(", ");
                        }
                    }
                }
                walkNode = walkNode.nextSibling;
            }

            if (!passed) {
                // Don't trigger if we're not in the body or if we're in a script
                let checkAncestor = RPTUtil.getAncestor(ruleContext, ["body", "script"]);
                passed = (checkAncestor == null || checkAncestor.nodeName.toLowerCase() != "body");
            }

            return passed ? RulePass("Pass_0") : RulePotential("Potential_1", [violatedtext]);
        }
    },
    {
        /**
         * Description: Trigger for detected emoticons
         * Origin: WCAG H86
         */
        id: "WCAG20_Text_Emoticons",
        context: "dom:*",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                emoticons: {
                    value: [":-)", ":)", ":o)", ":]", ":3", ":c)", ":>", "=]", "8)", "=)", ":D", "C:",
                        ":-D", ":D", "8D", "XD", "=D", "=3", "<=3", "<=8", "--!--", ":-(", ":(", ":c", ":<", ":[",
                        "D:", "D8", "D;", "D=", "DX", "v.v", ":-9", ";-)", ";)", "*)", ";]", ";D", ":-P", ":P",
                        ":-p", ":p", "=p", ":-Þ", ":Þ", ":-b", ":b", ":-O", ":O", "O_O", "o_o", "8O", "OwO", "O-O",
                        "0_o", "O_o", "O3O", "o0o ;o_o;", "o...o", "0w0", ":-/", ":/", ":\\", "=/", "=\\", ":S", ":|",
                        "d:-)", "qB-)", ":)~", ":-)>....", ":-X", ":X", ":-#", ":#", "O:-)", "0:3", "O:)", ":'(", ";*(",
                        "T_T", "TT_TT", "T.T", ":-*", ":*", "^o)", ">:)", ">;)", ">:-)", "B)", "B-)", "8)", "8-)",
                        "^>.>^", "^<.<^", "^>_>^", "^<_<^", "D:<", ">:(", "D-:<", ">:-(", ":-@[1]", ";(", "`_´", "D<",
                        "<3", "<333", "=^_^=", "=>.>=", "=<_<=", "=>.<=", "\\,,/", "\\m/", "\\m/\\>.</\\m/", "\\o/", "\\o o/",
                        "o/\\o", ":&", ":u"
                    ],
                    type: "[string]"
                }
            }
            const ruleContext = context["dom"].node as Element;
            let emoticons = validateParams.emoticons.value;
            let passed = true;
            let testText = "";

            let walkNode : Node = ruleContext.firstChild;
            while (walkNode) {
                // Comply to the Check Hidden Content setting will be done by default as this rule triggers on each element
                // and for each element it only checks that single elements text nodes and nothing else. So all inner elements will be
                // covered on their own. Currently for this rule by default Check Hidden Content will work, as we are doing
                // a node walk only on siblings so it would not get text nodes from other siblings at all.
                // In the case in the future something chnges, just need to add && !RPTUtil.shouldNodeBeSkippedHidden(walkNode) to the below
                // if.
                if (walkNode.nodeName == "#text") {
                    testText += " " + walkNode.nodeValue;
                }
                walkNode = walkNode.nextSibling;
            }

            if (testText.trim().length > 0) {
                for (let j = 0; passed && j < emoticons.length; ++j) {
                    let emotIdx = testText.indexOf(emoticons[j]);
                    let eLngth = emoticons[j].length;
                    while (passed && emotIdx != -1) {
                        // Passes if: the emoticon is not preceded by whitespace,
                        // or the emoticon is not followed by whitespace unless it's punctuation,
                        // or it's in a pre, code, or script
                        passed =
                            (emotIdx > 0 && !/\s/.test(testText.substring(emotIdx - 1, emotIdx))) ||
                            (emotIdx < testText.length - eLngth && !/\s/.test(testText.substring(emotIdx + eLngth, emotIdx + eLngth + 1)) &&
                                !/[.,!'"?]/.test(testText.substring(emotIdx + eLngth, emotIdx + eLngth + 1)));

                        // Allow usage of (: stuff :) since this is a comment in some languages
                        passed = passed || ((emoticons[j] == ":)" || emoticons[j] == "(:") && /\(\:.*\:\)/.test(testText));
                        passed = passed || ((emoticons[j] == ";)" || emoticons[j] == "(;") && /\(\;.*\;\)/.test(testText));
                        emotIdx = testText.indexOf(emoticons[j], emotIdx + 1);
                    }
                }
            }

            if (!passed) {
                // Don't trigger if we're not in the body or if we're in a script, pre, code
                let checkAncestor = RPTUtil.getAncestor(ruleContext, ["pre", "code", "script", "body"]);
                passed = checkAncestor == null || checkAncestor.nodeName.toLowerCase() != "body";
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger for words that are spaced out (e.g., I B M).  CSS should be used instead for this
         * Origin: WCAG 2.0 F32, C8 
         */
        id: "WCAG20_Text_LetterSpacing",
        context: "dom:*",
        run: (context: RuleContext, options?: {}) : RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
            let passed = true;
            let walkNode = ruleContext.firstChild as Node;
            while (passed && walkNode) {
                // Comply to the Check Hidden Content setting will be done by default as this rule triggers on each element
                // and for each element it only checks that single elements text nodes and nothing else. So all inner elements will be
                // covered on their own. Currently for this rule by default Check Hidden Content will work, as we are doing
                // a node walk only on siblings so it would not get text nodes from other siblings at all.
                // In the case in the future something chnges, just need to add && !RPTUtil.shouldNodeBeSkippedHidden(walkNode) to the below
                // if.
                if (walkNode.nodeName == "#text") {
                    let txtVal = walkNode.nodeValue;
                    passed = !(/(^|\s)[a-zA-Z] [a-zA-Z] [a-zA-Z]($|\s)/.test(txtVal));
                }
                walkNode = walkNode.nextSibling;
            }

            if (!passed) {
                // Don't trigger if we're not in the body or if we're in a script
                let checkAncestor = RPTUtil.getAncestor(ruleContext, ["body", "script", "code"]);
                passed = checkAncestor == null || checkAncestor.nodeName.toLowerCase() != "body";
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger for possible ASCII art in a <pre>
         * Origin: RPT 5.6 G458
         */
        id: "RPT_Pre_ASCIIArt",
        context: "dom:pre, dom:listing, dom:xmp, dom:plaintext",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;

            // Fix for IDWB writers. Don't trigger if content is in a code element.  The code element is searched for 
            // in various places because of the weird way various browsers render <code><pre></pre></code.  Firefox, 
            // HtmlUnit and Chrome all render differently.  Firefox: <code></code><pre></pre>  HtmlUnit: </code><pre><code></code></pre>
            // See unit test CodeElementAbovePreElement.html.  Don't know how RPT renders, so cover all the bases.
            if (ruleContext.nodeName.toLowerCase() == "pre") {
                if ((ruleContext.previousSibling && ruleContext.previousSibling.nodeName.toLowerCase() == "code") ||
                    ruleContext.getElementsByTagName("code").length > 0 ||
                    RPTUtil.getAncestor(ruleContext, "code")) {

                    return RulePass("Pass_0");
                }
            }

            let passed = true;
            let txtValue = RPTUtil.getInnerText(ruleContext);
            let nonAlphaNumericNorSpaceCount = 0;
            let alphNumSameCharacterCount = 0;
            let lastCharacter = "";

            // Iterate through the text content
            for (let idx = 0; passed && (idx < txtValue.length); ++idx) {
                let chStr = txtValue.substr(idx, 1);
                // Check if it is alphanumeric or punctuation
                if (/[\w!@#$%&\*().,?\[\]{}<>=":\/\\-]/.test(chStr)) {
                    // Detect same character sequence
                    if (lastCharacter == chStr) {
                        alphNumSameCharacterCount = alphNumSameCharacterCount + 1;;
                    } else {
                        alphNumSameCharacterCount = 0;
                    }
                } else if (/\s/.test(chStr)) {
                    alphNumSameCharacterCount = 0;
                } else {
                    nonAlphaNumericNorSpaceCount = nonAlphaNumericNorSpaceCount + 1;
                    alphNumSameCharacterCount = 0;
                }
                lastCharacter = chStr;

                // Make the decision
                if (nonAlphaNumericNorSpaceCount >= 5 || alphNumSameCharacterCount >= 4) {
                    passed = false;
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");
        }
    }

]
export { a11yRulesText }