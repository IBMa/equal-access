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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy, eRuleConfidence } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { LangUtil } from "../../v2/checker/accessibility/util/lang";
import { VisUtil } from "../util/VisUtil";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { ARIAMapper } from "../../v2/aria/ARIAMapper";

const validateLang = (context: RuleContext): number => {
    const ruleContext = context["dom"].node as Element;
    let nodeName = ruleContext.nodeName.toLowerCase();
    if (ruleContext.hasAttribute("lang")) {
        if (nodeName !== "html" && ruleContext.getAttribute("lang") === "") {
            // It's okay to have a lang="" if not on html
        } else {
            let langStr = ruleContext.getAttribute("lang");
            if (!LangUtil.validPrimaryLang(langStr)) {
                return 1;
            }
            if (!LangUtil.isBcp47(langStr)) {
                return 2;
            }
        }
    }
    if (ruleContext.hasAttribute("xml:lang")) {
        if (nodeName !== "html" && ruleContext.getAttribute("xml:lang") === "") {
            // It's okay to have a lang="" if not on html
        } else {
            let langStr = ruleContext.getAttribute("xml:lang");
            if (!LangUtil.validPrimaryLang(langStr)) {
                return 3;
            }
            if (!LangUtil.isBcp47(langStr)) {
                return 4;
            }
        }
    }
    return 0;
}

export let html_lang_valid: Rule = {
    id: "html_lang_valid",
    context: "dom:html[lang], dom:html[xml:lang]",
    help: {
        "en-US": {
            "Pass_0": "html_lang_valid.html",
            "Fail_1": "html_lang_valid.html",
            "Fail_2": "html_lang_valid.html",
            "Fail_3": "html_lang_valid.html",
            "Fail_4": "html_lang_valid.html",
            "group": "html_lang_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Lang has a valid primary lang and conforms to BCP 47",
            "Fail_1": "Specified 'lang' attribute does not include a valid primary language",
            "Fail_2": "Specified 'lang' attribute does not conform to BCP 47",
            "Fail_3": "Specified 'xml:lang' attribute does not include a valid primary language",
            "Fail_4": "Specified 'xml:lang' attribute does not conform to BCP 47",
            "group": "The default human language of the page must be valid and specified in accordance with BCP 47"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["3.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
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
        // "de46e4": {
        //     "Pass_0": "pass",
        //     "Fail_1": "fail",
        //     "Fail_2": "pass",
        //     "Fail_3": "inapplicable",
        //     "Fail_4": "inapplicable"
        // }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        let reasonCode = validateLang(context);
        // This is done here instead of in validateLang so that the genHelp code will pick it up
        let retArr = [
            RulePass("Pass_0"),
            RuleFail("Fail_1"),
            RuleFail("Fail_2"),
            RuleFail("Fail_3"),
            RuleFail("Fail_4")
        ]
        return retArr[reasonCode];
    }
}

export let element_lang_valid: Rule = {
    id: "element_lang_valid",
    context: "dom:*[lang], dom:*[xml:lang]",
    help: {
        "en-US": {
            "Pass_0": "element_lang_valid.html",
            "Fail_1": "element_lang_valid.html",
            "Fail_2": "element_lang_valid.html",
            "Fail_3": "element_lang_valid.html",
            "Fail_4": "element_lang_valid.html",
            "group": "element_lang_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Lang has a valid primary lang and conforms to BCP 47",
            "Fail_1": "Specified 'lang' attribute does not include a valid primary language",
            "Fail_2": "Specified 'lang' attribute does not conform to BCP 47",
            "Fail_3": "Specified 'xml:lang' attribute does not include a valid primary language",
            "Fail_4": "Specified 'xml:lang' attribute does not conform to BCP 47",
            "group": "The change in language of specific content must be valid and specified in accordance with BCP 47"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["3.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [{
        // "b5c3f8": {
        //     "Pass_0": "pass",
        //     "Fail_1": "fail",
        //     "Fail_2": "inapplicable",
        //     "Fail_3": "inapplicable",
        //     "Fail_4": "inapplicable"
        // },
        // "bf051a": {
        //     "Pass_0": "pass",
        //     "Fail_1": "fail",
        //     "Fail_2": "pass",
        //     "Fail_3": "fail",
        //     "Fail_4": "inapplicable"
        // },
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
        // If it's the HTML node, that's handled by html_lang_valid
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (nodeName === "html") return null;
        let reasonCode = validateLang(context);
        // This is done here instead of in validateLang so that the genHelp code will pick it up
        let retArr = [
            RulePass("Pass_0"),
            RuleFail("Fail_1"),
            RuleFail("Fail_2"),
            RuleFail("Fail_3"),
            RuleFail("Fail_4")
        ]
        let retVal = retArr[reasonCode];
        if (retVal.value[1] !== eRuleConfidence.PASS) {
            // Ensure that there's actually content of this element - skip subtrees that have other lang attributes
            let hasContent = false;
            if (ruleContext.firstChild !== null) {
                let nw = new DOMWalker(ruleContext);
                while (!hasContent && nw.nextNode()) {
                    // Skip hidden
                    if (nw.node.nodeType === 1) {
                        let element = nw.node as Element;
                        if (!VisUtil.isNodeVisible(element) || element.hasAttribute("lang")) {
                            nw.bEndTag = true;
                        } else {
                            hasContent = hasContent 
                                || element.nodeName.toLowerCase() === "img" && ARIAMapper.computeName(element).trim().length > 0;
                        }
                    } else {
                        hasContent = hasContent 
                            || nw.node.nodeType === 3 && nw.node.nodeValue.trim().length > 0;
                    }
                }
            }
            if (!hasContent) return null;
        }
        return retVal;
    }
}
