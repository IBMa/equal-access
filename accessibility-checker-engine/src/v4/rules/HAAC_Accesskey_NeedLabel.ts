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
import { DOMUtil } from "../../v2/dom/DOMUtil";

export let HAAC_Accesskey_NeedLabel: Rule = {
    id: "HAAC_Accesskey_NeedLabel",
    context: "dom:*[accesskey]",
    help: {
        "en-US": {
            "Pass_0": "HAAC_Accesskey_NeedLabel.html",
            "Potential_1": "HAAC_Accesskey_NeedLabel.html",
            "group": "HAAC_Accesskey_NeedLabel.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "The HTML element with an assigned 'accesskey' attribute does not have an associated label",
            "group": "An HTML element with an assigned 'accesskey' attribute must have an associated label"
        }
    },
    rulesets: [{ 
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"], 
        "num": ["3.3.2"],
        "level": eRulePolicy.RECOMMENDATION, 
        "toolkitLevel": eToolkitLevel.LEVEL_ONE 
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = false;
        if (RPTUtil.attributeNonEmpty(ruleContext, "title")) {
            passed = true;
        } else if (RPTUtil.attributeNonEmpty(ruleContext, "aria-label")) {
            passed = true;
        } else if (RPTUtil.getLabelForElementHidden(ruleContext, true)) { // ignore hidden
            passed = true;
        } else if (RPTUtil.attributeNonEmpty(ruleContext, "aria-labelledby")) {
            // assume the validity of the id (of aria-labelledby) is checked by a different rule
            passed = true;
        } else if (ruleContext.nodeName.toLowerCase() === "input"
            && DOMUtil.parentNode(ruleContext).nodeName.toLowerCase() === "label") {
            // assume the validity of the label, e.g. empty label, is checked by a different rule
            passed = true;
        }

        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}