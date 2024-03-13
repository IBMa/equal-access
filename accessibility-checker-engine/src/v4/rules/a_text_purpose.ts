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

import { ARIAMapper } from "../../v2/aria/ARIAMapper";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../../v2/dom/VisUtil";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let a_text_purpose: Rule = {
    id: "a_text_purpose",
    // doc-biblioref is a link
    context: "aria:link,aria:doc-biblioref",
    refactor: {
        "WCAG20_A_HasText": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "group": `a_text_purpose.html`,
            "Pass_0": `a_text_purpose.html`,
            "Fail_1": `a_text_purpose.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Hyperlinks must have accessible text for their purpose",
            "Pass_0": "Hyperlink has a description of its purpose",
            "Fail_1": "Hyperlink has no link text, label or image with a text alternative"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: ["2.4.4", "4.1.2"], // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_TWO
    }],
    act: "c487ae",
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }
        
        // Rule only passes if an element has inner content,
        // in the case that there is only hidden content under the the element it is a violation
        let passed =
            ARIAMapper.computeName(ruleContext).trim().length > 0
            || RPTUtil.nonTabableChildCheck(ruleContext);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}
