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
import { VisUtil } from "../../v2/dom/VisUtil";
import { getDefinedStyles, getComputedStyle, convertValue2Pixels } from "../util/CSSUtil";

export let text_spacing_valid: Rule = {
    id: "text_spacing_valid",
    context: "dom:*",
    help: {
        "en-US": {
            "pass": "text_spacing_valid.html",
            "group": "text_spacing_valid.html",
            "potential_letter_spacing_style": "text_spacing_valid.html",
            "potential_word_spacing_style": "text_spacing_valid.html",
            "potential_line_height_style": "text_spacing_valid.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "CSS is not used to control letter or word spacing",
            "group": "Use CSS to control letter or word spacing",
            "potential_letter_spacing_style": "Use CSS 'letter-spacing' to control spacing within a word",
            "potential_word_spacing_style": "Use CSS 'word-spacing' to control spacing between words",
            "potential_line_height_style": "Use CSS 'line-spacing' to control spacing between lines"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.4.12"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act:['9e45ec', '24afc2'],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        let nodeName = ruleContext.nodeName.toLowerCase();

        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;

        // Ensure that this element has children with actual text.
        let childStr = "";
        let childNodes = ruleContext.childNodes;
        for (let i = 0; i < childNodes.length; ++i) {
            if (childNodes[i].nodeType == 3) {
                childStr += childNodes[i].nodeValue;
            }
        }
        if (childStr.trim().length == 0)
            return null;

        //font size always resolved to 'px'    
        const font_size_style = getComputedStyle(ruleContext).getPropertyValue('font-size');
        var font_size = parseFloat(font_size_style); 
        //console.log("node=" + nodeName + ", font size style= " + font_size_style + ", font size= " + font_size);
        
        const styles = getDefinedStyles(ruleContext);
        if (Object.keys(styles).length === 0)
            return null;
        
        //note that CSS unit is a requirement for non-zero values, otherwise it's ignored
        let ret = []; 
        // matched string: original style, the style number, and unit
        const regex = /(-?[\d.]+)([a-z%]*)/;
        if (ruleContext.style.getPropertyPriority && ruleContext.style.getPropertyPriority('word-spacing') == 'important') { 
            const word_style = styles['word-spacing'];

            if (word_style) {
                if (word_style === 'initial' || word_style === 'normal' || word_style === 'inherit')
                    ret.push(RulePotential("potential_letter_spacing_style"));
                const wordSpacing = parseFloat(word_style);
                console.log("word style node=" + nodeName + ", font size= " + font_size + ", word style= " + word_style + ", word spacing= " + wordSpacing + ", styles= " + JSON.stringify(styles));
                // ignore 'normal', 'inherit' or other
                if (!isNaN(wordSpacing)) {
                    let parsed = word_style.trim().match(regex);
                    let pixels = convertValue2Pixels(parsed[2], parsed[1], ruleContext);
                    console.log("word node=" + nodeName + ", font size= " + font_size + ", parsed= " + parsed + ", unit= " + parsed[2] + ", value= " + parsed[1] + ", pixels= " + pixels +", ratio= " + pixels/font_size + ", important= " + ruleContext.style.getPropertyPriority('word-spacing'));
                    if (pixels != null && pixels/font_size < 0.16)
                        ret.push(RulePotential("potential_word_spacing_style"));
                }    
            }
        }

        if (ruleContext.style.getPropertyPriority && ruleContext.style.getPropertyPriority('letter-spacing') == 'important') {
            const letter_style = styles['letter-spacing'];
            if (letter_style) {
                if (letter_style === 'initial' || letter_style === 'normal' || letter_style === 'inherit')
                    ret.push(RulePotential("potential_letter_spacing_style"));
                const letterSpacing = parseFloat(letter_style);
                // ignore 'normal', 'inherit' or other
                if (!isNaN(letterSpacing)) {
                    let parsed = letter_style.trim().match(regex);
                    let unit = letter_style.trim().substring(letterSpacing.toString().length);
                    let pixels = convertValue2Pixels(parsed[2], parsed[1], ruleContext);
                    console.log("letter node=" + nodeName + ", font size= " + font_size + ", parsed= " + parsed + ", unit= " + parsed[2] + ", value= " + parsed[1] + ", pixels= " + pixels +", ratio= " + pixels/font_size + ", important= " + ruleContext.style.getPropertyPriority('letter-spacing'));
                    if (pixels != null && pixels/font_size < 0.12)
                         ret.push(RulePotential("potential_letter_spacing_style"));
                }
            }
        }

        if (ruleContext.style.getPropertyPriority && ruleContext.style.getPropertyPriority('line-height') == 'important') {
            const line_style = styles['line-height'];
            if (line_style) {
                if (line_style === 'initial' || line_style === 'normal' || line_style === 'inherit')
                    ret.push(RulePotential("potential_letter_spacing_style"));
                const lineHeight = parseFloat(line_style);
                // ignore 'normal', 'inherit' or other
                if (!isNaN(lineHeight)) {
                    let parsed = line_style.trim().match(regex);
                    let unit = line_style.trim().substring(lineHeight.toString().length);
                    let pixels = convertValue2Pixels(parsed[2], parsed[1], ruleContext);
                    console.log("line node=" + nodeName + ", font size= " + font_size + ", parsed= " + parsed + ", unit= " + parsed[2] + ", value= " + parsed[1] + ", pixels= " + pixels +", ratio= " + pixels/font_size + ", important= " + ruleContext.style.getPropertyPriority('line-height'));
                    if (pixels != null && pixels/font_size < 1.5)
                        ret.push(RulePotential("potential_line_height_style"));
                } 
            }
        }
         
        if (ret.length > 0) 
            return ret;
        return RulePass("pass"); 
    }    
}