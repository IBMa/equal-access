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
import { ARIAMapper } from "../../../../v2/aria/ARIAMapper";
import { FragmentUtil } from "../../../../v2/checker/accessibility/util/fragment";

export let group_withInputs_hasName: Rule = {
    id: "group_withInputs_hasName",
    context: "aria:group",
    help: {
        "en-US": {
            "Pass_1": "group_withInputs_hasName.html",
            "Fail_1": "group_withInputs_hasName.html",
            "Fail_2": "group_withInputs_hasName.html",
            "group": "group_withInputs_hasName.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_1": "Group/Fieldset \"{0}\" with an input has a unique name",
            "Fail_1": "Group/Fieldset does not have an accessible name",
            "Fail_2": "Group/Fieldset \"{0}\" has a duplicate name to another group",
            "group": "Groups with nested inputs must have unique accessible name"
        }
    },
    rulesets: [{ 
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"], 
        "num": ["1.3.1", "3.3.2"], 
        "level": eRulePolicy.VIOLATION, 
        "toolkitLevel": eToolkitLevel.LEVEL_THREE 
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let ownerDocument = FragmentUtil.getOwnerFragment(ruleContext);
        let formCache = RPTUtil.getCache(
            ruleContext.ownerDocument,
            "landmark_name_unique",
            null
        );

        if (!formCache) {
            formCache = {
                groupsWithInputs: [],
                groupsWithInputsComputedLabels: [],
            };
            let allGroupsTemp = ownerDocument.querySelectorAll(
                'fieldset,[role="group"]'
            );
            let allGroups = Array.from(allGroupsTemp);
            let groupsWithInputs = [];
            for (let i = 0; i < allGroups.length; i++) {
                // Loop over all the group nodes
                if (allGroups[i].querySelector("input")) {
                    groupsWithInputs.push(allGroups[i]);
                }
            }
            let groupsWithInputsComputedLabels = [];
            for (let i = 0; i < groupsWithInputs.length; i++) {
                // Loop over all the landmark nodes
                groupsWithInputsComputedLabels.push(
                    ARIAMapper.computeName(groupsWithInputs[i])
                );
            }
            formCache.groupsWithInputs = groupsWithInputs;
            formCache.groupsWithInputsComputedLabels =
                groupsWithInputsComputedLabels;
        }
        // formCache.groupsWithInputs.forEach(element => {
        //     console.log("formCache.groupsWithInputs: " +element.id)
        // });
        // console.log("formCache.groupsWithInputsComputedLabels: " +formCache.groupsWithInputsComputedLabels)
        // console.log("formCache.groupsWithInputsComputedLabels: " +formCache.groupsWithInputsComputedLabels.length)

        let ruleContextFoundIngroupsWithInputsFlag = false;
        let computedName = "";
        if (!formCache.groupsWithInputs) {
            // We do not have any groups with inputs. Therefore we should skip this rule trigger.
            return null;
        }

        for (let i = 0; i < formCache.groupsWithInputs.length; i++) {
            if (ruleContext.isSameNode(formCache.groupsWithInputs[i])) {
                // We have found our ruleContext in the cache
                ruleContextFoundIngroupsWithInputsFlag = true;
                if (
                    formCache.groupsWithInputsComputedLabels[i] === "" ||
                    formCache.groupsWithInputsComputedLabels[i] === null
                ) {
                    // console.log("Fail_1")
                    return RuleFail("Fail_1");
                }
                let foundSameNameFlag = false;
                for (
                    let j = 0;
                    j < formCache.groupsWithInputsComputedLabels.length;
                    j++
                ) {
                    if (i == j) {
                        continue;
                    } // We do not want to compare against ourselfs
                    if (
                        formCache.groupsWithInputsComputedLabels[i] ===
                        formCache.groupsWithInputsComputedLabels[j]
                    ) {
                        foundSameNameFlag = true;
                    }
                }
                if (foundSameNameFlag) {
                    // console.log("Fail_2")
                    return RuleFail("Fail_2", [
                        formCache.groupsWithInputsComputedLabels[i],
                    ]);
                }
                computedName = formCache.groupsWithInputsComputedLabels[i];
            }
        }
        if (!ruleContextFoundIngroupsWithInputsFlag) {
            // console.log("null return")
            return null;
        }
        // console.log("Pass_1")
        return RulePass("Pass_1", [computedName]);
    }
}