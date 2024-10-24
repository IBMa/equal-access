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
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";

import { CacheUtil } from "../util/CacheUtil";
import { VisUtil } from "../util/VisUtil";

export const widget_tabbable_single: Rule = {
    id: "widget_tabbable_single",
    context: "aria:button,aria:link,aria:menuitem,aria:spinbutton,aria:tablist,aria:combobox,aria:listbox,aria:menu,aria:radiogroup,aria:tree,aria:checkbox,aria:option,aria:radio,aria:slider,aria:spinbutton,aria:textbox,aria:columnheader,aria:rowheader,aria:slider,aria:tab",
    refactor: {
        "IBMA_Focus_MultiTab": {
            "pass": "pass",
            "potential_multiple_tabbable": "potential_multiple_tabbable"
        }
    },
    help: {
        "en-US": {
            "pass": "widget_tabbable_single.html",
            "potential_multiple_tabbable": "widget_tabbable_single.html",
            "group": "widget_tabbable_single.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Components with a widget role should have no more than one tabbable element",
            "potential_multiple_tabbable": "Component with \"{0}\" role has more than one tabbable element",
            "group": "Components with a widget role must have no more than one tabbable element"
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
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || CommonUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip the check if the element should be a presentational child of an element
        if (AriaUtil.shouldBePresentationalChild(ruleContext))
            return;
        
        let role = ARIAMapper.nodeToRole(ruleContext);
        let count = 0;
        if (CommonUtil.isTabbable(ruleContext)) {
            ++count;
        }
        // If node has children, look for tab stops in the children
        //skip the count if the element requires presentational children only
        let name = [];
        if (count < 2 && !AriaUtil.containsPresentationalChildrenOnly(ruleContext) && ruleContext.firstChild) {
            //let nw = new NodeWalker(ruleContext);
            let nw = new DOMWalker(ruleContext);
            while (count < 2 && nw.nextNode() && nw.node != ruleContext) {
                if (nw.node.nodeType == 1 && !nw.bEndTag && CommonUtil.isTabbable(nw.node)) {
                    // Radio inputs with the same name natively are only one tab stop
                    if (nw.node.nodeName.toLowerCase() === 'input' && (nw.node as Element).getAttribute("type") === 'radio') {
                        let curName = (nw.node as Element).getAttribute("name");
                        if (name.includes(curName)) 
                            continue;
                        else
                            name.push(curName);
                    }
                    ++count;
                }
            }
        }
        let passed = count < 2;
        if (!passed)
            CacheUtil.setCache(ruleContext, "widget_tabbable_single", "potential_multiple_tabbable");
        return passed ? RulePass("pass") : RulePotential("potential_multiple_tabbable", [role]);
    }
}
