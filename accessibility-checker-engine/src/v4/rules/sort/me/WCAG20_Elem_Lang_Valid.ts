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
import { LangUtil } from "../../../../v2/checker/accessibility/util/lang";

export let WCAG20_Elem_Lang_Valid: Rule = {
    id: "WCAG20_Elem_Lang_Valid",
    context: "dom:*[lang], dom:*[xml:lang]",
    help: {
        "en-US": {
            "Pass_0": "WCAG20_Elem_Lang_Valid.html",
            "Fail_1": "WCAG20_Elem_Lang_Valid.html",
            "Fail_2": "WCAG20_Elem_Lang_Valid.html",
            "Fail_3": "WCAG20_Elem_Lang_Valid.html",
            "Fail_4": "WCAG20_Elem_Lang_Valid.html",
            "group": "WCAG20_Elem_Lang_Valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Lang has a valid primary lang and conforms to BCP 47",
            "Fail_1": "Specified 'lang' attribute does not include a valid primary language",
            "Fail_2": "Specified 'lang' attribute does not conform to BCP 47",
            "Fail_3": "Specified 'lang' attribute does not include a valid primary language",
            "Fail_4": "Specified 'xml:lang' attribute does not conform to BCP 47",
            "group": "The language of content must be valid and specified in accordance with BCP 47"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["3.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [{
        "b5c3f8": {
            "Pass_0": "pass",
            "Fail_1": "fail",
            "Fail_2": "inapplicable",
            "Fail_3": "inapplicable",
            "Fail_4": "inapplicable"
        },
        "bf051a": {
            "Pass_0": "pass",
            "Fail_1": "fail",
            "Fail_2": "pass",
            "Fail_3": "fail",
            "Fail_4": "inapplicable"
        },
        // TODO: ACT: Mismatch because they don't check the html element in the same rule
        "de46e4": {
            "Pass_0": "pass",
            "Fail_1": "fail",
            "Fail_2": "pass",
            "Fail_3": "inapplicable",
            "Fail_4": "inapplicable"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (ruleContext.hasAttribute("lang")) {
            if (nodeName !== "html" && ruleContext.getAttribute("lang") === "") {
                // It's okay to have a lang="" if not on html
            } else {
                let langStr = ruleContext.getAttribute("lang");
                if (!LangUtil.validPrimaryLang(langStr)) {
                    return RuleFail("Fail_1");
                }
                if (!LangUtil.isBcp47(langStr)) {
                    return RuleFail("Fail_2");
                }
            }
        }
        if (ruleContext.hasAttribute("xml:lang")) {
            if (nodeName !== "html" && ruleContext.getAttribute("xml:lang") === "") {
                // It's okay to have a lang="" if not on html
            } else {
                let langStr = ruleContext.getAttribute("xml:lang");
                if (!LangUtil.validPrimaryLang(langStr)) {
                    return RuleFail("Fail_3");
                }
                if (!LangUtil.isBcp47(langStr)) {
                    return RuleFail("Fail_4");
                }
            }
        }
        return RulePass("Pass_0");
    }
}