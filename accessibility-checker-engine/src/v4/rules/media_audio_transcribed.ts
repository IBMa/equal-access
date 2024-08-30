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

import { Rule, RuleResult, RuleContext, RuleManual, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";

export const media_audio_transcribed: Rule = {
    id: "media_audio_transcribed",
    context: "dom:bgsound, dom:a[href], dom:area[href], dom:embed, dom:object",
    refactor: {
        "RPT_Media_AudioTrigger": {
            "Pass_0": "Pass_0",
            "Manual_1": "Manual_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "media_audio_transcribed.html",
            "Manual_1": "media_audio_transcribed.html",
            "group": "media_audio_transcribed.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Manual_1": "Provide transcripts for audio files",
            "group": "Audio information should also be available in text form"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.2.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let passed;
        let thisNode = ruleContext.nodeName.toLowerCase();
        if (thisNode == "bgsound") {
            passed = false;
        } else {
            passed = !CommonUtil.isAudioObjEmbedLink(ruleContext);
        }
        if (passed) return null; // Out of Scope
        if (!passed) return RuleManual("Manual_1");

    }
}