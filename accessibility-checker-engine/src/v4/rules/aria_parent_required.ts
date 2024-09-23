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
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";

export const aria_parent_required: Rule = {
    id: "aria_parent_required",
    context: "dom:*[role]",
    dependencies: ["aria_role_allowed"],
    refactor: {
        "Rpt_Aria_RequiredParent_Native_Host_Sematics": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"
        }
    },
    help: {
        "en-US": {
            "group": "aria_parent_required.html",
            "Pass_0": "aria_parent_required.html",
            "Fail_1": "aria_parent_required.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Each element with an implicit or explicit role must be contained within a valid element",
            "Pass_0": "Rule Passed",
            "Fail_1": "Element with \"{0}\" role is not contained in or owned by an element with one of the following roles: \"{1}\""
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: Check Fail 3
    act: "ff89c9",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        
        //skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || CommonUtil.isNodeDisabled(ruleContext))
            return;
        
        //skip the check if the element should be a presentational child of an element
        if (AriaUtil.shouldBePresentationalChild(ruleContext))
            return;
        
        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        
        // ignore if the element contains none or presentation role
        let presentationRoles = ["none", "presentation"];
        const found = roles.some(r=> presentationRoles.includes(r));
        if (found) return null;
        
        let passed = true;
        let designPatterns = ARIADefinitions.designPatterns;
        let roleNameArr = new Array();
        let containerRoles = new Array();
        let testedContainer = 0;

        let ancestorRoles = contextHierarchies["aria"].map(info => info.role);
        let parentRole = ancestorRoles[ancestorRoles.length - 2];
        let count = 2;
        while (parentRole === 'none') {
            count++;
            parentRole = ancestorRoles[ancestorRoles.length - count];

        }
        for (let j = 0, length = roles.length; j < length; ++j) {
            if (designPatterns[roles[j]] && designPatterns[roles[j]].container != null) {
                testedContainer++;
                passed = false;
                containerRoles = designPatterns[roles[j]].container;
                for (let i = 0, containersLength = containerRoles.length; !passed && i < containersLength; i++) {
                    passed = parentRole === containerRoles[i];
                    if (passed) break;
                }
                if (passed == false) {
                    roleNameArr.push(roles[j]);
                }
            }
        } 

        let retToken1 = new Array();
        retToken1.push(roleNameArr.join(", "));
        let retToken2 = new Array();
        retToken2.push(containerRoles.join(", "));
        //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [retToken1, retToken2]);
        if (testedContainer == 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
        } else {
            return RulePass("Pass_0");
        }
    }
}