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
    import { DOMUtil } from "../../v2/dom/DOMUtil";
    
    export let target_spacing_sufficient: Rule = {
        id: "target_spacing_sufficient",
        context: "dom:*",
        dependencies: [],
        help: {
            "en-US": {
                "group": "target_spacing_sufficient.html",
                "pass": "target_spacing_sufficient.html",
                "potential_obscured": "target_spacing_sufficient.html"
            }
        },
        messages: {
            "en-US": {
                "group": "The target is sufficiently spaced from other targets",
                "pass_spacing": "The target's spacing from other targets is more than minimum",
                "pass_sized": "The target’s size is more than 24 CSS pixels",
                "pass_inline": "The target is in a sentence or its size is otherwise constrained by the line-height of non-target text",
                "pass_default": "The size of the target is determined by the user agent and is not modified by the author",
                "pass": "The element is not entirely covered by other content",
                "violation": "The center of the <0> target is less than 12 CSS pixels from the bounding box (edge) of an adjacent target <1>",
                "potential_overlap": "Ensure the overlapped <0> element meets a minimum target size or has sufficient spacing from the overlapping element"
            }
        },
        rulesets: [{
            id: ["WCAG_2_2"],
            num: ["2.5.8"],
            level: eRulePolicy.VIOLATION,
            toolkitLevel: eToolkitLevel.LEVEL_THREE
        }],
        act: [],
        run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as HTMLElement;
            if (!VisUtil.isNodeVisible(ruleContext) || (!RPTUtil.isTabbable(ruleContext) && !ruleContext .hasAttribute("tabindex")))
                return null;
            
            const nodeName = ruleContext.nodeName.toLocaleLowerCase(); 
              
            //ignore certain elements
            if (RPTUtil.getAncestor(ruleContext, ["pre", "code", "script", "meta"]) !== null 
                || nodeName === "body" || nodeName === "html" )
                return null;
            
            const bounds = context["dom"].bounds;    
            
            //in case the bounds not available
            if (!bounds) return null;
            
            //ignore
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
            if (!zindex || isNaN(Number(zindex)))
                zindex = "0";
            
            var elems = doc.querySelectorAll('body *:not(script)');
            if (!elems || elems.length == 0)
                return;
             
            const mapper : DOMMapper = new DOMMapper();
            let violations = [];
            let before = true;
            for (let i=0; i < elems.length; i++) {
                const elem = elems[i];
                /**
                 *  the nodes returned from querySelectorAll is in document order
                 *  if two elements overlap and z-index are not defined, then the node rendered earlier will be overlaid by the node rendered later
                 */
                if (ruleContext.contains(elem)) {
                    //the next node in elems will be after the target node (ruleContext). 
                    before = false;
                    continue;
                }    
                if (!VisUtil.isNodeVisible(elem) || elem.contains(ruleContext)) continue;

                const bnds = mapper.getBounds(elem);
                if (bnds.height === 0 || bnds.width === 0) continue;

                var zStyle = win.getComputedStyle(elem); 
                let z_index = '0';
                if (zStyle) {
                    z_index = zStyle.zIndex;
                    if (!z_index || isNaN(Number(z_index)))
                        z_index = "0";
                }
                if (bnds.top <= bounds.top && bnds.left <= bounds.left && bnds.top + bnds.height >= bounds.top + bounds.height 
                    && bnds.left + bnds.height >= bounds.left + bounds.width 
                    && (before ? parseInt(zindex) < parseInt(z_index): parseInt(zindex) <= parseInt(z_index)))
                    // if the target is entirely covered: handled by element_tabbable_unobscured
                    continue;

                if (bnds.height !== 0 && bnds.width !== 0  
                    && bnds.top <= bounds.top && bnds.left <= bounds.left && bnds.top + bnds.height >= bounds.top + bounds.height 
                    && bnds.left + bnds.height >= bounds.left + bounds.width 
                    && (before ? parseInt(zindex) < parseInt(z_index): parseInt(zindex) <= parseInt(z_index)))
                    violations.push(elem);   
            }
            
            if (violations.length > 0)
                return RulePotential("potential_obscured", []);
                
            return RulePass("pass");
        }
    }
    