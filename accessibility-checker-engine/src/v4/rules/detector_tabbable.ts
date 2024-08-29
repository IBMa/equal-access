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

import { RPTUtil } from "../util/AriaUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let detector_tabbable: Rule = {
    id: "detector_tabbable",
    context: "dom:*",
    help: {
        "en-US": {
            "group": ``,
            "Pass_0": ``
        }
    },
    messages: {
        "en-US": {
            "group": "",
            "Pass_0": ""
        }
    },
    rulesets: [{
        id: ["EXTENSIONS"],
        num: "1", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.INFORMATION,
        toolkitLevel: eToolkitLevel.LEVEL_FOUR
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (!RPTUtil.isTabbable(ruleContext)) {
            return null;
        }
        let hierContext = contextHierarchies.aria[contextHierarchies.aria.length - 1];
        return RulePass("Pass_0", [], [{
            name: hierContext.attributes.name,
            role: hierContext.role,
            tabindex: parseInt(ruleContext.getAttribute("tabindex") || "0")
        }]);
    }
}
