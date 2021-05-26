/******************************************************************************
     Copyright:: 2020- IBM, Inc

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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IEngine";
import { RPTUtil } from "../util/legacy";
import { AncestorUtil } from "../util/ancestor";
import { FragmentUtil } from "../util/fragment";
import { LangUtil } from "../util/lang";

let a11yRulesHtml: Rule[] = [

    {
        /**
         * Description: Trigger if the document language is invalid
         * Origin: WCAG 2.0 Technique H57
         */
        id: "WCAG20_Html_HasLang",
        context: "dom:html",
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
    },

    {
        /**
         * Description: Trigger if skip navigation is missing (headers, frames, or skip links count)
         * Origin: RPT 5.6 G481
         */
        id: "RPT_Html_SkipNav",
        context: "dom:html",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = false;
            let frames = RPTUtil.getDocElementsByTag(ruleContext, "frame");
            let headers = RPTUtil.getDocElementsByTag(ruleContext, "h1");

            if ((frames != null && frames.length > 0) || (headers != null && headers.length > 0)) {
                // If frames or headings are used, pass
                passed = true;
            } else {
                // Look for skip anchors
                let anchors = RPTUtil.getDocElementsByTag(ruleContext, "a");
                let targets = {};
                for (let idx = 0; !passed && idx < anchors.length; ++idx) {
                    if (anchors[idx].hasAttribute("href")) {
                        let href = anchors[idx].href;
                        if (typeof href !== typeof "") {
                            if (href.baseVal) {
                                href = href.baseVal;
                            } else {
                                href = "";
                            }
                        }
                        let tmpLocation;
                        if (typeof ((ruleContext.ownerDocument as any).locationFromDAP) != "undefined" && (ruleContext.ownerDocument as any).locationFromDAP != null) { // DAP sets it
                            tmpLocation = (ruleContext.ownerDocument as any).locationFromDAP;
                        } else { // server scan has the location object
                            tmpLocation = ruleContext.ownerDocument.location;
                        }
                        let docHref = "";
                        if (tmpLocation) {
                            docHref = tmpLocation.href;
                        }
                        // Fix weird bugs with how various parsers report on file: url's:
                        if (href.startsWith("file:///")) href = "file:/" + href.substring("file:///".length);
                        if (docHref.startsWith("file:///")) docHref = "file:/" + docHref.substring("file:///".length);

                        if (href.charAt(0) == "#" || href.startsWith(docHref + "#")) {
                            let target = RPTUtil.getFileAnchor(href);
                            if (FragmentUtil.getById(ruleContext, target) != null)
                                passed = true;
                            else
                                targets[target] = true;
                        }
                    } else if (anchors[idx].hasAttribute("name")) {
                        // Assume forward jumping targets
                        let name = anchors[idx].getAttribute("name");
                        if (name.indexOf("#") != -1)
                            name = RPTUtil.getFileAnchor(name);
                        passed = name in targets;
                    }
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    }
]

export { a11yRulesHtml }