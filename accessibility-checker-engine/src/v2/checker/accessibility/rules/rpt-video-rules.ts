/******************************************************************************
     Copyright:: 2020- IBM, Inc

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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass } from "../../../api/IEngine";
import { RPTUtil } from "../util/legacy";

let a11yRulesVideo: Rule[] = [
    {
        /**
         * Description: Trigger if video is missing Track with an attribute kind="caption"
         * Origin: CI162-HTML 5, G1117
         */
        id: "HAAC_Video_HasNoTrack",
        context: "dom:video",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
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
                for (let i=0; i < ruleContext.textTracks.length; i++)  {
                    passed = passed || ruleContext.textTracks[i].kind  ===  'captions';
                }
            }

            if (passed) {
                return RulePass("Pass_0");
            } else {
                return RulePotential("Potential_1");
            }
        }
    },
    {
        /**
         * Description: Trigger if HTML5 <audio> or <video> elements are used 
         * Origin: CI162-HTML 5, G1119
         */
        id: "HAAC_Audio_Video_Trigger",
        context: "dom:audio, dom:video",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = true;
            let nodeName = ruleContext.nodeName.toLowerCase();
            if (nodeName == "audio" || nodeName === "video") {
                passed = false;
            }
            return passed ? RulePass("Pass_0") : RuleManual("Manual_1");
        }
    }
];
export { a11yRulesVideo }