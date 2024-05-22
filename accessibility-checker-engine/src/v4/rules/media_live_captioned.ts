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

export let media_live_captioned: Rule = {
    id: "media_live_captioned",
    context: "dom:embed, dom:object",
    refactor: {
        "RPT_Media_VideoObjectTrigger": {
            "Pass_0": "Pass_0",
            "Manual_1": "Manual_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "media_live_captioned.html",
            "Manual_1": "media_live_captioned.html",
            "group": "media_live_captioned.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Manual_1": "Verify captions are provided for live media (streaming video with audio)",
            "group": "Live media (streaming video with audio) should have captions for audio content"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.2.4"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = !RPTUtil.isVideoObjEmbedLink(ruleContext);
        if (passed) return null;
        if (!passed) return RuleManual("Manual_1");
    }
}