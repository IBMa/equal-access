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

export let HAAC_BackgroundImg_HasTextOrTitle: Rule = {
    id: "HAAC_BackgroundImg_HasTextOrTitle",
    context: "dom:*",
    help: {
        "en-US": {
            "Pass_0": "HAAC_BackgroundImg_HasTextOrTitle.html",
            "Manual_1": "HAAC_BackgroundImg_HasTextOrTitle.html",
            "group": "HAAC_BackgroundImg_HasTextOrTitle.html"
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
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
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