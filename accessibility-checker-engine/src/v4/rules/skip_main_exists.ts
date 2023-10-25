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
import { AncestorUtil } from "../../v2/checker/accessibility/util/ancestor";
import { getCache, setCache } from "../util/CacheUtil";
import { VisUtil } from "../../v2/dom/VisUtil";

export let skip_main_exists: Rule = {
    id: "skip_main_exists",
    context: "dom:body",
    refactor: {
        "WCAG20_Body_FirstASkips_Native_Host_Sematics": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "skip_main_exists.html",
            "Fail_1": "skip_main_exists.html",
            "group": "skip_main_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The page does not provide a way to quickly navigate to the main content (ARIA \"main\" landmark or a skip link)",
            "group": "Pages must provide a way to skip directly to the main content"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        // This rule does not apply inside a presentational frame
        if (AncestorUtil.isPresentationFrame(contextHierarchies)) {
            return null;
        }
        const ruleContext = context["dom"].node as Element;
        // Get the anchors on the page
        let doc = ruleContext.ownerDocument;

        // Check for landmarks first
        let passed;
        if (getCache(ruleContext, "IBM_hasLandmarks_Implicit", null) === null) {
            setCache(ruleContext, "IBM_hasLandmarks_Implicit", RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, ["application", "banner", "complementary", "contentinfo",
                "form", "main", "navigation", "search"
            ], true, true).length > 0);
        }
        passed = getCache(ruleContext, "IBM_hasLandmarks_Implicit", false);

        if (!passed) { // No landmarks, check for skip links
            let anchors = RPTUtil.getDocElementsByTag(ruleContext, "a");

            // Skip anchor should be the first one on the page with an href attribute
            let testAnchor = null;
            for (let i = 0; i < anchors.length; ++i) {
                if (anchors[i].hasAttribute("href") && VisUtil.isNodeVisible(anchors[i])) {
                    testAnchor = anchors[i];
                    break;
                }
            }

            // Pull out the target id
            let targetId = null;
            if (testAnchor != null) {
                let hrefStr = testAnchor.getAttribute("href");
                let idx = hrefStr.indexOf("#");
                if (idx != -1) {
                    targetId = hrefStr.substring(idx + 1);
                }
            }
            // Determine if there is an element id or named anchor on the page with this
            // target id.

            if (targetId != null) {
                passed = doc.getElementById(targetId) != null;
                for (let i = 0; !passed && i < anchors.length; ++i) {
                    if (!anchors[i].hasAttribute("href") &&
                        anchors[i].hasAttribute("name") &&
                        anchors[i].getAttribute("name") == targetId) {
                        passed = true;
                    }
                }
            }
        }
        //return new ValidationResult(passed, [ruleContext], '', '', []);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}