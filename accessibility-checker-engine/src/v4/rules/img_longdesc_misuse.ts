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
import { VisUtil } from "../../v2/dom/VisUtil";

export let img_longdesc_misuse: Rule = {
    id: "img_longdesc_misuse",
    context: "dom:img[longdesc]",
    refactor: {
        "RPT_Img_LongDescription2": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "img_longdesc_misuse.html",
            "Potential_1": "img_longdesc_misuse.html",
            "group": "img_longdesc_misuse.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that the file designated by the 'longdesc' attribute contains valid HTML content (file extension not recognized)",
            "group": " The 'longdesc' attribute must reference HTML content"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let longdesc = ruleContext.getAttribute("longdesc");
        // if (longdesc is bad URL) passed = false;

        let ext = RPTUtil.getFileExt(longdesc);
        let passed = ext.length != 0 && RPTUtil.isHtmlExt(ext)
            || longdesc.startsWith("#")
            || longdesc.startsWith("http://")
            || longdesc.startsWith("https://")
            || longdesc.startsWith("data:");

        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");

    }
}