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

import { CommonUtil } from "../util/CommonUtil";
import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { CSSUtil } from "../util/CSSUtil";
import { ColorUtil } from "../util/ColorUtil";

export const style_focus_visible: Rule = {
    id: "style_focus_visible",
    context: "dom:*",
    refactor: {
        "RPT_Style_HinderFocus1": {
            "Potential_1": "potential_focus_not_visible"
        }
    },
    help: {
        "en-US": {
            "group": `style_focus_visible.html`,
            "potential_focus_not_visible": `style_focus_visible.html`,
            "pass_focus_visible": `style_focus_visible.html`
        }
    },
    messages: {
        "en-US": {
            "group": "The keyboard focus indicator should be visible when default border or outline is modified by CSS",
            "potential_focus_not_visible": "Check the keyboard focus indicator is visible when using CSS declaration for 'border' or 'outline'",
            "pass_focus_visible": "The keyboard focus indicator is visible or is not changed from the browser default"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "2.4.7", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            skipNodes: {
                value: ["table"],
                type: "[string]"
            },
            checkParams: {
                value: ["border", "border-width", "border-style", 
                        "border-top-width", "border-right-width", "border-bottom-width", "border-left-width", 
                        "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", 
                        "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
                        "outline", "outline-width", "outline-color", "outline-style"],
                type: "[string]"
            }
        }
        const ruleContext = context["dom"].node as HTMLElement;
        if (!CommonUtil.isTabbable(ruleContext) || validateParams.skipNodes.value.includes(ruleContext.nodeName.toLowerCase())) {
            return null;
        }
        let normalStyles = CSSUtil.getDefinedStyles(ruleContext); // consider noth user-defined and browser default
        let focusStyles = []
        focusStyles.push(CSSUtil.getDefinedStyles(ruleContext, ":focus"));
        focusStyles.push(CSSUtil.getDefinedStyles(ruleContext, ":focus-visible"));
        focusStyles.push(CSSUtil.getDefinedStyles(ruleContext, ":focus-within"));
        
        // if focus style is defined
        let styleObj = focusStyles[0];
        if (Object.keys(styleObj).length > 0) {
            //pass if outline is not defined at all, browser will override 
            if (((!normalStyles["outline-width"] && !normalStyles["outline-style"])
                || (normalStyles["outline-width"] === '0px' || normalStyles["outline-style"] === 'none'))
                && (!styleObj["outline-style"] || styleObj["outline-style"] !== 'none'))
                return RulePass("pass_focus_visible");       

            let noneStyle = false;
            let numOtherStyle = 0;
            for (let focusStyle in styleObj) {
                if (validateParams.checkParams.value.includes(focusStyle)) {
                    /**
                     * failure case:  
                     *  1. focus outline or border style is none and no other style (color or width) defined
                     *  2. focus outline or border style is same with the normal
                     *  3. size in focus is same or smaller than default
                     *  4. color contrast in focus is better  
                     */
                    let focusStyleValue = styleObj[focusStyle];
                    let normalStyleValue = normalStyles[focusStyle];
                    if (focusStyle.includes("style")) {
                        if (focusStyleValue === "none") 
                            noneStyle = true;
                        else 
                            noneStyle = false;

                        if (normalStyleValue && focusStyleValue !== "none" && focusStyleValue === normalStyleValue)
                            return RulePotential("potential_focus_not_visible");
                    
                    } else if (focusStyle.includes("width")) {
                        numOtherStyle++;
                        
                        //proximation of the width style
                        if (focusStyleValue === 'initial') focusStyleValue = '2px';
                        else if (focusStyleValue === 'thin') focusStyleValue = '1px';
                        else if (focusStyleValue === 'medium') focusStyleValue = '2px';
                        else if (focusStyleValue === 'thick') focusStyleValue = '3px';  

                        if (normalStyleValue) {
                            if (normalStyleValue === 'initial') normalStyleValue = '2px';
                            else if (normalStyleValue === 'thin') normalStyleValue = '1px';
                            else if (normalStyleValue === 'medium') normalStyleValue = '2px';
                            else if (normalStyleValue === 'thick') normalStyleValue = '3px';  
                        }
                        focusStyleValue = CSSUtil.getPixelsFromStyle(focusStyleValue, ruleContext);
                        normalStyleValue = CSSUtil.getPixelsFromStyle(normalStyleValue, ruleContext);
                        if (focusStyleValue == 0 || focusStyleValue <= normalStyleValue)
                            return RulePotential("potential_focus_not_visible");
                    
                    } else if (focusStyle.includes("color")) {
                        numOtherStyle++;
                        
                        // get the element bg color
                        let colorCombo = ColorUtil.ColorCombo(ruleContext);
                        if (colorCombo === null) continue;
                        let bg = colorCombo.bg;
                        if (!bg) continue;

                        //proximation of the width style
                        if (focusStyleValue === 'initial') focusStyleValue = 'black';
                        if (normalStyleValue && normalStyleValue === 'initial') normalStyleValue = 'black';
                            
                        // get the border/outline color as fg colors
                        focusStyleValue = ColorUtil.Color(focusStyleValue);
                        normalStyleValue = ColorUtil.Color(normalStyleValue);
                        if (focusStyleValue === null || normalStyleValue === null) continue;
                        
                        //get the border/outline color contrast ratios
                        let focusRatio = focusStyleValue.contrastRatio(bg);
                        let normalRatio = normalStyleValue.contrastRatio(bg);
                        if (focusRatio < 3.0 || focusRatio <= normalRatio)
                            return RulePotential("potential_focus_not_visible");
                        
                    } else { 
                        //other
                        numOtherStyle++;
                        if (normalStyleValue != null && focusStyleValue === normalStyleValue)
                            return RulePotential("potential_focus_not_visible");
                    }
                }
            }
            // warn if a border/outline focus style is 'none' and noe other (color and/or width) is defined 
            if (noneStyle && numOtherStyle === 0)
                return RulePotential("potential_focus_not_visible");
        } else {
            // no focus style defined 
            // warn if normal style is defined and is not "none"
            for (let normalStyle in normalStyles) {
                if (validateParams.checkParams.value.includes(normalStyle)) {
                    let normalStyleValue = normalStyles[normalStyle];
                    // ignore if border or outline style is "none" 
                    if (normalStyleValue !== 'none')
                        return RulePotential("potential_focus_not_visible");
                }        
            }
        }   
        return RulePass("pass_focus_visible");
    }
}
