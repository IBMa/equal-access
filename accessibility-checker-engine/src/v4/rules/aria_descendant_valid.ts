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
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let aria_descendant_valid: Rule = {
    id: "aria_descendant_valid",
    context: "dom:*",
    dependencies: ["aria_semantics_role"],
    help: {
        "en-US": {
            "group": "aria_descendant_valid.html",
            "Pass": "aria_descendant_valid.html",
            "Fail_no_child": "aria_descendant_valid.html",
            "Fail_invalid_child": "aria_descendant_valid.html"
        }
    },
    messages: {
        "en-US": {
            "group": "An element with a ARIA role must own a required child",
            "Pass": "An element with a ARIA role owns a required child",
            "fail_with_no_presentation_child": "The element with role \"{0}\" owns the child element with the role \"{1}\" that is not one of the allowed role(s): \"{2}\""
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: Verify mapping
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        
        //skip the check if the element doesn't require presentational children only or is hidden or disabled
        if (!RPTUtil.containsPresentationalChildrenOnly(ruleContext) || RPTUtil.isNodeHiddenFromAT(ruleContext) || RPTUtil.isNodeDisabled(ruleContext))
            return;
        
        let tagName = ruleContext.tagName.toLowerCase();
        // get all the children from accessibility tree, 
        // including ones with aria-owns    
        let directATChildren = RPTUtil.getDirectATChildren(ruleContext);
        
        if (directATChildren && directATChildren.length > 0) {
            // the element with at least one non-presentational children
            return RuleFail("fail_with_no_presentation_child", [tagName]);
        }
        return RulePass("Pass");
    }
}