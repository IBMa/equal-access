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
import { CSSUtil } from "../util/CSSUtil";
import { Rule, RuleResult, RuleContext, RulePass, RuleContextHierarchy, RulePotential } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { DOMMapper } from "../../v2/dom/DOMMapper";

export let element_tabbable_visible: Rule = {
    id: "element_tabbable_visible",
    context: "dom:*",
    dependencies: [],
    help: {
        "en-US": {
            "group": "element_tabbable_visible.html",
            "pass": "element_tabbable_visible.html",
            "potential_visible": "element_tabbable_visible.html"
        }
    },
    messages: {
        "en-US": {
            "group": "A tabbable element should be visible on the screen when it has keyboard focus",
            "pass": "The tabbable element is visible on the screen",
            "potential_visible": "Confirm the element should be tabbable and if so, it becomes visible when it has keyboard focus"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        num: ["2.4.7"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        if (!RPTUtil.isTabbable(ruleContext))
            return null;
        
        const nodeName = ruleContext.nodeName.toLocaleLowerCase(); 
        const mapper : DOMMapper = new DOMMapper();
        const bounds = mapper.getUnadjustedBounds(ruleContext);
        
        //in case the bounds not available
        if (!bounds) return null;
        
        // defined styles only give the styles that changed
        const defined_styles = CSSUtil.getDefinedStyles(ruleContext);
        const onfocus_styles = CSSUtil.getDefinedStyles(ruleContext, ":focus");
                
        if (bounds['height'] === 0 || bounds['width'] === 0)
            return RulePotential("potential_visible", []);

        if (defined_styles['position']==='absolute' && defined_styles['clip'] && defined_styles['clip'].replaceAll(' ', '')==='rect(0px,0px,0px,0px)'
            && !onfocus_styles['clip']) {
            /** 
             * note that A user can select a checkbox and radio button by selecting the button or the label text. 
             * When a checkbox or radio button is clipped to 0 size, it is still available to a keyboard or a screen reader. 
             * The rule should be passed if the label text exists and the button on-focus style is defined by the user, 
             * which likely incurs the changes of the label style.   
             */ 
            if (nodeName === 'input' && (ruleContext.getAttribute('type')==='checkbox' || ruleContext.getAttribute('type')==='radio')) {
                const label = RPTUtil.getLabelForElement(ruleContext);
                if (label && !RPTUtil.isInnerTextEmpty(label)) {
                    const focus_styles = CSSUtil.getDefinedStyles(ruleContext, ":focus");
                    const focus_visible_styles = CSSUtil.getDefinedStyles(ruleContext, ":focus-visible");
                    const focus_within_styles = CSSUtil.getDefinedStyles(ruleContext, ":focus-within");
                    const checked_styles = CSSUtil.getDefinedStyles(ruleContext, ":checked");
                    
                    if (focus_styles || focus_visible_styles || focus_within_styles || checked_styles)
                        return RulePass("pass");
                }     
            }    
            return RulePotential("potential_visible", []);
        }    

        if (bounds['top'] >= 0 && bounds['left'] >= 0)
            return RulePass("pass");
        
        const default_styles = getComputedStyle(ruleContext);
        
        let top = bounds['top'];
        let left = bounds['left'];     
       
        if (Object.keys(onfocus_styles).length === 0 ) {
            // no onfocus position change, but could be changed from js 
            return RulePotential("potential_visible", []);
        } else {   
            // with onfocus position change
            var positions = ['absolute', 'fixed'];
            if (typeof onfocus_styles['top'] !== 'undefined') {
                if (positions.includes(onfocus_styles['position']) || (typeof onfocus_styles['position'] === 'undefined' && positions.includes(default_styles['position']))) {
                    top = onfocus_styles['top'].replace(/\D/g,'');
                } else { 
                    // the position is undefined and the parent's position is 'relative'
                    top = Number.MIN_VALUE;   
                }     
            } 
            if (typeof onfocus_styles['left'] !== 'undefined') {
                if (positions.includes(onfocus_styles['position']) || (typeof onfocus_styles['position'] === 'undefined' && positions.includes(default_styles['position']))) {
                    left = onfocus_styles['left'].replace(/\D/g,'');
                } else { 
                    // the position is undefined and the parent's position is 'relative'
                    left = Number.MIN_VALUE;   
                }     
            }    
        }
        
        if (top >= 0 && left >= 0)
            return RulePass("pass");
        else
            return RulePotential("potential_visible", []);
    }
}
