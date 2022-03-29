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

export let RPT_Embed_AutoStart: Rule = {
    id: "RPT_Embed_AutoStart",
    context: "dom:param[name=autoplay], dom:param[name=autostart], dom:embed[flashvars], dom:embed[src], dom:*[autostart=true], dom:*[autostart=1], dom:bgsound",
    help: {
        "en-US": {
            "Pass_0": "RPT_Embed_AutoStart.html",
            "Potential_1": "RPT_Embed_AutoStart.html",
            "group": "RPT_Embed_AutoStart.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify there is a mechanism to pause or stop and control the volume for the audio that plays automatically",
            "group": "Mechanism must be available to pause or stop and control the volume of the audio that plays automatically"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.4.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        let passed;
        if (nodeName == "bgsound") {
            passed = false;
        } else if (nodeName == "param") {
            let content = "";
            if (ruleContext.hasAttribute("value"))
                content = ruleContext.getAttribute("value").toLowerCase();
            passed = content.indexOf("0;") == 0 ||
                !(content.indexOf("true") != -1 || content.indexOf("1") != -1);
        } else if (nodeName == "embed") {
            passed = true;
            if (ruleContext.hasAttribute("flashvars")) {
                let str = ruleContext.getAttribute("flashvars");
                passed = str.indexOf("autostart=true") == -1 &&
                    str.indexOf("autostart=1") == -1;
            }
            if (passed && ruleContext.hasAttribute("src")) {
                let str = ruleContext.getAttribute("src");
                passed = str.indexOf("autostart=true") == -1 &&
                    str.indexOf("autostart=1") == -1;
            }
        }
        if (passed && ruleContext.hasAttribute("autostart")) {
            let val = ruleContext.getAttribute("autostart").toLowerCase();
            passed = val != 'true' && val != '1';
        }
        return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
    }
}