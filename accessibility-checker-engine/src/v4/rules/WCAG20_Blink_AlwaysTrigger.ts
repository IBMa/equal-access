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

export let WCAG20_Blink_AlwaysTrigger: Rule = {
    id: "WCAG20_Blink_AlwaysTrigger",
    context: "dom:blink",
    help: {
        "en-US": {
            "group": `WCAG20_Blink_AlwaysTrigger.html`,
            "Pass_0": `WCAG20_Blink_AlwaysTrigger.html`,
            "Fail_1": `WCAG20_Blink_AlwaysTrigger.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Content that blinks persistently must not be used",
            "Pass_0": "Rule Passed",
            "Fail_1": "Content found that blinks persistently"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: "2.2.2", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        // const ruleContext = context["dom"].node as Element;
        return RuleFail("Fail_1");
    }
}
    