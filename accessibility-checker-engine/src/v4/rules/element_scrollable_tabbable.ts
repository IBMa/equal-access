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
import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { VisUtil } from "../util/VisUtil";
import { AriaUtil } from "../util/AriaUtil";

export const element_scrollable_tabbable: Rule = {
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
    /**
     * deprecated on 6/10/2025 due to Browser support for auto-focus of a scrollable element 
     * rulesets: [{
        id: ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        num: ["2.1.1"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],*/
    rulesets: [],
    act: ["0ssw9k"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        //skip the check if the element is hidden or disabled
        if (!VisUtil.isNodeVisible(ruleContext) || CommonUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip elements
        if (CommonUtil.getAncestor(ruleContext, ["iframe", "svg", "script", "meta", "style"]))
            return null;

        //skip if no visible content
        if (!CommonUtil.hasInnerContent(ruleContext))
            return null;
            
        // ignore if the element's navigation is controlled or owned by another element
        if (AriaUtil.isNavigationOwnedOrControlled(ruleContext))
            return null;  

        // ignore if the element is not scrollable or content withouting needing a scroll
        if (!VisUtil.isElementScrollable(ruleContext))
            return null;

        // pass if element is tabbable
        if (CommonUtil.isTabbable(ruleContext))
            return RulePass("pass_tabbable");

        // check if element content is tabbable
        const count = CommonUtil.getTabbableChildren(ruleContext);
        if (count > 0)
            return RulePass("pass_interactive");

        // ignore in Firefox if no tabindex at all (not tested in embedded or any simulator)
        if (!ruleContext.hasAttribute("tabindex") && navigator.userAgent.indexOf("Firefox") > -1)
            return null;

        return RuleFail("fail_scrollable", [ruleContext.nodeName.toLowerCase()]);    
    }
}
