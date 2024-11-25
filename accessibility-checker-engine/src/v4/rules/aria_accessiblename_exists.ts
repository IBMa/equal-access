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
import { VisUtil } from "../util/VisUtil";
import { AccNameUtil } from "../util/AccNameUtil";

export const aria_accessiblename_exists: Rule = {
    id: "aria_accessiblename_exists",
    context: "aria:columnheader, aria:form, aria:heading, aria:rowheader, aria:table, aria:graphics-document,aria:graphics-symbol, aria:img,aria:image, doc-backlink, doc-biblioentry, doc-biblioref, doc-glossref, doc-noteref, doc-pagebreak, doc-example",
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
            "fail_no_accessible_name": "Element <{0}> with \"{1}\" role has no accessible name",
            "fail_no_accessible_name_image": "Element <{0}> with \"{1}\" role has no accessible name",
            "group": "Elements with certain roles should have accessible names"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE,
        reasonCodes: ["fail_no_accessible_name"]
    },
    {
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["ARIA"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE,
        reasonCodes: ["fail_no_accessible_name_image"]
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;

        let nodeName = ruleContext.nodeName.toLocaleLowerCase();
        // svg element is handled in svg_graphics_labbelled rule and image rules
        if (nodeName === 'svg' || nodeName === 'img') return;
        
        // when table element with a caption as first child
        if (nodeName === 'table' 
            && ruleContext.firstElementChild && ruleContext.firstElementChild.nodeName.toLowerCase() === 'caption'
            && ruleContext.firstElementChild.textContent && ruleContext.firstElementChild.textContent.trim().length > 0)
            return RulePass("pass");

        const invalidRoles = AriaUtil.getRolesUndefinedByAria(ruleContext);
        if (invalidRoles && invalidRoles.length > 0) return null;
        const deprecatedRoles = AriaUtil.getDeprecatedAriaRoles(ruleContext);
        if (deprecatedRoles && deprecatedRoles.length > 0) return null;
        const deprecatedAttributes = AriaUtil.getDeprecatedAriaAttributes(ruleContext);
        if (deprecatedAttributes && deprecatedAttributes.length > 0) return null;

        let role = AriaUtil.getResolvedRole(ruleContext);
        
        const name_pair = AccNameUtil.computeAccessibleName(ruleContext);
        if (!name_pair || !name_pair.name || name_pair.name.trim().length === 0) {
            if (role === 'img' || role === 'image')
                return RuleFail("fail_no_accessible_name_image", [ruleContext.nodeName.toLowerCase(), role]); 
            return RuleFail("fail_no_accessible_name", [ruleContext.nodeName.toLowerCase(), role]);
        }    
        return RulePass("pass");
    }
}
