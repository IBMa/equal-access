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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { getCache, setCache } from "../util/CacheUtil";
import { VisUtil } from "../../v2/dom/VisUtil";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";

export let text_sensory_misuse: Rule = {
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
            "potential_other": "Confirm the the user instruction is still understandable without the word(s) '{0}'",
            "group": "Instructions should be meaningful without relying solely on shape, size, or location words"
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
        const ruleContext = context["dom"].node as Element;
        // Extract the nodeName of the context node
        let nodeName = ruleContext.nodeName.toLowerCase();
        
        //skip the check if the element is hidden or disabled
        if (!VisUtil.isNodeVisible(ruleContext) || RPTUtil.isNodeDisabled(ruleContext) || VisUtil.hiddenByDefaultElements.includes(nodeName))
            return null;
        
        // Don't trigger if we're not in the body or if we're in a script
        if (RPTUtil.getAncestor(ruleContext, ["body"]) === null || RPTUtil.getAncestor(ruleContext, ["script"]) !== null) 
            return null;
        
        // ignore link and label elements
        if (nodeName === 'a' || nodeName === 'label') return null;

        //get the resolved role for the element
        const role = RPTUtil.getResolvedRole(ruleContext);
        if (role) {
            const roleProp =ARIADefinitions.designPatterns[role];
            //ignore all widgets and landmarks
            if (roleProp.roleType === 'widget' || roleProp.roleType === 'landmark') 
                return null;
            // ignore certain structures
            if (roleProp.roleType === 'structure' && !["paragraph", "strong", "suggestion", "tooltip"].includes(role)) 
                return null;
        }

        let violatedPositionText = "";
        let violatedOtherText = "";
        let walkNode = ruleContext.firstChild as Node;
        let txtVal = ""; 
        while (walkNode) {console.log("rule node="+nodeName +", nodeType=" + walkNode.nodeType + ", nodeName=" + walkNode.nodeName + ", orig node value=" + walkNode.textContent);
            // for each element it only checks that single elements text nodes and nothing else. 
            // all inner elements will be covered on their own. 
            // whitespace characters (space, newline, tab) between elements are considered a node too.
            if (walkNode.nodeName === "#text") {
                let txt = walkNode.nodeValue.trim();console.log("orig txt=" + txt);
                if (txt.length > 0)
                    txtVal += (txtVal.length > 0 ? ", " + txt : txt);
            }
            walkNode = walkNode.nextSibling;
        }
        console.log("rule node="+nodeName + ", txtVal=" + txtVal);
        if (txtVal.length > 0) {
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
            "upper", "lower", "corner", "beside"],
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
           "left-clicking", "left-clicks", "square root"
        ],
        type: "[string]"
    }    
}

//const exemptWords = ["right-click", "left-click", "right-clicking", "right-clicks", "left-clicking", "left-clicks"];

function getRegex(doc, type) {
    if (!validateParams[type]) return "";
    let sensoryRegex = getCache(doc, type + "_sensory_misuse", null);
    if (sensoryRegex == null) {
        let sensoryText = validateParams[type].value;
        let regexStr = "(" + sensoryText[0];
        for (let j = 1; j < sensoryText.length; ++j) {
            //regexStr += "|" + sensoryText[j];
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
        setCache(doc, type +"_sensory_misuse", sensoryRegex);
    }
    return sensoryRegex;
}

function getViolatedText(doc, type, text) { //console.log("text=" + text);
    if (!text) return "";
    // first to replace all the exempt words in the text
    let exemptRegex = getRegex(doc, "exemptText");  //console.log("exemptRegex=" + exemptRegex);
    let txtVal = text.replaceAll("  ", " ").replaceAll(exemptRegex, " "); //console.log("text=" + text + ", txtVal=" + txtVal);
    
    let sensoryRegex = getRegex(doc, type);
    let sensoryTextArr = validateParams[type].value
    let violatedtextArray = txtVal.match(sensoryRegex);
    //if (violatedtextArray != null) {
        let hash = {}, result = [];
        
        // split the string into words
        let counts = txtVal.split(/\s+/).reduce(function (map, word) {
            let wordWoTrailingPunc = word.replace(/[.?!:;()'",`\]]+$/, ""); //console.log("word=" +word + ", wordWoTrailingPunc=" +wordWoTrailingPunc);
            let lcWordWoPunc = word.toLowerCase().replace(/[.?!:;()'",`\]]/g, "");

            for (let counter = 0; counter < sensoryTextArr.length; counter++) {
                let a = lcWordWoPunc.indexOf(sensoryTextArr[counter]);
                //let b = exemptWords.indexOf(lcWordWoPunc);
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
    //} else
    //  return "";
} 