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
import { DOMMapper } from "../../v2/dom/DOMMapper";

export let iframe_interactive_tabbable: Rule = {
    id: "iframe_interactive_tabbable",
    context: "dom:iframe",
    dependencies: [],
    help: {
        "en-US": {
            "group": "iframe_interactive_tabbable.html",
            "pass": "iframe_interactive_tabbable.html",
            "fail_invalid": "iframe_interactive_tabbable.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Iframe with interactive content should not be excluded from tab order using tabindex",
            "pass": "The iframe with interactive content is not excluded from the tab order using tabindex",
            "fail_invalid": "The <iframe> with interactive content is excluded from tab order using tabindex"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        num: ["2.1.1"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: ["akn7bn"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;
        
        const mapper : DOMMapper = new DOMMapper();
        const bounds = mapper.getUnadjustedBounds(ruleContext);
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
