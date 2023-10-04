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
import { getDeprecatedAriaRoles, getDeprecatedAriaAttributes, getRolesUndefinedByAria} from "../util/CommonUtil";

export let aria_accessiblename_exists: Rule = {
    id: "aria_accessiblename_exists",
    context: "aria:columnheader, aria:form, aria:heading, aria:rowheader, aria:table, doc-backlink, doc-biblioentry, doc-biblioref, doc-glossref, doc-noteref, doc-pagebreak",
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
            "group": "Elements with certain roles should have accessible names"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", , "WCAG_2_0"],
        "num": ["1.3.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;

        // when table element with a caption as first child
        if (ruleContext.nodeName.toLocaleLowerCase() === 'table' 
            && ruleContext.firstElementChild && ruleContext.firstElementChild.nodeName.toLowerCase() === 'caption'
            && ruleContext.firstElementChild.textContent && ruleContext.firstElementChild.textContent.trim().length > 0)
            return RulePass("pass");

        const invalidRoles = getRolesUndefinedByAria(ruleContext);
        if (invalidRoles && invalidRoles.length > 0) return null;
        const deprecatedRoles = getDeprecatedAriaRoles(ruleContext);
        if (deprecatedRoles && deprecatedRoles.length > 0) return null;
        const deprecatedAttributes = getDeprecatedAriaAttributes(ruleContext);
        if (deprecatedAttributes && deprecatedAttributes.length > 0) return null;

        if ( RPTUtil.getAriaLabel(ruleContext).trim().length === 0 && !RPTUtil.attributeNonEmpty(ruleContext, "title")) {
            let roles = RPTUtil.getRoles(ruleContext, true);
            //when multiple roles specified, only the first valid role is applied, and the others just as fallbacks
            if (roles && roles.length > 0 && ARIADefinitions.designPatterns[roles[0]] && ARIADefinitions.designPatterns[roles[0]].nameFrom && ARIADefinitions.designPatterns[roles[0]].nameFrom.includes("contents")) {
                //if (!RPTUtil.getInnerText(ruleContext) || RPTUtil.getInnerText(ruleContext).trim().length === 0)
                //exclude the hidden text?
                if (!RPTUtil.hasInnerContentHidden(ruleContext))
                    return RuleFail("fail_no_accessible_name", [ruleContext.nodeName.toLowerCase(), roles[0]]);  
            } else 
                return RuleFail("fail_no_accessible_name", [ruleContext.nodeName.toLowerCase(), roles[0]]);   
        }
        return RulePass("pass");
    }
}
