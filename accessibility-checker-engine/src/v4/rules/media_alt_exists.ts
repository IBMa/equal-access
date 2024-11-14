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
import { VisUtil } from "../util/VisUtil";

export const media_alt_exists: Rule = {
    id: "media_alt_exists",
    context: "dom:area[alt], dom:embed[alt]",
    refactor: {
        "RPT_Media_AudioVideoAltFilename": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "media_alt_exists.html",
            "Potential_1": "media_alt_exists.html",
            "group": "media_alt_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Filename used as label for embedded audio or video",
            "group": "Audio or video on the page must have a short text alternative that describes the media content"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let uri = "";
        if (ruleContext.nodeName.toLowerCase() == "area") {
            uri = ruleContext.getAttribute("href")
        } else {
            uri = ruleContext.getAttribute("src")
        }
        if (uri == null) uri = "";
        let ext = CommonUtil.getFileExt(uri);
        let isAudVid = ext.length != 0 && (CommonUtil.isAudioExt(ext) || CommonUtil.isVideoExt(ext));
        let altText = ruleContext.getAttribute("alt");
        let passed = !isAudVid || (altText.length > 0 && altText.indexOf(ext) == -1);

        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}