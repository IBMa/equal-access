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
import { getCache, setCache } from "../util/CacheUtil";
import { VisUtil } from "../../v2/dom/VisUtil";

export let text_sensory_misuse: Rule = {
    id: "text_sensory_misuse",
    context: "dom:body, dom:body dom:*",
    refactor: {
        "RPT_Text_SensoryReference": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "text_sensory_misuse.html",
            "Potential_1": "text_sensory_misuse.html",
            "group": "text_sensory_misuse.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "If the word(s) '{0}' is part of instructions for using page content, check it is still understandable without this location or shape information",
            "group": "Instructions must be meaningful without shape or location words"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.3"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
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
        if (VisUtil.hiddenByDefaultElements.includes(ruleContext.nodeName.toLowerCase())) {
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
        let sensoryRegex = getCache(ruleContext.ownerDocument, "text_sensory_misuse", null);
        if (sensoryRegex == null) {
            let sensoryText = validateParams.sensoryText.value;
            let regexStr = "(" + sensoryText[0];
            for (let j = 1; j < sensoryText.length; ++j)
                regexStr += "|" + sensoryText[j];
            regexStr += ")\\W";
            sensoryRegex = new RegExp(regexStr, "gi");
            setCache(ruleContext.ownerDocument, "text_sensory_misuse", sensoryRegex);
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
}