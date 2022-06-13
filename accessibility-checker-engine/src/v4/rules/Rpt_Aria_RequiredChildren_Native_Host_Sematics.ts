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
import { NodeWalker, RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";

export let Rpt_Aria_RequiredChildren_Native_Host_Sematics: Rule = {
    id: "Rpt_Aria_RequiredChildren_Native_Host_Sematics",
    context: "dom:*[role]",
    dependencies: ["Rpt_Aria_ValidRole"],
    help: {
        "en-US": {
            "group": "Rpt_Aria_RequiredChildren_Native_Host_Sematics.html",
            "Pass_0": "Rpt_Aria_RequiredChildren_Native_Host_Sematics.html",
            "Potential_1": "Rpt_Aria_RequiredChildren_Native_Host_Sematics.html",
        }
    },
    messages: {
        "en-US": {
            "group": "An element with a ARIA role must contain required children",
            "Pass_0": "Rule Passed",
            "Potential_1": "The element with role \"{0}\" does not contain or own at least one child element with each of the following roles: \"{1}\""
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: Verify mapping
    act: ["bc4a75"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let passed = false;
        let designPatterns = ARIADefinitions.designPatterns;
        let roles = ruleContext.getAttribute("role").trim().toLowerCase().split(/\s+/);
        let doc = ruleContext.ownerDocument;
        let roleNameArr = new Array();
        let requiredChildren = new Array();
        let nodeName = ruleContext.nodeName.toLowerCase();

        // Handle the case where the element is hidden by disabled html5 attribute or aria-disabled:
        //  1. In the case that this element has a disabled attribute and the element supports it, we mark this rule as passed.
        //  2. In the case that this element has a aria-disabled attribute then, we mark this rule as passed.
        // For both of the cases above we do not need to perform any further checks, as the element is disabled in some form or another.
        if (RPTUtil.isNodeDisabled(ruleContext)) {
            return RulePass("Pass_0");
        }

        for (let j = 0, length = roles.length; j < length; ++j) {

            if (roles[j] === "combobox") {
                //  For combobox, we have g1193 ... g1199 to check the values etc.
                //  We don't want to trigger 1152 again. So, we bypass it here.
                passed = true;
                continue;
            }

            if (designPatterns[roles[j]] && designPatterns[roles[j]].reqChildren != null) {
                requiredChildren = designPatterns[roles[j]].reqChildren;
                let roleMissingReqChild = false;
                for (let i = 0, requiredChildrenLength = requiredChildren.length; i < requiredChildrenLength; i++) {
                    passed = RPTUtil.getDescendantWithRoleHidden(ruleContext, requiredChildren[i], true, true) || RPTUtil.getAriaOwnsWithRoleHidden(ruleContext, requiredChildren[i], true);
                    if (!passed) {
                        // See if an html equivalent child meets the requirement (e.g., radiogroup contains html radio buttons)
                        let htmlEquiv = designPatterns[requiredChildren[i]].htmlEquiv;
                        if (htmlEquiv) {
                            let nw = new NodeWalker(ruleContext);
                            while (!passed && nw.nextNode() && nw.node != ruleContext) {
                                // Following are the steps that are executed at this stage to determine if the node should be classified as hidden
                                // or not.
                                //  1. Only run isNodeVisible check if hidden content should NOT be checked. In the case that hidden content is to,
                                //     be scanned then we can just scan everything as normal. In the case that the current node is hidden we do not
                                //     add it to the roleToElems hash at all or even do any checking for it at all.
                                //
                                // Note: The if conditions uses short-circuiting so if the first condition is not true it will not check the next one,
                                //       so on and so forth.
                                if (RPTUtil.shouldNodeBeSkippedHidden(nw.node)) {
                                    continue;
                                }

                                //Check if the element has explicit role specified. If so, honor the role
                                if (!RPTUtil.hasAnyRole(nw.node, false)) {
                                    passed = RPTUtil.isHtmlEquiv(nw.node, htmlEquiv);
                                }
                            }
                            if (passed) break; // break incrementing over required children. At least one required child was found.
                        }
                    } else break; // break incrementing over required children. At least one required child was found.
                }
            } else passed = true; // No required children for this role
            if (!passed) {
                roleNameArr.push(roles[j]);
            }
        }
        let retToken = new Array();
        retToken.push(roleNameArr.join(", "));
        retToken.push(requiredChildren.join(", "));
        return passed ? RulePass("Pass_0") : RulePotential("Potential_1", retToken);
    }
}