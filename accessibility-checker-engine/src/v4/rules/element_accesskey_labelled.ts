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

import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";

export const element_accesskey_labelled: Rule = {
    id: "element_accesskey_labelled",
    context: "dom:*[accesskey]",
    refactor: {
        "HAAC_Accesskey_NeedLabel": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "element_accesskey_labelled.html",
            "Potential_1": "element_accesskey_labelled.html",
            "group": "element_accesskey_labelled.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "The element with an assigned 'accesskey' attribute does not have an associated label",
            "group": "An element with an assigned 'accesskey' attribute must have an associated label"
        }
    },
    rulesets: [{ 
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"], 
        "num": ["3.3.2"],
        "level": eRulePolicy.RECOMMENDATION, 
        "toolkitLevel": eToolkitLevel.LEVEL_ONE 
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        //skip the check if the element is hidden or disabled
        if (!VisUtil.isNodeVisible(ruleContext) || CommonUtil.isNodeDisabled(ruleContext))
            return;

        //skip if the element is tabbable, it's covered by other rules
        if (CommonUtil.isTabbable(ruleContext))
            return;

        let roles = AriaUtil.getRoles(ruleContext, true);
        //skip the native element, mostly text elements
        if (!roles || roles.length === 0) return;

        let patterns = ARIADefinitions.designPatterns[roles[0]]
        if (!patterns.nameFrom) 
            return;

        // ignore if accessble name is required (checked in other rules) or prohibited (text element)    
        if (patterns.nameRequired || !patterns.nameFrom || patterns.nameFrom.includes("prohibited"))
            return;
        
        //special case: legend, as a child of a fieldset, delegate the accesskey command to the field of the fieldset which is covered by other rules 
        if (ruleContext.parentElement && ruleContext.parentElement.nodeName.toLowerCase() === 'fieldset')
            return;

        // check if accessible name exists
        if (ARIAMapper.computeName(ruleContext).trim().length > 0)
            return RulePass("Pass_0");
        return RulePotential("Potential_1");

    }
}