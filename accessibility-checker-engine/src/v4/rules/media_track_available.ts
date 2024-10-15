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
import { VisUtil } from "../../v2/dom/VisUtil";

export let media_track_available: Rule = {
    id: "media_track_available",
    context: "dom:a[href], dom:area[href], dom:applet, dom:embed, dom:object",
    refactor: {
        "RPT_Media_VideoReferenceTrigger": {
            "Manual_1": "Manual_1"}
    },
    help: {
        "en-US": {
            "Manual_1": "media_track_available.html",
            "group": "media_track_available.html"
        }
    },
    messages: {
        "en-US": {
            "Manual_1": "Verify availability of a user-selectable audio track with description of visual content",
            "group": "Pre-recorded media should have an audio track that describes visual information"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.2.3", "1.2.5"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let nodeName = ruleContext.nodeName.toLowerCase();
        let passed = true;

        if (nodeName == "applet") {
            passed = false;
        } else {
            passed = !RPTUtil.isVideoObjEmbedLink(ruleContext);
        }

        if (passed) return null;
        if (!passed) return RuleManual("Manual_1");

    }
}