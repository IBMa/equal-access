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
import { Rule, RuleResult, RuleFail, RuleContext, RulePass } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../../v2/dom/VisUtil";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let a_text_purpose: Rule = {
    id: "a_text_purpose",
    // doc-biblioref is a link
    context: "aria:link,aria:doc-biblioref",
    refactor: {
        "WCAG20_A_HasText": {
            "Pass_0": "pass",
            "Fail_1": "fail_acc_name"
        }
    },
    help: {
        "en-US": {
            "group": `a_text_purpose.html`,
            "pass": `a_text_purpose.html`,
            "fail_acc_name": `a_text_purpose.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Hyperlinks must have an accessible name for their purpose",
            "pass": "Hyperlink has a description of its purpose",
            "fail_acc_name": "Hyperlink has no link text, label or image with a text alternative"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
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
            return RuleFail("fail_acc_name");
        } else {
            return RulePass("pass");
        }
    }
}
