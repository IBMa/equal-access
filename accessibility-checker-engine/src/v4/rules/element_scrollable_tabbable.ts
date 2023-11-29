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
import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { VisUtil } from "../../v2/dom/VisUtil";
import { getComputedStyle, getPixelsFromStyle } from "..//util/CSSUtil";

export let element_scrollable_tabbable: Rule = {
    id: "element_scrollable_tabbable",
    context: "dom:*",
    dependencies: [],
    help: {
        "en-US": {
            "group": "element_scrollable_tabbable.html",
            "pass_tabbable": "element_scrollable_tabbable.html",
            "pass_interactive": "element_scrollable_tabbable.html",
            "fail_scrollable": "element_scrollable_tabbable.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Scrollable elements should be tabbable or contain tabbable content",
            "pass_tabbable": "The scrollable element is tabbable",
            "pass_interactive": "The scrollable element has tabbable content",
            "fail_scrollable": "The scrollable element <{0}> with non-interactive content is not tabbable"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        num: ["2.1.1"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: ["0ssw9k"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        //skip the check if the element is hidden or disabled
        if (!VisUtil.isNodeVisible(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip elements
        if (RPTUtil.getAncestor(ruleContext, ["iframe", "svg", "script", "meta"]))
            return null;

        //skip if no visible content
        if (!RPTUtil.hasInnerContent(ruleContext))
            return null;
            
        const nodeName = ruleContext.nodeName.toLowerCase();
        const styles = getComputedStyle(ruleContext);
        // not scrollable, inapplicable
        if ((styles.overflowX === 'visible' || styles.overflowX === 'hidden')
            && (styles.overflowY === 'visible' || styles.overflowY === 'hidden'))
            return null;

        // ignore if the overall scrollable element (clientWidth + scrollbarWidth and clientHeight + scrollbarHeight) is too small to be visible on screen
        if (Math.max(ruleContext.offsetWidth, ruleContext.offsetHeight) < 30 || Math.min(ruleContext.offsetWidth, ruleContext.offsetHeight) < 15)  
           return null; 

        // ignore if both x and y scroll distances < element's horizontal/vertical padding
        const padding_x = getPixelsFromStyle(styles.paddingLeft, ruleContext) + getPixelsFromStyle(styles.paddingRight, ruleContext);
        const padding_y = getPixelsFromStyle(styles.paddingTop, ruleContext) + getPixelsFromStyle(styles.paddingBottom, ruleContext);
        if (ruleContext.scrollWidth -  ruleContext.clientWidth < 1 + padding_x 
            && ruleContext.scrollHeight -  ruleContext.clientHeight < 1+ padding_y)
            return null;
        
        // pass iframe element has a tabindex attribute value that is not negative
        if (ruleContext.hasAttribute("tabindex") && parseInt(ruleContext.getAttribute("tabindex")) >= 0)
            return RulePass("pass_tabbable");

        // check if element content is tabbable
        const count = RPTUtil.getTabbableChildren(ruleContext);
        if (count > 0)
            return RulePass("pass_interactive");

        // ignore in Firefox if no tabindex at all (not tested in embedded or any simulator)
        if (!ruleContext.hasAttribute("tabindex") && navigator.userAgent.indexOf("Firefox") > -1)
            return null;

        return RuleFail("fail_scrollable", [nodeName]);    
    }
}
