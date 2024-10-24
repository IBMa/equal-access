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

export const caption_track_exists: Rule = {
    id: "caption_track_exists",
    context: "dom:video",
    refactor: {
        "HAAC_Video_HasNoTrack": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "caption_track_exists.html",
            "Potential_1": "caption_track_exists.html",
            "group": "caption_track_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that captions are available for any meaningful audio or provide a caption track for the <video> element",
            "group": "A <video> element must have a text alternative for any meaningful audio content"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.2.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLVideoElement;
        let passed = false;

        // ignore decorative video if user uses aria-hidden
        if (ruleContext.getAttribute("aria-hidden") === "true") {
            return null;
        }

        let tracks = ruleContext.getElementsByTagName("track");

        for (let i = 0; i < tracks.length; ++i) {
            passed = passed || tracks[i].getAttribute("kind") === 'captions';
        }
        // checks for addition of dynamic tracks
        if (ruleContext.textTracks && ruleContext.textTracks.length > 0) {
            for (let i = 0; i < ruleContext.textTracks.length; i++) {
                passed = passed || ruleContext.textTracks[i].kind === 'captions';
            }
        }

        if (passed) {
            return RulePass("Pass_0");
        } else {
            return RulePotential("Potential_1");
        }
    }
}