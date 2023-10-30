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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let style_background_decorative: Rule = {
    id: "style_background_decorative",
    context: "dom:style, dom:*[style]",
    refactor: {
        "RPT_Style_BackgroundImage": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "style_background_decorative.html",
            "Potential_1": "style_background_decorative.html",
            "group": "style_background_decorative.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify the CSS background image does not convey important information",
            "group": "Images included by using CSS alone must not convey important information"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        let passed = true;
        if (nodeName === "link" && ruleContext.hasAttribute("rel") &&
            ruleContext.getAttribute("rel").toLowerCase() === "stylesheet") {
            // External stylesheet - trigger
            passed = RPTUtil.triggerOnce(ruleContext, "style_background_decorative", false);
        }
        if (passed && nodeName === "style" || ruleContext.hasAttribute("style")) {
            let styleText;
            if (nodeName === "style")
                styleText = RPTUtil.getInnerText(ruleContext);
            else
                styleText = ruleContext.getAttribute("style");
            let bgMatches = styleText.match(/background:[^;]*/g);
            if (bgMatches !== null) {
                for (let i = 0; passed && i < bgMatches.length; ++i)
                    passed = bgMatches[i].indexOf("url(") === -1;
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}