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
import { AncestorUtil } from "../../v2/checker/accessibility/util/ancestor";
import { LangUtil } from "../../v2/checker/accessibility/util/lang";

export let html_lang_exists: Rule = {
    id: "html_lang_exists",
    context: "dom:html",
    refactor: {
        "WCAG20_Html_HasLang": { 
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2",
            "Fail_3": "Fail_3",
            "Fail_4": "Fail_4",
            "Fail_5": "Fail_5",
            "Potential_5": "Potential_5",
            "Potential_6": "Potential_6"
        }
    },
    help: {
        "en-US": {
            "group": `html_lang_exists.html`, 
            "Pass_0": `html_lang_exists.html`,
            "Fail_1": `html_lang_exists.html`,
            "Fail_2": `html_lang_exists.html`,
            "Fail_3": `html_lang_exists.html`,
            "Fail_4": `html_lang_exists.html`,
            "Fail_5": `html_lang_exists.html`,
            "Potential_5": `html_lang_exists.html`,
            "Potential_6": `html_lang_exists.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Page must identify the default language of the document with a 'lang' attribute", 
            "Pass_0": "Page language detected as \"{0}\"",
            "Fail_1": "Page detected as XHTML 1.0, but has neither 'lang' nor 'xml:lang' attributes",
            "Fail_2": "Page detected as XHTML, but does not have an 'xml:lang' attribute",
            "Fail_3": "Page detected as HTML, but does not have a 'lang' attribute",
            "Fail_4": "Page detected with 'lang' and 'xml:lang' attributes and primary languages do not match: \"{0}\", \"{1}\"",
            "Fail_5": "Page detected with 'lang' and 'xml:lang' attributes that do not match: \"{0}\", \"{1}\"",
            "Potential_5": "Page detected as XHTML 1.0 with only a 'lang' attribute. Confirm that page is only delivered via text/html mime type",
            "Potential_6": "Page detected as XHTML 1.0 with only an 'xml:lang' attribute. Confirm that page is only delivered via xml mime type"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1", "WCAG_2_2"],
        num: "3.1.1", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_ONE
    }],
    act: [{
        "b5c3f8": {
            "Pass_0": "pass",
            "Fail_1": "inapplicable",
            "Fail_2": "inapplicable",
            "Fail_3": "fail",
            "Fail_4": "inapplicable",
            "Fail_5": "inapplicable",
            "Potential_5": "inapplicable",
            "Potential_6": "inapplicable"
        },
        "5b7ae0": {
            "Pass_0": "pass",
            "Fail_1": "inapplicable",
            "Fail_2": "inapplicable",
            "Fail_3": "inapplicable",
            "Fail_4": "fail",
            "Fail_5": "pass",
            "Potential_5": "inapplicable",
            "Potential_6": "inapplicable"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        // This rule does not apply inside a presentational frame
        if (AncestorUtil.isPresentationFrame(contextHierarchies)) {
            return null;
        }
        const ruleContext = context["dom"].node as Element;
        let doctypeString = ruleContext.ownerDocument.doctype ? ruleContext.ownerDocument.doctype.publicId : "";
        if (!doctypeString) doctypeString = "";
        let lang = ruleContext.getAttribute("lang");
        let langXML = ruleContext.getAttribute("xml:lang");

        if (doctypeString.includes('XHTML') && !doctypeString.includes("1.0")) {
            if (!langXML) {
                // XHTML != 1.0 (must have xml:lang
                return RuleFail("Fail_2");
            } else {
                return RulePass("Pass_0",[langXML]);
            }
        } else if (doctypeString.includes('XHTML') && doctypeString.includes("1.0")) {
            // Handle XHTML 1.0
            // If neither is provided, it's a failure
            if (!lang && !langXML) {
                // XHTML and no lang
                return RuleFail("Fail_1");
            } else if (lang && langXML) {
                if (lang !== langXML) {
                    if (!LangUtil.validPrimaryLang(lang) || !LangUtil.validPrimaryLang(langXML)) {
                        // Let Elem_Lang_Valid handle this
                        return null;
                    }
                    if (!LangUtil.matchPrimaryLang(lang, langXML)) {
                        // XHTML and lang and xml:lang, but they don't match
                        return RuleFail("Fail_4", [lang, langXML], []);
                    } else {
                        return RuleFail("Fail_5", [lang, langXML], []);
                    }
                } else {
                    // XHTML and lang and xml:lang match
                    return RulePass("Pass_0",[lang])
                }
            } else if (lang) {
                // XHTML and only lang (okay if only delivered via text/html)
                return RulePotential("Potential_5");
            } else {
                // XHTML and only xml:lang (okay if only delivered via xml mime type)
                return RulePotential("Potential_6");
            }
        } else {
            if (!lang) {
                return RuleFail("Fail_3");
            } else if (lang && langXML) {
                // HTML5 polyglot documents
                if (lang !== langXML) {
                    if (!LangUtil.validPrimaryLang(lang) || !LangUtil.validPrimaryLang(langXML)) {
                        // Let Elem_Lang_Valid handle this
                        return null;
                    }
                    if (!LangUtil.matchPrimaryLang(lang, langXML)) {
                        // XHTML and lang and xml:lang, but they don't match
                        return RuleFail("Fail_4", [lang, langXML], []);
                    } else {
                        return RuleFail("Fail_5", [lang, langXML], []);
                    }
                } else {
                    // XHTML and lang and xml:lang match
                    return RulePass("Pass_0",[lang])
                }
            } else {
                return RulePass("Pass_0",[lang]);
            }
        }
    }
}
