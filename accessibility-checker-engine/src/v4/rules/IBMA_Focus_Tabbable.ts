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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";

export let IBMA_Focus_Tabbable: Rule = {
    id: "IBMA_Focus_Tabbable",
    context: "aria:button,aria:link,aria:spinbutton,aria:tablist,aria:combobox,aria:listbox,aria:menu,aria:radiogroup,aria:tree,aria:checkbox,aria:slider,aria:spinbutton,aria:textbox,aria:scrollbar,aria:slider,aria:spinbutton",
    help: {
        "en-US": {
            "Pass_0": "IBMA_Focus_Tabbable.html",
            "Potential_1": "IBMA_Focus_Tabbable.html",
            "group": "IBMA_Focus_Tabbable.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Component with \"{0}\" role does not have a tabbable element",
            "group": "Component must have at least one tabbable element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.4.3"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let role = ARIAMapper.nodeToRole(ruleContext);
        let count = 0;
        if (RPTUtil.isTabbable(ruleContext)) {
            ++count;
        }
        // If node has children, look for tab stops in the children
        if (count < 1 && ruleContext.firstChild) {
            let nw = new NodeWalker(ruleContext);
            while (count < 1 && nw.nextNode() && nw.node != ruleContext) {
                if (nw.node.nodeType == 1 && !nw.bEndTag && RPTUtil.isTabbable(nw.node)) {
                    ++count;
                }
            }
        }
        let passed = count >= 1;
        return passed ? RulePass("Pass_0") : RulePotential("Potential_1", [role]);
    }
}