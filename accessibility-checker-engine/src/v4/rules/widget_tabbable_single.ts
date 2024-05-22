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

import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { setCache } from "../util/CacheUtil";
import { VisUtil } from "../../v2/dom/VisUtil";

export let widget_tabbable_single: Rule = {
    id: "widget_tabbable_single",
    context: "aria:button,aria:link,aria:menuitem,aria:spinbutton,aria:tablist,aria:combobox,aria:listbox,aria:menu,aria:radiogroup,aria:tree,aria:checkbox,aria:option,aria:radio,aria:slider,aria:spinbutton,aria:textbox,aria:columnheader,aria:rowheader,aria:slider,aria:tab",
    refactor: {
        "IBMA_Focus_MultiTab": {
            "pass": "pass",
            "fail_multiple_tabbable": "fail_multiple_tabbable"
        }
    },
    help: {
        "en-US": {
            "pass": "widget_tabbable_single.html",
            "fail_multiple_tabbable": "widget_tabbable_single.html",
            "group": "widget_tabbable_single.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "fail_multiple_tabbable": "Component with \"{0}\" role has more than one tabbable element",
            "group": "Certain components must have no more than one tabbable element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.1.1", "2.4.3"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        
        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip the check if the element should be a presentational child of an element
        if (RPTUtil.shouldBePresentationalChild(ruleContext))
            return;
        
        let role = ARIAMapper.nodeToRole(ruleContext);
        let count = 0;
        if (RPTUtil.isTabbable(ruleContext)) {
            ++count;
        }
        // If node has children, look for tab stops in the children
        //skip the count if the element requires presentational children only
        if (count < 2 && !RPTUtil.containsPresentationalChildrenOnly(ruleContext) && ruleContext.firstChild) {
            let nw = new NodeWalker(ruleContext);
            while (count < 2 && nw.nextNode() && nw.node != ruleContext) {
                if (nw.node.nodeType == 1 && !nw.bEndTag && RPTUtil.isTabbable(nw.node)) {
                    ++count;
                }
            }
        }
        let passed = count < 2;
        if (!passed)
            setCache(ruleContext, "widget_tabbable_single", "fail_multiple_tabbable");
        return passed ? RulePass("pass") : RulePotential("fail_multiple_tabbable", [role]);
    }
}
