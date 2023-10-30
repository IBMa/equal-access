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
import { VisUtil } from "../../v2/dom/VisUtil";

export let img_alt_misuse: Rule = {
    id: "img_alt_misuse",
    context: "dom:img, dom:area, dom:input",
    refactor: {
        "RPT_Img_AltCommonMisuse": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "img_alt_misuse.html",
            "Potential_1": "img_alt_misuse.html",
            "group": "img_alt_misuse.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that the file name serves as a good inline replacement for the image",
            "group": "'alt' attribute value must be a good inline replacement for the image"
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
        const validateParams = {
            badText: {
                value: ["short description"],
                type: "[string]"
            }
        }
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let nodeName = ruleContext.nodeName.toLowerCase();
        let passed = true;
        // Alt text check are elsewhere (See 41, 240, 455)
        if (ruleContext.hasAttribute("alt")) {
            let altText = ruleContext.getAttribute("alt").trim();
            if (altText.length > 0) {
                let badText = validateParams.badText.value;
                for (let i = 0; passed && i < badText.length; ++i) {
                    passed = altText.indexOf(badText[i]) == -1;
                }
                if (passed) {
                    let src = ruleContext.getAttribute((nodeName == "area") ? "href" : "src");
                    // Allow it to pass if there's no src - can't determine these.
                    if (src != null) {
                        // Fail if the alt matches the src exactly
                        // Also fail if the alt has a . in it and either the src is in the alt or the alt is in the src
                        passed = src.trim() != altText &&
                            (altText.indexOf(".") == -1 || (altText.indexOf(src) == -1 && src.indexOf(altText) == -1));
                    }
                }
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}