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

export let input_haspopup_conflict: Rule = {
    id: "input_haspopup_conflict",
    context: "dom:input[list][aria-haspopup]",
    refactor: {
        "input_haspopup_invalid": {
            "Pass": "Pass",
            "Potential_1": "Potential_1",
            "Potential_2": "Potential_2"}
    },
    help: {
        "en-US": {
            "Pass": "input_haspopup_conflict.html",
            "Potential_1": "input_haspopup_conflict.html",
            "Potential_2": "input_haspopup_conflict.html",
            "group": "input_haspopup_conflict.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "<input> element with 'list' attribute does not use 'aria-haspopup' attribute",
            "Potential_1": "<input> element with 'list' attribute also uses 'aria-haspopup' attribute with type=\"{0}\"",
            "Potential_2": "<input> element with 'list' attribute also uses 'aria-haspopup' attribute with missing or invalid input type",
            "group": "<input> element with 'list' attribute should not also use 'aria-haspopup' attribute"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        //triggering input types: text, search, tel, url, email, or missing or invalid 
        let yesTypes = ["text", "search", "tel", "url", "email"];
        let noTypes = ["file", "password", "checkbox", "radio", "submit", "reset",
            "date", "number", "range", "time", "color", "image",
            "month", "week", "datetime-local", "hidden", "button"
        ];

        let attrValue = ruleContext.getAttribute("type");
        //missing input type
        if (!attrValue)
            return RulePotential("Potential_2");

        attrValue = attrValue.toLowerCase();
        // ignore for no triggering input types 
        if (noTypes.includes(attrValue))
            return;

        // failure_1 if any triggering input types    
        if (yesTypes.includes(attrValue))
            return RulePotential("Potential_1", [attrValue]);

        //invalid input type
        return RulePotential("Potential_2");

    }
}