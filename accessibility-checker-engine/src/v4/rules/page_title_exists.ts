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
import { AncestorUtil } from "../../v2/checker/accessibility/util/ancestor";

export let page_title_exists: Rule = {
    id: "page_title_exists",
    context: "dom:html",
    refactor: {
        "WCAG20_Doc_HasTitle": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2",
            "Fail_3": "Fail_3"
        }
    },
    help: {
        "en-US": {
            "group": "page_title_exists.html",
            "Pass_0": "page_title_exists.html",
            "Fail_1": "page_title_exists.html",
            "Fail_2": "page_title_exists.html",
            "Fail_3": "page_title_exists.html"
        }
    },
    messages: {
        "en-US": {
            "group": "The page should have a title that correctly identifies the subject of the page",
            "Pass_0": "Rule Passed",
            "Fail_1": "Missing <head> element so there can be no <title> element present",
            "Fail_2": "Missing <title> element in <head> element",
            "Fail_3": "The <title> element is empty (no innerHTML)"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.4.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [{
        "2779a5": {
            "Pass_0": "pass",
            "Fail_1": "pass",
            "Fail_2": "fail",
            "Fail_3": "fail"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        // This rule does not apply inside a presentational frame
        if (AncestorUtil.isFrame(contextHierarchies)) {
            return null;
        }
        const ruleContext = context["dom"].node as Node;
        // First, find the head element
        let findHead = ruleContext.firstChild as Node;
        let findTitle = null;
        while (findHead != null) {
            if (findHead.nodeName.toLowerCase() == "head")
                break;
            findHead = findHead.nextSibling;
        }
        let possibleTitles = (ruleContext as Element).querySelectorAll("title");
        for (let idx = 0; idx < possibleTitles.length; ++idx) {
            if (!RPTUtil.getAncestor(possibleTitles[idx], ["svg"])) {
                findTitle = possibleTitles[idx];
                break;
            }
        }
        if (findHead === null) {
            if (!findTitle) {
                return RuleFail("Fail_1");
            }
        }

        if (findTitle === null) { // don't have title second PoF
            return RuleFail("Fail_2");
        }

        // if we get here we have <head> and <title>

        if (findTitle != null && RPTUtil.getInnerText(findTitle).trim().length > 0) {
            return RulePass("Pass_0");
        } else { // <title> has no innerHTML third PoF
            return RuleFail("Fail_3");
        }
    }
}