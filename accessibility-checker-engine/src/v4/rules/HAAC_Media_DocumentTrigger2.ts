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

export let HAAC_Media_DocumentTrigger2: Rule = {
    id: "HAAC_Media_DocumentTrigger2",
    context: "dom:a[href],dom:area[href]",
    help: {
        "en-US": {
            "Pass_0": "HAAC_Media_DocumentTrigger2.html",
            "Manual_1": "HAAC_Media_DocumentTrigger2.html",
            "group": "HAAC_Media_DocumentTrigger2.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Manual_1": "Verify that the file download mechanism does not cause a keyboard trap",
            "group": "File download mechanisms should be keyboard-operable and preserve page focus location"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["2.1.2"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let href = ruleContext.getAttribute("href");
        let ext = RPTUtil.getFileExt(href);
        let passed = ![".docx", ".doc", ".pdf", ".odt"].includes(ext);
        if (passed) return null;
        if (!passed) return RuleManual("Manual_1");

    }
}