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
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { VisUtil } from "../util/VisUtil";
import { CSSUtil } from "../util/CSSUtil";
export const element_tabbable_role_valid: Rule = {
    id: "element_tabbable_role_valid",
    context:"dom:*",
    help: {
        "en-US": {
            "pass": "element_tabbable_role_valid.html",
            "fail_invalid_role": "element_tabbable_role_valid.html",
            "fail_no_valid_role": "element_tabbable_role_valid.html",
            "group": "element_tabbable_role_valid.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The tabbable element has a widget role",
            "fail_invalid_role": "The tabbable element's role '{0}' is not a widget role",
            "fail_no_valid_role": "The tabbable element does not have a valid widget role",
            "group": "A tabbable element must have a valid widget role"
        }
    },
    rulesets: [{
            "id": ["IBM_Accessibility", "IBM_Accessibility_next"],
            "num": ["4.1.2"],
            "level": eRulePolicy.VIOLATION,
            "toolkitLevel": eToolkitLevel.LEVEL_ONE
        },
        {
            "id": ["WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
            "num": ["4.1.2"],
            "level": eRulePolicy.RECOMMENDATION,
            "toolkitLevel": eToolkitLevel.LEVEL_ONE
        }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        
        if (CommonUtil.isNodeDisabled(ruleContext) || VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        
        const nodeName = ruleContext.nodeName.toLowerCase();
        // if the element is tabbable by default with or without tabindex, let the other rules (such as widget_tabbable_single) to handle it
        if (nodeName in CommonUtil.tabTagMap ) {
            let value = CommonUtil.tabTagMap[nodeName];
            if (typeof (value) === "function") {
                value = value(ruleContext);
            } 
            if (value) return null;
        } 
        
        // handle the case: no tabindex or tabindex < 0
        if (!ruleContext.hasAttribute("tabindex") || parseInt(ruleContext.getAttribute("tabindex")) < 0)
            return null;
        
        // ignore if the element is scrollable
        if (VisUtil.isElementScrollable(ruleContext))
            return null;    

        // elements whose roles allow no descendants that are interactive or with a tabindex >= 0 
        // this case should be handled in widget_tabbable_single and aria_child_tabbable
        const roles_no_interactive_child =["button", "checkbox", "img", "link", "menuitem", "menuitemcheckbox", "menuitemradio", 
                               "option", "radio", "switch", "tab"];

        const parent = DOMWalker.parentNode(ruleContext);
        
        const parent_role = AriaUtil.getResolvedRole(parent as Element);
        
        // ignore if the parent role is in roles_no_interactive_child
        if (roles_no_interactive_child.includes(parent_role))
                 return null;
        
        let role = AriaUtil.getResolvedRole(ruleContext);
        if (!role) 
            return RuleFail("fail_no_valid_role"); 
        // ignore 'application' role that contains one or more focusable elements that do not follow a standard interaction pattern supported by a widget role:https://www.w3.org/TR/2023/PR-WAI-ARIA-1.2-20230328/#application 
        if (role === "application")
            return null;

        // handle the case: tabindex >= 0 to examine whether a widget role is setup or not 
        // pass if one of the roles is a widget type
        // Row is weird. It's structure, but can also be widget
        // Focusable separators are widgets
        if (role === "row" || role === "separator" || ARIADefinitions.designPatterns[role].roleType === 'widget') {
                return RulePass("pass");
        }
            
        return RuleFail("fail_invalid_role", [role]);
    }
}