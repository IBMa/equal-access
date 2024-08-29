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
import { RPTUtil } from "../util/AriaUtil";

export let embed_noembed_exists: Rule = {
    id: "embed_noembed_exists",
    context: "dom:embed",
    refactor: {
        "WCAG20_Embed_HasNoEmbed": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "embed_noembed_exists.html",
            "Potential_1": "embed_noembed_exists.html",
            "group": "embed_noembed_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that the <embed> element is immediately followed by a non-embedded element",
            "group": "<embed> elements should be immediately followed by a non-embedded element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_FOUR
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = ruleContext.getElementsByTagName("noembed").length > 0;
        if (!passed) {
            let walkNode = ruleContext.nextSibling;
            while (!passed && walkNode !== null) {
                if (walkNode.nodeName.toLowerCase() == "noembed")
                    passed = true;
                else if (walkNode.nodeName.toLowerCase() == "#text" && walkNode.nodeValue.trim().length > 0)
                    break;
                else if (walkNode.nodeType == 1)
                    break;
                walkNode = walkNode.nextSibling;
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}