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
import { CommonUtil } from "../util/CommonUtil";
import { CacheUtil } from "../util/CacheUtil";
import { VisUtil } from "../util/VisUtil";

export const skip_main_described: Rule = {
    id: "skip_main_described",
    context: "dom:body",
    dependencies: ["skip_main_exists"],
    refactor: {
        "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            "Pass_0": "skip_main_described.html",
            "Potential_1": "skip_main_described.html",
            "group": "skip_main_described.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that if this hyperlink skips content, the description communicates where it links to",
            "group": "The description of a hyperlink used to skip content must communicate where it links to"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            paramSkipText: {
                value: ["skip", "jump"],
                type: "[string]"
            }
        }
        const ruleContext = context["dom"].node as Element;
        // Get the anchors on the page
        let doc = ruleContext.ownerDocument;

        // Check for landmarks first
        let passed;
        if (CacheUtil.getCache(ruleContext, "IBM_hasLandmarks_Implicit", null) === null) {
            CacheUtil.setCache(ruleContext, "IBM_hasLandmarks_Implicit", CommonUtil.getElementsByRoleHidden(ruleContext.ownerDocument, ["application", "banner", "complementary", "contentinfo",
                "form", "main", "navigation", "search"
            ], true, true).length > 0);
        }
        passed = CacheUtil.getCache(ruleContext, "IBM_hasLandmarks_Implicit", false);

        if (!passed) { // No landmarks, check for skip links
            let links = doc.links;
            // Skip link should be the first one on the page with an href attribute (i.e., links[0])
            // also if the first link is hidden then we should also trigger a violation.
            if (links && links.length > 0 && VisUtil.isNodeVisible(links[0])) {
                let testText = CommonUtil.getInnerText(doc.links[0]).toLowerCase();
                for (let i = 0; !passed && i < validateParams.paramSkipText.value.length; ++i) {
                    passed = testText.indexOf(validateParams.paramSkipText.value[i]) != -1;
                }
            } else passed = false;

        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}