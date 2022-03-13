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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../../../api/IRule";
import { RPTUtil } from "../../../../v2/checker/accessibility/util/legacy";
import { ARIADefinitions } from "../../../../v2/aria/ARIADefinitions";

export let Rpt_Aria_RequiredParent_Native_Host_Sematics: Rule = {
    id: "Rpt_Aria_RequiredParent_Native_Host_Sematics",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    help: {
        "en-US": {
            "Pass_0": "Rpt_Aria_RequiredParent_Native_Host_Sematics.html",
            "Fail_1": "Rpt_Aria_RequiredParent_Native_Host_Sematics.html",
            "group": "Rpt_Aria_RequiredParent_Native_Host_Sematics.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The element with role \"{0}\" is not contained in or owned by an element with one of the following roles: \"{1}\"",
            "group": "An element with an implicit or explicit role must be contained within a valid element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: {},
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = true;
        let designPatterns = ARIADefinitions.designPatterns;
        let roleNameArr = new Array();
        let containerRoles = new Array();
        let testedContainer = 0;

        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
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