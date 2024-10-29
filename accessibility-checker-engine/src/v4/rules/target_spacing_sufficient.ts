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
    import { Rule, RuleResult, RuleContext, RulePass, RuleContextHierarchy, RuleFail, RulePotential } from "../api/IRule";
    import { eRulePolicy, eToolkitLevel } from "../api/IRule";
    import { DOMMapper } from "../../v2/dom/DOMMapper";
    import { CSSUtil } from "../util/CSSUtil";
    
    export const target_spacing_sufficient: Rule = {
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
                "violation_spacing": "target_spacing_sufficient.html",
                "recommendation_inline": "target_spacing_sufficient.html",
                "potential_overlap": "target_spacing_sufficient.html"
            }
        },
        messages: {
            "en-US": {
                "group": "The target must be sufficiently sized or spaced from other targets",
                "pass_spacing": "The target's spacing from other targets is sufficient",
                "pass_sized": "The target’s size is more than 24 CSS pixels",
                "pass_inline": "The target is in a sentence or its size is otherwise constrained by the line-height of non-target text",
                "pass_default": "The target's size is determined by the user agent and is not modified by the author",
                "violation_spacing": "Undersized target \"{0}\" does not have sufficient spacing of 12 CSS pixels from another target \"{1}\"",
                "recommendation_inline": "Confirm the inline target \"{0}\" is sufficiently spaced from another inline target \"{1}\"",
                "potential_overlap": "Ensure the overlapped target \"{0}\" meets a minimum target size or has sufficient spacing from the overlapping target \"{1}\""
            }
        },
        rulesets: [{
            id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_2"],
            num: ["2.5.8"],
            level: eRulePolicy.VIOLATION,
            toolkitLevel: eToolkitLevel.LEVEL_THREE,
            reasonCodes: ["pass_spacing","pass_sized", "pass_inline","pass_default", "violation_spacing", "potential_overlap"]
        },
        {
            id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_2"],
            num: ["2.5.8"],
            level: eRulePolicy.RECOMMENDATION,
            toolkitLevel: eToolkitLevel.LEVEL_THREE,
            reasonCodes: ["recommendation_inline"]
        }],
        act: [],
        run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as HTMLElement;
            const nodeName = ruleContext.nodeName.toLocaleLowerCase(); 
            
            const mapper : DOMMapper = new DOMMapper();
            const bounds = mapper.getUnadjustedBounds(ruleContext); //context["dom"].bounds;    
            if (!bounds) 
                return null;
            
            // ignore hidden, non-target
            if (!CommonUtil.isTarget(ruleContext))
                return null;

            if (bounds.height >= 24 && bounds.width >= 24)
                return RulePass("pass_sized"); 

            // check inline element: without text in the same line
            const status = CSSUtil.getInlineStatus(ruleContext);
            if (status === null) return null;
            if (status.inline) {
                if (status.text) {
                    if (status.violation === null)
                        return RulePass("pass_inline");
                    else
                        // case 1: inline element is too close horizontally
                        return RulePotential("recommendation_inline", [nodeName, status.violation]);
                } else {
                    if (status.violation === null)
                        return RulePass("pass_default");
                    else
                        // case 1: inline element is too close horizontally
                        return RulePotential("recommendation_inline", [nodeName, status.violation]);
                }
            } else {
                // ignore browser default
                if (CSSUtil.isTargetBrowserDefault(ruleContext)) 
                    return RulePass("pass_default");
            }

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
            
            //select all elements except itself and descendants
            var elems = doc.querySelectorAll('body *:not(script):not(style)');
            if (!elems || elems.length === 0)
                return;
            
            let before = true;
            let minX = 24;
            let minY = 24;
            let adjacentX = null;
            let adjacentY = null;
            let checked = []; //contains a list of elements that have been checked so their descendants don't need to be checked again
            for (let i=0; i < elems.length; i++) {
                const elem = elems[i] as HTMLElement;
                /**
                 *  the nodes returned from querySelectorAll is in document order
                 *  if two elements overlap and z-index are not defined, then the node rendered earlier will be overlaid by the node rendered later
                 *  filter out the elements that’re descendant or ancestors of the target element, nor descendant of the target element's siblings
                 */
                if (ruleContext.contains(elem)) {
                    //the next node in elems will be after the target node (ruleContext). 
                    before = false;
                    continue;
                }
                // ignore ascendants of the element, not a target, or itself or its ascendant already checked   
                if (elem.contains(ruleContext)  || !CommonUtil.isTarget(elem) 
                   || checked.some(item => item.contains(elem))) 
                    continue;

                const bnds = mapper.getUnadjustedBounds(elem);
                if (!bnds) continue;
                
                var zStyle = getComputedStyle(elem); 
                let z_index = '0';
                if (zStyle) {
                    z_index = zStyle.zIndex;
                    if (!z_index || isNaN(Number(z_index)))
                        z_index = "0";
                }

                // case 2: the element overlaps the target entirely
                // note when a link is inline with other target, if the link text wraps in another line in a given viewport,  
                // the bounds of the link may cover and the entire two lines, causing the other tagets to be overlapped, see two links in the test case: element_inline.html 
                if (bnds.top <= bounds.top && bnds.left <= bounds.left && bnds.top + bnds.height >= bounds.top + bounds.height 
                    && bnds.left + bnds.width >= bounds.left + bounds.width) {
                    // if the target on top    
                    if (before ? parseInt(zindex) < parseInt(z_index): parseInt(zindex) <= parseInt(z_index)) {
                        // the target is entirely covered: tabbable target handled by element_tabbable_unobscured and tabindex=-1 ignored
                        return null;
                    } else
                        return RulePotential("potential_overlap", [nodeName, elem.nodeName.toLowerCase()]);
                } 
                
                // case 3: if the target overlaps the element entirely
                if (bounds.top <= bnds.top && bounds.left <= bnds.left && bounds.top + bounds.height >= bnds.top + bnds.height 
                    && bounds.left + bounds.width >= bnds.left + bnds.width) {
                    // if the element on top    
                    if (before ? parseInt(zindex) < parseInt(z_index): parseInt(zindex) <= parseInt(z_index)) {
                        return RulePotential("potential_overlap", [nodeName, elem.nodeName.toLowerCase()]); 
                    } else // the target on top
                        return RuleFail("violation_spacing", [nodeName, elem.nodeName.toLowerCase()]);     
                }
                
                // case 4: the element overlaps partially with the target
                if ((((bounds.top >= bnds.top && bounds.top <= bnds.top + bnds.height) || (bounds.top + bounds.height <= bnds.top && bounds.top + bounds.height >= bnds.top +bnds.height))
                     && ((bounds.left > bnds.left && bounds.left < bnds.left + bnds.width) || (bnds.left > bounds.left && bnds.left < bounds.left + bounds.width))) 
                     || (((bounds.top > bnds.top && bounds.top < bnds.top + bnds.height) || (bnds.top > bounds.top && bnds.top < bounds.top + bounds.height))
                     && ((bounds.left >= bnds.left && bounds.left <= bnds.left + bnds.width) || (bounds.left + bounds.width >= bnds.left && bounds.left + bounds.width <= bnds.left + bnds.width)))) {
                        // TODO: more check to turn to violation  
                        return RulePotential("potential_overlap", [nodeName, elem.nodeName.toLowerCase()]); 

                } else { // no overlap with the elem, though may overlap withe other elements
                    let disX = 24; 
                    let disY = 24;   
                    // the element is in the horizontally same row with the target
                    if (bounds.width < 24 && ((bounds.top >= bnds.top && bounds.top <= bnds.top + bnds.height) || (bounds.top <= bnds.top && bounds.top + bounds.height > bnds.top)))
                        disX = Math.min( Math.abs(bounds.left - bnds.left), Math.abs(bounds.left - (bnds.left + bnds.width)),  Math.abs(bounds.left + bounds.width - (bnds.left + bnds.width)), Math.abs(bounds.left + bounds.width - bnds.left));
                    
                    // the element is in the vertically same column with the target    
                    if (bounds.height < 24 && ((bounds.left >= bnds.left && bounds.left <= bnds.left + bnds.width) || (bounds.left <= bnds.left && bounds.left + bounds.width > bnds.left)))
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
                checked.push(elem);
            }
            
            // case 5: no overlap + insufficient target size. check spacing    
            if (Math.round(bounds.width/2) + minX < 12 || Math.round(bounds.height/2) + minY < 12) {
                if (Math.round(bounds.width/2) + minX < Math.round(bounds.height/2) + minY)
                    return RuleFail("violation_spacing", [nodeName, adjacentX.nodeName.toLowerCase()]); 
                return RuleFail("violation_spacing", [nodeName, adjacentY.nodeName.toLowerCase()]);
            } else 
                return RulePass("pass_spacing");
        }
    }
    