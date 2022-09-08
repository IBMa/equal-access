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

export let RPT_Media_AudioTrigger: Rule = {
    id: "RPT_Media_AudioTrigger",
    context: "dom:bgsound, dom:a[href], dom:area[href], dom:embed, dom:object",
    help: {
        "en-US": {
            "Pass_0": "RPT_Media_AudioTrigger.html",
            "Manual_1": "RPT_Media_AudioTrigger.html",
            "group": "RPT_Media_AudioTrigger.html"
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
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
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
            passed = !RPTUtil.isAudioObjEmbedLink(ruleContext);
        }
        if (passed) return null; // Out of Scope
        if (!passed) return RuleManual("Manual_1");

    }
}