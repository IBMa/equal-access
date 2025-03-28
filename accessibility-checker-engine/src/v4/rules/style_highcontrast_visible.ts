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

import { Rule, RuleResult, RuleContext, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { CacheUtil } from "../util/CacheUtil";

export const style_highcontrast_visible: Rule = {
    id: "style_highcontrast_visible",
    context: "dom:style, dom:link, dom:*[style]",
    refactor: {
        "RPT_Style_Trigger2": {
            "Pass_0": "Pass_0",
            "Manual_1": "Manual_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "style_highcontrast_visible.html",
            "Manual_1": "style_highcontrast_visible.html",
            "group": "style_highcontrast_visible.html"
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
        "id": ["IBM_Accessibility", "IBM_Accessibility_next"],
        "num": ["1.1.1", "1.3.2", "1.4.11"],  //other "style" rules for focus, hover, and color
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    },
    {
        "id": ["WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1", "1.3.2", "1.4.11"],
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
        let triggered = CacheUtil.getCache(ruleContext.ownerDocument, "style_highcontrast_visible", false);
        let passed = triggered;
        //        Packages.java.lang.System.out.println(triggered);
        CacheUtil.setCache(ruleContext.ownerDocument, "style_highcontrast_visible", true);
        if (passed) return RulePass("Pass_0");
        if (!passed) return RuleManual("Manual_1");
    }
}