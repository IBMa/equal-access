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
import { VisUtil } from "../../v2/dom/VisUtil";

export let widget_tabbable_exists: Rule = {
    id: "widget_tabbable_exists",
    context: "aria:button,aria:link,aria:spinbutton,aria:tablist,aria:combobox,aria:listbox,aria:menu,aria:radiogroup,aria:tree,aria:menubar, aria:grid, aria:treegrid, aria:checkbox,aria:slider,aria:spinbutton,aria:textbox,aria:scrollbar,aria:slider,aria:spinbutton",
    refactor: {
        "IBMA_Focus_Tabbable": {
            "pass": "pass",
            "fail_no_tabbable": "fail_no_tabbable"}
    },
    help: {
        "en-US": {
            "pass": "widget_tabbable_exists.html",
            "fail_no_tabbable": "widget_tabbable_exists.html",
            "group": "widget_tabbable_exists.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "fail_no_tabbable": "Component with \"{0}\" role does not have a tabbable element",
            "group": "Component must have at least one tabbable element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.1.1"],
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
        
        let nodeName = ruleContext.nodeName.toLowerCase();
        //ignore datalist element check since it will be part of a input element or hidden by default
        if (nodeName === 'datalist')
            return null;
            
        // Composite user interface widget roles. They act as containers that manage other, contained widgets.
        let roleContainers = ["combobox", "grid", "listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"];
        for (const role of roleContainers) {
            if (RPTUtil.getAncestorWithRole(ruleContext, role, true) != null) 
                // it's a descendant of a composite widget already examined
                return null;
        }    
        let role = ARIAMapper.nodeToRole(ruleContext);
        let count = 0;
        if (RPTUtil.isTabbable(ruleContext)) {
            ++count;
        }
        // If node has children, look for tab stops in the children
        // skip the count if the element requires presentational children only
        if (count < 1 && !RPTUtil.containsPresentationalChildrenOnly(ruleContext) && ruleContext.firstChild) {
            let nw = new NodeWalker(ruleContext);
            while (count < 1 && nw.nextNode() && nw.node != ruleContext) {
                if (nw.node.nodeType == 1 && !nw.bEndTag && RPTUtil.isTabbable(nw.node)) {
                    ++count;
                }
            }
        }
        let passed = count >= 1;
        return passed ? RulePass("pass") : RulePotential("fail_no_tabbable", [role]);
    }
}
