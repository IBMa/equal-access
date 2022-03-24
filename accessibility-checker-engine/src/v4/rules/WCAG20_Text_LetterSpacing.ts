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

export let WCAG20_Text_LetterSpacing: Rule = {
    id: "WCAG20_Text_LetterSpacing",
    context: "dom:*",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Text_LetterSpacing.html",
            "Potential_1": "WCAG20_Text_LetterSpacing.html",
            "group": "WCAG20_Text_LetterSpacing.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify space characters are not being used to create space between the letters of a word",
            "group": "Use CSS 'letter-spacing' to control spacing within a word"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.3.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = true;
        let walkNode = ruleContext.firstChild as Node;
        while (passed && walkNode) {
            // Comply to the Check Hidden Content setting will be done by default as this rule triggers on each element
            // and for each element it only checks that single elements text nodes and nothing else. So all inner elements will be
            // covered on their own. Currently for this rule by default Check Hidden Content will work, as we are doing
            // a node walk only on siblings so it would not get text nodes from other siblings at all.
            // In the case in the future something chnges, just need to add && !RPTUtil.shouldNodeBeSkippedHidden(walkNode) to the below
            // if.
            if (walkNode.nodeName == "#text") {
                let txtVal = walkNode.nodeValue;
                passed = !(/(^|\s)[a-zA-Z] [a-zA-Z] [a-zA-Z]($|\s)/.test(txtVal));
            }
            walkNode = walkNode.nextSibling;
        }

        if (!passed) {
            // Don't trigger if we're not in the body or if we're in a script
            let checkAncestor = RPTUtil.getAncestor(ruleContext, ["body", "script", "code"]);
            passed = checkAncestor == null || checkAncestor.nodeName.toLowerCase() != "body";
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}