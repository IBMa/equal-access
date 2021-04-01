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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass } from "../../../api/IEngine";
import { RPTUtil } from "../util/legacy";
import { AncestorUtil } from "../util/ancestor";

let a11yRulesElem: Rule[] = [
    {
        /**
         * Description: Trigger if element language attributes are valid
         * Origin: WCAG 2.0 Technique H58
         */
        id: "WCAG20_Elem_Lang_Valid",
        context: "dom:*[lang], dom:*[xml:lang]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = true;
            if (ruleContext.hasAttribute("lang")) {
                passed = RPTUtil.validLang(ruleContext.getAttribute("lang"));
                // Lang is bad and I'm not on the html element
                if (!passed && ruleContext.nodeName.toLowerCase() !== "html") {
                    // It's okay to have a lang=""
                    passed = !RPTUtil.attributeNonEmpty(ruleContext, "lang");
                }
            }
            if (passed && ruleContext.hasAttribute("xml:lang")) {
                passed = RPTUtil.validLang(ruleContext.getAttribute("xml:lang"));
                // Lang is bad and I'm not in the html element
                if (!passed && ruleContext.nodeName.toLowerCase() !== "html") {
                    // It's okay to have a lang=""
                    passed = !RPTUtil.attributeNonEmpty(ruleContext, "xml:lang");
                }
            }
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Trigger if elements or attrributes are deprecated
         * Origin: RPT 5.6
         */
        id: "RPT_Elem_Deprecated",
        context: "dom:applet, dom:basefont, dom:center, dom:dir, dom:font, dom:isindex, dom:listing, dom:menu" +
            ", dom:plaintext, dom:spacer, dom:s, dom:strike, dom:u, dom:xmp, dom:*[align], dom:*[link], dom:*[archive]" +
            ", dom:*[background], dom:*[bgcolor], dom:*[clear], dom:*[code], dom:*[color]" +
            ", dom:*[compact], dom:*[face], dom:*[hspace], dom:*[language], dom:*[link]" +
            ", dom:*[noshade], dom:*[nowrap], dom:*[object], dom:*[prompt], dom:*[start]" +
            ", dom:*[text], dom:*[version], dom:*[vlink], dom:*[vspace], dom:img[border]" +
            ", dom:object[border], dom:td[height], dom:th[height], dom:li[type], dom:ol[type]" +
            ", dom:ul[type], dom:li[value], dom:pre[width], dom:hr[width], dom:td[width], dom:th[width]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = false;
            // HTMLUnit auto adds a tbody[align=left] to tables if tbody is missing!
            if (ruleContext.nodeName.toLowerCase() == "tbody" && ruleContext.hasAttribute("align"))
                passed = true;

            //        if (!passed)
            //            Packages.java.lang.System.err.println(""+ruleContext.nodeName);
            //        Packages.java.lang.System.err.println(""+ruleContext.getAttribute("align"));
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger if this elem's id isn't obtained by getElementById
         * Origin: RPT 5.6
         */
        id: "RPT_Elem_UniqueId",
        context: "dom:*[id]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - NO OUT OF SCOPE hidden in context
            let doc = AncestorUtil.getOwnerFragment(ruleContext);
            let id = ruleContext.getAttribute("id");

            // In the case that id is empty we should trigger a violation right away with out checking 
            // for uniqueness.
            if (id === "") {
                //return new ValidationResult(false, [ruleContext], '', '', [ruleContext.nodeName.toLowerCase(), id]);
                return RuleFail("Fail_1", [ruleContext.nodeName.toLowerCase(), id]);
            }

            let element = doc.getElementById(id);
            let passed = element === ruleContext;
            //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [ruleContext.nodeName.toLowerCase(), id]);
            if (!passed) {
                return RuleFail("Fail_2", [ruleContext.nodeName.toLowerCase(), id]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Trigger if this elem's accesskey isn't unique
         * Origin: WCAG 2.0 Technique F17
         */
        id: "WCAG20_Elem_UniqueAccessKey",
        context: "dom:*[accesskey]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let map = RPTUtil.getCache(ruleContext.ownerDocument, "WCAG20_Elem_UniqueAccessKey", {});

            let key = ruleContext.getAttribute("accesskey");

            let passed = !(key in map);
            map[key] = true;
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: Trigger if an assesskey doesn't have a label
         * Origin:  HTML 5 - per Richard Schwerdtfeger's requirements. g1140
         */
        id: "HAAC_Accesskey_NeedLabel",
        context: "dom:*[accesskey]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = false;
            if (RPTUtil.attributeNonEmpty(ruleContext, "title")) {
                passed = true;
            } else if (RPTUtil.attributeNonEmpty(ruleContext, "aria-label")) {
                passed = true;
            } else if (RPTUtil.getLabelForElementHidden(ruleContext, true)) { // ignore hidden
                passed = true;
            } else if (RPTUtil.attributeNonEmpty(ruleContext, "aria-labelledby")) {
                // assume the validity of the id (of aria-labelledby) is checked by a different rule
                passed = true;
            } else if (ruleContext.nodeName.toLowerCase() === "input"
                && ruleContext.parentNode.nodeName.toLowerCase() === "label") {
                // assume the validity of the label, e.g. empty label, is checked by a different rule
                passed = true;
            }

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger if a mouse event is used and a matching keyboard event is not
         * Origin: RPT 5.6 g269
         */
        id: "RPT_Elem_EventMouseAndKey",
        context: "dom:*[ondblclick], dom:*[onmousemove], dom:*[onmousedown], " +
            "dom:*[onmouseup], dom:*[onmouseover], dom:*[onmouseout], dom:*[onclick]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let passed = ruleContext.hasAttribute("href") ||
                (!ruleContext.hasAttribute("ondblclick") &&
                    !ruleContext.hasAttribute("onmousemove") &&
                    (!ruleContext.hasAttribute("onmousedown") || ruleContext.hasAttribute("onkeydown")) &&
                    (!ruleContext.hasAttribute("onmouseup") || ruleContext.hasAttribute("onkeyup")) &&
                    (!ruleContext.hasAttribute("onmouseover") || ruleContext.hasAttribute("onfocus")) &&
                    (!ruleContext.hasAttribute("onmouseout") || ruleContext.hasAttribute("onblur")) &&
                    (!ruleContext.hasAttribute("onclick") || ruleContext.hasAttribute("onkeypress") ||
                        nodeName == "a" || nodeName == "button"));

            let failedMouseEvents = new Array();
            if (!passed) {
                //store and display event name and node name in the tokens
                if (ruleContext.hasAttribute("ondblclick")) {
                    failedMouseEvents.push("ondblclick");
                }
                if (ruleContext.hasAttribute("onmousemove")) {
                    failedMouseEvents.push("onmousemove");
                }
                if (ruleContext.hasAttribute("onmousedown") && !ruleContext.hasAttribute("onkeydown")) {
                    failedMouseEvents.push("onmousedown");
                }
                if (ruleContext.hasAttribute("onmouseup") && !ruleContext.hasAttribute("onkeyup")) {
                    failedMouseEvents.push("onmouseup");
                }
                if (ruleContext.hasAttribute("onmouseover") && !ruleContext.hasAttribute("onfocus")) {
                    failedMouseEvents.push("onmouseover");
                }
                if (ruleContext.hasAttribute("onmouseout") && !ruleContext.hasAttribute("onblur")) {
                    failedMouseEvents.push("onmouseout");
                }
                if (ruleContext.hasAttribute("onclick") && !ruleContext.hasAttribute("onkeypress")) {
                    if (!(nodeName == "a" || nodeName == "button"))
                        failedMouseEvents.push("onclick");
                }
            }
            return passed ? RulePass("Pass_0") : RuleManual("Manual_1", [nodeName, failedMouseEvents.join(", ")]);
        }
    },
    {
        /**
         * Description: Trigger if an invalid value is used for the dir attribute
         * Origin: Valerie
         */
        id: "Valerie_Elem_DirValid",
        context: "dom:*[dir]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let dirStr = ruleContext.getAttribute("dir").toLowerCase();
            let passed = dirStr == "ltr" || dirStr == "rtl" || dirStr == "auto";
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    }
]

export { a11yRulesElem }