/******************************************************************************
     Copyright:: 2020- IBM, Inc

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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass } from "../../../api/IEngine";
import { RPTUtil, NodeWalker } from "../util/legacy";
import { ARIAMapper } from "../../../..";

let a11yRulesFocus: Rule[] = [

    {
        /**
         * Description: Determine if widgets that should have focus have a tab stop
         */
        id: "IBMA_Focus_Tabbable",
        context:
            // widget
            // - command 
            "aria:button,aria:link"
            // ",menuitem"
            // - composite
            + ",aria:spinbutton,aria:tablist"
            // ",grid"
            // -- select
            + ",aria:combobox,aria:listbox,aria:menu,aria:radiogroup,aria:tree"
            // - input
            + ",aria:checkbox,aria:slider,aria:spinbutton,aria:textbox"
            // + ",option,radio"
            // - gridcell
            // + ",columnheader,rowheader"
            // - range
            //        + ",progressbar"
            + ",aria:scrollbar,aria:slider,aria:spinbutton"
        // - row,separator,tab
        // other
        //        + ",article"
        ,
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
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
            return passed ? RulePass("Pass_0"): RulePotential("Potential_1", [role]);
        }
    },
    {
        /**
         * Description: Flag if widgets have more than one tab stop
         */
        id: "IBMA_Focus_MultiTab",
        context:
            // widget
            // - command 
            "aria:button,aria:link,aria:menuitem"
            // - composite
            // + ",grid"
            + ",aria:spinbutton,aria:tablist"
            // -- select
            + ",aria:combobox,aria:listbox,aria:menu,aria:radiogroup,aria:tree"
            // - input
            + ",aria:checkbox,aria:option,aria:radio,aria:slider,aria:spinbutton,aria:textbox"
            // - gridcell
            + ",aria:columnheader,aria:rowheader"
            // - range
            //        + ",progressbar"
            //        + ",scrollbar"
            //        + ",spinbutton"
            + ",aria:slider,aria:tab"
        // - row,separator
        // other
        // + ",article"
        ,
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let role = ARIAMapper.nodeToRole(ruleContext);
            let count = 0;
            if (RPTUtil.isTabbable(ruleContext)) {
                ++count;
            }
            // If node has children, look for tab stops in the children
            if (count < 2 && ruleContext.firstChild) {
                let nw = new NodeWalker(ruleContext);
                while (count < 2 && nw.nextNode() && nw.node != ruleContext) {
                    if (nw.node.nodeType == 1 && !nw.bEndTag && RPTUtil.isTabbable(nw.node)) {
                        ++count;
                    }
                }
            }
            let passed = count < 2;
            return passed ? RulePass("Pass_0"): RulePotential("Potential_1", [role]);
        }
    }
]
export { a11yRulesFocus }