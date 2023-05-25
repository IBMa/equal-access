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
import { VisUtil } from "../../v2/dom/VisUtil";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";

export let aria_accessiblename_exists: Rule = {
    id: "aria_accessiblename_exists",
    context: "aria:alertdialog, aria:application, aria:button, aria:checkbox, aria:columnheader,   aria:combobox, aria:form, aria:heading, aria:img, aria:link, aria:meter, aria:menuitem, aria:menuitemcheckbox, aria:menuitemradio, aria:option, aria:progressbar, aria:radio, aria:radiogroup, aria:region,  aria:rowheader, aria:searchbox, aria:slider, aria:spinbutton, aria:switch,  aria:tab, aria:table, aria:tabpanel, aria:textbox, aria:treegrid, aria:treeitem",
    //context: "aria:button,aria:checkbox,aria:combobox,aria:listbox,aria:menuitemcheckbox,aria:menuitemradio,aria:radio,aria:searchbox,aria:slider,aria:spinbutton,aria:switch,aria:textbox,aria:progressbar,dom:input[type=file],dom:output,dom:meter,dom:input[type=password]",
    dependencies: ["aria_role_valid", "aria_role_redundant"],
    help: {
        "en-US": {
            "pass": "aria_accessiblename_exists.html",
            "fail_no_accessible_name": "aria_accessiblename_exists.html",
            "group": "aria_accessiblename_exists.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "An accessible name is provided for the element",
            "fail_no_accessible_name": "Element <{0}> with \"{0}\" role has no accessible name",
            "group": "Elements with cerain roles must have accessible names per ARIA specification"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;

        let nodeName = ruleContext.nodeName.toLowerCase();
        //ignore datalist element check since it will be part of a input element or hidden by default
        if (nodeName === 'datalist')
            return null;
        
        if (RPTUtil.attributeNonEmpty(ruleContext, "aria-label") || RPTUtil.attributeNonEmpty(ruleContext, "aria-labelledby") || RPTUtil.attributeNonEmpty(ruleContext, "title")) {
            let roles = RPTUtil.getRoles(ruleContext, true);
            if (roles && roles.length > 0) {
                //when multiple roles specified, only the first valid role is applied, and the others just as fallbacks
                if (ARIADefinitions.designPatterns[roles[0]].nameFrom && ARIADefinitions.designPatterns[roles[0]].nameFrom.includes("contents")) {
                    if (!RPTUtil.getInnerText(ruleContext) || RPTUtil.getInnerText(ruleContext).trim().length === 0)
                        return RuleFail("fail_no_accessible_name", [nodeName, roles[0]]);  
                }
            } 
        }
    }
}
