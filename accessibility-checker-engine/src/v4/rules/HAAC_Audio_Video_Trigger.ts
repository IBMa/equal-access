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

export let HAAC_Audio_Video_Trigger: Rule = {
    id: "HAAC_Audio_Video_Trigger",
    context: "dom:audio, dom:video",
    help: {
        "en-US": {
            "Pass_0": "HAAC_Audio_Video_Trigger.html",
            "Manual_1": "HAAC_Audio_Video_Trigger.html",
            "group": "HAAC_Audio_Video_Trigger.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Manual_1": "Verify media using <audio> and/or <video> elements have keyboard accessible controls",
            "group": "Media using <audio> and/or <video> elements must have keyboard accessible controls"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let passed = true;
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (nodeName == "audio" || nodeName === "video") {
            passed = false;
        }
        return passed ? RulePass("Pass_0") : RuleManual("Manual_1");
    }
}