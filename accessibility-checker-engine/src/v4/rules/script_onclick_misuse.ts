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

export let script_onclick_misuse: Rule = {
    id: "script_onclick_misuse",
    context: "dom:*[onclick]",
    refactor: {
        "RPT_Script_OnclickHTML1": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "script_onclick_misuse.html",
            "Potential_1": "script_onclick_misuse.html",
            "group": "script_onclick_misuse.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Possible use of a script to emulate a link",
            "group": "Scripts should not be used to emulate links"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.1.1"], //help and match mapping to 2.1.1 only 
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            failSubstring: {
                value: [".asp", ".aspx", ".cfm", ".cfml", ".cgi", ".htm", ".html", ".shtm",
                    ".shtml", ".php", ".pl", ".py", ".shtm", ".shtml", ".xhtml",
                    "location.href"],
                type: "[string]"
            }
        };
        const ruleContext = context["dom"].node as Element;
        // If there's an aria-role specified, don't trigger this.
        let passed = RPTUtil.attributeNonEmpty(ruleContext, "role");
        // If this is an a or area, don't trigger if there's an href.
        let nodeName = ruleContext.nodeName.toLowerCase();
        passed = passed || ((nodeName == "a" || nodeName == "area") && RPTUtil.attributeNonEmpty(ruleContext, "href"));

        // If the guards failed, check to see if they're looking at links
        if (!passed) {
            let failSubstring = validateParams.failSubstring.value;;
            let onclick = ruleContext.getAttribute("onclick").toLowerCase();
            passed = true;
            for (let i = 0; passed && i < failSubstring.length; ++i) {
                passed = onclick.indexOf(failSubstring[i]) == -1;
            }
        }

        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}