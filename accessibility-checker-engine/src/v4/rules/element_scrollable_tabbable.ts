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
import { getDefinedStyles, getComputedStyle } from "..//util/CSSUtil";

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
        id: ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        num: ["2.1.1"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: ["ossw9k"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        // ignore if it's Firefox, not tested in embedded or any simulator
        if (navigator.userAgent.indexOf("Firefox") > -1)
            return null;

        const ruleContext = context["dom"].node as HTMLElement;
        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip elements
        if (RPTUtil.getAncestor(ruleContext, ["iframe", "svg", "script", "meta"]))
            return null;

        //skip if no visible content
        if (!RPTUtil.hasInnerContent(ruleContext))
            return null;
            
        const nodeName = ruleContext.nodeName.toLowerCase();
        const styles = getComputedStyle(ruleContext);
        if (nodeName === 'section') console.log("node=" + nodeName +", styles=" + JSON.stringify(styles));
        // not scrollable, inapplicable
        if ((styles.overflowX === 'visible' || styles.overflowX === 'hidden')
            && (styles.overflowY === 'visible' || styles.overflowY === 'hidden'))
            return null;

        // ignore if the scrollable element is too small to be visible on screen
        const bounds = context["dom"].bounds;
        //in case the bounds not available
        if (!bounds) return null;
        if (Math.max(bounds['height'], bounds['width']) < 30 || Math.min(bounds['height'], bounds['width']) < 15)  
           return null; 

        // ignore if both x and y scroll distances < 1
        if (nodeName === 'section') console.log("node=" + nodeName +", scrollWidth=" + ruleContext.scrollWidth+", clientWidth=" + ruleContext.clientWidth+", scrollHeight=" + ruleContext.scrollHeight+", clientHeight=" + ruleContext.clientHeight);
        if (ruleContext.scrollWidth -  ruleContext.clientWidth < 1 
            && ruleContext.scrollHeight -  ruleContext.clientHeight < 1)
            return null;
        
        // pass iframe element does not have a tabindex attribute value that is a negative number
        if (ruleContext.hasAttribute("tabindex") && parseInt(ruleContext.getAttribute("tabindex")) >= 0)
            return RulePass("pass_tabbable");

        // check if element content is tabbable
        const count = RPTUtil.getTabbableChildren(ruleContext);
        if (count > 0)
            return RulePass("pass_interactive");

        return RuleFail("fail_scrollable", [nodeName]);    
    }
}
