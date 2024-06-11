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

import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { getInvalidAriaAttributes, getConflictAriaAndHtmlAttributes } from "../util/CommonUtil";

export let aria_attribute_conflict: Rule = {
    id: "aria_attribute_conflict",
    context: "dom:*[aria-required], dom:*[aria-autocomplete], dom:*[aria-readonly], dom:*[aria-disabled], dom:*[aria-placeholder]" 
            + ", dom:*[aria-checked], dom:*[aria-hidden], dom:*[aria-valuemax], dom:*[aria-valuemin], dom:*[aria-colspan]"
            + ", dom:*[aria-rowspan]",
    help: {
        "en-US": {
            "pass": "aria_attribute_conflict.html",
            "fail_conflict": "aria_attribute_conflict.html",
            "group": "aria_attribute_conflict.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "fail_conflict": "The ARIA attribute \"{0}\" is in conflict with the corresponding HTML attribute \"{1}\"",
            "group": "An ARIA attribute must not conflict with the corresponding HTML attribute"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        // dependency check: if the ARIA attribute is completely invalid, skip this check
        let invalidAttributes = getInvalidAriaAttributes(ruleContext);
        if (invalidAttributes && invalidAttributes.length > 0)
            return null;
        
        let ret = [];
        let ariaAttributes = RPTUtil.getUserDefinedAriaAttributes(ruleContext);
        if (!ariaAttributes || ariaAttributes.length ===0)
            return null;

        let conflictAttributes = getConflictAriaAndHtmlAttributes(ruleContext);
        for (let i = 0; i < conflictAttributes.length; i++) {
            ret.push(RuleFail("fail_conflict", [conflictAttributes[i]['ariaAttr'], conflictAttributes[i]['htmlAttr']]));
            if (ariaAttributes.includes(conflictAttributes[i]['ariaAttr']))
                RPTUtil.reduceArrayItemList([conflictAttributes[i]['ariaAttr']], ariaAttributes);
        }

        for (let i = 0; i < ariaAttributes.length; i++)
            ret.push(RulePass("pass"));
        
        if (ret.length > 0) 
            return ret;

        return null;  
    }
}