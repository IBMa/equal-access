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

export let blink_elem_deprecated: Rule = {
    id: "blink_elem_deprecated",
    context: "dom:blink",
    refactor: {
        "WCAG20_Blink_AlwaysTrigger": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "group": `blink_elem_deprecated.html`,
            "Pass_0": `blink_elem_deprecated.html`,
            "Fail_1": `blink_elem_deprecated.html`
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
        id: [ "IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
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
    