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

export let style_hover_persistent: Rule = {
    id: "style_hover_persistent",
    context: "dom:style, dom:*[style], dom:*",
    help: {
        "en-US": {
            "Pass_0": "style_hover_persistent.html",
            "Pass_1": "style_hover_persistent.html",
            "Pass_2": "style_hover_persistent.html",
            "Potential_1": "style_hover_persistent.html",
            "Potential_2": "style_hover_persistent.html",
            "Potential_3": "style_hover_persistent.html",
            "group": "style_hover_persistent.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "the hover: pseudo-class is not used to display content",
            "Pass_1": "content displayed via the :hover pseudo-class is a direct child of the trigger element",
            "Pass_2": "content displayed via the :hover pseudo-class is the adjacent sibling of the trigger element",
            "Potential_1": "Confirm the pointer can be positioned over the displayed element, not just the trigger",
            "Potential_2": "Confirm the pointer can be positioned over all the information displayed on hover",
            "Potential_3": "Confirm the margin style attribute has not prevented the pointer from hovering over the displayed element, not just the trigger",
            "group": "The pointer should be able to move over content displayed on hover"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_2"],
        "num": ["1.4.13"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        let pass0 = false;
        let pass1 = false;
        let pass2 = false; // never happen
        let potential1 = false;
        let potential2 = false;
        let potential3 = false;

        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        let styleText = "";
        if (nodeName === "style") {
            // console.log("RULE RUN ******************");
            styleText = RPTUtil.getInnerText(ruleContext).toLowerCase();
            // check import
            // console.log("ruleContext.ownerDocument.styleSheets.length = "+ruleContext.ownerDocument.styleSheets.length);
            for (let sIndex = 0; sIndex < ruleContext.ownerDocument.styleSheets.length; ++sIndex) {
                let sheet = ruleContext.ownerDocument.styleSheets[sIndex] as CSSStyleSheet;
                if (sheet && sheet.ownerNode === ruleContext) {
                    try {
                        let styleRules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                        // console.log("styleRules.length = "+styleRules.length);
                        for (let styleRuleIndex = 0; styleRuleIndex < styleRules.length; styleRuleIndex++) {
                            // console.log("**********");
                            // console.log("********** FOR LOOP styleRuleIndex = "+styleRuleIndex);
                            let foundHover = false;
                            let hoverElement = "";
                            let plusCombinator = false;
                            let tildeCombinator = false;
                            let afterCombinatorElement = "";
                            let afterCombinatorElementDisplay = false;
                            let afterCombinatorElementDisplayValue = false;
                            let afterCombinatorElementHover = false;
                            let supportingElement = false;
                            let supportingHover = false;
                            let supportingHoverElementDisplayProperty = false;
                            let supportingHoverElementDisplayValue = false;
                            let adjacentPlusSibling = false;
                            let adjacentTildeMultipleSibling = false;
                            let styleRule = styleRules[styleRuleIndex];
                            let ruleText = styleRules[styleRuleIndex].cssText;
                            // console.log("styleRules["+styleRuleIndex+"] = "+ruleText);
                            // 1. Check for :hover
                            if (ruleText.match(/:hover/g)) {
                                foundHover = true;
                                // console.log("1. found :hover = "+ foundHover);
                                // 2. Get hover element
                                hoverElement = ruleText.split(":")[0];
                                // console.log("2. found element that goes with :hover = "+hoverElement);
                            } else {
                                // console.log("1. No hover on css element so skip this rule");
                                continue; // if no :hover skip this rule
                            }
                            // 3a. Check for css combinator +
                            // 4a. if so do we have an after combinator element
                            let plusTempStr = ruleText.substring(ruleText.indexOf("+") + 1);
                            plusTempStr = plusTempStr.trim();
                            if (ruleText.match(/:hover \+/g) || ruleText.match(/:hover\+/g)) {
                                plusCombinator = true;
                                // console.log("3a. Found plusCombinator = "+ plusCombinator);
                                afterCombinatorElement = plusTempStr.split(" ")[0];
                                // console.log("4a. Found plus afterCombinatorElement = "+afterCombinatorElement);
                            }

                            // 3b. Check for css combinator +
                            // 4b. if so do we have an after combinator element
                            if (ruleText.match(/:hover \~/g) || ruleText.match(/:hover\~/g)) {
                                // console.log("match = "+ruleText.match(":hover \~"));
                                tildeCombinator = true;
                                // console.log("3b. Found tildeCombinator = "+ tildeCombinator);
                                let plusTempStr = ruleText.substring(ruleText.indexOf("~") + 1);
                                plusTempStr = plusTempStr.trim();
                                afterCombinatorElement = plusTempStr.split(" ")[0];
                                // console.log("4b. Found tilde afterCombinatorElement = "+afterCombinatorElement);
                            }

                            if (!plusCombinator && !tildeCombinator) {
                                // NO plusCombinator or tildeCombinator so skip this rule
                                // console.log("NO plusCombinator or tildeCombinator so PASS");
                                // console.log("**** REPORT PASS 0 HERE");
                                return RulePass("Pass_0"); // JCH: should we have a N/A pass
                            }

                            // So now we have a css element with hover - element:hover so we have problems
                            // to check

                            // 5. Check if the after combinator element has display: property
                            // 6. Check if display property is not none
                            if (afterCombinatorElement) {
                                // get index of display:
                                // console.log("plusTempStr = "+plusTempStr);
                                let index = plusTempStr.indexOf("display:");
                                if (index) {
                                    afterCombinatorElementDisplay = true;
                                    // console.log("5. Found afterCombinatorElementDisplay = "+afterCombinatorElementDisplay);
                                    if (plusTempStr.slice(index + 8).trim().split(" ")[0] !== "none;") {
                                        afterCombinatorElementDisplayValue = true;
                                        // console.log("6. Found afterCombinatorElementDisplayValue not none = "+afterCombinatorElementDisplayValue);
                                    } else {
                                        // console.log("afterCombinatorElementDisplayValue === none");
                                        // console.log("**** PUT POTENTIAL 0 HERE");
                                        continue;
                                    }
                                } else {
                                    // this is bad css so it won't happen
                                    // console.log("NO afterCombinatorElementDisplay so skip this rule");
                                    continue;
                                }
                            } else {
                                // this is bad css so it won't happen
                                // console.log("NO afterCombinatorElement so skip this rule");
                                continue;
                            }

                            if (afterCombinatorElementDisplayValue)
                                if (sheet && sheet.ownerNode === ruleContext) {
                                    // console.log("**** At this point we have verified that we have a css element with a hover of the format span:hover + div { display: block; } with all the proper properties and values");
                                    // NOTE: At this point we have verified that we have a css element with a hover
                                    //       of the format span:hover + div { display: block; }
                                    //       with all the proper properties and values

                                    try {
                                        let styleRules2 = sheet.cssRules ? sheet.cssRules : sheet.rules;
                                        // console.log("styleRules2.length = "+styleRules2.length);
                                        for (let styleRuleIndex2 = 0; styleRuleIndex2 < styleRules2.length; styleRuleIndex2++) {
                                            // Check rule for afterCominatorElement:hover
                                            // If find afterCombinatorElement:hover see if rule has property display: value where
                                            // value != none
                                            // console.log("**********");
                                            // console.log("********** 2nd FOR styleRuleIndex2 = "+styleRuleIndex2);
                                            let ruleText2 = styleRules[styleRuleIndex2].cssText;
                                            // console.log("ruleText2 = ", ruleText2);
                                            // console.log("afterCombinatorElement = "+afterCombinatorElement);
                                            // Check all supporting elements for margin property
                                            // If find margin STOP and REPORT ERROR
                                            let regExString = afterCombinatorElement + " {";
                                            let trimRuleText2 = ruleText2.trim();
                                            let regIndex = trimRuleText2.indexOf(regExString);
                                            let afterCombinatorElementProperties = trimRuleText2.slice(regIndex).trim();

                                            //if (!afterCombinatorElementProperties.match(/margin/g)) {
                                            if (!trimRuleText2.match(/margin/g)) {       
                                                // console.log("No margin problem so continue on...");
                                                // do we have a supporting element css definitions
                                                let supportingHoverElement = ruleText2.split(":")[0];
                                                supportingHoverElement = supportingHoverElement.split(" ")[0];
                                                // console.log("supportingHoverElement = "+supportingHoverElement);
                                                // console.log("afterCombinatorElement = "+afterCombinatorElement);

                                                // NEED TO CHECK FOR afterCominatorElement:hover in ONE STEP

                                                if (supportingHoverElement === afterCombinatorElement && ruleText2.match(/:hover/g)) {
                                                    // console.log("7. Found supporting hover element same as afterCombinatorElement")
                                                    // 7. Found supporting hover element same as afterCombinatorElement
                                                    supportingElement = true;
                                                    // does supporting element have hover
                                                    // console.log("8. Supporting element has hover also = "+ foundHover);
                                                    // 8. Supporting element has hover also
                                                    supportingHover = true;
                                                    let index = ruleText2.indexOf("display:");
                                                    // console.log("index = "+index);
                                                    if (index) {
                                                        // 9. Found supportingHoverElementDisplayProperty
                                                        supportingHoverElementDisplayProperty = true;
                                                        // console.log("9. Found supportingHoverElementDisplayProperty = "+supportingHoverElementDisplayProperty);
                                                        if (plusTempStr.slice(index + 8).trim().split(" ")[0] !== "none;") {
                                                            // 10. Found supportingHoverElementDisplayValue not none
                                                            supportingHoverElementDisplayValue = true;
                                                            // console.log("10. Found supportingHoverElementDisplayValue not none = "+supportingHoverElementDisplayValue);
                                                            // Get list of hover elements and next sibling for +
                                                            // For + there must be at least one ADJACENT sibling
                                                            if (hoverElement !== "" && plusCombinator) {
                                                                let hoverElementList = ruleContext.ownerDocument.getElementsByTagName(hoverElement.toUpperCase());
                                                                // console.log("hoverElementList.length = "+hoverElementList.length);
                                                                // console.log("hoverElementList[0].tagName = "+hoverElementList[0].tagName);
                                                                // Get adjacent sibling
                                                                // console.log("Adjacent sibling = "+hoverElementList[0].nextElementSibling.tagName);
                                                                // console.log("afterCombinatorElement.toUpperCase() = "+afterCombinatorElement.toUpperCase());

                                                                if (afterCombinatorElement.toUpperCase() === hoverElementList[0].nextElementSibling.tagName) {
                                                                    // console.log("11a. Hover with plus has adjacent sibling.")
                                                                    // 11a. Hover with plus has adjacent sibling.
                                                                    adjacentPlusSibling = true;
                                                                    // At this point we have verified a supporting afterCombinatorElement css rule that contains hover and display property that is not equal to none and has a hover element in the body with an adjacent sibling
                                                                    // console.log("**** REPORT PASS 1 HERE");
                                                                    pass0 = true;
                                                                    continue;
                                                                }
                                                            } else if (plusCombinator) {
                                                                // console.log("11a. Main hover with + combinator has no adjacent sibling");
                                                                if (!potential1) {
                                                                    // console.log("**** PUT POTENTIAL 1 HERE");
                                                                    potential1 = true;
                                                                    break;
                                                                }
                                                                continue;
                                                            }
                                                            // Get list of hover elements and determine if there are 2 or more adjacent siblings for ~
                                                            // For ~ there must be at least one ADJACENT sibling
                                                            if (hoverElement !== "" && tildeCombinator) {
                                                                // console.log("hoverElement.toUpperCase() = "+hoverElement.toUpperCase());
                                                                let hoverElementList =
                                                                    ruleContext.ownerDocument.getElementsByTagName(
                                                                        hoverElement.toUpperCase()
                                                                    );
                                                                // console.log("hoverElementList.length = "+hoverElementList.length);
                                                                // Check for two or more adjacent siblings
                                                                let siblings = [];
                                                                let sibling = hoverElementList[0].nextElementSibling;
                                                                do {
                                                                    // console.log("sibling.tagName = "+sibling.tagName);
                                                                    if (sibling.tagName === afterCombinatorElement.toUpperCase()) {
                                                                        siblings.push(sibling);
                                                                    } else {
                                                                        break;
                                                                    }
                                                                } while ((sibling = sibling.nextElementSibling));
                                                                let siblingCount = siblings.length;
                                                                // console.log("siblingCount = "+siblingCount);
                                                                // JCH TODO: what if sibling count 0
                                                                if (siblingCount === 1) {
                                                                    // console.log("11b. Hover with tilde and one adjacent sibling");
                                                                    adjacentTildeMultipleSibling = true;
                                                                    // console.log("**** REPORT PASS 2 HERE");
                                                                    return RulePass("Pass_2");
                                                                } else if (siblingCount > 1) {
                                                                    // console.log("Main hover with ~ combinator has two or more siblings");
                                                                    if (!potential2) {
                                                                        // console.log("**** PUT POTENTIAL 2 HERE");
                                                                        return RulePotential("Potential_2");
                                                                    }
                                                                }
                                                            }
                                                        } else if (plusCombinator) {
                                                            // supportingHoverElementDisplayValue
                                                            // if we make it to the last rule and supportingHoverElementDisplayValue is still false => potential1
                                                            if (styleRuleIndex2 === styleRules2.length - 1 && supportingHoverElementDisplayValue === false) {
                                                                // console.log("NO plus supportingHoverElementDisplayProperty");
                                                                // console.log("**** PUT POTENTIAL 1 HERE");
                                                                return RulePotential("Potential_1");
                                                            } else {
                                                                continue;
                                                            }
                                                        } else if (tildeCombinator) {
                                                            // if we make it to the last rule and supportingHoverElementDisplayValue is still false => potential2
                                                            if (styleRuleIndex2 === styleRules2.length - 1 && supportingHoverElementDisplayValue === false) {
                                                                // console.log("NO plus supportingHoverElementDisplayProperty");
                                                                // console.log("**** PUT POTENTIAL 2 HERE");
                                                                return RulePotential("Potential_1");
                                                            } else {
                                                                continue;
                                                            }
                                                        }

                                                        // note at least one of the rules must have a display property
                                                    } else if (plusCombinator) {
                                                        // if we make it to the last rule and supportingHoverElementDisplayProperty is still false => potential1
                                                        if (styleRuleIndex2 === styleRules2.length - 1 && supportingHoverElementDisplayProperty === false) {
                                                            // console.log("NO plus supportingHoverElementDisplayProperty");
                                                            // console.log("**** PUT POTENTIAL 1 HERE");
                                                            return RulePotential("Potential_1");
                                                        } else {
                                                            continue;
                                                        }
                                                    } else if (tildeCombinator) {
                                                        // if we make it to the last rule and supportingHoverElementDisplayProperty is still false => potential2
                                                        if (styleRuleIndex2 === styleRules2.length - 1 && supportingHoverElementDisplayProperty === false) {
                                                            // console.log("NO tilde supportingHoverElementDisplayProperty");
                                                            // console.log("**** PUT POTENTIAL 2 HERE");
                                                            return RulePotential("Potential_1");
                                                        } else {
                                                            continue;
                                                        }
                                                    }

                                                    // note at least one of the rules must have a supportingElement:hover
                                                } else if (plusCombinator) {
                                                    // if we make it to the last rule and supportingElement is still false => potential1
                                                    // console.log("styleRuleIndex2 = "+styleRuleIndex2);
                                                    // console.log("styleRules2.length = "+styleRules2.length);
                                                    // console.log("supportingElement = "+supportingHover);
                                                    if (styleRuleIndex2 === styleRules2.length - 1 && supportingHover === false) {
                                                        // console.log("NO plus supportingElement:hover");
                                                        // console.log("**** PUT POTENTIAL 1 HERE");
                                                        return RulePotential("Potential_1");
                                                    } else {
                                                        continue;
                                                    }
                                                } else if (tildeCombinator) {
                                                    // if we make it to the last rule and supportingElement is still false => potential2
                                                    // console.log("styleRuleIndex2 = "+styleRuleIndex2);
                                                    // console.log("styleRules2.length = "+styleRules2.length);
                                                    // console.log("supportingElement = "+supportingHover);
                                                    if (styleRuleIndex2 === styleRules2.length - 1 && supportingHover === false) {
                                                        // console.log("NO tilde supportingElement:hover");
                                                        // console.log("**** PUT POTENTIAL 2 HERE");
                                                        return RulePotential("Potential_2");
                                                    } else {
                                                        continue;
                                                    }
                                                }
                                            } else {
                                                // console.log("There is a margin in the supporting element");
                                                if (!potential3) {
                                                    // console.log("**** PUT POTENTIAL 3 HERE");
                                                    potential3 = true;
                                                    return RulePotential("Potential_3");
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        // Silence css access issues
                                    }
                                }
                        }
                    } catch (e) {
                        // Silence css access issues
                    }
                }
            }
        }
        // console.log("----------------------");
        // console.log("pass0 = "+pass0);
        // console.log("pass1 = "+pass1);
        // console.log("pass2 = "+pass2);
        // console.log("potential1 = "+potential1);
        // console.log("potential2 = "+potential2);
        // console.log("potential3 = "+potential3);
        if (pass0) return RulePass("Pass_0");
        if (pass1) return RulePass("Pass_2");
        if (pass2) return RulePass("Pass_3");
        if (potential1) return RulePotential("Potential_1");
        if (potential2) return RulePotential("Potential_2");
        if (potential3) return RulePotential("Potential_3");
    }
}