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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../../v2/dom/VisUtil";

export let input_haspopup_conflict: Rule = {
    id: "input_haspopup_conflict",
    context: "dom:input[list][aria-haspopup]",
    refactor: {
        "input_haspopup_invalid": {
            "Potential_1": "potential_type_misuse",
            "Potential_2": "potential_misuse"}
    },
    help: {
        "en-US": {
            "group": "input_haspopup_conflict.html",
            "potential_type_misuse": "input_haspopup_conflict.html",
            "potential_misuse": "input_haspopup_conflict.html",
            "potential_list_notexist": "input_haspopup_conflict.html",
            "fail_invalid_list_type": "input_haspopup_conflict.html",
            "fail_invalid_list_elem": "input_haspopup_conflict.html"
        }
    },
    messages: {
        "en-US": {
            "group": "<input> element with a 'list' attribute should not use an explicit 'aria-haspopup' attribute",
            "potential_type_misuse": "The <input> element with type \"{0}\" and 'list' attribute uses an explicit 'aria-haspopup' attribute",
            "potential_misuse": "The <input> element with a missing or invalid type and 'list' attribute uses an explicit 'aria-haspopup' attribute",
            "potential_list_notexist": "The list attribute for the <input> element is invalid",
            "fail_invalid_list_type": "The list attribute for the <input> element with the type \"{0}\" is invalid",
            "fail_invalid_list_elem": "The list attribute for the <input> element does not reference a datalist element"
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

        //skip if the fieldset is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return null;

        let roles = RPTUtil.getUserDefinedRoles(ruleContext);
        // let "aria_role_valid" to handle invalid role. Only allowed role is combobox which is implicit. 
        if (roles && roles.length > 0 && !roles.includes('combobox')) 
            return null;         

        //triggering input types: text, search, tel, url, email, or missing or invalid 
        let yesTypes = ["text", "search", "tel", "url", "email", "date", "month", "week", "time", "datetime-local", "number", "range", "color"];
        let noTypes = ["file", "password", "checkbox", "radio", "submit", "reset", "image", "hidden", "button"];

        let attrValue = ruleContext.getAttribute("type");
        //missing input type for list but with aria_has_popup
        if (!attrValue || attrValue.trim().length === 0)
            return RulePotential("potential_misuse");

        attrValue = attrValue.trim().toLowerCase();
        //invalid input types for list but with aria_has_popup
        if (!yesTypes.includes(attrValue) && !noTypes.includes(attrValue))
            return RulePotential("potential_misuse");

        // the list attribute is used for wrong input type
        if (attrValue && noTypes.includes(attrValue))
            return RuleFail("fail_invalid_list_type");

        let list = ruleContext.getAttribute("list");
        // the list attribute is blank
        if (!list || list.trim().length === 0)
            return RulePotential("potential_list_notexist");

        let listElem = ruleContext.ownerDocument.getElementById(list);
        // the list element doesn't exist
        if (!listElem)
            return RuleFail("potential_list_notexist");

        // the list element is not a datalist element
        if (listElem.nodeName.toLowerCase() !== 'datalist')
            return RuleFail("fail_invalid_list_elem");

        // valid input types for list but with aria_has_popup    
        if (yesTypes.includes(attrValue))
            return RulePotential("potential_type_misuse", [attrValue]);
        
        // shouldn't get here 
            return;
    }
}