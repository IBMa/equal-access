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
import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { VisUtil } from "../../v2/dom/VisUtil";

export let WCAG20_Object_HasText: Rule = {
    id: "WCAG20_Object_HasText",
    context: "dom:object",
    help: {
        "en-US": {
            "group": "WCAG20_Object_HasText.html",
            "Pass_0": "WCAG20_Object_HasText.html",
            "Fail_1": "WCAG20_Object_HasText.html"
        }
    },
    messages: {
        "en-US": {
            "group": "<object> elements must have a text alternative for the content rendered by the object",
            "Pass_0": "Rule Passed",
            "Fail_1": "An <object> element does not have a text alternative"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "8fc3b6",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        // JCH - NO OUT OF SCOPE hidden in context

        // Detect if this object is of type text, by checking the object type in the case it is text then do not trigger this rule
        if (ruleContext.hasAttribute("type") && (ruleContext.getAttribute("type")).indexOf("text") !== -1) {
            return null;
        }
        if (ruleContext.getAttribute("aria-hidden") === "true") {
            return null;
        }
        let role = ruleContext.getAttribute("role");
        if (role === "presentation" || role === "none") {
            return null;
        }

        // Per ACT, ignore embedded HTML files
        let data = ruleContext.getAttribute("data");
        let ext = data && typeof data === typeof "" ? data.substring(data.lastIndexOf(".")) : "";
        if (ext === ".html" || ext === ".htm") {
            return null;
        }

        let passed = RPTUtil.hasInnerContentHidden(ruleContext) || ARIAMapper.computeName(ruleContext).trim().length > 0;
        if (passed) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1");
        }
    }
}