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

import { Rule, RuleResult, RuleContext, RulePotential, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { CacheUtil } from "../util/CacheUtil";
import { VisUtil } from "../util/VisUtil";

export const text_sensory_misuse: Rule = {
    id: "text_sensory_misuse",
    context: "dom:body, dom:body dom:*",
    refactor: {
        "RPT_Text_SensoryReference": {
            "Pass_0": "pass",
            "Potential_1": "potential_position, potential_other"}
    },
    help: {
        "en-US": {
            "pass": "text_sensory_misuse.html",
            "potential_position": "text_sensory_misuse.html",
            "potential_other": "text_sensory_misuse.html",
            "group": "text_sensory_misuse.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Instructions are meaningful without relying solely on shape, size, or location words",
            "potential_position": "Confirm the word(s) '{0}' of the user instruction is used to indicate a logical rather than visual position",
            "potential_other": "Confirm the user instruction is still understandable without the word(s) '{0}'",
            "group": "Instructions should be meaningful without relying solely on shape, size, or location words"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.3"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // Extract the nodeName of the context node
        let nodeName = ruleContext.nodeName.toLowerCase();
        
        //skip the check if the element is hidden or disabled
        if (!VisUtil.isNodeVisible(ruleContext) || CommonUtil.isNodeDisabled(ruleContext) || VisUtil.hiddenByDefaultElements.includes(nodeName))
            return null;
        
        // Don't trigger if we're not in the body or if we're in a script
        if (CommonUtil.getAncestor(ruleContext, ["body"]) === null) 
            return null;
        
        // ignore script, link, label and their child elements
        if (CommonUtil.getAncestor(ruleContext, ["script", "a", 'label']) !== null)
            return null;
    
        // ignore text on landmark roles, but not on their children (e.g., section, main)
        const role = AriaUtil.getResolvedRole(ruleContext);
        if (role) {
            let lmRoles = AriaUtil.getRolesWithTypes(ruleContext, ["landmark"]);
            if (lmRoles && lmRoles.includes(role))
                return null;
        }    
        
        // ignore all widgets and headings, and their children, and certain structure roles
        let roles = AriaUtil.getRolesWithTypes(ruleContext, ["widget", "heading"]);
        // add some structure roles
        CommonUtil.concatUniqueArrayItemList(["caption", "cell", "code", "columnheader", "definition", "figure", "list", "listitem", "math", "meter", "row", "rowgroup", "rowheader", "term"], roles);
        if (AriaUtil.getAncestorWithRoles(ruleContext, roles) !== null) 
            return null;

        let violatedPositionText = "";
        let violatedOtherText = "";
        let walkNode = ruleContext.firstChild as Node;
        let txtVal = ""; 
        while (walkNode) {
            // for each element it only checks that single elements text nodes and nothing else. 
            // all inner elements will be covered on their own. 
            // whitespace characters (space, newline, tab) between elements are considered a node too.
            if (walkNode.nodeName === "#text") {
                let txt = walkNode.nodeValue.trim();
                if (txt.length > 0)
                    txtVal += (txtVal.length > 0 ? ", " + txt : txt);
            }
            walkNode = walkNode.nextSibling;
        }
        
        if (txtVal.length > 0) {
             // first to remove each exempt word with a single space in the text
            let exemptRegex = getRegex(ruleContext.ownerDocument, "exemptText");
            txtVal = txtVal.replace(exemptRegex, " ");

            violatedPositionText = getViolatedText(ruleContext.ownerDocument, "positionText", txtVal);
            violatedOtherText = getViolatedText(ruleContext.ownerDocument, "otherText", txtVal);
        }

        let ret = []; 
        if (violatedPositionText) ret.push(RulePotential("potential_position", [violatedPositionText]));
        if (violatedOtherText) ret.push(RulePotential("potential_other", [violatedOtherText]));
        return ret.length == 0 ? null : ret;
    }
}

const validateParams = {
    positionText: {
        value: ["top-left", "top-right", "bottom-right", "bottom-left",
            "top-to-bottom", "left-to-right", "bottom-to-top", "right-to-left",
            "right", "left", "above", "below", "top", "bottom",
            "upper", "lower", "corner", "beside"
        ],
        type: "[string]"
    },
    otherText: {
        value: ["round", "square", "shape", "rectangle", "triangle",
            "size", "large", "small", "medium", "big", "huge", "tiny", "extra",
            "larger", "smaller", "bigger", "little", "largest", "smallest", "biggest"
        ],
        type: "[string]"
    },
    exemptText: {
        value: ["right-click", "left-click", "right-clicking", "right-clicks", 
           "left-clicking", "left-clicks", "square root", "right now", "off the top"   //append as needed
        ],
        type: "[string]"
    }    
}

function getRegex(doc, type) {
    if (!validateParams[type]) return "";
    let sensoryRegex = CacheUtil.getCache(doc, type + "_sensory_misuse", null);
    if (sensoryRegex == null) {
        let sensoryText = validateParams[type].value;
        let regexStr = "(\s\s+|" + sensoryText[0];
        for (let j = 1; j < sensoryText.length; ++j) {
            let words = sensoryText[j].trim().split(" ");
            regexStr += "|" + words[0];
            if (words.length > 1) {
                for (let c = 1; c < words.length; ++c)
                    regexStr += " +" + words[c];
            }
        }
        //regexStr += ")\\W";
        regexStr += ")";
        sensoryRegex = new RegExp(regexStr, "gi");
        CacheUtil.setCache(doc, type +"_sensory_misuse", sensoryRegex);
    }
    return sensoryRegex;
}

function getViolatedText(doc, type, txtVal) {
    if (!txtVal) return "";
    let sensoryTextArr = validateParams[type].value
    let hash = {}, result = [];
    
    // split the string into words
    let counts = txtVal.split(/\s+/).reduce(function (map, word) {
        let wordWoTrailingPunc = word.replace(/[.?!:;()'",`\]]+$/, "");
        let lcWordWoPunc = word.toLowerCase().replace(/[.?!:;()'",`\]]/g, "");

        for (let counter = 0; counter < sensoryTextArr.length; counter++) {
            let a = lcWordWoPunc.indexOf(sensoryTextArr[counter]);
            
            let sensoryWordLen = sensoryTextArr[counter].length;
            let charFollowSensoryText = lcWordWoPunc.charAt(sensoryWordLen + a);

            // If the word does not contains substring of sensoryTextArr[counter]
            // proceed to the next loop iteration for next sensoryText.
            if (a < 0) { continue; }

            //check the following and proceeding punctuations
            //let isPuncfollowing = ((charFollowSensoryText == '\-') ||
            let isPuncfollowing = (
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

            if (((lcWordWoPunc.length == sensoryWordLen) || (isPuncfollowing == true) || (isPuncPreceding == true))) {
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
    return result.join(", ");
} 