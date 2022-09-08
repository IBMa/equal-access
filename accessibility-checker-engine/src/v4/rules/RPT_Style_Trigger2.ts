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
import { getCache, setCache } from "../util/CacheUtil";

export let RPT_Style_Trigger2: Rule = {
    id: "RPT_Style_Trigger2",
    context: "dom:style, dom:link, dom:*[style]",
    help: {
        "en-US": {
            "Pass_0": "RPT_Style_Trigger2.html",
            "Manual_1": "RPT_Style_Trigger2.html",
            "group": "RPT_Style_Trigger2.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Manual_1": "Confirm Windows high contrast mode is supported when using CSS to include, position or alter non-decorative content",
            "group": "Windows high contrast mode must be supported when using CSS to include, position or alter non-decorative content"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    },
    {
        "id": ["WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (nodeName === "link" &&
            (!ruleContext.hasAttribute("rel") || ruleContext.getAttribute("rel").toLowerCase() !== "stylesheet"))
            return RulePass("Pass_0");
        if (nodeName !== "style" && nodeName !== "link" &&
            ruleContext.hasAttribute("style") && ruleContext.getAttribute("style").trim().length === 0)
            return RulePass("Pass_0");
        let triggered = getCache(ruleContext.ownerDocument, "RPT_Style_Trigger2", false);
        let passed = triggered;
        //        Packages.java.lang.System.out.println(triggered);
        setCache(ruleContext.ownerDocument, "RPT_Style_Trigger2", true);
        if (passed) return RulePass("Pass_0");
        if (!passed) return RuleManual("Manual_1");
    }
}