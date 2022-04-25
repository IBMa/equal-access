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

import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let RPT_Style_HinderFocus1: Rule = {
    id: "RPT_Style_HinderFocus1",
    context: "dom:style, dom:*[style]",
    help: {
        "en-US": {
            "group": `RPT_Style_HinderFocus1.html`,
            "Pass_0": `RPT_Style_HinderFocus1.html`,
            "Potential_1": `RPT_Style_HinderFocus1.html`
        }
    },
    messages: {
        "en-US": {
            "group": "The keyboard focus indicator must be highly visible when default border or outline is modified by CSS",
            "Pass_0": "Rule Passed",
            "Potential_1": "Check the keyboard focus indicator is highly visible when using CSS elements for border or outline"
        }
    },
    rulesets: [{
        id: ["IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: "2.4.7", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            skipNodes: {
                value: ["table"],
                type: "[string]"
            },
            regex1: {
                value: /(^|})([^{]*){[^}]*(outline|border)[ \t]*\:/gi,
                type: "regex"
            },
            regex2: {
                value: /([a-z]+)[ \t]*(,|$)/gi,
                type: "regex"
            }
        }
        const ruleContext = context["dom"].node as Element;
        if (!RPTUtil.isTabbable(ruleContext)) {
            return null;
        }
        let skipNodes = validateParams.skipNodes.value;

        let passed = true;
        // Note: link to be handled by RPT_Style_ExternalStyleSheet
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (nodeName === "style") {
            let textValue = RPTUtil.getInnerText(ruleContext);
            let r = validateParams.regex1.value;
            r.lastIndex = 0;
            let m; let m2;
            while (passed && (m = r.exec(textValue)) !== null) {
                let selector = m[2];
                let r2 = validateParams.regex2.value;
                r2.lastIndex = 0;
                while (passed && (m2 = r2.exec(selector)) !== null) {
                    passed = skipNodes.includes(m2[1].trim().toLowerCase());
                }
            }
        } else if (!ruleContext.hasAttribute("disabled") ||
            ruleContext.getAttribute("disabled").toLowerCase() === "false") {
            let textValue = ruleContext.getAttribute('style');
            passed = skipNodes.includes(nodeName) ||
                !(/(outline|border)[ \t]*\:/.test(textValue));
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");
    }
}
