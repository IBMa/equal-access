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
import { VisUtil } from "../util/VisUtil";

export const img_alt_background: Rule = {
    id: "img_alt_background",
    context: "dom:*",
    refactor: {
        "HAAC_BackgroundImg_HasTextOrTitle": {
            "Pass_0": "Pass_0",
            "Manual_1": "Manual_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "img_alt_background.html",
            "Manual_1": "img_alt_background.html",
            "group": "img_alt_background.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Manual_1": "Verify important background image information has a text alternative in system high contrast mode",
            "group": "Background images that convey important information must have a text alternative that describes the image"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let doc = ruleContext.ownerDocument;
        let style = doc.defaultView.getComputedStyle(ruleContext);
        if (style == null) {
            return RulePass("Pass_0");
        }
        let backgroundImgs = style.backgroundImage;
        let passed = true;

        if (backgroundImgs != null && backgroundImgs != "" && backgroundImgs != 'none' && backgroundImgs != 'inherit') {
            if (ruleContext.innerHTML != null && ruleContext.innerHTML.trim().length != 0) {
                passed = false;
            } else {
                let title = ruleContext.getAttribute('title');
                if (title != null && title.length != 0)
                    passed = false;
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RuleManual("Manual_1");

    }
}