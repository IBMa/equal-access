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
import { getDefinedStyles, getComputedStyle } from "../../v4/util/CSSUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy, RulePotential } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let element_tabbable_off_screen: Rule = {
    id: "element_tabbable_off_screen",
    context: "dom:*",
    dependencies: [],
    help: {
        "en-US": {
            "group": "element_tabbable_off_screen.html",
            "pass": "element_tabbable_off_screen.html",
            "fail_off": "element_tabbable_off_screen.html",
            "potential_off": "element_tabbable_off_screen.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Tabbable element should be on the screen",
            "pass": "Tabbable element is on the screen",
            "fail_off": "The tabbable element <{0}> is off the screen",
            "potential_off": "Confirm that the tabbable element <{0}> is on the screen when it receives focus"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        num: ["2.4.7"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        if (!RPTUtil.isTabbable(ruleContext))
            return null;
        /**
         * If the element has a positive top and left bounding box, Pass
         * If the element has a :focus style that moves it, Potential. For 2, if it can be determined 
         *     that it moves it on screen (e.g., it was -5 left, and the difference between non-focus and focus is more than 5, maybe we can pass).
         * If the element has a negative top or negative left, and the :focus styles don’t change that, Fail.
         */
        
        const bounds = context["dom"].bounds;
        //in case the bounds not available
        if (!bounds) return null;
        console.log("node=" + ruleContext.nodeName + ", bounds=" + JSON.stringify(bounds));
        const default_styles = getComputedStyle(ruleContext);
        console.log("node=" + ruleContext.nodeName + ", default_styles left =" + default_styles['left']
             +  ", default_styles top =" + default_styles['top']
             +  ", default_styles position =" + default_styles['position']);

        const onfocus_styles = getDefinedStyles(ruleContext, ":focus");
        console.log("node=" + ruleContext.nodeName + ", onfocus_styles=" + JSON.stringify(onfocus_styles));
        console.log("node=" + ruleContext.nodeName + ", onfocus_styles left =" + onfocus_styles['left']
             +  ", onfocus_styles top =" + onfocus_styles['top']
             +  ", onfocus_styles position =" + onfocus_styles['position']);
        
        let top = bounds['top'];
        let left = bounds['left'];     
        if (Object.keys(onfocus_styles).length > 0 ) { 
            if (onfocus_styles['top'] !== 'undefined') { console.log(onfocus_styles['position'] +", " + default_styles['position'] );
                if (onfocus_styles['position'] === 'absolute' || (onfocus_styles['position'] === 'undefined' && default_styles['position'] === 'absolute'))
                    top = onfocus_styles['top'];
                else { 
                    // the position is undefined and the parent's position is 'relative'
                    top = Number.MIN_VALUE;   
                }     
            } 
            if (onfocus_styles['left'] !== 'undefined') {
                if (onfocus_styles['position'] === 'absolute' || (onfocus_styles['position'] === 'undefined' && default_styles['position'] === 'absolute'))
                    left = onfocus_styles['left'];
                else { 
                    // the position is undefined and the parent's position is 'relative'
                    left = Number.MIN_VALUE;   
                }     
            }    
        }
        console.log('left=' + left +", top=" + top);
        if (top === Number.MIN_VALUE || left === Number.MIN_VALUE)
            return RulePotential("potential_off");

        else if (top > 0 && left > 0)
            return RulePass("pass");
        
        return RuleFail("fail_off", [ruleContext.nodeName.toLowerCase()]);

    }
}
