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

import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { getDefinedStyles, getPixelsFromStyle } from "../util/CSSUtil";
import { ColorUtil } from "../../v2/dom/ColorUtil";

export let style_focus_visible: Rule = {
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
        id: ["IBM_Accessibility", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
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
        if (!RPTUtil.isTabbable(ruleContext) || validateParams.skipNodes.value.includes(ruleContext.nodeName.toLowerCase())) {
            return null;
        }
        let normalStyles = getDefinedStyles(ruleContext); // consider noth user-defined and browser default
        let focusStyles = []
        focusStyles.push(getDefinedStyles(ruleContext, ":focus"));
        focusStyles.push(getDefinedStyles(ruleContext, ":focus-visible"));
        focusStyles.push(getDefinedStyles(ruleContext, ":focus-within"));
        console.log("id=" +ruleContext.getAttribute("id") + ", focusStyles=" + JSON.stringify(focusStyles));
        console.log("id=" +ruleContext.getAttribute("id") + ", definedStyles=" + JSON.stringify(normalStyles));
        
        for (const styleObj of focusStyles) { 
            if (Object.keys(styleObj).length > 0) {  console.log("id=" + ruleContext.getAttribute("id") + ", styleObj=" + JSON.stringify(styleObj));
                let noneStyle = false;
                let numOtherStyle = 0;
                for (let focusStyle in styleObj) {
                    if (validateParams.checkParams.value.includes(focusStyle)) {
                        /**
                         * passing case:  
                         *  1. browser default is not changed (no :focus style defined)
                         *  2. focus outline or border style is none 
                         *  2. size in focus is larger than default
                         *  3. color in focus is changed
                         *  
                         */
                        let focusStyleValue = styleObj[focusStyle];
                        let normalStyleValue = normalStyles[focusStyle];
                        if (focusStyle.includes("style")) { console.log("style id=" + ruleContext.getAttribute("id") + ", focusStyle=" + focusStyle + ", focusStyleValue=" + focusStyleValue +", normalValue=" + normalStyleValue);
                            if (focusStyleValue === "none") 
                                noneStyle = true;
                            else 
                                noneStyle = false;
                            if (normalStyleValue && focusStyleValue !== "none" &&  normalStyleValue !== 'none' && focusStyleValue === normalStyleValue)
                                return RulePotential("potential_focus_not_visible");
                        
                        } else if (focusStyle.includes("width")) {
                            numOtherStyle++;
                            focusStyleValue = getPixelsFromStyle(styleObj[focusStyle], ruleContext);
                            normalStyleValue = getPixelsFromStyle(normalStyles[focusStyle], ruleContext);
                            console.log("id=" + ruleContext.getAttribute("width id") + ", focusStyle=" + focusStyle + ", focusStyleValue=" + focusStyleValue +", normalValue=" + normalStyleValue);
                            if (focusStyleValue !== 0 && normalStyleValue !== 0  && focusStyleValue <= normalStyleValue)
                                return RulePotential("potential_focus_not_visible");
                        
                        } else if (focusStyle.includes("color")) {
                            numOtherStyle++;
                            // get the element bg color
                            let colorCombo = ColorUtil.ColorCombo(ruleContext);
                            if (colorCombo === null) continue;
                            let bg = colorCombo.bg;
                            if (!bg) continue;

                            // get the border/outline color as fg colors
                            focusStyleValue = ColorUtil.Color(styleObj[focusStyle]);
                            normalStyleValue = ColorUtil.Color(normalStyles[focusStyle]);
                            if (focusStyleValue === null || normalStyleValue === null) continue;

                            //get the border/outline color contrast ratios
                            let focusRatio = focusStyleValue.contrastRatio(bg);
                            let normalRatio = normalStyleValue.contrastRatio(bg);
                            console.log("color id=" + ruleContext.getAttribute("id") + ", focusStyleValue=" + JSON.stringify(focusStyleValue) +", normalValue=" + JSON.stringify(normalStyleValue) +", bg="+JSON.stringify(bg) +", focusRatio="+focusRatio +", normalRatio="+ normalRatio);
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
                console.log("style id=" + ruleContext.getAttribute("id") +", noneStyle=" + noneStyle); 
                if (noneStyle && numOtherStyle === 0)
                    return RulePotential("potential_focus_not_visible");
            }    
        }
        
        return RulePass("pass_focus_visible");
    }
}
