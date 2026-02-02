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
import { Rule, RuleResult, RuleContext, RulePass, RuleContextHierarchy, RulePotential } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { VisUtil } from "../util/VisUtil";
import { DOMMapper } from "../../v2/dom/DOMMapper";

export const element_tabbable_unobscured: Rule = {
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
        id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_2"],
        num: ["2.4.11"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;

        // Early exit: check visibility and tabbability first
        if (!VisUtil.isNodeVisible(ruleContext) || !CommonUtil.isTabbable(ruleContext))
            return null;
        
        const nodeName = ruleContext.nodeName.toLocaleLowerCase();
          
        // Early exit: ignore certain elements
        if (CommonUtil.getAncestor(ruleContext, ["pre", "code", "script", "meta"]) !== null
            || nodeName === "body" || nodeName === "html")
            return null;
        
        const doc = ruleContext.ownerDocument;
        if (!doc) return null;
        
        const win = doc.defaultView;
        if (!win) return null;
        
        // Reuse single DOMMapper instance
        const mapper: DOMMapper = new DOMMapper();
        const bounds = mapper.getUnadjustedBounds(ruleContext);
        
        // Early exit: bounds not available or element has no dimensions
        if (!bounds || bounds.height === 0 || bounds.width === 0)
            return null;
        
        const cStyle = win.getComputedStyle(ruleContext);
        if (!cStyle) return null;
        
        // Parse z-index once and cache
        const zindex = parseInt(cStyle.zIndex === 'auto' || !cStyle.zIndex ? '0' : cStyle.zIndex);
        
        // More specific selector to reduce iteration
        const elems = doc.querySelectorAll('body *:not(script):not(style):not(meta):not(link)');
        if (!elems || elems.length === 0)
            return null;
         
        let before = true;
        const boundsRight = bounds.left + bounds.width;
        const boundsBottom = bounds.top + bounds.height;
        
        // Check for obscuring elements
        for (let i = 0; i < elems.length; i++) {
            const elem = elems[i];
            
            /**
             * The nodes returned from querySelectorAll are in document order.
             * If two elements overlap and z-index are not defined, then the node
             * rendered earlier will be overlaid by the node rendered later.
             */
            // Use compareDocumentPosition to check containment relationships
            const position = ruleContext.compareDocumentPosition(elem);
            
            // DOCUMENT_POSITION_CONTAINED_BY (16): elem is contained by ruleContext
            if (position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                // The next node in elems will be after the target node (ruleContext)
                before = false;
                continue;
            }
            
            // DOCUMENT_POSITION_CONTAINS (8): elem contains ruleContext
            // Skip if element contains ruleContext or is not visible
            if ((position & Node.DOCUMENT_POSITION_CONTAINS) || !VisUtil.isNodeVisible(elem))
                continue;
            
            const bnds = mapper.getUnadjustedBounds(elem);
            
            // Skip if no bounds or zero dimensions
            if (!bnds || bnds.height === 0 || bnds.width === 0)
                continue;
            
            // Quick bounds check: does elem completely cover ruleContext?
            if (bnds.top > bounds.top || bnds.left > bounds.left)
                continue;
            
            const bndsRight = bnds.left + bnds.width;
            const bndsBottom = bnds.top + bnds.height;
            
            if (bndsRight < boundsRight || bndsBottom < boundsBottom)
                continue;
            
            // Check z-index to determine if elem obscures ruleContext
            const zStyle = win.getComputedStyle(elem);
            if (!zStyle) continue;
            
            const elemZindex = parseInt(zStyle.zIndex === 'auto' || !zStyle.zIndex || isNaN(Number(zStyle.zIndex)) ? '0' : zStyle.zIndex);
            
            // If before ruleContext in DOM order, elem must have higher z-index to obscure
            // If after ruleContext in DOM order, elem can obscure with equal or higher z-index
            if ((before && elemZindex > zindex) || (!before && elemZindex >= zindex)) {
                return RulePotential("potential_obscured", []);
            }
        }
        
        return RulePass("pass");
    }
}
