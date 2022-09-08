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
import { DOMWalker } from "../../v2/dom/DOMWalker";

export let HAAC_List_Group_ListItem: Rule = {
    id: "HAAC_List_Group_ListItem",
    context: "aria:group",
    help: {
        "en-US": {
            "Pass_0": "HAAC_List_Group_ListItem.html",
            "Fail_1": "HAAC_List_Group_ListItem.html",
            "group": "HAAC_List_Group_ListItem.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "List component with \"group\" role has children that are not <listitem> elements",
            "group": "List component with \"group\" role must limit children to <listitem> elements"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let parent = DOMWalker.parentElement(ruleContext);
        if (!RPTUtil.hasRoleInSemantics(parent, "list")) {
            return null;
        }

        let passed = true;
        let children = ruleContext.children;
        for (let i = 0; passed && i < children.length; i++) {
            passed = RPTUtil.hasRoleInSemantics(children[i], "listitem");
        }
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}