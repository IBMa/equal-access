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
import { Rule, RuleResult, RuleContext, RulePass, RuleContextHierarchy, RulePotential } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { VisUtil } from "../../v2/dom/VisUtil";
import { DOMMapper } from "../../v2/dom/DOMMapper";

export let element_tabbable_unobscured: Rule = {
    id: "element_tabbable_unobscured",
    context: "dom:*",
    dependencies: [],
    help: {
        "en-US": {
            "group": "element_tabbable_unobscured.html",
            "pass": "element_tabbable_unobscured.html",
            "potential_obscured": "element_tabbable_unobscured.html"
        }
    },
    messages: {
        "en-US": {
            "group": "When an element receives focus, it is not entirely covered by other content",
            "pass": "The element is not entirely covered by other content",
            "potential_obscured": "Confirm that when the element receives focus, it is not covered or, if covered by user action, can be uncovered without moving focus"
        }
    },
    rulesets: [{
        id: ["WCAG_2_2"],
        num: ["2.4.11"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        if (!VisUtil.isNodeVisible(ruleContext) || (!RPTUtil.isTabbable(ruleContext) && (!ruleContext .hasAttribute("tabindex")|| parseInt(ruleContext.getAttribute("tabindex")) < 0)))
            return null;
        
        const nodeName = ruleContext.nodeName.toLocaleLowerCase(); 
            
        //ignore certain elements
        if (RPTUtil.getAncestor(ruleContext, ["pre", "code", "script", "meta"]) !== null 
            || nodeName === "body" || nodeName === "html" )
            return null;
        
        const bounds = context["dom"].bounds;    
        
        //in case the bounds not available
        if (!bounds) return null;
        
        //ignore if offscreen
        if (bounds['height'] === 0 || bounds['width'] === 0 ) 
            return null;

        var doc = ruleContext.ownerDocument;
        if (!doc) {
            return null;
        }
        var win = doc.defaultView;
        if (!win) {
            return null;
        }

        var cStyle = win.getComputedStyle(ruleContext);
        if (cStyle === null) 
            return null;
        
        let zindex = cStyle.zIndex;   
        if (!zindex || zindex === 'auto')
            zindex = "0";

        const ancestors = RPTUtil.getAncestorNames(ruleContext);
        let ignoreList = nodeName +' *, ' + nodeName +', script';
        if (ancestors) {
            ancestors.forEach(ancestor=> {
                if (!["html", "body"].includes(ancestor))
                    ignoreList += ", " + ancestor;
            });
        }
        var elems = doc.querySelectorAll('body *:not(' + ignoreList +')');
        if (!elems || elems.length == 0)
            return;

        const mapper : DOMMapper = new DOMMapper();
        let violations = []; 
        elems.forEach(elem => {
            // Skip hidden
            if (VisUtil.isNodeVisible(elem)) {
                const bnds = mapper.getBounds(elem);
                var zStyle = win.getComputedStyle(elem);
                let z_index = "0";
                if (zStyle !== null) {
                    z_index = zStyle.zIndex;   
                    if (!z_index || z_index === 'auto')
                        z_index = "0";
                }
                if (bnds.height !== 0 && bnds.width !== 0  
                    && bnds.top <= bounds.top && bnds.left <= bounds.left && bnds.top + bnds.height >= bounds.top + bounds.height 
                    && bnds.left + bnds.height >= bounds.left + bounds.width && parseInt(zindex) <= parseInt(z_index))
                    violations.push(elem); 
            }    
        });
        
        if (violations.length > 0)
            return RulePotential("potential_obscured", []);
            
        return RulePass("pass");
    }
}
