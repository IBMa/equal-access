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

import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AccNameUtil } from "../util/AccNameUtil";
import { VisUtil } from "../util/VisUtil";

export const svg_graphics_labelled: Rule = {
    id: "svg_graphics_labelled",
    context: "dom:svg",
    help: {
        "en-US": {
            "group": "svg_graphics_labelled.html",
            "pass": "svg_graphics_labelled.html",
            "fail_acc_name": "svg_graphics_labelled.html"
        }
    },
    messages: {
        "en-US": {
            "group": "A none decorative SVG element must have an accessible name",
            "pass": "The SVG element has an accessible name",
            "fail_acc_name": "The SVG element has no accessible name"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"], 
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [{
        "7d6734": {
            "pass": "pass",
            "fail_acc_name": "fail"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || VisUtil.isNodePresentational(ruleContext)) return null;

        const name_pair = AccNameUtil.computeAccessibleName(ruleContext);
        if (name_pair && name_pair.name && name_pair.name.trim().length > 0)
            return RulePass("pass");
        return RuleFail("fail_acc_name")
    }
}
