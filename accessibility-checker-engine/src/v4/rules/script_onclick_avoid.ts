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
import { RPTUtil } from "../util/AriaUtil";

export let script_onclick_avoid: Rule = {
    id: "script_onclick_avoid",
    context: "dom:*[onclick]",
    dependencies: ["script_onclick_misuse"],
    refactor: {
        "RPT_Script_OnclickHTML2": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "script_onclick_avoid.html",
            "Potential_1": "script_onclick_avoid.html",
            "group": "script_onclick_avoid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that 'onclick' events are not used in script to emulate a link",
            "group": "Scripts should not be used to emulate links"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.1.1"], //help and match mapping to 2.1.1 only 
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_FOUR
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // Don't trigger this for SVG element for now until a determination is made (by Rich)
        // to support SVG at a point when the SVG a11y spec is ready.
        if (RPTUtil.getAncestor(ruleContext, "svg")) {
            return RulePass("Pass_0");
        }
        // If there's an aria-role specified, don't trigger this.
        if (RPTUtil.attributeNonEmpty(ruleContext, "role"))
            return RulePass("Pass_0");

        let nodeName = ruleContext.nodeName.toLowerCase();
        let passed = nodeName == "a" || nodeName == "area" || nodeName == "input";
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}