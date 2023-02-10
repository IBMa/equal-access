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

export let element_scrollable_tabbable: Rule = {
    id: "element_scrollable_tabbable",
    context: "dom:*",
    dependencies: [],
    help: {
        "en-US": {
            "group": "element_scrollable_tabbable.html",
            "pass": "element_scrollable_tabbable.html",
            "fail_invalid": "element_scrollable_tabbable.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Scrollable elements should be tabbable or contain tabbable content",
            "pass_tabbable": "The scrollable element is tabbable",
            "pass_interactivecontent": "The scrollable element has tabbable content",
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
        const ruleContext = context["dom"].node as HTMLElement;
        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;
        
        const bounds = context["dom"].bounds;
        //in case the bounds not available
        if (!bounds) return null;
        
        // ignore if iframe is too small to be visible on screen
        if (Math.max(bounds['height'], bounds['width']) < 30 || Math.min(bounds['height'], bounds['width']) < 15)  
           return null; 

        // pass iframe element does not have a tabindex attribute value that is a negative number
        if (!ruleContext.hasAttribute("tabindex") || parseInt(ruleContext.getAttribute("tabindex")) >= 0)
            return RulePass("pass");

        // check iframe content
        const iframElem = ruleContext as HTMLIFrameElement;
        if (!iframElem || !iframElem.contentDocument || !iframElem.contentDocument.documentElement)
            return null;

        const count = RPTUtil.getTabbableChildren(ruleContext);
        if (count > 0)
            return RuleFail("fail_invalid");

        return null;    
    }
}
