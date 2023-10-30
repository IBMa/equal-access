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
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { getDefinedStyles } from "../util/CSSUtil";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { VisUtil } from "../../v2/dom/VisUtil";

export let element_tabbable_role_valid: Rule = {
    id: "element_tabbable_role_valid",
    context:"dom:*",
    help: {
        "en-US": {
            "pass": "element_tabbable_role_valid.html",
            "fail_invalid_role": "element_tabbable_role_valid.html",
            "group": "element_tabbable_role_valid.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The tabbable element has a widget role",
            "fail_invalid_role": "The tabbable element's role '{0}' is not a widget role",
            "group": "A tabbable element must have a valid widget role"
        }
    },
    rulesets: [{
            "id": ["IBM_Accessibility"],
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
        
        if (RPTUtil.isNodeDisabled(ruleContext) || VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        
        const nodeName = ruleContext.nodeName.toLowerCase();
        // if the element is tabbable by default with or without tabindex, let the other rules (such as widget_tabbable_single) to handle it
        if (nodeName in RPTUtil.tabTagMap ) {
            let value = RPTUtil.tabTagMap[nodeName];
            if (typeof (value) === "function") {
                value = value(ruleContext);
            } 
            if (value) return null;
        } 
        
        // handle the case: no tabindex or tabindex < 0
        if (!ruleContext.hasAttribute("tabindex") || parseInt(ruleContext.getAttribute("tabindex")) < 0)
            return null;
        
        // ignore elements with CSS overflow: scroll or auto
        let styles = getDefinedStyles(ruleContext);
        if (styles['overflow-x'] === 'scroll' || styles['overflow-y'] === 'scroll' 
            || styles['overflow-x'] === 'auto' || styles['overflow-y'] === 'auto')
            return null;

        let roles = RPTUtil.getRoles(ruleContext, false);
        // ignore 'application' role that contains one or more focusable elements that do not follow a standard interaction pattern supported by a widget role:https://www.w3.org/TR/2023/PR-WAI-ARIA-1.2-20230328/#application 
        if (roles && roles.includes("application"))
            return null;
        
        // elements whose roles allow no descendants that are interactive or with a tabindex >= 0 
        // this case should be handled in widget_tabbable_single and aria_child_tabbable
        const roles_no_interactive_child =["button", "checkbox", "img", "link", "menuitem", "menuitemcheckbox", "menuitemradio", 
                               "option", "radio", "switch", "tab"];

        if (!roles || roles.length === 0) {
            roles = RPTUtil.getImplicitRole(ruleContext);
        }
        const parent = DOMWalker.parentNode(ruleContext);
        const parent_roles = RPTUtil.getRoles(parent as Element, true);
        
        // ignore if one of the parent roles is in roles_no_interactive_child
        for (let i=0; i < parent_roles.length; i++) {
            if (roles_no_interactive_child.includes(parent_roles[i]))
                 return null;
        }

        // handle the case: tabindex >= 0 to examine whether a widget role is setup or not 
        // pass if one of the roles is a widget type
        for (let i=0; i < roles.length; i++) {
            // Row is weird. It's structure, but can also be widget
            if (roles[i] === "row" || ARIADefinitions.designPatterns[roles[i]].roleType === 'widget') {
                 return RulePass("pass");
            }
            // Focusable separators are widgets
            if (roles[i] === "separator") {
                return RulePass("pass");
            }
        }
            
        return RuleFail("fail_invalid_role", [roles.length === 0 ? 'none' : roles.join(', ')]);
    }
}