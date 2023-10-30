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

export let img_ismap_misuse: Rule = {
    id: "img_ismap_misuse",
    context: "dom:img[ismap]",
    refactor: {
        "RPT_Img_UsemapValid": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "img_ismap_misuse.html",
            "Potential_1": "img_ismap_misuse.html",
            "group": "img_ismap_misuse.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Server-side image map hot-spots do not have duplicate text links",
            "group": "Server-side image map hot-spots must have duplicate text links"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let passed = false;
        if (ruleContext.hasAttribute("usemap")) {
            let usemap = ruleContext.getAttribute("usemap");
            usemap = usemap.trim().toLowerCase();
            let idx = usemap.indexOf("#");
            if (idx != -1)
                usemap = usemap.substr(idx + 1);

            if (usemap.length > 0) {
                let maps = RPTUtil.getDocElementsByTag(ruleContext, "map");
                for (let i = 0; !passed && i < maps.length; ++i) {
                    passed = maps[i].hasAttribute("name") &&
                        maps[i].getAttribute("name").toLowerCase() == usemap;
                }
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}