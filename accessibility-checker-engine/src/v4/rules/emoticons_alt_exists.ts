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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let emoticons_alt_exists: Rule = {
    id: "emoticons_alt_exists",
    context: "dom:*",
    refactor: {
        "WCAG20_Text_Emoticons": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "emoticons_alt_exists.html",
            "Potential_1": "emoticons_alt_exists.html",
            "group": "emoticons_alt_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that emoticons have a text alternative",
            "group": "Emoticons must have a short text alternative that describes their purpose"
        }
    },
    /**
     * Decision in planning 9/7/23 that this rule causes more reviews that we see actual problems in content, so turn these rules off
    
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    */
    rulesets: [],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
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

        let walkNode: Node = ruleContext.firstChild;
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
}