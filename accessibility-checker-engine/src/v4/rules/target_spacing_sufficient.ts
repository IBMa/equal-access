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
    import { Rule, RuleResult, RuleContext, RulePass, RuleContextHierarchy, RuleFail, RulePotential } from "../api/IRule";
    import { eRulePolicy, eToolkitLevel } from "../api/IRule";
    import { VisUtil } from "../../v2/dom/VisUtil";
    import { DOMMapper } from "../../v2/dom/DOMMapper";
    import { getComputedStyle } from "../util/CSSUtil";
    
    export let target_spacing_sufficient: Rule = {
        id: "target_spacing_sufficient",
        context: "dom:*",
        dependencies: [],
        help: {
            "en-US": {
                "group": "target_spacing_sufficient.html",
                "pass_spacing": "target_spacing_sufficient.html",
                "pass_sized": "target_spacing_sufficient.html",
                "pass_inline": "target_spacing_sufficient.html",
                "pass_default": "target_spacing_sufficient.html",
                "violation": "target_spacing_sufficient.html",
                "potential_overlap": "target_spacing_sufficient.html"
            }
        },
        messages: {
            "en-US": {
                "group": "The target is sufficiently spaced from other targets",
                "pass_spacing": "The target's spacing from other targets is more than minimum",
                "pass_sized": "The target’s size is more than 24 CSS pixels",
                "pass_inline": "The target is in a sentence or its size is otherwise constrained by the line-height of non-target text",
                "pass_default": "The size of the target is determined by the user agent and is not modified by the author",
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
            const nodeName = ruleContext.nodeName.toLocaleLowerCase(); 
            //ignore certain elements
            if (RPTUtil.getAncestor(ruleContext, ["pre", "code", "script", "meta", 'head']) !== null 
                || nodeName === "body" || nodeName === "html" )
                return null;
            
            // ignore hidden, non-target, or inline element without text in the same line
            if (!VisUtil.isNodeVisible(ruleContext) || !RPTUtil.isTarget(ruleContext))
                return null;

            console.log("node=" + nodeName +", id=" + ruleContext.getAttribute('id') +", inline=" +RPTUtil.isInline(ruleContext));
            if (RPTUtil.isInline(ruleContext))
                return RulePass("pass_inline");   
            
            const bounds = context["dom"].bounds;    
            if (!bounds || bounds['height'] === 0 || bounds['width'] === 0 ) 
                return null;
    
            var doc = ruleContext.ownerDocument;
            if (!doc) {
                return null;
            }
            
            var cStyle = getComputedStyle(ruleContext);
            if (cStyle === null) 
                return null;
            
            let zindex = cStyle.zIndex;   
            if (!zindex || isNaN(Number(zindex)))
                zindex = "0";
            
            var elems = doc.querySelectorAll('body *:not(script)');
            if (!elems || elems.length == 0)
                return;
             
            const mapper : DOMMapper = new DOMMapper();
            let before = true;
            let minX = 24;
            let minY = 24;
            let adjacentX = null;
            let adjacentY = null;
            for (let i=0; i < elems.length; i++) {
                const elem = elems[i] as HTMLElement;
                /**
                 *  the nodes returned from querySelectorAll is in document order
                 *  if two elements overlap and z-index are not defined, then the node rendered earlier will be overlaid by the node rendered later
                 *  filter out the elements that’re descendant or ancestors of the target element<X>
                 */
                if (ruleContext.contains(elem)) {
                    //the next node in elems will be after the target node (ruleContext). 
                    before = false;
                    continue;
                }    
                if (!VisUtil.isNodeVisible(elem) || !RPTUtil.isTarget(elem) || elem.contains(ruleContext)) continue;

                const bnds = mapper.getBounds(elem);
                if (bnds.height === 0 || bnds.width === 0) continue;

                var zStyle = getComputedStyle(elem); 
                let z_index = '0';
                if (zStyle) {
                    z_index = zStyle.zIndex;
                    if (!z_index || isNaN(Number(z_index)))
                        z_index = "0";
                }

                // ignore if the target is entirely covered: tabbable target handled by element_tabbable_unobscured and tabindex=-1 ignored
                if (bnds.top <= bounds.top && bnds.left <= bounds.left && bnds.top + bnds.height >= bounds.top + bounds.height 
                    && bnds.left + bnds.height >= bounds.left + bounds.width) 
                    if (before ? parseInt(zindex) < parseInt(z_index): parseInt(zindex) <= parseInt(z_index))
                        return null;
                    else {
                        if (bnds.height >= 24 && bnds.width >= 24)
                            return RulePass("pass_sized");  
                        return RuleFail("violation", [nodeName, elem.nodeName.toLowerCase()]);     
                    }
                
                // the element overlaps with target
                if (((bounds.top >= bnds.top && bounds.top <= bnds.top + bnds.height) || (bounds.top <= bnds.top && bounds.top + bounds.height > bnds.top))
                   && ((bounds.left >= bnds.left && bounds.left <= bnds.left + bnds.width) || (bounds.left <= bnds.left && bounds.left + bounds.width > bnds.left)))
                      return null;

                else { // no overlap
                    if (bnds.height >= 24 && bnds.width >= 24)
                        return RulePass("pass_sized"); 

                    // the element is in the horizontally same row 
                    let disX = 24; 
                    let disY = 24;   
                    if ((bounds.top >= bnds.top && bounds.top <= bnds.top + bnds.height) || (bounds.top <= bnds.top && bounds.top + bounds.height > bnds.top))
                        disX = Math.min( Math.abs(bounds.left - bnds.left), Math.abs(bounds.left - (bnds.left + bnds.width)),  Math.abs(bounds.left + bounds.width - (bnds.left + bnds.width)), Math.abs(bounds.left + bounds.width - bnds.left));
                    
                    // the element is in the horizontally same column     
                    if ((bounds.left >= bnds.left && bounds.left <= bnds.left + bnds.width) || (bounds.left <= bnds.left && bounds.left + bounds.width > bnds.left))
                        disY = Math.min(Math.abs(bounds.top - bnds.top), Math.abs(bounds.top - (bnds.top + bnds.height)),  Math.abs(bounds.top + bounds.height - (bnds.top + bnds.height)), Math.abs(bounds.top + bounds.height - bnds.top));
                    
                    if (disX < minX) {
                        minX = disX;
                        adjacentX = elem;
                    }    
                    if (disY < minY) {
                        minY = disY;   
                        adjacentY = elem;
                    }    

                }
            }
            
            if (Math.round(bounds.width/2) + minX < 12 || Math.round(bounds.height/2) + minY < 12) {
                if (Math.round(bounds.width/2) + minX < Math.round(bounds.height/2) + minY)
                    return RuleFail("violation", [nodeName, adjacentX.nodeName.toLowerCase()]); 
                return RuleFail("violation", [nodeName, adjacentY.nodeName.toLowerCase()]);
            }
                //if (bounds.top <= bnds.top && bounds.top + bounds.height >= bnds.top || bounds.top <= bnds.top+ bounds.height && bounds.top + bounds.height >= bnds.top + bnds.height)

                
                //minX = min(minX, min( abs(bounds.left - bnds.left), abs(bounds.left - bnds.right),  abs(bounds.right - bnds.right), abs(bounds.right - bnds.left))

                //if (bounds.left <= bnds.left && bounds.left+bounds.width >= bnds.left+bnds.width || bounds.left <= bnds.left + bnds.width && bounds.left + bounds.width >= bnds.right)

                //minY = min(minY, min(abs(bounds.top - bnds.top), abs(bounds.top - bnds.bottom),  abs(bounds.bottom - bnds.bottom), abs(bounds.bottom - bnds.top)))

                

                // if the target is on top of an overlapping elements    
                /**
                if (bnds.height !== 0 && bnds.width !== 0  
                    && bnds.top <= bounds.top && bnds.left <= bounds.left && bnds.top + bnds.height >= bounds.top + bounds.height 
                    && bnds.left + bnds.height >= bounds.left + bounds.width 
                    && (before ? parseInt(zindex) < parseInt(z_index): parseInt(zindex) <= parseInt(z_index)))
                    violations.push(elem);   
                 */    
            
            return RulePass("pass_spacing");
        }
    }
    