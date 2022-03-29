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

export let RPT_Blink_CSSTrigger1: Rule = {
    id: "RPT_Blink_CSSTrigger1",
    context: "dom:style, dom:*[style]",
    help: {
        "en-US": {
            "group": `RPT_Blink_CSSTrigger1.html`,
            "Pass_0": `RPT_Blink_CSSTrigger1.html`,
            "Potential_1": `RPT_Blink_CSSTrigger1.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Do not use the \"blink\" value of the 'text-decoration' property for longer than five seconds",
            "Pass_0": "Rule Passed",
            "Potential_1": "Check the \"blink\" value of the CSS 'text-decoration' property is not used for more than than five seconds"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: "2.2.2", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let textValue = RPTUtil.getInnerText(ruleContext);
        if (ruleContext.hasAttribute('style')) {
            textValue = ruleContext.getAttribute('style');
        }

        let passed = textValue.toLowerCase().indexOf("text-decoration:blink") == -1;
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");
    }
}
