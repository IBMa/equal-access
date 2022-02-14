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
import { FragmentUtil } from "../util/fragment";
import { LangUtil } from "../util/lang";
import { DOMUtil } from "../../../dom/DOMUtil";

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
    },
    {
        /**
         * Description: Trigger if elements or attrributes are deprecated
         * Origin: RPT 5.6
         * source: 
         *      html tags: https://dev.w3.org/html5/pf-summary/obsolete.html
         */
        id: "RPT_Elem_Deprecated",
        context: "dom:applet, dom:basefont, dom:center, dom:dir, dom:font, dom:isindex, dom:listing, dom:menu" +
            ", dom:plaintext, dom:spacer, dom:s, dom:strike, dom:u, dom:xmp, dom:*[align], dom:*[link], dom:*[archive]" +
            ", dom:*[background], dom:*[bgcolor], dom:*[clear], dom:*[code], dom:*[color]" +
            ", dom:*[compact], dom:*[face], dom:*[hspace], dom:*[language], dom:*[link]" +
            ", dom:*[noshade], dom:*[nowrap], dom:*[object], dom:*[prompt], dom:*[start]" +
            ", dom:*[text], dom:*[version], dom:*[vlink], dom:*[vspace], dom:img[border]" +
            ", dom:object[border], dom:td[height], dom:th[height], dom:li[type], dom:ol[type]" +
            ", dom:ul[type], dom:li[value], dom:pre[width], dom:hr[width], dom:td[width], dom:th[width]" +
            
            /**  add deprecated html tags: https://dev.w3.org/html5/pf-summary/obsolete.html */
            ", dom:meta[http-equiv], dom:acronym, dom:frame, dom:frameset, dom:noframes, dom:noembed" +
            ", dom:big, dom:blink, dom:marquee, dom:tt " +
            ", dom:a[charset], dom:a[coords], dom:a[shape], dom:a[rev], dom:link[rev], dom:link[charset] " +
            ", dom:img[name], dom:area[nohref], dom:head[profile], dom:html[version], dom:input[usemap] " +
            ", dom:iframe[longdesc], dom:img[longdesc], dom:link[target], dom:meta[scheme], dom:object[archive] " +
            ", dom:object[code], dom:object[codebase], dom:object[codetype], dom:object[declare], dom:object[standby] " +
            ", dom:param[type], dom:param[valuetype], dom:script[language], dom:th[abbr], dom:td[abbr], dom:th[axis], dom:td[axis] " +
            ", dom:body[alink],dom:body[background], dom:body[bgcolor], dom:body[link], dom:body[text] " +
            ", dom:body[vlink], dom:br[clear], dom:caption[align], dom:col[align], dom:col[char], dom:col[charoff], dom:col[valign], dom:col[width] " +
            ", dom:div[align], dom:dl[compact], dom:hr[align], dom:hr[noshade], dom:hr[size], dom:hr[width] " +
            ", dom:h1[align], dom:h2[align],  dom:h3[align],  dom:h4[align],  dom:h5[align],  dom:h6[align] " +
            ", dom:iframe[align], dom:iframe[frameborder], dom:iframe[marginheight], dom:iframe[marginwidth] " +
            ", dom:iframe[scrolling], dom:input[align], dom:img[align], dom:img[hspace], dom:img[vspace],dom:legend[align], dom:li[type], dom:menu[compact] " +
            ", dom:object[align], dom:object[hspace], dom:object[vspace], dom:ol[compact], dom:ol[type], dom:p[align], dom:pre[width], dom:table[align] " +
            ", dom:table[bgcolor], dom:table[cellpadding], dom:table[cellspacing], dom:table[frame] " + 
            ", dom:table[rules], dom:table[width], dom:tbody[align], dom:thead[align], dom:tfoot[align] " +
            ", dom:tbody[char], thead[char], dom:tfoot[char], dom:tbody[charoff], dom:thead[charoff], dom:tfoot[charoff] " +
            ", dom:tbody[valign], thead[valign], dom:tfoot[valign], dom:td[align], dom:th[align], dom:td[bgcolor], dom:th[bgcolor] " +
            ", dom:td[char], dom:th[char], dom:td[charoff], dom:th[charoff], dom:td[height], dom:th[height], dom:td[nowrap], dom:th[nowrap] " +
            ", dom:td[valign], dom:th[valign], dom:td[width], dom:th[width], dom:tr[align], dom:tr[bgcolor] " +
            ", dom:tr[char], dom:tr[charoff], dom:tr[valign], dom:ul[compact] " +
            
            /**  add deprecated aria roles and attributes: https://www.w3.org/TR/wai-aria-1.2/ */
            ", aria:directory, aria:*[aria-grabbed], aria:*[aria-dropeffect] " +
            ", aria:alert[aria-disabled], aria:alert[aria-errormessage], aria:alert[aria-haspopup], aria:alert[aria-invalid] " +
            ", aria:alertdialog[aria-disabled], aria:alertdialog[aria-errormessage], aria:alertdialog[aria-haspopup], aria:alertdialog[aria-invalid] " +
            ", aria:article[aria-disabled], aria:article[aria-errormessage], aria:article[aria-haspopup], aria:article[aria-invalid]" +
            ", aria:banner[aria-disabled], aria:banner[aria-errormessage], aria:banner[aria-haspopup], aria:banner[aria-invalid]" +
            ", aria:blockquote[aria-disabled], aria:blockquote[aria-errormessage], aria:blockquote[aria-haspopup], aria:blockquote[aria-invalid]" +
            ", aria:button[aria-errormessage], aria:button[aria-invalid]" +
            ", aria:caption[aria-disabled], aria:caption[aria-errormessage], aria:caption[aria-haspopup], aria:caption[aria-invalid]" +
            ", aria:cell[aria-disabled], aria:cell[aria-errormessage], aria:cell[aria-haspopup], aria:cell[aria-invalid]" +
            ", aria:checkbox[aria-haspopup] " +
            ", aria:code[aria-disabled], aria:code[aria-errormessage], aria:code[aria-haspopup], aria:code[aria-invalid]" +
            ", aria:command[aria-disabled], aria:command[aria-errormessage], aria:command[aria-haspopup], aria:command[aria-invalid]" +
            ", aria:complementary[aria-disabled], aria:complementary[aria-errormessage], aria:complementary[aria-haspopup], aria:complementary[aria-invalid]" +
            ", aria:composite[aria-errormessage], aria:composite[aria-haspopup], aria:composite[aria-invalid] " +
            ", aria:contentinfo[aria-disabled], aria:contentinfo[aria-errormessage], aria:contentinfo[aria-haspopup], aria:contentinfo[aria-invalid] " +
            ", aria:definition[aria-disabled], aria:definition[aria-errormessage], aria:definition[aria-haspopup], aria:definition[aria-invalid] " +
            ", aria:deletion[aria-disabled], aria:deletion[aria-errormessage], aria:deletion[aria-haspopup], aria:deletion[aria-invalid] " +
            ", aria:dialog[aria-disabled], aria:dialog[aria-errormessage], aria:dialog[aria-haspopup], aria:dialog[aria-invalid] " +
            ", aria:document[aria-disabled], aria:document[aria-errormessage], aria:document[aria-haspopup], aria:document[aria-invalid] " +
            ", aria:emphasis[aria-disabled], aria:emphasis[aria-errormessage], aria:emphasis[aria-haspopup], aria:emphasis[aria-invalid] " +
            ", aria:feed[aria-disabled], aria:feed[aria-errormessage], aria:feed[aria-haspopup], aria:feed[aria-invalid] " +
            ", aria:figure[aria-disabled], aria:figure[aria-errormessage], aria:figure[aria-haspopup], aria:figure[aria-invalid] " +
            ", aria:form[aria-disabled], aria:form[aria-errormessage], aria:form[aria-haspopup], aria:form[aria-invalid] " +
            ", aria:generic[aria-disabled], aria:generic[aria-errormessage], aria:generic[aria-haspopup], aria:generic[aria-invalid] " +
            ", aria:grid[aria-errormessage], aria:grid[aria-haspopup], aria:grid[aria-invalid] " +
            ", aria:group[aria-errormessage], aria:group[aria-haspopup], aria:group[aria-invalid] " +
            ", aria:heading[aria-disabled], aria:heading[aria-errormessage], aria:heading[aria-haspopup], aria:heading[aria-invalid] " +
            ", aria:img[aria-disabled], aria:img[aria-errormessage], aria:img[aria-haspopup], aria:img[aria-invalid] " +
            ", aria:img[aria-disabled], aria:img[aria-errormessage], aria:img[aria-haspopup], aria:img[aria-invalid] " +
            ", aria:input[aria-errormessage], aria:input[aria-haspopup], aria:input[aria-invalid] " +
            ", aria:landmark[aria-disabled], aria:landmark[aria-errormessage], aria:landmark[aria-haspopup], aria:landmark[aria-invalid] " +
            ", aria:insertion[aria-disabled], aria:insertion[aria-errormessage], aria:insertion[aria-haspopup], aria:insertion[aria-invalid] " +
            ", aria:link[aria-errormessage], aria:link[aria-invalid] " +
            ", aria:list[aria-disabled], aria:list[aria-errormessage], aria:list[aria-haspopup], aria:list[aria-invalid] " +
            ", aria:listbox[aria-haspopup] " +
            ", aria:listitem[aria-disabled], aria:listitem[aria-errormessage], aria:listitem[aria-haspopup], aria:listitem[aria-invalid] " +
            ", aria:log[aria-disabled], aria:log[aria-errormessage], aria:log[aria-haspopup], aria:log[aria-invalid] " +
            ", aria:main[aria-disabled], aria:main[aria-errormessage], aria:main[aria-haspopup], aria:main[aria-invalid] " +
            ", aria:marquee[aria-disabled], aria:marquee[aria-errormessage], aria:marquee[aria-haspopup], aria:marquee[aria-invalid] " +
            ", aria:math[aria-disabled], aria:math[aria-errormessage], aria:math[aria-haspopup], aria:math[aria-invalid] " +
            ", aria:meter[aria-disabled], aria:meter[aria-errormessage], aria:meter[aria-haspopup], aria:meter[aria-invalid] " +
            ", aria:menu[aria-errormessage], aria:menu[aria-haspopup], aria:menu[aria-invalid] " +
            ", aria:menubar[aria-errormessage], aria:menubar[aria-haspopup], aria:menubar[aria-invalid] " +
            ", aria:menuitem[aria-errormessage], aria:menuitem[aria-invalid] " +
            ", aria:menuitemcheckbox[aria-errormessage], aria:menuitemcheckbox[aria-invalid] " +
            ", aria:menuitemradio[aria-errormessage], aria:menuitemradio[aria-invalid] " +
            ", aria:navigation[aria-disabled], aria:navigation[aria-errormessage], aria:navigation[aria-haspopup], aria:navigation[aria-invalid] " +
            ", aria:note[aria-disabled], aria:note[aria-errormessage], aria:note[aria-haspopup], aria:note[aria-invalid] " +
            ", aria:option[aria-errormessage], aria:option[aria-haspopup], aria:option[aria-invalid] " +
            ", aria:paragraph[aria-disabled], aria:paragraph[aria-errormessage], aria:paragraph[aria-haspopup], aria:paragraph[aria-invalid] " +
            ", aria:presentation[aria-disabled], aria:presentation[aria-errormessage], aria:presentation[aria-haspopup], aria:presentation[aria-invalid] " +
            ", aria:progressbar[aria-disabled], aria:progressbar[aria-errormessage], aria:progressbar[aria-haspopup], aria:progressbar[aria-invalid] " +
            ", aria:radio[aria-errormessage], aria:radio[aria-haspopup], aria:radio[aria-invalid] " +
            ", aria:radiogroup[aria-haspopup] " +
            ", aria:range[aria-disabled], aria:range[aria-errormessage], aria:range[aria-haspopup], aria:range[aria-invalid] " +
            ", aria:region[aria-disabled], aria:region[aria-errormessage], aria:region[aria-haspopup], aria:region[aria-invalid] " +
            ", aria:row[aria-errormessage], aria:row[aria-haspopup], aria:row[aria-invalid] " +
            ", aria:rowgroup[aria-disabled], aria:rowgroup[aria-errormessage], aria:rowgroup[aria-haspopup], aria:rowgroup[aria-invalid] " +
            ", aria:scrollbar[aria-errormessage], aria:scrollbar[aria-haspopup], aria:scrollbar[aria-invalid] " +
            ", aria:search[aria-disabled], aria:search[aria-errormessage], aria:search[aria-haspopup], aria:search[aria-invalid] " +
            ", aria:section[aria-disabled], aria:section[aria-errormessage], aria:section[aria-haspopup], aria:section[aria-invalid] " +
            ", aria:sectionhead[aria-disabled], aria:sectionhead[aria-errormessage], aria:sectionhead[aria-haspopup], aria:sectionhead[aria-invalid] " +
            ", aria:select[aria-errormessage], aria:select[aria-haspopup], aria:select[aria-invalid] " +
            ", aria:separator[aria-errormessage], aria:separator[aria-haspopup], aria:separator[aria-invalid] " +
            ", aria:spinbutton[aria-haspopup] " +
            ", aria:status[aria-disabled], aria:status[aria-errormessage], aria:status[aria-haspopup], aria:status[aria-invalid] " +
            ", aria:strong[aria-disabled], aria:strong[aria-errormessage], aria:strong[aria-haspopup], aria:strong[aria-invalid] " +
            ", aria:structure[aria-disabled], aria:structure[aria-errormessage], aria:structure[aria-haspopup], aria:structure[aria-invalid] " +
            ", aria:subscript[aria-disabled], aria:subscript[aria-errormessage], aria:subscript[aria-haspopup], aria:subscript[aria-invalid] " +
            ", aria:superscript[aria-disabled], aria:superscript[aria-errormessage], aria:superscript[aria-haspopup], aria:superscript[aria-invalid] " +
            ", aria:switch[aria-haspopup] " +
            ", aria:tab[aria-errormessage], aria:tab[aria-invalid] " +
            ", aria:table[aria-disabled], aria:table[aria-errormessage], aria:table[aria-haspopup], aria:table[aria-invalid] " +
            ", aria:tablist[aria-errormessage], aria:tablist[aria-haspopup], aria:tablist[aria-invalid] " +
            ", aria:tabpanel[aria-disabled], aria:tabpanel[aria-errormessage], aria:tabpanel[aria-haspopup], aria:tabpanel[aria-invalid] " +
            ", aria:term[aria-disabled], aria:term[aria-errormessage], aria:term[aria-haspopup], aria:term[aria-invalid] " +
            ", aria:time[aria-disabled], aria:time[aria-errormessage], aria:time[aria-haspopup], aria:time[aria-invalid] " +
            ", aria:timer[aria-disabled], aria:timer[aria-errormessage], aria:timer[aria-haspopup], aria:timer[aria-invalid] " +
            ", aria:toolbar[aria-errormessage], aria:toolbar[aria-haspopup], aria:toolbar[aria-invalid] " +
            ", aria:tooltip[aria-disabled], aria:tooltip[aria-errormessage], aria:tooltip[aria-haspopup], aria:tooltip[aria-invalid] " +
            ", aria:tree[aria-haspopup] " +
            ", aria:treegrid[aria-haspopup] " +
            ", aria:treeitem[aria-errormessage], aria:treeitem[aria-invalid] " +
            ", aria:widget[aria-disabled], aria:widget[aria-errormessage], aria:widget[aria-haspopup], aria:widget[aria-invalid] " +
            ", aria:window[aria-disabled], aria:window[aria-errormessage], aria:window[aria-haspopup], aria:window[aria-invalid] ",
            
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
            let id = ruleContext.getAttribute("id");

            // In the case that id is empty we should trigger a violation right away with out checking 
            // for uniqueness.
            if (id === "") {
                //return new ValidationResult(false, [ruleContext], '', '', [ruleContext.nodeName.toLowerCase(), id]);
                return RuleFail("Fail_1", [ruleContext.nodeName.toLowerCase(), id]);
            }

            let element = FragmentUtil.getById(ruleContext, id);
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
                && DOMUtil.parentNode(ruleContext).nodeName.toLowerCase() === "label") {
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