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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let aria_activedescendant_tabindex_valid: Rule = {
    id: "aria_activedescendant_tabindex_valid",
    context: "dom:*[aria-activedescendant]",
    refactor: {
        "Rpt_Aria_InvalidTabindexForActivedescendant": {
            "pass": "pass",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "pass": "aria_activedescendant_tabindex_valid.html",
            "Fail_1": "aria_activedescendant_tabindex_valid.html",
            "group": "aria_activedescendant_tabindex_valid.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "Fail_1": "The <{0}> element using 'aria-activedescendant' set to \"{1}\" is not tabbable",
            "group": "Element using 'aria-activedescendant' property should be tabbable"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let passed = false;
        let nodeName = ruleContext.nodeName.toLowerCase();

        // Rule not supported on mobile
        if (ruleContext.hasAttribute("class") && ruleContext.getAttribute("class").substring(0, 3) == "mbl") {
            return null;
        }

        // Handle the case where the element is hidden by disabled html5 attribute or aria-disabled:
        //  1. In the case that this element has a disabled attribute and the element supports it, we mark this rule as passed.
        //  2. In the case that this element has a aria-disabled attribute then, we mark this rule as passed.
        // For both of the cases above we do not need to perform any further checks, as the element is disabled in some form or another.
        if (RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }

        //check if the attribute 'aria-activedescendant' is valid for the role of the element
        

        // If the tabindex attribute is provided then verify that it is 0 or -1
        passed = RPTUtil.isTabbable(ruleContext);

        // pass if one of the children is tabbable. in this case, the tab will stop on the first tabbable element
        if (!passed) 
            passed = RPTUtil.getTabbableChildren(ruleContext) > 0;

        // Build array for node token
        let retToken1 = new Array();
        retToken1.push(nodeName);

        // Build array for id referenced by aria-activedescendant
        let retToken2 = new Array();
        retToken2.push(ruleContext.getAttribute("aria-activedescendant").split(" ").join(", "));

        //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [retToken1, retToken2]);
        if (!passed) {
            return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
        } else {
            return RulePass("pass");
        }
    }
}