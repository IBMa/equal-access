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

import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../../v2/dom/VisUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let application_content_accessible: Rule = {
    id: "application_content_accessible",
    context: "aria:application",
    refactor: {
        "HAAC_Application_Role_Text": {
            0: `HAAC_Application_Role_Text.html`,
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"
        }
    },
    help: {
        "en-US": {
            0: `application_content_accessible.html`,
            "Pass_0": `application_content_accessible.html`,
            "Potential_1": `application_content_accessible.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Non-decorative static text and image content within an element with \"application\" role must be accessible",
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that the non-decorative static text and image content within an element with \"application\" role are accessible"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "2.1.1", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = true;
        let children = ruleContext.childNodes;
        for (let i = 0; passed && i < children.length; i++) {
            if (children[i].nodeType === 1) {
                if (VisUtil.isNodeVisible(children[i])) {
                    passed = RPTUtil.hasRoleInSemantics(children[i], "document") || RPTUtil.hasRoleInSemantics(children[i], "article");
                }
            } else if (children[i].nodeType === 3) {
                passed = children[i].nodeValue.trim().length === 0;
            }
        }

        return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
    }
}
