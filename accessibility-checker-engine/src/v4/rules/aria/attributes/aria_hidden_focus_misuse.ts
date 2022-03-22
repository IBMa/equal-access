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

import { RPTUtil } from "../../../../v2/checker/accessibility/util/legacy";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../../../api/IRule";

export let aria_hidden_focus_misuse: Rule = {
    id: "aria_hidden_focus_misuse",
    context: "dom:*[aria-hidden=true], dom:*[aria-hidden=true] dom:*",
    help: {
        "en-US": {
            "group": `aria_hidden_focus_misuse.html`, 
            "Pass_0": `aria_hidden_focus_misuse.html`,
            "Fail_1": `aria_hidden_focus_misuse.html`
        }
    },
    messages: {
        "en-US": {
            "group": "A focusable element should not be within the subtree of an element with 'aria-hidden' set to \"true\"", 
            "Pass_0": "Rule Passed",
            "Fail_1": "Element \"{0}\" should not be focusable within the subtree of an element with an 'aria-hidden' attribute with value 'true'"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: ["1.3.1", "4.1.2"], // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_TWO
    }],
    // TODO: ACT: Handle testcase with focus jumping away
    act: "6cfa84",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
            
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (RPTUtil.isTabbable(ruleContext) || ruleContext.hasAttribute("tabIndex") && ruleContext.getAttribute("tabIndex").length > 0)
            return RuleFail("Fail_1", [nodeName]);
        
        return RulePass("Pass_0");
    }
}
